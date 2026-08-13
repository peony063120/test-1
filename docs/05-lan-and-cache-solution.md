# Báo cáo cập nhật dự án — Giải pháp LAN nội bộ & Cache Server

---

## 1. Phương án truy cập qua mạng LAN

### 1.1 Bài toán

Ứng dụng có 2 thành phần chạy riêng biệt:
- **Backend** (NestJS): port `3000`
- **Frontend** (React + Vite): port `3001`

Ban đầu, frontend chỉ bind vào `127.0.0.1` (localhost), nên các thiết bị khác trong mạng LAN không thể truy cập. Ngoài ra, file `.env` hardcode địa chỉ IP cố định (`VITE_API_URL=http://192.168.1.91:3000/api/v1`), khi IP của máy thay đổi theo từng mạng thì ứng dụng ngừng hoạt động.

### 1.2 Các phương án khảo sát

| # | Phương án | Cách hoạt động | Ưu điểm | Nhược điểm |
|---|---|---|---|---|
| 1 | **Bind 0.0.0.0 + IP tĩnh trong .env** | Vite lắng nghe mọi interface; frontend gọi backend qua IP hardcode | Đơn giản | IP đổi theo mạng → phải sửa .env mỗi lần |
| 2 | **Tunnel (Ngrok/Cloudflare Tunnel)** | Tạo URL public trỏ về máy local | Truy cập từ mọi nơi | URL tạm, phụ thuộc dịch vụ ngoài |
| 3 | **VPN mesh (Tailscale/ZeroTier)** | Tạo mạng ảo riêng giữa các máy | Bảo mật, IP ổn định | Cần cài client trên từng thiết bị |
| 4 | **Auto-detect backend URL theo hostname** | Frontend đọc IP từ URL và tự gọi backend cùng IP | Không cần cấu hình, hoạt động với mọi LAN IP | Chỉ phù hợp khi backend & frontend cùng máy |

### 1.3 Phương án được chọn

**Kết hợp phương án 1 + 4:**

1. **Vite bind `0.0.0.0`** (`host: true` trong `vite.config.ts`) — cho phép mọi thiết bị trong LAN truy cập frontend.

2. **Auto-detect backend URL** (`axios.config.ts`) — frontend tự đọc `window.location.hostname` từ URL đang truy cập và gọi backend tại cùng IP, khác port:

```typescript
const resolveBaseUrl = (): string => {
  const explicit = import.meta.env.VITE_API_URL;
  if (explicit && explicit.trim()) return explicit.trim();

  const { hostname, protocol } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/api/v1';                     // máy chủ: dùng Vite proxy
  }
  return `${protocol}//${hostname}:3000/api/v1`;  // LAN IP: gọi thẳng backend
};
```

3. **Backend CORS mở cho mọi LAN origin** (`main.ts`) — chấp nhận request từ `192.168.*`, `10.*`, `172.16-31.*`, `localhost`.

### 1.4 Lý do chọn

- **Không cần cấu hình lại khi đổi mạng**: IP thay đổi (`192.168.1.91` → `192.168.100.41` → ...) thì hệ thống vẫn tự thích ứng, không phải sửa `.env`.
- **Không phụ thuộc dịch vụ bên ngoài**: khác với Ngrok/Tailscale, giải pháp chạy hoàn toàn nội bộ.
- **Đơn giản, ít rủi ro**: chỉ thay đổi logic resolve URL, không đổi data structure.

### 1.5 Kết quả kiểm chứng

| Trường hợp | URL truy cập | Kết quả |
|---|---|---|
| Máy chủ (localhost) | `http://localhost:3001` | ✅ hoạt động (qua Vite proxy) |
| LAN IP 1 | `http://192.168.100.41:3001` | ✅ login thành công, redirect `/admin` |
| LAN IP 2 | `http://172.28.144.1:3001` | ✅ login thành công, redirect `/admin` |
| Backend qua LAN IP | `http://192.168.100.41:3000` | ✅ ADMIN login OK |

---

## 2. Giải pháp Cache Server

### 2.1 Hiện trạng trước khi nâng cấp

`RedisService` ban đầu là **giả lập in-memory** (`Map` trong bộ nhớ):

```typescript
private readonly store = new Map<string, { value: any; expiresAt: number }>();
```

Hạn chế:
- Cache bị mất khi restart server (cold start)
- Không chia sẻ giữa nhiều instance (không scale ngang được)
- Không có eviction policy thông minh (LRU/LFU)
- Wildcard delete (`del('permissions:*')`) **không hoạt động** đúng (chỉ xóa literal key)

### 2.2 Các chiến lược cache khảo sát

| # | Chiến lược | Cơ chế | Ưu điểm | Nhược điểm |
|---|---|---|---|---|
| 1 | **Cache-Aside (Lazy Loading)** | Đọc cache → miss → đọc DB → lưu cache | Đơn giản, an toàn (DB là source of truth) | Cache miss đầu tiên chậm |
| 2 | Read-Through | Cache tự load từ DB khi miss | Code app sạch hơn | Cần provider hỗ trợ loader |
| 3 | Write-Through | Ghi đồng thời cache + DB | Cache luôn mới | Mỗi write chậm gấp đôi |
| 4 | Write-Around | Ghi thẳng DB, bỏ qua cache | Cache không phình | Đọc ngay sau ghi bị miss |
| 5 | Write-Behind | Ghi cache trước, async flush DB | Write nhanh nhất | Rủi ro mất dữ liệu |
| 6 | Refresh-Ahead | Chủ động refresh trước khi hết TTL | Tránh miss cho hot key | Phức tạp, cần worker |

### 2.3 Phương án được chọn

**Cache-Aside + TTL + Invalidation chủ động**

Lý do:
- Nghiệp vụ **đọc nhiều hơn ghi** (quét barcode, xem sản phẩm, tồn kho, báo cáo).
- **An toàn dữ liệu**: cache lỗi không làm mất dữ liệu — DB vẫn là nguồn sự thật.
- **Code đã theo pattern này sẵn** — chỉ cần thay Map bằng Redis thật, không đổi kiến trúc.
- Kết hợp **invalidation chủ động** khi write: update/delete sản phẩm → xóa `product:{id}`; điều chỉnh tồn kho → xóa `inventory:{...}`; đổi quyền → xóa `permissions:*`.

### 2.4 Kiến trúc triển khai

`RedisService` được viết lại với **ioredis + graceful fallback**:

```
                    ┌──────────────┐
   App request ───► │  RedisService │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │  Redis có sẵn?           │
              └────────────┬────────────┘
                    Có           Không
                     │              │
              ┌──────▼──────┐  ┌───▼──────────┐
              │ Redis thật  │  │ In-memory    │
              │ (ioredis)   │  │ Map fallback │
              │ SCAN+DEL    │  │ (dev/outage) │
              └─────────────┘  └──────────────┘
```

Tính năng:
- Kết nối Redis thật qua `REDIS_HOST`/`REDIS_PORT` (từ `.env`)
- Graceful fallback: Redis down → dùng in-memory, app vẫn chạy
- Wildcard delete dùng `SCAN` + `DEL` (sửa lỗi của bản in-memory cũ)
- Tự disconnect khi app shutdown (`onModuleDestroy`)

### 2.5 Dữ liệu cache theo độ ưu tiên

| Dữ liệu | Key | TTL | Invalidate khi |
|---|---|---|---|
| Permissions theo user | `permissions:{userId}` | 3600s | Đổi role/user, logout |
| Product theo ID | `product:{id}` | 300s | Update/delete product |
| Product theo barcode | `barcode:{code}` | 600s | Update product |
| Inventory theo product | `inventory:{productId}:{warehouseId}` | 60s | Adjust inventory |

### 2.6 Không nên cache

- Stock transaction history (ghi liên tục, dễ stale)
- Báo cáo tổng hợp (dữ liệu thay đổi theo thời gian thực)
- Purchase/Sales order đang xử lý (cần consistency tuyệt đối)

### 2.7 Kết quả kiểm chứng

| Kiểm tra | Kết quả |
|---|---|
| Kết nối Redis | ✅ `Redis connected at localhost:6379` |
| Dữ liệu lưu thật trong Redis | ✅ `redis-cli` đọc được giá trị |
| Cache round-trip (set → get) | ✅ |
| Exact delete | ✅ |
| Wildcard delete (`permissions:*`) | ✅ xóa đúng các key khớp |
| Graceful fallback (Redis down) | ✅ không crash, dùng in-memory |
| Backend test suite | ✅ 21/21 pass, 61 tests |
| Backend build | ✅ pass |

---

## 3. Kết luận

1. **LAN nội bộ**: giải pháp auto-detect theo hostname giúp ứng dụng hoạt động với **bất kỳ IP LAN nào** mà không cần cấu hình lại, kết hợp Vite bind `0.0.0.0` và CORS mở cho LAN.

2. **Cache server**: nâng cấp từ in-memory Map lên **Redis thật** theo chiến lược **Cache-Aside + TTL + Invalidation**, giữ nguyên interface (get/set/del) — không lệch data structure, không tạo lỗi mới, có cơ chế fallback an toàn khi Redis gặp sự cố.
