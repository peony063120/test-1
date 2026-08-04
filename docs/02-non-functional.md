# 02. Non Functional Requirement

## 1. Mục tiêu NFR
Hệ thống không chỉ đáp ứng tính đúng nghiệp vụ mà còn phải đảm bảo hiệu suất, bảo mật, độ tin cậy và dễ bảo trì trong môi trường production.

## 2. Yêu cầu hiệu năng
| Tiêu chí | Yêu cầu |
|---|---|
| Thời gian phản hồi API chính | < 300ms cho 95% request |
| Thời gian phản hồi search | < 500ms |
| Tốc độ quét barcode | < 1s |
| Hỗ trợ đồng thời | 1.000+ request/giây với cấu hình đủ mạnh |

## 3. Tính khả dụng
| Tiêu chí | Yêu cầu |
|---|---|
| SLA | 99.9% |
| Khôi phục sự cố | < 15 phút cho lỗi không nghiêm trọng |
| Backup | Backup tự động hàng ngày |
| Disaster recovery | Có kế hoạch failover và restore |

## 4. Bảo mật
| Tiêu chí | Yêu cầu |
|---|---|
| Authentication | JWT + Refresh Token |
| Authorization | RBAC + permission-based access |
| Mật khẩu | Hash bằng bcrypt/Argon2 |
| Secret | Lưu trong môi trường và secret manager |
| Logging | Ghi audit log cho hành động nhạy cảm |
| Rate limiting | Chống brute force và DDoS |

## 5. Tính mở rộng
- Hệ thống nên thiết kế theo module, dễ thêm tính năng mới.
- Backend có thể scale ngang bằng container orchestration.
- Redis dùng cho cache và session.
- Queue dùng RabbitMQ cho xử lý async.

## 6. Tính bảo trì
- Code theo Clean Architecture.
- Tách rõ business logic và infrastructure.
- Có unit test, integration test, contract test.
- Swagger cho API documentation.

## 7. Tính nhất quán dữ liệu
- Dùng transaction cho các thao tác kho và đơn hàng.
- Không cho phép tồn kho âm nếu không được phép.
- Dùng constraint và FK để bảo vệ dữ liệu.

## 8. Observability
- Logging structured.
- Metrics: latency, error rate, queue depth, DB connection pool.
- Tracing phân tán cho request đi qua gateway, API, DB, queue.

## 9. NFR thiết kế đề xuất
- Sử dụng PostgreSQL cho dữ liệu nghiệp vụ chính.
- Redis cho cache, rate limiting và temporary token.
- Object storage cho ảnh và file đính kèm.
- Elasticsearch cho search nếu dữ liệu lớn.

## 10. Ưu điểm của thiết kế này
- Dễ mở rộng khi số lượng người dùng và dữ liệu tăng.
- Đáp ứng được 3NF và các yêu cầu audit, transaction.

## 11. Nhược điểm
- Cấu hình production phức tạp hơn so với monolith đơn giản.
- Cần đội ngũ vận hành và giám sát.
