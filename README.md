# Product Management System

He thong quan ly san pham gom:
- Backend NestJS + Prisma + PostgreSQL + Redis
- Frontend React + Vite
- Phan quyen theo vai tro: `ADMIN`, `WAREHOUSE_STAFF`, `SALES_STAFF`, `MANAGER`

README nay duoc viet lai de nguoi dung moi co the chay duoc nhanh, biet can cau hinh file nao, va xu ly duoc cac loi pho bien nhu dang ky that bai hoac frontend khong goi duoc API.

## 1. Kien truc thu muc

- `backend/`: API NestJS, Prisma schema, seed, test
- `frontend/`: giao dien React + Vite
- `docs/`: tai lieu thiet ke, API, bao mat
- `docker-compose.yml`: bo service local de chay nhanh

## 2. Yeu cau truoc khi chay

Can co:
- Node.js 20+
- npm 10+
- Docker Desktop neu muon chay nhanh bang container

## 3. Cach chay nhanh nhat: Docker

Tai thu muc goc project:

```powershell
docker compose up -d --build
```

Sau khi len service:
- Backend API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- RabbitMQ UI: http://localhost:15672
- Elasticsearch: http://localhost:9200

Tat toan bo:

```powershell
docker compose down
```

Luu y:
- Docker compose hien tai chi chay backend service, khong tu dong chay frontend dev server.
- Frontend van nen chay rieng bang `npm run dev` trong thu muc `frontend`.

## 4. Cach chay local dung nhat

### 4.1. Buoc 1: chay ha tang

Neu khong muon chay full backend bang Docker, hay chi bat cac dependency:

```powershell
docker compose up -d postgres redis rabbitmq elasticsearch
```

### 4.2. Buoc 2: cau hinh backend

File env can dung la:
- `backend/.env`

Neu chua co file nay:

```powershell
cd backend
Copy-Item .env.example .env
```

Gia tri mac dinh trong `backend/.env.example` da phu hop voi docker local.

### 4.3. Buoc 3: khoi tao database

Van trong `backend`:

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Day la buoc rat quan trong. Neu bo qua `prisma:seed`, he thong van co the khoi dong nhung:
- tai khoan `admin` se khong co
- role/permission co the thieu
- mot so chuc nang phan quyen se khong day du

### 4.4. Buoc 4: chay backend

```powershell
npm run start:dev
```

Backend mac dinh chay tai:
- http://localhost:3000
- API prefix: `/api/v1`
- Swagger: http://localhost:3000/docs

### 4.5. Buoc 5: chay frontend

Mo terminal moi:

```powershell
cd frontend
npm install
npm run dev
```

Frontend mac dinh chay tai:
- http://localhost:5173

## 5. Dang nhap va dang ky

### 5.1. Tai khoan mac dinh sau khi seed

Sau `npm run prisma:seed`, co san tai khoan:
- username: `admin`
- password: `admin123`

### 5.2. Dang nhap

Trang dang nhap cho phep nhap:
- username
- hoac email

Sau dang nhap, he thong tu dong dieu huong theo role:
- `ADMIN` -> man hinh admin
- `WAREHOUSE_STAFF` -> man hinh kho / nhap hang
- `SALES_STAFF` -> man hinh POS / ban hang
- `MANAGER` -> man hinh dashboard bao cao

### 5.3. Dang ky

Trang dang ky cho phep tao tai khoan moi voi 3 role:
- `SALES_STAFF`
- `WAREHOUSE_STAFF`
- `MANAGER`

`ADMIN` khong duoc mo dang ky cong khai.

Neu ban vua sua code hoac DB moi tinh, van nen chay `npm run prisma:seed` de co du bo role/permission mac dinh.

Luu y quan trong:
- Ban moi tao co duoc role co ban ngay khi dang ky
- Backend hien da tu dong tao role/phien quyen can thiet neu DB chua seed day du
- Tuy vay, seed van la cach on dinh nhat de co du du lieu he thong

## 6. Vai tro va chuc nang

### Admin
- Dashboard tong quan
- Quan ly user
- Quan ly role/quyen
- Cau hinh he thong
- Xem audit log
- Toan quyen thao tac du lieu

### Warehouse Staff
- Tao phiếu nhap kho
- Cap nhat ton kho
- Quan ly nha cung cap
- Khong duoc sua gia ban
- Khong duoc xoa san pham
- Khong xem bao cao doanh thu nhu manager

### Sales Staff
- Giao dien POS
- Nhap ma san pham hoac quet camera
- Tao don hang
- In hoa don
- Khong duoc nhap hang
- Khong duoc sua gia san pham

### Manager
- Dashboard thong ke
- Bao cao ton kho
- Bao cao nhap xuat, doanh thu
- Chi xem, khong tao/sua/xoa

## 7. Camera va nhap ma san pham

Vai tro `SALES_STAFF` co man hinh POS voi:
- o nhap barcode thu cong
- nut mo camera
- tim san pham theo barcode
- them vao gio hang
- tao don hang
- in hoa don

Neu camera khong mo duoc:
- kiem tra trinh duyet da cap quyen camera chua
- neu chay tren host khac, dam bao site hop le cho `getUserMedia`
- van co the dung o nhap ma thu cong de thay the

## 8. Bien moi truong quan trong

File dung cho backend: `backend/.env`

Cac bien quan trong:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/product_management
JWT_SECRET=supersecretkey
JWT_REFRESH_SECRET=superrefreshsecretkey
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost:5672
ELASTICSEARCH_URL=http://localhost:9200
PORT=3000
```

Frontend co the su dung them:
- `VITE_API_URL`

Neu khong set, frontend se mac dinh goi:
- `/api/v1`

Neu frontend chay tai `5173` va backend tai `3000`, co the dat:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 9. Lenh thuong dung

### Backend

```powershell
cd backend
npm run build
npm run test
```

### Frontend

```powershell
cd frontend
npm run build
```

### Root

```powershell
npm run build
npm test
```

Luu y:
- `npm run build` o root la script cho backend
- build frontend phai chay trong thu muc `frontend`

## 10. Kiem tra nhanh neu he thong khong chay dung

### Truong hop 1: Dang ky that bai

Kiem tra theo thu tu nay:
1. Backend co dang chay khong
2. PostgreSQL co dang chay khong
3. `backend/.env` co ton tai khong
4. Da chay `npm run prisma:migrate` chua
5. Da chay `npm run prisma:seed` chua

Neu can reset nhanh du lieu role/user local:

```powershell
cd backend
npm run prisma:seed
```

### Truong hop 2: Dang nhap xong nhung bi 401 lien tuc

Thu lan luot:
1. Xoa token trong `localStorage`
2. Dang nhap lai
3. Kiem tra `JWT_SECRET` va `JWT_REFRESH_SECRET`
4. Kiem tra backend va frontend co dang dung cung API prefix khong

### Truong hop 3: Frontend khong goi duoc API

Kiem tra:
- backend dang chay tai `http://localhost:3000`
- frontend dang goi dung `VITE_API_URL`
- CORS cua backend cho phep domain frontend

### Truong hop 4: Swagger vao duoc nhung mot so chuc nang bi Forbidden

Ly do thuong gap:
- tai khoan dang co khong dung role
- DB chua co du permission/role
- chua seed xong sau khi cap nhat schema logic

Cach xu ly:

```powershell
cd backend
npm run prisma:seed
```

## 11. API quan trong

Base URL:
- `http://localhost:3000/api/v1`

Cac endpoint co ban:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /products`
- `GET /products/barcode/:barcode`

Chi tiet day du xem tren Swagger.

## 12. Trang thai hien tai da duoc xac minh

Da kiem tra thanh cong:
- backend build pass
- frontend build pass
- auth integration test pass

Neu ban gap loi dang ky trong local, kha nang cao nhat la backend chua duoc migrate/seed dung cach hoac DB dang chua chay.
