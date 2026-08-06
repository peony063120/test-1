# 01. Functional Requirement

## 1. Mục tiêu hệ thống
Hệ thống Quản lý sản phẩm và kho hàng doanh nghiệp nhằm hỗ trợ toàn bộ vòng đời sản phẩm từ đăng ký, quản lý tồn kho, mua hàng, bán hàng, tra cứu và báo cáo. Hệ thống phải phù hợp cho môi trường có nhiều kho, nhiều người dùng, nhiều vai trò và cần mở rộng theo thời gian.

## 2. Phạm vi hệ thống
- Quản lý người dùng, phân quyền và truy cập.
- Quản lý danh mục sản phẩm, thương hiệu, nhà cung cấp.
- Quản lý sản phẩm, hình ảnh, biến thể, barcode.
- Quản lý kho, tồn kho và giao dịch kho.
- Quản lý đơn mua và đơn bán.
- Quản lý khách hàng, nhân viên và thông báo.
- Ghi nhận audit log và cấu hình hệ thống.
- Hỗ trợ tìm kiếm và upload file.

## 3. Functional Requirements theo module

### 3.1 Authentication & Authorization
| Chức năng | Mô tả |
|---|---|
| Đăng nhập | Hỗ trợ username/email + password |
| Đăng xuất | Hủy session hiện tại |
| Refresh Token | Tạo và refresh token an toàn |
| RBAC | Phân quyền theo role và permission |
| Quản lý người dùng | Tạo, sửa, khóa/mở khóa user |
| Tạo tài khoản thủ kho | Admin tạo user với role WAREHOUSE_STAFF để dùng cho nhập hàng và quản lý kho |
| Audit | Ghi lại hành động bảo mật |

### 3.2 Dashboard
| Chức năng | Mô tả |
|---|---|
| Tổng quan | Hiển thị doanh thu, tồn kho, đơn hàng, cảnh báo |
| Biểu đồ | Biểu đồ theo ngày/tháng/tuần |
| Cảnh báo | Sản phẩm sắp hết hàng, đơn hàng chậm xử lý |

### 3.3 Product Management
| Chức năng | Mô tả |
|---|---|
| Tạo sản phẩm | Tạo SKU, barcode, tên, giá, trạng thái |
| Chỉnh sửa sản phẩm | Cập nhật thông tin và quan hệ |
| Xóa mềm | Không xóa hẳn khỏi DB |
| Upload ảnh | Hỗ trợ nhiều ảnh cho một sản phẩm |
| Quản lý biến thể | Mỗi sản phẩm có thể có nhiều biến thể |
| Tìm kiếm | Tìm theo tên, SKU, barcode |

### 3.4 Category, Brand, Supplier
| Chức năng | Mô tả |
|---|---|
| Quản lý danh mục | Cấu trúc phân cấp |
| Quản lý thương hiệu | Gắn với sản phẩm |
| Quản lý nhà cung cấp | Lưu thông tin liên hệ, thuế, địa chỉ |

### 3.5 Warehouse & Inventory
| Chức năng | Mô tả |
|---|---|
| Quản lý kho | Kho có tên, địa điểm, mô tả |
| Quản lý tồn kho | Mỗi sản phẩm tại mỗi kho có số lượng |
| Cảnh báo tồn kho | Ngưỡng min/max |
| Giao dịch kho | Nhập, xuất, điều chỉnh, hủy |

### 3.6 Purchase Order
| Chức năng | Mô tả |
|---|---|
| Tạo đơn mua | Chọn nhà cung cấp, kho, sản phẩm |
| Duyệt đơn | Theo workflow phê duyệt |
| Theo dõi trạng thái | Chờ duyệt, đã nhận, hủy |

### 3.7 Sales Order
| Chức năng | Mô tả |
|---|---|
| Tạo đơn bán | Chọn khách hàng, sản phẩm, số lượng |
| Tính tiền | Tính tổng tiền, chiết khấu, thuế |
| Xử lý đơn | Đã tạo, đang giao, hoàn tất, hủy |

### 3.8 Customer, Employee, Notification, Audit
| Chức năng | Mô tả |
|---|---|
| Quản lý khách hàng | Lưu thông tin và lịch sử giao dịch |
| Quản lý nhân viên | Lưu vị trí công việc |
| Notification | Thông báo trạng thái hệ thống và nghiệp vụ |
| Audit Log | Ghi lại thay đổi quan trọng |

### 3.9 File Upload, Barcode, Search
| Chức năng | Mô tả |
|---|---|
| Upload file | Ảnh sản phẩm, tài liệu, chứng từ |
| Barcode scanner | Quét bằng camera hoặc nhập tay |
| Search | Autocomplete và gợi ý gần đúng |

## 4. Quy tắc nghiệp vụ cốt lõi
1. Barcode là duy nhất trên toàn hệ thống.
2. Mỗi sản phẩm phải có SKU duy nhất.
3. Tồn kho chỉ thay đổi thông qua giao dịch kho hợp lệ.
4. Đơn mua và đơn bán phải luôn có số lượng và giá hợp lệ.
5. Tất cả thay đổi quan trọng phải được ghi audit log.

## 5. Bổ sung đề xuất
Để hệ thống thực tế hơn, nên bổ sung thêm các module sau trước khi triển khai sản phẩm thật:
- Multi-warehouse và multi-location.
- Serial/Lot number tracking.
- Approval workflow cho đơn mua và đơn bán.
- Currency và tax rules.
- Soft delete thay vì hard delete.
- Versioning cho sản phẩm và giá.

## 6. Vì sao thiết kế như vậy
- Đảm bảo nghiệp vụ đầy đủ theo yêu cầu doanh nghiệp.
- Tách biệt rõ các luồng mua, bán, kho và sản phẩm.
- Có thể mở rộng thêm module ERP hoặc E-commerce sau này.

## 7. Ưu điểm
- Phù hợp cho các doanh nghiệp vừa và lớn.
- Có thể tích hợp thêm API cho mobile, POS, marketplace.
- Dễ kiểm soát dữ liệu và audit.

## 8. Nhược điểm
- Phạm vi ban đầu khá lớn, cần chia ra các giai đoạn triển khai.
- Yêu cầu thiết kế dữ liệu kỹ lưỡng để tránh sửa lớn về sau.
