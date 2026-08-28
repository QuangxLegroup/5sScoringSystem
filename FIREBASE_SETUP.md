# Hướng dẫn tạo Firebase Project cho hệ thống 5S

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Đăng nhập bằng tài khoản Google
3. Nhấn **"Create a project"** (Tạo dự án)
4. Đặt tên: `legroup-5s` (hoặc tên bạn muốn)
5. Bỏ chọn Google Analytics (không cần)
6. Nhấn **"Create project"**

## Bước 2: Tạo Realtime Database

1. Trong Firebase Console, chọn project vừa tạo
2. Menu bên trái → **Build** → **Realtime Database**
3. Nhấn **"Create Database"**
4. Chọn location: **Singapore (asia-southeast1)** (gần Việt Nam nhất)
5. Chọn **"Start in test mode"** → nhấn **Enable**

## Bước 3: Cập nhật Security Rules

1. Trong trang Realtime Database → tab **Rules**
2. Xóa nội dung cũ, copy toàn bộ nội dung file `firebase-rules.json` vào
3. Nhấn **"Publish"**

## Bước 4: Lấy Firebase Config

1. Trong Firebase Console → biểu tượng ⚙️ (Settings) → **Project settings**
2. Cuộn xuống phần **"Your apps"**
3. Nhấn biểu tượng **`</>`** (Web) để thêm web app
4. Đặt tên: `5S Scoring`
5. **KHÔNG** chọn Firebase Hosting
6. Nhấn **"Register app"**
7. Copy đoạn `firebaseConfig` object, ví dụ:

```js
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "legroup-5s.firebaseapp.com",
  databaseURL: "https://legroup-5s-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "legroup-5s",
  storageBucket: "legroup-5s.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

## Bước 5: Cập nhật file firebase-config.js

1. Mở file `firebase-config.js` trong project
2. Thay thế các giá trị `"YOUR_..."` bằng giá trị thật từ bước 4:

```js
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB...",              // ← thay bằng apiKey thật
  authDomain: "legroup-5s.firebaseapp.com",
  databaseURL: "https://legroup-5s-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "legroup-5s",
  storageBucket: "legroup-5s.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

## Bước 6: Kiểm tra

1. Mở trang web app → nếu loading xong và hiện login → Firebase đã kết nối thành công
2. Đăng nhập admin → sửa 1 điểm → vào Firebase Console → Realtime Database → kiểm tra data xuất hiện
3. Mở 2 tab → sửa điểm ở tab 1 → tab 2 tự cập nhật = realtime sync hoạt động

## Lưu ý

- **Dữ liệu cũ trên localStorage sẽ KHÔNG tự migrate.** Lần đầu chạy, app tạo data mẫu 5S mới trên Firebase.
- **databaseURL** rất quan trọng, phải đúng region. Nếu chọn Singapore thì URL có dạng `...asia-southeast1.firebasedatabase.app`
- **Test mode** mặc định hết hạn sau 30 ngày. Hãy cập nhật rules từ file `firebase-rules.json` để tránh bị khóa.
