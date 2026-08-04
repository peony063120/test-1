# 04. Business Flow

## 1. Luồng quản lý sản phẩm
```mermaid
flowchart LR
    A[Nhập thông tin sản phẩm] --> B[Validate SKU/Barcode]
    B --> C[Upload ảnh và thông tin biến thể]
    C --> D[Gán category/brand/supplier]
    D --> E[Lưu vào DB]
    E --> F[Phân bổ tồn kho ban đầu]
    F --> G[Hoàn thành]
```

## 2. Luồng quét barcode
```mermaid
flowchart TD
    A[Camera hoặc nhập tay] --> B[Barcode Scanner]
    B --> C[Decode barcode]
    C --> D[GET /products/barcode/{barcode}]
    D --> E[Kiểm tra DB]
    E --> F[Hiển thị thông tin sản phẩm]
```

## 3. Luồng nhập kho
```mermaid
flowchart TD
    A[Tạo Purchase Order] --> B[Chọn nhà cung cấp và kho]
    B --> C[Chọn sản phẩm và số lượng]
    C --> D[Validate giá và tồn kho]
    D --> E[Create transaction]
    E --> F[Cập nhật inventory]
    F --> G[Hoàn tất]
```

## 4. Luồng bán hàng
```mermaid
flowchart TD
    A[Tạo Sales Order] --> B[Chọn khách hàng và sản phẩm]
    B --> C[Kiểm tra tồn kho]
    C --> D[Create sales detail]
    D --> E[Trừ tồn kho]
    E --> F[Thanh toán và hoàn tất]
```

## 5. Luồng xác thực và phân quyền
```mermaid
sequenceDiagram
    participant U as User
    participant A as Auth API
    participant DB as Database
    U->>A: Login
    A->>DB: Check credentials
    DB-->>A: User + Role + Permission
    A-->>U: Access Token + Refresh Token
```

## 6. Business rules
- Không được tạo sản phẩm với barcode trùng.
- Không được bán vượt quá tồn kho hiện có.
- Mọi thay đổi kho đều phải có người tạo và timestamp.
- Mọi đơn mua/bán cần có trạng thái rõ ràng.

## 7. Vì sao luồng này hiệu quả
- Rõ ràng về trách nhiệm và thứ tự xử lý.
- Dễ kiểm tra lỗi và audit.
- Dễ mở rộng thêm workflow phê duyệt hoặc multi-step approval.
