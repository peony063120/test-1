# 07. API Design

## 1. Nguyên tắc thiết kế API
- RESTful, rõ ràng, thống nhất.
- Dùng versioning nếu cần mở rộng: /api/v1.
- Dùng chuẩn status code HTTP.
- Dùng pagination, filter, sort cho danh sách.
- Validate request ở DTO với class-validator / Joi / Zod.

## 2. Auth API
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /api/v1/auth/login | Đăng nhập |
| POST | /api/v1/auth/refresh | Refresh token |
| POST | /api/v1/auth/logout | Đăng xuất |
| GET | /api/v1/auth/me | Thông tin user hiện tại |

## 3. User & Role API
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /api/v1/users | Danh sách user |
| POST | /api/v1/users | Tạo user |
| GET | /api/v1/users/{id} | Chi tiết user |
| PUT | /api/v1/users/{id} | Cập nhật user |
| DELETE | /api/v1/users/{id} | Xóa mềm |
| GET | /api/v1/roles | Danh sách role |
| POST | /api/v1/roles | Tạo role |

## 4. Product API
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /api/v1/products | Danh sách sản phẩm |
| GET | /api/v1/products/{id} | Chi tiết sản phẩm |
| POST | /api/v1/products | Tạo sản phẩm |
| PUT | /api/v1/products/{id} | Cập nhật sản phẩm |
| DELETE | /api/v1/products/{id} | Xóa mềm |
| GET | /api/v1/products/barcode/{barcode} | Tìm theo barcode |
| GET | /api/v1/products/search | Tìm kiếm autocomplete |

## 5. Category/Brand/Supplier API
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /api/v1/categories | Danh sách danh mục |
| POST | /api/v1/categories | Tạo danh mục |
| GET | /api/v1/brands | Danh sách thương hiệu |
| GET | /api/v1/suppliers | Danh sách nhà cung cấp |

## 6. Inventory API
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /api/v1/inventories | Danh sách tồn kho |
| GET | /api/v1/inventories/{id} | Chi tiết |
| POST | /api/v1/inventories/adjust | Điều chỉnh tồn kho |
| POST | /api/v1/inventories/transfer | Chuyển kho |

## 7. Purchase API
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /api/v1/purchase-orders | Danh sách đơn mua |
| POST | /api/v1/purchase-orders | Tạo đơn mua |
| PUT | /api/v1/purchase-orders/{id}/approve | Duyệt đơn |
| GET | /api/v1/purchase-orders/{id} | Chi tiết |

## 8. Sales API
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /api/v1/sales-orders | Danh sách đơn bán |
| POST | /api/v1/sales-orders | Tạo đơn bán |
| PUT | /api/v1/sales-orders/{id}/complete | Hoàn tất |
| GET | /api/v1/sales-orders/{id} | Chi tiết |

## 9. Notification & Audit API
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /api/v1/notifications | Danh sách thông báo |
| GET | /api/v1/audit-logs | Nhật ký hệ thống |

## 10. File Upload API
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /api/v1/files/upload | Upload file |
| GET | /api/v1/files/{id} | Download file |

## 11. Response format chuẩn
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## 12. Error format chuẩn
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "barcode",
      "message": "Barcode already exists"
    }
  ]
}
```

## 13. Vì sao thiết kế như vậy
- Dễ cho frontend consume và test.
- Có thể chia nhỏ theo module.
- Dễ tích hợp Swagger và auth middleware.

## 14. Phương án thay thế
- Nếu hệ thống rất lớn, có thể dùng GraphQL cho query linh hoạt.
- Nếu cần tốc độ hơn, có thể thêm gRPC giữa internal services.
