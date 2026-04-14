Hãy tạo một website quản lý thiết bị phòng lab CNTT sử dụng QR Code với kiến trúc fullstack hiện đại.

1. Công nghệ:
- Frontend: ReactJS (hoặc HTML/CSS/JS)
- UI: màu xanh dương nhạt, hiện đại, responsive
- Backend: Node.js + Express
- Database: MongoDB (sử dụng Mongoose ODM)

2. Chức năng chính:

🔐 Xác thực & phân quyền:
- Trang đăng nhập
- 2 role:
  + Admin
  + User
- Sử dụng JWT để xác thực
- Middleware kiểm tra quyền

📊 Dashboard:
- Tổng số thiết bị
- Thiết bị đang mượn
- Thiết bị bảo trì
- Biểu đồ thống kê (theo ngày/tháng)

📦 Quản lý thiết bị:
- Danh sách thiết bị:
  + Tên
  + QR Code
  + Trạng thái (Available, Borrowed, Maintenance, Overdue)
- Có search + filter
- CRUD thiết bị (Admin)
- Upload ảnh

📷 QR Code:
- Mỗi thiết bị có QR riêng
- QR chứa URL:
  http://localhost:3000/product/{id}
- Scan → chuyển trang chi tiết

📱 Scan QR bằng camera:
- Sử dụng thư viện html5-qrcode
- Scan bằng webcam

📄 Trang chi tiết thiết bị:
- Hiển thị:
  + Tên
  + Mô tả
  + Hình ảnh
  + Trạng thái
- Chức năng:
  + Mượn
  + Trả
- Hiển thị lịch sử giao dịch

📊 Giao dịch:
- Mượn thiết bị:
  + chọn ngày trả
- Trả thiết bị
- Nếu quá hạn:
  + đánh dấu Overdue
  + highlight đỏ

🔔 Notification:
- Thông báo:
  + Quá hạn
  + Thiết bị cần bảo trì
- Icon chuông + badge

🧑‍💼 Quản lý người dùng:
- Admin CRUD user
- Phân quyền

📤 Export:
- Xuất PDF / Excel lịch sử giao dịch

---

3. Database (MongoDB - Mongoose Schema):

👤 User Schema:
- _id
- username: String
- password: String (hashed)
- role: ["admin", "user"]
- createdAt

📦 Product Schema:
- _id
- name: String
- description: String
- status: ["available", "borrowed", "maintenance", "overdue"]
- image: String
- qrCode: String
- createdAt

📊 Transaction Schema:
- _id
- userId: ObjectId (ref: User)
- productId: ObjectId (ref: Product)
- borrowDate: Date
- returnDate: Date
- status: ["borrowing", "returned", "overdue"]

🔔 Notification Schema:
- _id
- message: String
- isRead: Boolean
- createdAt: Date

---

4. API thiết kế:

🔐 Auth:
- POST /api/auth/login

👤 Users:
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

📦 Products:
- GET /api/products
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

📊 Transactions:
- POST /api/transactions/borrow
- POST /api/transactions/return
- GET /api/transactions

🔔 Notifications:
- GET /api/notifications

📷 QR:
- GET /api/scan/:id

---

5. UI/UX:
- Sidebar:
  + Dashboard
  + Products
  + Transactions
  + Users
- Header:
  + Avatar
  + Notification bell
- Giao diện đơn giản, dễ dùng

---

6. Yêu cầu thêm:
- Code rõ ràng, có comment
- Có mock data (seed MongoDB)
- Có hướng dẫn chạy project
- Tách rõ MVC (Model - Controller - Route)

---

7. Bonus:
- Thống kê theo tháng
- Highlight thiết bị sắp quá hạn
- Gợi ý thiết bị được mượn nhiều