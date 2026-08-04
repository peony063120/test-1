# 08. Folder Structure

## 1. Mục tiêu
Cấu trúc thư mục theo Clean Architecture, dễ tách module, dễ mở rộng và kiểm thử.

## 2. Cấu trúc đề xuất
```text
src/
  app.module.ts
  main.ts

  modules/
    auth/
      application/
        dto/
        use-cases/
        services/
      domain/
        entities/
        repositories/
      infrastructure/
        controllers/
        repositories/
        guards/
        strategies/
        middleware/
    users/
    roles/
    permissions/
    products/
    categories/
    brands/
    suppliers/
    warehouses/
    inventories/
    stock-transactions/
    purchase-orders/
    purchase-details/
    sales-orders/
    sales-details/
    customers/
    employees/
    notifications/
    audit-logs/
    files/
    settings/
    dashboard/
    reports/
    search/

  shared/
    common/
    config/
    constants/
    exceptions/
    filters/
    interceptors/
    logger/
    utils/
    security/
    validation/

  prisma/
    schema.prisma
    migrations/

  test/
    e2e/
    unit/
```

## 3. Mô tả từng nhóm
- modules: chứa các module nghiệp vụ chính.
- shared: các thành phần dùng chung.
- prisma: schema và migration.
- test: unit và e2e test.

## 4. Vì sao thiết kế này
- Dễ phân chia team làm việc.
- Module độc lập và có thể thay thế công nghệ nền.
- Dễ áp dụng Clean Architecture.

## 5. Nhược điểm
- Ban đầu khá nặng về cấu trúc.
- Cần tuân thủ convention để không trở nên lộn xộn.
