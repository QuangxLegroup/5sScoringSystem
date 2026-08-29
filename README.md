# LeGroup 5S Local Web App

Web app cham diem 5S theo bang mau `Tong Hop diem 5S thang 12.2025`.

## Ngon ngu su dung

- HTML: cau truc giao dien.
- CSS: giao dien, bang diem giong Excel, dashboard, popup.
- JavaScript thuan: dang nhap, phan quyen, cham diem, luu Firebase, xuat Excel.

Hien tai app dung Firebase Realtime Database theo cau hinh trong `firebase-config.js`.
Ung dung van la app tinh, khong co backend SMTP rieng.

## Chay app

Mo file:

```text
D:\LeGroup\scoring-system\index.html
```

Tai khoan admin tam:

```text
Username: duongbichngoc
Password: 12345678
```

## Luong su dung

1. Admin dang nhap, xem `Tong hop diem`, `Danh gia an toan`, `Thong ke AT`, `Danh muc` va `Tai khoan`; trang admin khong hien `Phieu cham`.
2. Admin tao ky cham moi theo thang trong `Danh muc`; ky moi bat dau trong diem.
3. Admin them/sua/xoa danh muc `Assessor` rieng trong `Danh muc`, sau do khi them/sua zone se chon assessor tu dropdown.
4. Admin them/sua/xoa nguoi phu trach zone va email nhan bao cao ngay trong muc `Nguoi phu trach zone / nguoi duoc danh gia`.
5. Admin sua ten zone, truong phong, nhom tong diem, nguoi phu trach zone/nguoi duoc danh gia va assessor dong cuoi trong `Danh muc` hoac ngay tren bang tong hop.
6. Admin tao/sua/xoa tai khoan assessor trong `Tai khoan`; tai khoan assessor khong dung email, zone chinh duoc lay tu danh muc zone da chon assessor, checkbox trong tai khoan chi dung de gan them zone ngoai le.
7. Assessor dang nhap se thay toan bo bang nhung chi sua duoc cac zone duoc gan.
8. Assessor dung `Phieu cham` de xem day du tieu chi cap 1-5, chon diem hoac `Gach cheo`, ghi chu van de va them anh minh hoa.
9. Admin xem `Danh gia an toan` de tong hop cac ghi chu/anh theo form Hazard Identification & Activity Follow Up Sheet, sua noi dung bao cao, them anh sau cai tien, dong/mo trang thai van de, xuat file DG AT va copy danh sach email nguoi phu trach cac zone dang co van de de dan vao Gmail.
10. Admin xem `Thong ke AT` de dem so van de dang gap phai trong thang theo zone va STOP 6.

## Ghi chu

- Hang muc 5S co dinh theo file mau, khong cho sua trong app.
- Moi ky danh gia co `settingsSnapshot` rieng. Ky moi nhat dung thiet lap hien tai; khi mo ky cu, bang tong hop va bang DG AT dung snapshot cua ky do nen khong bi doi theo danh muc moi. Neu admin sua truc tiep tren bang cua ky cu thi chi sua snapshot cua ky cu do.
- Thang diem la 1 den 5, them lua chon `Gach cheo` cho o khong cham; khi chon se cap nhat hien thi o ngay trong giao dien.
- File xuat ra la `.xlsx`, gom bang diem chi tiet va bang danh gia an toan o dang bang tinh giong giao dien web, co style mau, merge cell, o `Gach cheo`, khong chen cot cong thuc phu gay loi `####`.
- Nut danh sach email gom email cua nguoi phu trach zone dang co van de, loai trung va cho copy nhanh de dan vao Gmail.
