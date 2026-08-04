# 11. Sequence Diagram

## 1. Mục tiêu
Sequence diagram giúp mô tả trực quan luồng tương tác giữa các actor, controller, use case, service và persistence layer trong các nghiệp vụ cốt lõi.

## 2. Sequence Diagram: Authentication
```mermaid
sequenceDiagram
    actor User
    participant API as Auth Controller
    participant UC as Auth Use Case
    participant DB as PostgreSQL
    participant Cache as Redis

    User->>API: POST /auth/login
    API->>UC: validate credentials
    UC->>DB: find user by email/username
    DB-->>UC: user + password hash
    UC->>Cache: check token state
    UC-->>API: issue access + refresh token
    API-->>User: return profile + tokens
```

## 3. Sequence Diagram: Create Product
```mermaid
sequenceDiagram
    actor Admin
    participant API as Product Controller
    participant UC as Product Use Case
    participant DB as PostgreSQL
    participant Search as Search Index
    participant Noti as Notification Service

    Admin->>API: POST /products
    API->>UC: createProduct(dto)
    UC->>DB: validate sku/barcode/category
    DB-->>UC: validation result
    UC->>DB: insert product + images + variants
    UC->>Search: index product
    UC->>Noti: emit product-created event
    UC-->>API: product created
    API-->>Admin: success response
```

## 4. Sequence Diagram: Purchase Receive
```mermaid
sequenceDiagram
    actor WarehouseStaff
    participant API as Purchase Controller
    participant UC as Purchase Use Case
    participant DB as PostgreSQL
    participant Inv as Inventory Service
    participant Queue as RabbitMQ

    WarehouseStaff->>API: POST /purchase-orders/:id/receive
    API->>UC: receivePurchaseOrder(id)
    UC->>DB: validate purchase order status
    UC->>Inv: lock inventory rows
    Inv->>DB: update quantities
    UC->>DB: insert stock transactions
    UC->>Queue: enqueue notification/report job
    UC-->>API: completed
    API-->>WarehouseStaff: success response
```

## 5. Sequence Diagram: Sales Ship
```mermaid
sequenceDiagram
    actor SalesStaff
    participant API as Sales Controller
    participant UC as Sales Use Case
    participant DB as PostgreSQL
    participant Inv as Inventory Service
    participant Socket as Socket.IO

    SalesStaff->>API: POST /sales-orders/:id/ship
    API->>UC: shipSalesOrder(id)
    UC->>DB: validate order and stock availability
    UC->>Inv: deduct inventory
    Inv->>DB: update quantities
    UC->>DB: insert stock transaction
    UC->>Socket: broadcast inventory updated
    UC-->>API: shipped
    API-->>SalesStaff: success response
```

## 6. Sequence Diagram: Barcode Lookup
```mermaid
sequenceDiagram
    actor Staff
    participant FE as Frontend
    participant API as Product Controller
    participant Cache as Redis
    participant DB as PostgreSQL

    Staff->>FE: scan barcode
    FE->>API: GET /products/barcode/:barcode
    API->>Cache: check cache
    alt cache hit
        Cache-->>API: product detail
    else cache miss
        API->>DB: query product by barcode
        DB-->>API: product detail
        API->>Cache: write cache
    end
    API-->>FE: product info + inventory
    FE-->>Staff: show result
```

## 7. Design rationale
- Sequence diagram giúp team hiểu giao tiếp giữa các layer và giảm rủi ro khi triển khai thực tế.
- Với nghiệp vụ kho, việc thể hiện khóa tồn kho và transaction là rất quan trọng.
- Qua các luồng này, có thể thấy nơi nào nên dùng cache, queue, event hoặc websocket.

## 8. Phương án thay thế
- Nếu không cần quá chi tiết, có thể dùng simple flowchart thay cho sequence diagram.
- Với hệ thống lớn, nên bổ sung sequence diagram cho integrator service và payment gateway sau này.
