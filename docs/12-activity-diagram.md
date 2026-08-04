# 12. Activity Diagram

## 1. Mục tiêu
Activity diagram mô tả quy trình nghiệp vụ theo từng bước, đặc biệt phù hợp với luồng nhập kho, bán hàng, kiểm kê và tìm kiếm sản phẩm.

## 2. Activity Diagram: Login Flow
```mermaid
flowchart TD
    A[Open login page] --> B{Credentials valid?}
    B -- No --> C[Show error]
    B -- Yes --> D[Check account status]
    D --> E{Account active?}
    E -- No --> F[Block login]
    E -- Yes --> G[Create JWT and refresh token]
    G --> H[Store session state]
    H --> I[Redirect to dashboard]
```

## 3. Activity Diagram: Product Creation
```mermaid
flowchart TD
    A[Start create product] --> B[Validate input]
    B --> C{SKU/barcode unique?}
    C -- No --> D[Return validation error]
    C -- Yes --> E[Save product]
    E --> F[Save images and variants]
    F --> G[Create audit log]
    G --> H[Sync search index]
    H --> I[Finish]
```

## 4. Activity Diagram: Inventory Adjustment
```mermaid
flowchart TD
    A[Start adjustment] --> B[Load inventory row]
    B --> C[Acquire lock]
    C --> D[Calculate before/after quantity]
    D --> E[Insert stock transaction]
    E --> F[Update inventory balance]
    F --> G[Publish notification/event]
    G --> H[Commit transaction]
    H --> I[Finish]
```

## 5. Activity Diagram: Purchase Order Flow
```mermaid
flowchart TD
    A[Create PO] --> B[Validate supplier/warehouse/details]
    B --> C{Need approval?}
    C -- Yes --> D[Pending approval]
    C -- No --> E[Approved]
    D --> F[Approve by manager]
    F --> E
    E --> G[Receive goods]
    G --> H[Update inventory]
    H --> I[Complete PO]
```

## 6. Activity Diagram: Sales Order Flow
```mermaid
flowchart TD
    A[Create sales order] --> B[Validate customer and pricing]
    B --> C[Check inventory availability]
    C --> D{Enough stock?}
    D -- No --> E[Reject / hold order]
    D -- Yes --> F[Reserve stock]
    F --> G[Create stock transaction]
    G --> H[Complete order]
    H --> I[Send notification]
```

## 7. Activity Diagram: Barcode Search Flow
```mermaid
flowchart TD
    A[Scan or enter barcode] --> B[Call barcode API]
    B --> C{Found in cache?}
    C -- Yes --> D[Return cached result]
    C -- No --> E[Query database]
    E --> F[Return product detail]
    D --> G[Display result]
    F --> G
```

## 8. Design rationale
- Activity diagram giúp nhiều bên liên quan hiểu luồng nghiệp vụ rõ hơn, đặc biệt cho đội vận hành và test.
- Với nghiệp vụ kho và bán hàng, việc nêu rõ điều kiện rẽ nhánh giúp giảm lỗi business rule.
- Đây là tài liệu tốt để làm base cho test case và UAT.
