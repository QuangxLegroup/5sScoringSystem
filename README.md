# LeGroup 5S Local Web App

Web app cham diem 5S theo bang mau `Tong Hop diem 5S thang 12.2025`.

## Ngon ngu su dung

- HTML: cau truc giao dien.
- CSS: giao dien, bang diem giong Excel, dashboard, popup.
- JavaScript thuan: dang nhap, phan quyen, cham diem, luu localStorage, xuat Excel.

Hien tai app khong dung backend, SQLite hay Firebase. Du lieu tam thoi nam trong
`localStorage` cua trinh duyet.

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

1. Admin dang nhap, xem `Bang Excel` dau tien va xuat file Excel cuoi.
2. Admin tao ky cham moi theo thang trong `Danh muc`; ky moi bat dau trong diem.
3. Admin sua ten zone, truong phong, nhom tong diem va nguoi cham trong `Danh muc`.
4. Admin tao/sua/xoa tai khoan nguoi cham trong `Tai khoan`.
5. Mot nguoi cham co the phu trach nhieu zone. Khi dang nhap, ho thay toan bo bang nhung chi sua duoc cac zone duoc gan.
6. Moi lan sua diem hoac admin them/sua/xoa du lieu se ghi lich su. Dashboard hien 10 dong lich su moi trang.

## Ghi chu

- Hang muc 5S co dinh theo file mau, khong cho sua trong app.
- Thang diem la 1 den 5.
- File xuat ra la `.xlsx`, gom bang diem chi tiet o tren va dashboard o duoi, co style mau, merge cell, o N/A gach cheo va cong thuc tinh diem.
