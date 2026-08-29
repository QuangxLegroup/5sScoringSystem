(() => {
  "use strict";

  const DATA_VERSION = 4;
  const DB_PATH = "legroup-5s";
  const BENCHMARK = 3.3;
  const PAGE_SIZE = 10;
  const SCORE_CROSSED = "na";
  const XLSX_ROW_OFFSET = 1;
  const XLSX_COLUMN_OFFSET = 1;
  const XLSX_LEADING_COLUMN_WIDTH = 2.89;
  const XLSX_AREA_COLUMN_WIDTHS = [
    3.11, 2.78, 2.78, 3.22, 2.78, 3.22, 2.78, 2.89, 2.78, 2.78,
    3.22, 3.33, 3.33, 3.56, 3.11, 3.11, 2.78, 3.33, 3.56, 2.78,
    3.11, 3.11, 3.22, 2.78, 3.22, 3.33, 2.89, 2.22, 2.22,
  ];
  const ADMIN_USERNAME = "duongbichngoc";
  const ADMIN_PASSWORD = "12345678";
  const CRC32_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      table[index] = value >>> 0;
    }
    return table;
  })();

  const CRITERIA_3S = [
    { id: "phan-loai", label: "Phân loại" },
    { id: "sap-xep", label: "Sắp xếp" },
    { id: "lau-don", label: "Lau dọn" },
  ];

  const SCORE_LEVEL_LABELS = window.FIVE_S_LEVEL_LABELS || [
    "Rất xấu (Cấp 1)",
    "Xấu (Cấp 2)",
    "Bình thường (Cấp 3)",
    "Tốt (Cấp 4)",
    "Rất tốt (Cấp 5)",
  ];
  const SCORE_GUIDE = window.FIVE_S_STANDARDS || {};
  const STOP6_OPTIONS = [
    { value: "", label: "Chưa phân loại" },
    { value: "1-Kẹp,kẹt", label: "1-Kẹp,kẹt" },
    { value: "2-Vật nặng", label: "2-Vật nặng" },
    { value: "3-Xe cộ", label: "3-Xe cộ" },
    { value: "4-Rơi,ngã", label: "4-Rơi,ngã" },
    { value: "5-Điện giật", label: "5-Điện giật" },
    { value: "6-Cháy nổ", label: "6-Cháy nổ" },
    { value: "7-Loại khác", label: "7-Loại khác" },
  ];
  const SAFETY_STOP6_COLUMNS = [
    { value: "1-Kẹp,kẹt", label: "kẹp kẹt" },
    { value: "2-Vật nặng", label: "vật nặng" },
    { value: "3-Xe cộ", label: "xe cộ" },
    { value: "4-Rơi,ngã", label: "rơi ngã" },
    { value: "5-Điện giật", label: "điện giật" },
    { value: "6-Cháy nổ", label: "cháy nổ" },
    { value: "7-Loại khác", label: "loại khác" },
  ];
  const ISSUE_LEVEL_OPTIONS = [
    { value: "", label: "Chưa chọn cấp" },
    { value: "A", label: "Cấp độ A" },
    { value: "B", label: "Cấp độ B" },
    { value: "C", label: "Cấp độ C" },
  ];
  const SAFETY_LEVEL_COLUMNS = [
    { value: "A", label: "độ A" },
    { value: "B", label: "độ B" },
    { value: "C", label: "độ C" },
  ];
  const SAFETY_FOUND_OPTIONS = [
    { value: "", label: "Chưa chọn" },
    { value: "member", label: "Member" },
    { value: "internal-audit", label: "Internal audit" },
    { value: "lean", label: "(LEAN)" },
  ];
  const SAFETY_FOUND_COLUMNS = SAFETY_FOUND_OPTIONS.filter((option) => option.value);
  const ISSUE_STATUS_LABELS = {
    open: "Đang gặp phải",
    closed: "Đã xử lý",
  };
  const DEFAULT_SAFETY_REPORT = {
    performer: "Assessor 5S",
    performerTitle: "Assessor",
    checker: "BGĐ Nhà máy, Các TBP, LEAN",
    department: "5S/An toàn",
    checkerTitle: "",
    checkerDepartment: "",
    instruction: 'Đánh dấu "1" vào mục chọn',
    issueDate: "",
    reportDate: "",
  };

  const DEFAULT_ITEMS = [
    { id: "a1", code: "(A1)", name: "Đường đi bộ", criteria: CRITERIA_3S },
    { id: "a2", code: "(A2)", name: "Cây nước", criteria: CRITERIA_3S },
    { id: "a3", code: "(A3)", name: "Khu vực rửa tay, nhà vệ sinh", criteria: CRITERIA_3S },
    { id: "b1", code: "(B1)", name: "Khu để dầu, hóa chất, sơn (các loại dd hóa chất)", criteria: CRITERIA_3S },
    { id: "b2", code: "(B2)", name: "Hàng lưu kho, hàng lỗi", criteria: CRITERIA_3S },
    { id: "b3", code: "(B3)", name: "Nơi để vật tư, vật liệu, găng tay, giẻ lau", criteria: CRITERIA_3S },
    { id: "c1", code: "(C1)", name: "Nơi làm việc", criteria: CRITERIA_3S },
    { id: "c2", code: "(C2)", name: "Thiết bị máy móc sản xuất", criteria: CRITERIA_3S },
    { id: "c3", code: "(C3)", name: "Bàn thao tác", criteria: CRITERIA_3S },
    { id: "c4", code: "(C4)", name: "Nơi để đồ giá, Jig, tủ dụng cụ", criteria: CRITERIA_3S },
    { id: "c5", code: "(C5)", name: "Bảng quản lý trong dây chuyền", criteria: CRITERIA_3S },
    { id: "d1", code: "(D1)", name: "Khu vực nghỉ", criteria: CRITERIA_3S },
    { id: "d2", code: "(D2)", name: "Bàn quản lý (GL)", criteria: CRITERIA_3S },
    { id: "d3", code: "(D3)", name: "Khu để tư liệu, tài liệu", criteria: CRITERIA_3S },
    { id: "e1", code: "(E1)", name: "Tự giác của tổ viên", criteria: [{ id: "diem", label: "Điểm" }] },
    { id: "e2", code: "(E2)", name: "Tự giác của người giám sát", criteria: [{ id: "diem", label: "Điểm" }] },
  ];

  const DEFAULT_AREA_COLUMNS = [
    { code: "25", departmentHead: "Mr Phong", summaryGroup: "Mr Việt Anh", scorerName: "Mr Trần Anh", highlight: true },
    { code: "19", departmentHead: "Mr Phong", summaryGroup: "Mr Việt Anh", scorerName: "Mr Nghinh", highlight: false },
    { code: "18.1", departmentHead: "Mr Phong", summaryGroup: "Mr Việt Anh", scorerName: "Mr Thao", highlight: false },
    { code: "18.2", departmentHead: "Mr Phong", summaryGroup: "Mr Việt Anh", scorerName: "Mr Thao", highlight: true },
    { code: "5", departmentHead: "Mr Lĩnh", summaryGroup: "Mr Lĩnh", scorerName: "Mr Vũ", highlight: false },
    { code: "1", departmentHead: "Mr Lĩnh", summaryGroup: "Mr Lĩnh", scorerName: "Mr Thông", highlight: false },
    { code: "6", departmentHead: "Mr Lĩnh", summaryGroup: "Mr Lĩnh", scorerName: "Mr Cường", highlight: false },
    { code: "7", departmentHead: "Mr Lĩnh", summaryGroup: "Mr Lĩnh", scorerName: "Mr Xiêm", highlight: false },
    { code: "26", departmentHead: "Mr Lĩnh", summaryGroup: "Mr Lĩnh", scorerName: "Mr Hùng", highlight: false },
    { code: "4", departmentHead: "Mr Lĩnh", summaryGroup: "Mr Lĩnh", scorerName: "Mr The", highlight: false },
    { code: "15", departmentHead: "Mr Cương", summaryGroup: "Mr Cương", scorerName: "Mr Hùng", highlight: false },
    { code: "12.1", departmentHead: "Mr Cương", summaryGroup: "Mr Cương", scorerName: "Tiến 201", highlight: false },
    { code: "12.2", departmentHead: "Mr Cương", summaryGroup: "Mr Cương", scorerName: "Mr Ut Tiến", highlight: true },
    { code: "13", departmentHead: "Mr Cương", summaryGroup: "Mr Cương", scorerName: "Mr Cương", highlight: false },
    { code: "14", departmentHead: "Mr Cương", summaryGroup: "Mr Cương", scorerName: "Mr Cương", highlight: false },
    { code: "10", departmentHead: "Mr Trọng", summaryGroup: "Mr Trọng", scorerName: "Mr Quyết", highlight: true },
    { code: "8", departmentHead: "Mr Trọng", summaryGroup: "Mr Trọng", scorerName: "Mr Quyền", highlight: false },
    { code: "9", departmentHead: "Mr Trọng", summaryGroup: "Mr Trọng", scorerName: "Mr Huy", highlight: false },
    { code: "16", departmentHead: "Mrs Nga", summaryGroup: "Mr Trung", scorerName: "Mr Trung", highlight: false },
    { code: "17", departmentHead: "Mrs Nga", summaryGroup: "Mrs Nga", scorerName: "Mrs Nga", highlight: false },
    { code: "2", departmentHead: "Mrs Duyên", summaryGroup: "Mrs Liên", scorerName: "Mr Hương", highlight: false },
    { code: "3", departmentHead: "Mrs Duyên", summaryGroup: "Mrs Liên", scorerName: "Mrs Thắng", highlight: false },
    { code: "24", departmentHead: "", summaryGroup: "Mr Long", scorerName: "Mr Long", highlight: false },
    { code: "21", departmentHead: "", summaryGroup: "Ms Dương", scorerName: "Mrs Dương", highlight: false },
    { code: "22", departmentHead: "", summaryGroup: "Mr Việt", scorerName: "Mr Việt", highlight: true },
    { code: "11", departmentHead: "", summaryGroup: "Mr Văn", scorerName: "Mr Văn", highlight: false },
    { code: "23", departmentHead: "", summaryGroup: "Mr Công", scorerName: "Mr Công", highlight: false },
    { code: "20", departmentHead: "", summaryGroup: "", scorerName: "Mr Ánh", highlight: false },
    { code: "27", departmentHead: "", summaryGroup: "", scorerName: "Mr Đạt", highlight: false },
  ];

  const SAMPLE_VALUES = {
    a1: {
      "phan-loai": [3, 4, 4, null, 3, 3, 3, 3, 3, 3, 4, 3, 4, 3, 4, 4, 3, 3, 3, 3, 3, 3, null, 3, 3, 3, 3, null, null],
      "sap-xep": [3, 4, 3, null, 3, 3, 3, 3, 3, 3, 4, 3, 4, 3, 4, 3, 3, 3, 3, 3, 3, 3, null, 3, 3, 3, 3, null, null],
      "lau-don": [3, 3, 3, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, null, 3, 3, 3, 3, null, null],
    },
    a2: {
      "phan-loai": [4, 4, 4, null, 4, 3, 3, 4, 4, 3, null, 4, 4, 4, 4, 4, 4, 3, 3, 4, null, 4, 4, 4, 3, 4, 4, null, null],
      "sap-xep": [4, 3, 4, null, 3, 3, 4, 3, 3, 4, null, 4, 4, 3, 4, 4, 4, 3, 4, 3, null, 3, 4, 4, 3, 4, 4, null, null],
      "lau-don": [4, 3, 3, null, 3, 4, 3, 3, 3, 3, null, 3, 3, 3, 3, 3, 3, 3, 4, 3, null, 3, 3, 3, 4, 3, 3, null, null],
    },
    a3: {
      "phan-loai": [3, null, null, null, null, null, 3, 3, null, 3, null, null, null, null, 3, 4, null, null, null, 3, null, null, null, 3, null, null, null, null, null],
      "sap-xep": [3, null, null, null, null, null, 3, 3, null, 3, null, null, null, null, 3, 3, null, null, null, 3, null, null, null, 3, null, null, null, null, null],
      "lau-don": [4, null, null, null, null, null, 3, 3, null, 3, null, null, null, null, 3, 3, null, null, null, 3, null, null, null, 3, null, null, null, null, null],
    },
    b1: {
      "phan-loai": [3, null, 3, null, 4, 3, 3, 3, 4, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 4, null, 3, 3, 3, 3, 3, 3, null, null],
      "sap-xep": [3, null, 3, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, 3, 4, 3, 3, 3, 3, null, null],
      "lau-don": [3, null, 3, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, 3, 3, 3, 3, 3, 3, null, null],
    },
    b2: {
      "phan-loai": [3, 3, 3, null, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, null, 3, 4, 3, 3, 3, null, null],
      "sap-xep": [3, 3, 3, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, 3, 3, 3, 3, 3, null, null],
      "lau-don": [3, 3, 3, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, 3, 3, 3, 3, 3, null, null],
    },
    b3: {
      "phan-loai": [3, 3, 3, null, 3, 3, 4, 4, 4, 4, 3, 3, 4, 3, 3, 3, 3, 3, 3, 4, 3, 3, 4, 3, 3, 3, 4, null, null],
      "sap-xep": [3, 3, 3, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, null, null],
      "lau-don": [3, 3, 3, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, null, null],
    },
    c1: {
      "phan-loai": [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, null],
      "sap-xep": [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, null],
      "lau-don": [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, null],
    },
    c2: {
      "phan-loai": [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, null, 3, 3, 4, 3, 3, 3, null, null],
      "sap-xep": [3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, 3, 3, 3, 3, 3, 3, null, null],
      "lau-don": [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, 3, 3, 3, 3, 3, 3, null, null],
    },
    c3: {
      "phan-loai": [3, 3, 3, null, 4, 3, 4, 4, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, null, 4, null, null, 3, 3, 3, 3, 3, null, null],
      "sap-xep": [3, 3, 3, null, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, 3, null, null, 3, 3, 3, 3, 3, null, null],
      "lau-don": [3, 3, 3, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, 3, null, null, 4, 3, 3, 3, 3, null, null],
    },
    c4: {
      "phan-loai": [3, 3, 3, null, 3, 3, 4, 4, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, null, 3, null, null, 3, null, 3, 3, 3, null, null],
      "sap-xep": [3, 3, 3, null, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, null, 3, null, null, 4, null, 3, 3, 3, null, null],
      "lau-don": [3, 3, 3, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, 3, null, null, 3, null, 3, 3, 3, null, null],
    },
    c5: {
      "phan-loai": [3, 3, 3, 4, 3, 3, 3, 3, 4, 3, 3, 4, 4, 4, 4, 4, 3, 4, 3, 3, 3, 3, 3, 4, 3, 3, 3, null, null],
      "sap-xep": [3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, null],
      "lau-don": [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, null, null],
    },
    d1: {
      "phan-loai": [null, null, 4, null, null, 4, 3, null, null, 3, null, null, null, 3, null, null, null, null, 3, 4, 3, null, null, 3, null, 4, null, null, null],
      "sap-xep": [null, null, 4, null, null, 3, 3, null, null, 3, null, null, null, 3, null, null, null, null, 3, 3, 3, null, null, 3, null, 4, null, null, null],
      "lau-don": [null, null, 3, null, null, 4, 3, null, null, 3, null, null, null, 4, null, null, null, null, 3, 3, 3, null, null, 3, null, 3, null, null, null],
    },
    d2: {
      "phan-loai": [4, 4, 3, null, 4, 4, 4, 4, 3, 4, 3, 3, 4, 4, 4, 4, 4, 3, 3, 4, 3, 3, 4, 4, 3, 4, null, null, null],
      "sap-xep": [4, 3, 3, null, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 4, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 4, null, null, null],
      "lau-don": [4, 3, 3, null, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, null, null, null],
    },
    d3: {
      "phan-loai": [3, 3, 4, null, 3, 3, 3, 4, 3, 3, 3, 3, 4, 3, 4, 4, 4, 3, 3, 4, null, 3, 3, 4, 3, 3, 3, null, null],
      "sap-xep": [3, 3, 4, null, 3, 4, 3, 3, 3, 3, 3, 4, 4, 4, 3, 4, 4, 3, 3, 3, null, 3, 3, 3, 3, 3, 3, null, null],
      "lau-don": [4, 3, 3, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, 3, 3, 3, 3, 3, 3, null, null],
    },
    e1: {
      diem: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, null],
    },
    e2: {
      diem: [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, null],
    },
  };

  const elements = {
    loginScreen: document.getElementById("login-screen"),
    loginForm: document.getElementById("login-form"),
    loginUsername: document.getElementById("login-username"),
    loginPassword: document.getElementById("login-password"),
    appShell: document.getElementById("app-shell"),
    userBox: document.getElementById("user-box"),
    accountMenuButton: document.getElementById("account-menu-button"),
    accountMenu: document.getElementById("account-menu"),
    accountAvatar: document.getElementById("account-avatar"),
    accountMenuAvatar: document.getElementById("account-menu-avatar"),
    accountMenuName: document.getElementById("account-menu-name"),
    accountMenuUsername: document.getElementById("account-menu-username"),
    currentUserName: document.getElementById("current-user-name"),
    currentUserRole: document.getElementById("current-user-role"),
    logoutButton: document.getElementById("logout-button"),
    assessorPeriodSelect: document.getElementById("assessor-period-select"),
    assessorAreaSelect: document.getElementById("assessor-area-select"),
    assessorProgress: document.getElementById("assessor-progress"),
    assessorTitle: document.getElementById("assessor-title"),
    assessorSheet: document.getElementById("assessor-sheet"),
    summaryPeriodSelect: document.getElementById("summary-period-select"),
    assignedZoneSummary: document.getElementById("assigned-zone-summary"),
    summaryTable: document.getElementById("summary-table"),
    summaryTitle: document.getElementById("summary-title"),
    exportExcelButton: document.getElementById("export-excel-button"),
    safetyPeriodSelect: document.getElementById("safety-period-select"),
    safetyAreaFilter: document.getElementById("safety-area-filter"),
    safetyTable: document.getElementById("safety-table"),
    editSafetyMetaButton: document.getElementById("edit-safety-meta-button"),
    exportSafetyExcelButton: document.getElementById("export-safety-excel-button"),
    sendSafetyMailButton: document.getElementById("send-safety-mail-button"),
    issueStatsPeriodSelect: document.getElementById("issue-stats-period-select"),
    issueStatsGrid: document.getElementById("issue-stats-grid"),
    issueZoneStats: document.getElementById("issue-zone-stats"),
    issueTypeStats: document.getElementById("issue-type-stats"),
    periodForm: document.getElementById("period-form"),
    periodMonth: document.getElementById("period-month"),
    periodYear: document.getElementById("period-year"),
    periodList: document.getElementById("period-list"),
    archivedPeriodList: document.getElementById("archived-period-list"),
    scorerForm: document.getElementById("scorer-form"),
    scorerName: document.getElementById("scorer-name"),
    scorerEmails: document.getElementById("scorer-emails"),
    scorerList: document.getElementById("scorer-list"),
    catalogAssessorForm: document.getElementById("catalog-assessor-form"),
    catalogAssessorName: document.getElementById("catalog-assessor-name"),
    catalogAssessorList: document.getElementById("catalog-assessor-list"),
    areaForm: document.getElementById("area-form"),
    areaCode: document.getElementById("area-code"),
    areaHead: document.getElementById("area-head"),
    areaSummaryGroup: document.getElementById("area-summary-group"),
    areaScorer: document.getElementById("area-scorer"),
    areaAssessor: document.getElementById("area-assessor"),
    areaHighlight: document.getElementById("area-highlight"),
    areaList: document.getElementById("area-list"),
    itemList: document.getElementById("item-list"),
    accountForm: document.getElementById("account-form"),
    accountAssessor: document.getElementById("account-assessor"),
    accountZoneList: document.getElementById("account-zone-list"),
    accountUsername: document.getElementById("account-username"),
    accountPassword: document.getElementById("account-password"),
    accountList: document.getElementById("account-list"),
    modalBackdrop: document.getElementById("modal-backdrop"),
    modalTitle: document.getElementById("modal-title"),
    modalBody: document.getElementById("modal-body"),
    modalActions: document.getElementById("modal-actions"),
    modalCloseButton: document.getElementById("modal-close-button"),
    toast: document.getElementById("toast"),
  };

  let state = null;
  let currentUser = null;
  let activeTab = "home";
  let toastTimer = 0;
  let db = null; // Firebase database reference
  let modalPreviewDirty = false;
  let modalSubmitSucceeded = false;
  let snapshotSeedPromise = null;

  // ─── Firebase helpers ───────────────────────────────────────────────────────

  function getDb() {
    if (!db) {
      firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.database();
    }
    return db;
  }

  function dbRef(path) {
    return path ? getDb().ref(`${DB_PATH}/${path}`) : getDb().ref(DB_PATH);
  }

  // Convert Firebase snapshot (object keyed by id) → sorted array
  function snapshotToArray(snapshot) {
    if (Array.isArray(snapshot)) {
      return snapshot.filter((item) => item && typeof item === "object");
    }

    const result = [];
    if (snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)) {
      Object.values(snapshot).forEach((item) => {
        if (item && typeof item === "object") {
          result.push(item);
        }
      });
    }
    return result;
  }

  // ─── Default / normalize state ───────────────────────────────────────────────

  function createDefaultState() {
    const now = new Date().toISOString();
    const managers = [];
    const managerIdsByName = new Map();

    DEFAULT_AREA_COLUMNS.forEach((column) => {
      if (!managerIdsByName.has(column.scorerName)) {
        const id = `scorer-${managers.length + 1}`;
        managerIdsByName.set(column.scorerName, id);
        managers.push({ id, name: column.scorerName, emails: [], createdAt: now });
      }
    });

    const areas = DEFAULT_AREA_COLUMNS.map((column, index) => ({
      id: `area-${index + 1}`,
      order: index + 1,
      code: column.code,
      templateCode: column.code,
      departmentHead: column.departmentHead,
      summaryGroup: column.summaryGroup,
      scorerId: managerIdsByName.get(column.scorerName),
      assessorName: "",
      highlight: column.highlight,
      createdAt: now,
    }));

    const periodId = "period-2025-12";

    const defaultState = {
      version: DATA_VERSION,
      benchmark: BENCHMARK,
      activePeriodId: periodId,
      periods: [
        { id: periodId, month: 12, year: 2025, label: "Tháng 12/2025", createdAt: now, archived: false },
      ],
      managers,
      areas,
      accounts: [
        {
          id: "admin",
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
          role: "admin",
          name: "Dương Bích Ngọc",
          createdAt: now,
        },
      ],
      assessors: [],
      safetyReport: { ...DEFAULT_SAFETY_REPORT },
      scores: buildSampleScores(periodId, areas, managers, now),
      history: [],
    };

    defaultState.periods[0].settingsSnapshot = makeSettingsSnapshot(defaultState);
    return defaultState;
  }

  function buildSampleScores(periodId, areas, managers, timestamp) {
    const managerById = new Map(managers.map((manager) => [manager.id, manager]));
    const scores = [];

    DEFAULT_ITEMS.forEach((item) => {
      item.criteria.forEach((criterion) => {
        const values = SAMPLE_VALUES[item.id]?.[criterion.id] || [];
        values.forEach((value, index) => {
          if (!Number.isFinite(value)) {
            return;
          }

          const area = areas[index];
          if (!area || isNotApplicable(item.id, criterion.id, area)) {
            return;
          }

          scores.push({
            id: makeId("score"),
            periodId,
            areaId: area.id,
            itemId: item.id,
            criterionId: criterion.id,
            score: value,
            note: "",
            scorerName: area.assessorName || "",
            accountUsername: "file-mau",
            updatedAt: timestamp,
          });
        });
      });
    });

    return scores;
  }

  // Convert raw Firebase data (nested objects) → normalised state with arrays
  function normalizeState(raw) {
    const normalized = {
      ...raw,
      version: DATA_VERSION,
      benchmark: Number(raw.benchmark) || BENCHMARK,
      periods: snapshotToArray(raw.periods),
      managers: snapshotToArray(raw.managers),
      assessors: snapshotToArray(raw.assessors),
      areas: snapshotToArray(raw.areas),
      accounts: snapshotToArray(raw.accounts),
      safetyReport: { ...DEFAULT_SAFETY_REPORT, ...(raw.safetyReport || {}) },
      scores: snapshotToArray(raw.scores),
      history: snapshotToArray(raw.history),
    };

    normalized.periods = normalized.periods.map((period) => ({
      ...period,
      archived: Boolean(period.archived),
      settingsSnapshot: normalizeSettingsSnapshot(period.settingsSnapshot),
    }));

    normalized.managers = normalized.managers
      .map((manager) => {
        const name = String(manager.name || "").trim();
        return {
          id: manager.id || makeStableId("scorer", name),
          name,
          emails: mergeEmailLists(manager.emails, manager.email, manager.managerEmail, manager.managerEmails),
          createdAt: manager.createdAt || "",
        };
      })
      .filter((manager) => manager.id && manager.name);

    if (!normalized.accounts.some((account) => account.username === ADMIN_USERNAME && account.role === "admin")) {
      normalized.accounts.unshift({
        id: "admin",
        username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
          role: "admin",
          name: "Dương Bích Ngọc",
          createdAt: new Date().toISOString(),
        });
      }

    if (!normalized.activePeriodId || !normalized.periods.some((period) => period.id === normalized.activePeriodId)) {
      normalized.activePeriodId = normalized.periods[0]?.id || "";
    }

    const defaultAreaByCode = new Map(DEFAULT_AREA_COLUMNS.map((area) => [area.code, area]));
    normalized.areas = normalized.areas
      .map((area, index) => ({
        ...area,
        order: Number.isFinite(area.order) ? area.order : index + 1,
        templateCode: area.templateCode || area.code,
        departmentHead: area.departmentHead ?? defaultAreaByCode.get(area.templateCode || area.code)?.departmentHead ?? "",
        summaryGroup: area.summaryGroup ?? defaultAreaByCode.get(area.templateCode || area.code)?.summaryGroup ?? area.departmentHead ?? "",
        managerEmails: normalizeEmailList(area.managerEmails || area.managerEmail || ""),
        assessorName: area.assessorName || "",
        assessorId: area.assessorId || "",
        highlight: area.highlight ?? Boolean(defaultAreaByCode.get(area.templateCode || area.code)?.highlight),
      }))
      .sort((a, b) => a.order - b.order);

    const legacyEmailsByManagerId = new Map();
    normalized.areas.forEach((area) => {
      const emails = normalizeEmailList(area.managerEmails || area.managerEmail || "");
      if (!area.scorerId || !emails.length) {
        return;
      }

      legacyEmailsByManagerId.set(area.scorerId, mergeEmailLists(legacyEmailsByManagerId.get(area.scorerId), emails));
    });
    normalized.managers = normalized.managers.map((manager) => ({
      ...manager,
      emails: mergeEmailLists(manager.emails, legacyEmailsByManagerId.get(manager.id)),
    }));
    normalized.areas = normalized.areas.map((area) => {
      const { managerEmail, managerEmails, ...areaWithoutLegacyEmails } = area;
      return areaWithoutLegacyEmails;
    });

    let assessorByName = new Map(normalized.assessors.map((assessor) => [String(assessor.name || "").trim().toLocaleLowerCase("vi"), assessor]));
    const ensureAssessor = (name) => {
      const cleanName = String(name || "").trim();
      if (!cleanName) {
        return null;
      }

      const key = cleanName.toLocaleLowerCase("vi");
      if (assessorByName.has(key)) {
        return assessorByName.get(key);
      }

      const assessor = {
        id: makeStableId("assessor", cleanName),
        name: cleanName,
        createdAt: new Date().toISOString(),
      };
      normalized.assessors.push(assessor);
      assessorByName.set(key, assessor);
      return assessor;
    };

    normalized.areas.forEach((area) => ensureAssessor(area.assessorName));
    normalized.accounts
      .filter((account) => account.role !== "admin")
      .forEach((account) => ensureAssessor(account.name));
    assessorByName = new Map(normalized.assessors.map((assessor) => [String(assessor.name || "").trim().toLocaleLowerCase("vi"), assessor]));
    const assessorById = new Map(normalized.assessors.map((assessor) => [assessor.id, assessor]));
    normalized.areas = normalized.areas.map((area) => {
      const matchedByName = assessorByName.get(String(area.assessorName || "").trim().toLocaleLowerCase("vi"));
      const assessorId = area.assessorId || matchedByName?.id || "";
      return {
        ...area,
        assessorId,
        assessorName: assessorById.get(assessorId)?.name || area.assessorName || "",
      };
    });

    const managerById = new Map(normalized.managers.map((manager) => [manager.id, manager]));
    normalized.accounts = normalized.accounts.map((account) => {
      const { email, senderEmail, ...accountWithoutEmail } = account;
      if (account.role === "admin") {
        return { ...accountWithoutEmail, role: "admin" };
      }

      const explicitAreaIds = Array.isArray(account.areaIds) ? account.areaIds.filter(Boolean) : [];
      const migratedAreaIds = explicitAreaIds.length
        ? explicitAreaIds
        : normalized.areas
            .filter((area) => account.scorerId && area.scorerId === account.scorerId)
            .map((area) => area.id);

      const matchedAssessorId = account.assessorId || assessorByName.get(String(account.name || "").trim().toLocaleLowerCase("vi"))?.id || "";
      return {
        ...accountWithoutEmail,
        role: "manager",
        assessorId: matchedAssessorId,
        name: assessorById.get(matchedAssessorId)?.name || account.name || managerById.get(account.scorerId)?.name || account.username || "",
        areaIds: [...new Set(migratedAreaIds)],
      };
    });

    normalized.scores = normalized.scores.map((score) => ({
      ...score,
      status: score.status === SCORE_CROSSED ? SCORE_CROSSED : "",
      note: score.note || "",
      photoDataUrl: score.photoDataUrl || "",
      photoName: score.photoName || "",
      issueType: score.issueType || "",
      issueLevel: score.issueLevel || "",
      issueStatus: score.issueStatus === "closed" ? "closed" : score.note || score.photoDataUrl ? "open" : "",
      issueLocation: score.issueLocation || "",
      issueDay: score.issueDay || "",
      issueMonth: score.issueMonth || "",
      issueCount: normalizeIssueCount(score.issueCount),
      issueFoundBy: score.issueFoundBy || "",
      issueItemLabel: score.issueItemLabel || "",
      foundChannel: score.foundChannel || "",
      improvementContent: score.improvementContent || "",
      afterPhotoDataUrl: score.afterPhotoDataUrl || "",
      afterPhotoName: score.afterPhotoName || "",
      actionOwner: score.actionOwner || "",
      actionPlan: score.actionPlan || "",
      completionDate: score.completionDate || "",
      completionLevelConfirm: score.completionLevelConfirm || "",
      completionStop6Confirm: score.completionStop6Confirm || "",
    }));

    return normalized;
  }

  // Convert arrays → keyed objects for Firebase storage
  function stateToFirebase(s) {
    function toObj(arr) {
      if (!Array.isArray(arr) || arr.length === 0) return null;
      const obj = {};
      arr.forEach((item) => {
        if (item?.id) obj[item.id] = item;
      });
      return obj;
    }

    const managers = (s.managers || []).map((manager) => ({
      id: manager.id,
      name: manager.name || "",
      emails: normalizeEmailList(manager.emails),
      createdAt: manager.createdAt || "",
    }));
    const areas = (s.areas || []).map((area) => {
      const { managerEmail, managerEmails, ...areaWithoutLegacyEmails } = area;
      return areaWithoutLegacyEmails;
    });
    const accounts = (s.accounts || []).map((account) => {
      const { email, senderEmail, ...accountWithoutEmail } = account;
      return accountWithoutEmail;
    });

    return {
      version: s.version,
      benchmark: s.benchmark,
      activePeriodId: s.activePeriodId || "",
      periods: toObj(s.periods),
      managers: toObj(managers),
      assessors: toObj(s.assessors),
      areas: toObj(areas),
      accounts: toObj(accounts),
      safetyReport: s.safetyReport || DEFAULT_SAFETY_REPORT,
      scores: toObj(s.scores),
      history: toObj(s.history),
    };
  }

  // ─── Load from Firebase (once on startup) ────────────────────────────────────

  async function loadStateFromFirebase() {
    const snapshot = await dbRef().once("value");
    const raw = snapshot.val();

    if (raw && raw.version === DATA_VERSION) {
      const normalized = normalizeState(raw);
      cleanupDeprecatedEmailStorage(raw, normalized).catch((error) => {
        console.warn("Không dọn được dữ liệu email cũ:", error);
      });
      return normalized;
    }

    // First run or version mismatch → seed default data
    const defaultState = createDefaultState();
    await dbRef().set(stateToFirebase(defaultState));
    return defaultState;
  }

  async function cleanupDeprecatedEmailStorage(raw, normalized) {
    const updates = {};
    const rawAccounts = snapshotToArray(raw?.accounts);
    rawAccounts.forEach((account) => {
      if (!account?.id) {
        return;
      }

      if (Object.prototype.hasOwnProperty.call(account, "email")) {
        updates[`accounts/${account.id}/email`] = null;
      }
      if (Object.prototype.hasOwnProperty.call(account, "senderEmail")) {
        updates[`accounts/${account.id}/senderEmail`] = null;
      }
    });

    const rawAreas = snapshotToArray(raw?.areas);
    rawAreas.forEach((area) => {
      if (!area?.id) {
        return;
      }

      if (Object.prototype.hasOwnProperty.call(area, "managerEmails")) {
        updates[`areas/${area.id}/managerEmails`] = null;
      }
      if (Object.prototype.hasOwnProperty.call(area, "managerEmail")) {
        updates[`areas/${area.id}/managerEmail`] = null;
      }
    });

    const rawManagerById = new Map(snapshotToArray(raw?.managers).map((manager) => [manager.id, manager]));
    (normalized.managers || []).forEach((manager) => {
      const rawManager = rawManagerById.get(manager.id) || {};
      if (!areEmailListsEqual(rawManager.emails, manager.emails) && normalizeEmailList(manager.emails).length) {
        updates[`managers/${manager.id}/emails`] = normalizeEmailList(manager.emails);
      }
      ["email", "managerEmail", "managerEmails"].forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(rawManager, field)) {
          updates[`managers/${manager.id}/${field}`] = null;
        }
      });
    });

    if (Object.keys(updates).length) {
      await dbRef().update(updates);
    }
  }

  // ─── Save helpers (granular writes to Firebase) ───────────────────────────────

  async function saveState() {
    await dbRef().set(stateToFirebase(state));
  }

  async function saveScore(score) {
    await dbRef(`scores/${score.id}`).set(score);
  }

  async function deleteScoreFromDb(scoreId) {
    await dbRef(`scores/${scoreId}`).remove();
  }

  async function saveHistoryEntry(entry) {
    await dbRef(`history/${entry.id}`).set(entry);
  }

  async function saveMeta() {
    await dbRef().update({
      activePeriodId: state.activePeriodId || "",
      benchmark: state.benchmark,
    });
  }

  async function saveSafetyReport() {
    await dbRef("safetyReport").set(state.safetyReport || DEFAULT_SAFETY_REPORT);
  }

  async function savePeriodSnapshot(period) {
    if (!period?.id || !period.settingsSnapshot) {
      return;
    }

    await dbRef(`periods/${period.id}/settingsSnapshot`).set(period.settingsSnapshot);
  }

  async function ensurePeriodSnapshot(periodId) {
    const period = getPeriod(periodId);
    if (!period || period.settingsSnapshot?.areas?.length) {
      return period?.settingsSnapshot || null;
    }

    period.settingsSnapshot = makeSettingsSnapshot();
    await savePeriodSnapshot(period);
    return period.settingsSnapshot;
  }

  function ensurePeriodSnapshotLocal(periodId) {
    const period = getPeriod(periodId);
    if (!period) {
      return null;
    }

    if (!period.settingsSnapshot?.areas?.length) {
      period.settingsSnapshot = makeSettingsSnapshot();
    }

    return period.settingsSnapshot;
  }

  async function refreshLatestPeriodSnapshot() {
    const latest = getLatestWritablePeriod();
    if (!latest) {
      return;
    }

    latest.settingsSnapshot = makeSettingsSnapshot();
    await savePeriodSnapshot(latest);
  }

  function ensureAllPeriodSnapshots() {
    if (snapshotSeedPromise) {
      return snapshotSeedPromise;
    }

    const missingPeriods = state.periods.filter((period) => !period.settingsSnapshot?.areas?.length);
    if (!missingPeriods.length) {
      return Promise.resolve();
    }

    missingPeriods.forEach((period) => {
      period.settingsSnapshot = makeSettingsSnapshot();
    });

    snapshotSeedPromise = Promise.all(missingPeriods.map((period) => savePeriodSnapshot(period)))
      .catch((error) => {
        console.warn("Không tạo được snapshot cho toàn bộ kỳ:", error);
      })
      .finally(() => {
        snapshotSeedPromise = null;
      });

    return snapshotSeedPromise;
  }

  function makeId(prefix) {
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${Date.now().toString(36)}-${randomPart}`;
  }

  function makeStableId(prefix, value) {
    const text = String(value || "").trim().toLocaleLowerCase("vi");
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
    }
    return `${prefix}-${Math.abs(hash).toString(36) || "0"}`;
  }

  function getPeriods() {
    return [...state.periods].sort((a, b) => b.year - a.year || b.month - a.month);
  }

  function getArchivedPeriods() {
    return getPeriods().filter((period) => period.archived);
  }

  function isPeriodArchived(periodId) {
    if (!periodId) {
      return false;
    }

    return Boolean(state.periods.find((period) => period.id === periodId)?.archived);
  }

  function blockIfArchivedPeriod(periodId) {
    if (!isPeriodArchived(periodId)) {
      return false;
    }

    showToast("Kỳ đã lưu trữ: chỉ xem và xuất Excel.", true);
    renderActiveTab();
    return true;
  }

  function getLatestPeriod() {
    return getPeriods()[0] || null;
  }

  function getLatestWritablePeriod() {
    return getPeriods().find((period) => !period.archived) || null;
  }

  function getAreas() {
    return [...state.areas].sort((a, b) => a.order - b.order);
  }

  function getManagers() {
    return [...state.managers].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }

  function getAssessors() {
    return [...(state.assessors || [])]
      .filter((assessor) => assessor?.id && assessor?.name)
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }

  function normalizeSettingsSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") {
      return null;
    }

    let managers = snapshotToArray(snapshot.managers)
      .map((manager) => ({
        id: manager.id || makeStableId("scorer", manager.name),
        name: String(manager.name || "").trim(),
        emails: mergeEmailLists(manager.emails, manager.email, manager.managerEmail, manager.managerEmails),
        createdAt: manager.createdAt || "",
      }))
      .filter((manager) => manager.id && manager.name);
    const assessors = snapshotToArray(snapshot.assessors)
      .map((assessor) => ({
        id: assessor.id || makeStableId("assessor", assessor.name),
        name: String(assessor.name || "").trim(),
        createdAt: assessor.createdAt || "",
      }))
      .filter((assessor) => assessor.id && assessor.name);
    const managerById = new Map(managers.map((manager) => [manager.id, manager]));
    const assessorById = new Map(assessors.map((assessor) => [assessor.id, assessor]));
    const areas = snapshotToArray(snapshot.areas)
      .map((area, index) => ({
        id: area.id || makeStableId("area", area.code || String(index + 1)),
        order: Number.isFinite(Number(area.order)) ? Number(area.order) : index + 1,
        code: String(area.code || "").trim(),
        templateCode: area.templateCode || area.code || "",
        departmentHead: area.departmentHead || "",
        summaryGroup: area.summaryGroup || "",
        managerEmails: normalizeEmailList(area.managerEmails || area.managerEmail || ""),
        scorerId: area.scorerId || "",
        responsibleName: area.responsibleName || managerById.get(area.scorerId)?.name || area.scorerName || "",
        assessorId: area.assessorId || "",
        assessorName: area.assessorName || assessorById.get(area.assessorId)?.name || "",
        highlight: Boolean(area.highlight),
        createdAt: area.createdAt || "",
      }))
      .filter((area) => area.id && area.code)
      .sort((a, b) => a.order - b.order);
    const legacyEmailsByManagerId = new Map();
    areas.forEach((area) => {
      const emails = normalizeEmailList(area.managerEmails || area.managerEmail || "");
      if (area.scorerId && emails.length) {
        legacyEmailsByManagerId.set(area.scorerId, mergeEmailLists(legacyEmailsByManagerId.get(area.scorerId), emails));
      }
    });
    managers = managers.map((manager) => ({
      ...manager,
      emails: mergeEmailLists(manager.emails, legacyEmailsByManagerId.get(manager.id)),
    }));
    const areasWithoutLegacyEmails = areas.map((area) => {
      const { managerEmail, managerEmails, ...areaWithoutLegacyEmails } = area;
      return areaWithoutLegacyEmails;
    });

    return {
      version: Number(snapshot.version) || 1,
      capturedAt: snapshot.capturedAt || "",
      managers,
      assessors,
      areas: areasWithoutLegacyEmails,
      safetyReport: { ...DEFAULT_SAFETY_REPORT, ...(snapshot.safetyReport || {}) },
    };
  }

  function makeSettingsSnapshot(source = state) {
    const managers = [...(source?.managers || [])].map((manager) => ({
      id: manager.id,
      name: manager.name || "",
      emails: normalizeEmailList(manager.emails),
      createdAt: manager.createdAt || "",
    }));
    const assessors = [...(source?.assessors || [])].map((assessor) => ({
      id: assessor.id,
      name: assessor.name || "",
      createdAt: assessor.createdAt || "",
    }));
    const managerById = new Map(managers.map((manager) => [manager.id, manager]));
    const assessorById = new Map(assessors.map((assessor) => [assessor.id, assessor]));
    const areas = [...(source?.areas || [])]
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
      .map((area, index) => ({
        id: area.id,
        order: Number.isFinite(Number(area.order)) ? Number(area.order) : index + 1,
        code: area.code || "",
        templateCode: area.templateCode || area.code || "",
        departmentHead: area.departmentHead || "",
        summaryGroup: area.summaryGroup || "",
        scorerId: area.scorerId || "",
        responsibleName: area.responsibleName || managerById.get(area.scorerId)?.name || area.scorerName || "",
        assessorId: area.assessorId || "",
        assessorName: assessorById.get(area.assessorId)?.name || area.assessorName || "",
        highlight: Boolean(area.highlight),
        createdAt: area.createdAt || "",
      }));

    return {
      version: 1,
      capturedAt: new Date().toISOString(),
      managers,
      assessors,
      areas,
      safetyReport: { ...DEFAULT_SAFETY_REPORT, ...(source?.safetyReport || {}) },
    };
  }

  function getPeriodSnapshot(periodId) {
    const period = getPeriod(periodId);
    return period?.settingsSnapshot?.areas?.length ? period.settingsSnapshot : null;
  }

  function shouldUsePeriodSnapshot(periodId) {
    if (!periodId) {
      return false;
    }

    const period = getPeriod(periodId);
    const latest = getLatestPeriod();
    return Boolean(period?.settingsSnapshot?.areas?.length && (period.archived || (latest && period.id !== latest.id)));
  }

  function shouldEditPeriodSnapshot(periodId) {
    return !isPeriodArchived(periodId) && shouldUsePeriodSnapshot(periodId);
  }

  function getAreasForPeriod(periodId) {
    if (shouldUsePeriodSnapshot(periodId)) {
      return [...getPeriodSnapshot(periodId).areas].sort((a, b) => a.order - b.order);
    }

    return getAreas();
  }

  function getManagersForPeriod(periodId) {
    if (shouldUsePeriodSnapshot(periodId)) {
      return [...(getPeriodSnapshot(periodId)?.managers || [])].sort((a, b) => a.name.localeCompare(b.name, "vi"));
    }

    return getManagers();
  }

  function getAssessorsForPeriod(periodId) {
    if (shouldUsePeriodSnapshot(periodId)) {
      return [...(getPeriodSnapshot(periodId)?.assessors || [])].sort((a, b) => a.name.localeCompare(b.name, "vi"));
    }

    return getAssessors();
  }

  function getPeriod(periodId = state.activePeriodId) {
    return state.periods.find((period) => period.id === periodId) || state.periods[0] || null;
  }

  function getArea(areaId) {
    return state.areas.find((area) => area.id === areaId) || null;
  }

  function getManager(scorerId) {
    return state.managers.find((manager) => manager.id === scorerId) || null;
  }

  function getAssessor(assessorId) {
    return getAssessors().find((assessor) => assessor.id === assessorId) || null;
  }

  function getAreaForPeriod(periodId, areaId) {
    return getAreasForPeriod(periodId).find((area) => area.id === areaId) || null;
  }

  function getManagerForPeriod(periodId, scorerId) {
    return getManagersForPeriod(periodId).find((manager) => manager.id === scorerId) || null;
  }

  function getAssessorForPeriod(periodId, assessorId) {
    return getAssessorsForPeriod(periodId).find((assessor) => assessor.id === assessorId) || null;
  }

  function getItem(itemId) {
    return DEFAULT_ITEMS.find((item) => item.id === itemId) || null;
  }

  function getCriterion(item, criterionId) {
    return item?.criteria.find((criterion) => criterion.id === criterionId) || null;
  }

  function periodLabel(period) {
    return period ? `Tháng ${period.month}/${period.year}` : "Chưa có kỳ đánh giá";
  }

  function getAccountDisplayName(account) {
    if (!account) {
      return "";
    }

    if (account.role === "admin") {
      return account.name || account.username;
    }

    return getAssessor(account.assessorId)?.name || account.name || account.username;
  }

  function getAreaResponsibleName(area) {
    return getManager(area.scorerId)?.name || area.responsibleName || "Chưa phân quyền";
  }

  function getAreaConfiguredAssessorName(area) {
    return getAssessor(area.assessorId)?.name || area.assessorName || "";
  }

  function getAreaResponsibleNameForPeriod(periodId, area) {
    return area?.responsibleName || getManagerForPeriod(periodId, area?.scorerId)?.name || "Chưa phân quyền";
  }

  function getManagerEmails(manager) {
    return normalizeEmailList(manager?.emails || manager?.email || manager?.managerEmail || manager?.managerEmails || "");
  }

  function getAreaResponsibleEmailsForPeriod(periodId, area) {
    const manager = getManagerForPeriod(periodId, area?.scorerId);
    return mergeEmailLists(getManagerEmails(manager), area?.managerEmails, area?.managerEmail);
  }

  function getAreaConfiguredAssessorNameForPeriod(periodId, area) {
    return area?.assessorName || getAssessorForPeriod(periodId, area?.assessorId)?.name || "";
  }

  function getAreaScorerName(area) {
    return getAreaResponsibleName(area);
  }

  function getAllowedAreaIds(account = currentUser, periodId = state.activePeriodId) {
    if (!account) {
      return new Set();
    }

    const periodAreas = getAreasForPeriod(periodId);
    if (account.role === "admin") {
      return new Set(periodAreas.map((area) => area.id));
    }

    const explicitIds = Array.isArray(account.areaIds) ? account.areaIds.filter(Boolean) : [];
    const byAssessor = periodAreas
      .filter((area) => account.assessorId && area.assessorId === account.assessorId)
      .map((area) => area.id);
    const byOldResponsiblePerson = periodAreas
      .filter((area) => account.scorerId && area.scorerId === account.scorerId)
      .map((area) => area.id);

    return new Set([...explicitIds, ...byAssessor, ...byOldResponsiblePerson]);
  }

  function isNotApplicable(itemId, criterionId, area) {
    return false;
  }

  function getScoreRecord(periodId, areaId, itemId, criterionId) {
    return state.scores.find(
      (score) =>
        score.periodId === periodId &&
        score.areaId === areaId &&
        score.itemId === itemId &&
        score.criterionId === criterionId,
    );
  }

  function getScoreValue(periodId, areaId, itemId, criterionId) {
    const record = getScoreRecord(periodId, areaId, itemId, criterionId);
    return Number.isFinite(record?.score) ? record.score : null;
  }

  function isScoreCrossed(record) {
    return record?.status === SCORE_CROSSED;
  }

  function getRequiredCellsForArea(area) {
    let count = 0;
    DEFAULT_ITEMS.forEach((item) => {
      item.criteria.forEach((criterion) => {
        if (!isNotApplicable(item.id, criterion.id, area)) {
          count += 1;
        }
      });
    });
    return count;
  }

  function average(values) {
    const numbers = values.filter((value) => Number.isFinite(value));
    if (!numbers.length) {
      return null;
    }

    return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  }

  function areaAverage(periodId, area) {
    const values = [];
    DEFAULT_ITEMS.forEach((item) => {
      item.criteria.forEach((criterion) => {
        if (!isNotApplicable(item.id, criterion.id, area)) {
          values.push(getScoreValue(periodId, area.id, item.id, criterion.id));
        }
      });
    });
    return average(values);
  }

  function itemAverage(periodId, item, areas = getAreasForPeriod(periodId)) {
    const values = [];
    areas.forEach((area) => {
      item.criteria.forEach((criterion) => {
        if (!isNotApplicable(item.id, criterion.id, area)) {
          values.push(getScoreValue(periodId, area.id, item.id, criterion.id));
        }
      });
    });
    return average(values);
  }

  function groupAverage(periodId, areas) {
    return average(areas.map((area) => areaAverage(periodId, area)));
  }

  function overallAverage(periodId, areas = getAreasForPeriod(periodId)) {
    return average(areas.map((area) => areaAverage(periodId, area)));
  }

  function getCompletedCellCount(periodId, area) {
    let count = 0;
    DEFAULT_ITEMS.forEach((item) => {
      item.criteria.forEach((criterion) => {
        const record = getScoreRecord(periodId, area.id, item.id, criterion.id);
        if (!isNotApplicable(item.id, criterion.id, area) && (Number.isFinite(record?.score) || isScoreCrossed(record))) {
          count += 1;
        }
      });
    });
    return count;
  }

  function getPeriodStats(periodId) {
    const areas = getAreasForPeriod(periodId);
    const areaAverages = areas.map((area) => ({ area, average: areaAverage(periodId, area) }));
    const completedAreas = areas.filter((area) => {
      const required = getRequiredCellsForArea(area);
      return required > 0 && getCompletedCellCount(periodId, area) >= required;
    });

    return {
      overall: overallAverage(periodId, areas),
      completedAreas: completedAreas.length,
      totalAreas: areas.length,
      belowTarget: areaAverages.filter((row) => Number.isFinite(row.average) && row.average < state.benchmark).length,
      editCount: state.history.length,
    };
  }

  function formatNumber(value, digits = 1) {
    return Number.isFinite(value) ? value.toFixed(digits) : "-";
  }

  function formatScore(value) {
    return Number.isFinite(value) ? String(value) : "";
  }

  function formatScoreRecord(record) {
    if (isScoreCrossed(record)) {
      return "Gạch chéo";
    }

    return Number.isFinite(record?.score) ? String(record.score) : "";
  }

  function normalizeEmailList(value) {
    const values = Array.isArray(value) ? value : String(value || "").split(/[,\n;]/);
    return [...new Set(values.map((email) => String(email).trim()).filter(Boolean))];
  }

  function mergeEmailLists(...values) {
    return normalizeEmailList(values.flatMap((value) => normalizeEmailList(value)));
  }

  function areEmailListsEqual(a, b) {
    const left = normalizeEmailList(a).map((email) => email.toLocaleLowerCase()).sort();
    const right = normalizeEmailList(b).map((email) => email.toLocaleLowerCase()).sort();
    return left.length === right.length && left.every((email, index) => email === right[index]);
  }

  function formatEmailList(emails) {
    return normalizeEmailList(emails).join(", ");
  }

  function normalizeIssueCount(value) {
    if (value === "" || value === null || value === undefined) {
      return "";
    }

    const number = Number(value);
    return Number.isInteger(number) && number >= 1 ? number : "";
  }

  function formatDateParts(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return { day: "", month: "", display: "" };
    }

    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      display: date.toLocaleDateString("vi-VN"),
    };
  }

  function todayIsoDate() {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function toIsoDate(value) {
    if (!value) {
      return "";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
      return String(value);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function formatDateDisplay(value) {
    const iso = toIsoDate(value);
    if (!iso) {
      return "";
    }

    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
  }

  function getReportDateValue(report, period, fieldName) {
    return toIsoDate(report?.[fieldName]) || toIsoDate(period?.createdAt) || todayIsoDate();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function optionHtml(options, selectedValue) {
    return options
      .map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === selectedValue ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
      .join("");
  }

  function areaCheckboxListHtml(selectedIds = []) {
    const selected = new Set(selectedIds.filter(Boolean));
    const areas = getAreas();
    if (!areas.length) {
      return '<p class="field-hint">Chưa có zone. Hãy thêm zone ở Danh mục trước.</p>';
    }

    return areas
      .map((area) => `<label class="check-line zone-check-item">
        <input name="areaIds" type="checkbox" value="${escapeHtml(area.id)}" ${selected.has(area.id) ? "checked" : ""}>
        <span>Zone ${escapeHtml(area.code)} · ${escapeHtml(getAreaResponsibleName(area))}</span>
      </label>`)
      .join("");
  }

  function getCheckedAreaIds(container) {
    return [...container.querySelectorAll('input[name="areaIds"]:checked')].map((input) => input.value);
  }

  function scoreGuideHtml(item, criterion) {
    const levels = SCORE_GUIDE[item.id]?.[criterion.id] || [];
    if (!levels.length) {
      return "";
    }

    return `<div class="score-guide">
      ${levels
        .map((text, index) => `<article class="score-guide-level">
          <strong>${index + 1}. ${escapeHtml(SCORE_LEVEL_LABELS[index] || `Cấp ${index + 1}`)}</strong>
          <span>${escapeHtml(text)}</span>
        </article>`)
        .join("")}
    </div>`;
  }

  function getIssueRecords(periodId, options = {}) {
    const areaId = options.areaId || "";
    return state.scores
      .filter((score) => score.periodId === periodId && (score.note || score.photoDataUrl))
      .map((score) => ({
        score,
        area: getAreaForPeriod(periodId, score.areaId),
        item: getItem(score.itemId),
      }))
      .filter((row) => row.area && row.item && (!areaId || row.area.id === areaId))
      .sort((a, b) => String(b.score.updatedAt || "").localeCompare(String(a.score.updatedAt || "")));
  }

  function getSafetyReportForPeriod(periodId) {
    const snapshot = shouldUsePeriodSnapshot(periodId) ? getPeriodSnapshot(periodId) : null;
    return { ...DEFAULT_SAFETY_REPORT, ...((snapshot?.safetyReport || state.safetyReport) || {}) };
  }

  function isIssueOpen(score) {
    return (score.issueStatus || "open") !== "closed";
  }

  function getIssueLocation(row) {
    return row.score.issueLocation || `Zone ${row.area.code}`;
  }

  function getIssueDescription(row) {
    const criterion = getCriterion(row.item, row.score.criterionId);
    const prefix = `${row.item.code} ${row.item.name} - ${criterion?.label || ""}`;
    return row.score.note ? `${prefix}: ${row.score.note}` : prefix;
  }

  function getIssueDay(row) {
    return row.score.issueDay || formatDateParts(row.score.updatedAt).day || "";
  }

  function getIssueMonth(row, periodId) {
    if (row.score.issueMonth) {
      return row.score.issueMonth;
    }

    const parts = formatDateParts(row.score.updatedAt);
    const period = getPeriod(periodId);
    return parts.month || period?.month || "";
  }

  function getIssueCount(row) {
    return normalizeIssueCount(row.score.issueCount) || 1;
  }

  function getIssueLevelLabel(score) {
    return score.issueLevel ? `Cấp độ ${score.issueLevel}` : "";
  }

  function getCompletionDateDisplay(score) {
    return formatDateDisplay(score.completionDate) || score.completionDate || "";
  }

  function getIssueFoundBy(row) {
    return row.score.issueFoundBy || row.score.scorerName || row.score.accountUsername || "";
  }

  function getIssueItemLabel(row) {
    const criterion = getCriterion(row.item, row.score.criterionId);
    return row.score.issueItemLabel || `${row.item.code} ${row.item.name} · ${criterion?.label || ""}`;
  }

  function isSafetyStop6Selected(score, value) {
    return String(score.issueType || "") === value;
  }

  function isSafetyLevelSelected(score, value) {
    return String(score.issueLevel || "") === value;
  }

  function isSafetyFoundSelected(score, value) {
    const fallback = score.issueFoundBy || score.scorerName || score.accountUsername ? "member" : "";
    return String(score.foundChannel || fallback) === value;
  }

  function safetyMarkCell(selected, extraClass = "", value = "1") {
    return `<td class="safety-mark-cell ${selected ? `is-marked ${extraClass}` : ""}">${selected ? escapeHtml(value) : ""}</td>`;
  }

  function createCell(tagName, text, className = "") {
    const cell = document.createElement(tagName);
    if (className) {
      cell.className = className;
    }
    cell.textContent = text ?? "";
    return cell;
  }

  function setColSpan(cell, value) {
    cell.colSpan = value;
    return cell;
  }

  function setRowSpan(cell, value) {
    cell.rowSpan = value;
    return cell;
  }

  function excelColumnName(index) {
    let name = "";
    let n = index;
    while (n > 0) {
      const remainder = (n - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      n = Math.floor((n - 1) / 26);
    }
    return name;
  }

  function buildConsecutiveGroups(areas, propertyName, mergeBlankGroups = true) {
    const groups = [];

    areas.forEach((area) => {
      const label = area[propertyName] || "";
      const current = groups[groups.length - 1];
      if (current && current.label === label && (label || mergeBlankGroups)) {
        current.areas.push(area);
      } else {
        groups.push({ label, areas: [area] });
      }
    });

    return groups;
  }

  function buildMatrixTable(table, options) {
    const period = getPeriod(options.periodId);
    const periodId = period?.id || "";
    const areas = getAreasForPeriod(periodId);
    const editableAreaIds = options.editableAreaIds || new Set();
    const adminMode = Boolean(options.adminMode) && !isPeriodArchived(periodId);
    const canEdit = Boolean(options.editable) && !isPeriodArchived(periodId);
    const includeFormulas = Boolean(options.formulas);
    const firstScoreRow = 5;
    const lastAreaColumn = excelColumnName(3 + areas.length);

    table.innerHTML = "";
    table.dataset.periodId = periodId;

    const colgroup = document.createElement("colgroup");
    [["46px"], ["112px"], ["88px"], ...areas.map(() => ["43px"]), ["66px"]].forEach(([width]) => {
      const col = document.createElement("col");
      col.style.width = width;
      colgroup.appendChild(col);
    });
    table.appendChild(colgroup);

    const titleRow = document.createElement("tr");
    titleRow.appendChild(setColSpan(createCell("th", `Điểm Chi Tiết Theo Từng Hạng Mục BP Tự Đánh giá (${periodLabel(period)})`, "matrix-title"), areas.length + 4));
    table.appendChild(titleRow);

    const zoneRow = document.createElement("tr");
    zoneRow.appendChild(setRowSpan(setColSpan(createCell("th", "Tiêu Chuẩn\nĐánh Giá", "standard-head"), 2), 2));
    zoneRow.appendChild(createCell("th", "Zone", "zone-title"));
    areas.forEach((area) => {
      const cell = createCell("th", "", `${area.highlight ? "zone-code is-highlight" : "zone-code"}${adminMode ? " editable-header" : ""}`);
      if (adminMode) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = area.code;
        button.dataset.action = "edit-area";
        button.dataset.id = area.id;
        button.dataset.periodId = periodId;
        button.title = "Sửa thông tin zone";
        cell.appendChild(button);
      } else {
        cell.textContent = area.code;
      }
      zoneRow.appendChild(cell);
    });
    zoneRow.appendChild(setRowSpan(createCell("th", "AVER", "aver-head"), 3));
    table.appendChild(zoneRow);

    const departmentRow = document.createElement("tr");
    departmentRow.appendChild(createCell("th", "T.Phòng", "zone-title"));
    buildConsecutiveGroups(areas, "departmentHead", false).forEach((group) => {
      const cell = createCell("th", "", `department-head${adminMode ? " editable-header" : ""}`);
      if (adminMode) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = group.label || "Chưa có";
        button.dataset.action = "edit-department-head";
        button.dataset.id = group.label || "";
        button.dataset.periodId = periodId;
        button.title = "Sửa trưởng phòng cho nhóm zone này";
        cell.appendChild(button);
      } else {
        cell.textContent = group.label;
      }
      departmentRow.appendChild(setColSpan(cell, group.areas.length));
    });
    table.appendChild(departmentRow);

    const picRow = document.createElement("tr");
    picRow.appendChild(setColSpan(createCell("th", "ITEMS", "items-head"), 2));
    picRow.appendChild(createCell("th", "Point", "point-head"));
    areas.forEach((area) => {
      const cell = createCell("th", "", `pic-name${adminMode ? " editable-header" : ""}`);
      if (adminMode) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = getAreaResponsibleNameForPeriod(periodId, area);
        button.dataset.action = "edit-area-responsible";
        button.dataset.id = area.id;
        button.dataset.periodId = periodId;
        button.title = "Sửa người phụ trách zone / người được đánh giá";
        cell.appendChild(button);
      } else {
        cell.textContent = getAreaResponsibleNameForPeriod(periodId, area);
      }
      picRow.appendChild(cell);
    });
    table.appendChild(picRow);

    let rowNumber = firstScoreRow;
    DEFAULT_ITEMS.forEach((item) => {
      const itemStartRow = rowNumber;
      const itemEndRow = itemStartRow + item.criteria.length - 1;
      item.criteria.forEach((criterion, criterionIndex) => {
        const row = document.createElement("tr");

        if (criterionIndex === 0) {
          row.appendChild(setRowSpan(createCell("td", item.code, "item-code"), item.criteria.length));
          row.appendChild(setRowSpan(createCell("td", item.name, "item-name"), item.criteria.length));
        }

        row.appendChild(createCell("td", criterion.label, "criteria-cell"));

        areas.forEach((area) => {
          const isNa = isNotApplicable(item.id, criterion.id, area);
          const record = getScoreRecord(periodId, area.id, item.id, criterion.id);
          const value = Number.isFinite(record?.score) ? record.score : null;
          const isCrossed = isScoreCrossed(record);
          const isEditable = canEdit && editableAreaIds.has(area.id) && !isNa;
          const classNames = ["score-cell"];

          if (isNa || isCrossed) {
            classNames.push("score-na");
          } else if (!Number.isFinite(value)) {
            classNames.push("score-empty");
          } else if (value <= 2) {
            classNames.push("score-low");
          }

          if (record?.note || record?.photoDataUrl) {
            classNames.push("score-has-note");
          }

          if (isEditable) {
            classNames.push("editable");
          }

          const cell = createCell("td", "", classNames.join(" "));
          if (isNa) {
            cell.setAttribute("aria-label", "Không áp dụng");
          } else if (isEditable) {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = isCrossed ? "" : formatScore(value);
            button.dataset.editScore = "true";
            button.dataset.periodId = periodId;
            button.dataset.areaId = area.id;
            button.dataset.itemId = item.id;
            button.dataset.criterionId = criterion.id;
            button.title = formatScoreRecord(record) || "Sửa điểm";
            cell.appendChild(button);
          } else {
            cell.textContent = isCrossed ? "" : formatScore(value);
          }
          row.appendChild(cell);
        });

        if (criterionIndex === 0) {
          const averageCell = setRowSpan(createCell("td", formatNumber(itemAverage(periodId, item, areas), 1), "item-average"), item.criteria.length);
          if (includeFormulas) {
            averageCell.setAttribute("x:fmla", `=IFERROR(AVERAGE(D${itemStartRow}:${lastAreaColumn}${itemEndRow}),"")`);
          }
          row.appendChild(averageCell);
        }

        table.appendChild(row);
        rowNumber += 1;
      });
    });

    appendTotalRows(table, periodId, areas, {
      includeFormulas,
      firstScoreRow,
      lastScoreRow: rowNumber - 1,
      totalRowNumber: rowNumber,
      lastAreaColumn,
      adminMode,
    });
  }

  function appendTotalRows(table, periodId, areas, options = {}) {
    const areaTotalRow = document.createElement("tr");
    areaTotalRow.appendChild(setRowSpan(setColSpan(createCell("td", "TOTAL SCORE:", "total-left"), 3), 3));

    areas.forEach((area, index) => {
      const totalCell = createCell("td", formatNumber(areaAverage(periodId, area), 2), "area-total");
      if (options.includeFormulas) {
        const column = excelColumnName(4 + index);
        totalCell.setAttribute("x:fmla", `=IFERROR(AVERAGE(${column}${options.firstScoreRow}:${column}${options.lastScoreRow}),"")`);
      }
      areaTotalRow.appendChild(totalCell);
    });

    const overallCell = setRowSpan(createCell("td", formatNumber(overallAverage(periodId, areas), 1), "overall-total"), 3);
    if (options.includeFormulas) {
      overallCell.setAttribute("x:fmla", `=IFERROR(AVERAGE(D${options.totalRowNumber}:${options.lastAreaColumn}${options.totalRowNumber}),"")`);
    }
    areaTotalRow.appendChild(overallCell);
    table.appendChild(areaTotalRow);

    const summaryGroups = buildConsecutiveGroups(areas, "summaryGroup", false);
    const groupAverageRow = document.createElement("tr");
    const groupLabelRow = document.createElement("tr");

    function createSummaryGroupCell(group) {
      const cell = createCell("td", "", `group-label${options.adminMode ? " editable-header" : ""}`);
      if (options.adminMode) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = group.label || "Chưa có";
        button.dataset.action = "edit-summary-group";
        button.dataset.id = group.label || "";
        button.dataset.periodId = periodId;
        button.title = "Sửa nhóm tổng điểm cho các zone này";
        cell.appendChild(button);
      } else {
        cell.textContent = group.label;
      }
      return cell;
    }

    summaryGroups.forEach((group) => {
      const span = group.areas.length;
      if (span > 1) {
        const averageCell = setColSpan(createCell("td", group.label ? formatNumber(groupAverage(periodId, group.areas), 2) : "", "group-average"), span);
        if (options.includeFormulas && group.label) {
          const startColumn = excelColumnName(4 + areas.indexOf(group.areas[0]));
          const endColumn = excelColumnName(4 + areas.indexOf(group.areas[group.areas.length - 1]));
          averageCell.setAttribute("x:fmla", `=IFERROR(AVERAGE(${startColumn}${options.totalRowNumber}:${endColumn}${options.totalRowNumber}),"")`);
        }
        groupAverageRow.appendChild(averageCell);
        groupLabelRow.appendChild(setColSpan(createSummaryGroupCell(group), span));
      } else {
        groupAverageRow.appendChild(setRowSpan(createSummaryGroupCell(group), 2));
      }
    });

    table.appendChild(groupAverageRow);
    table.appendChild(groupLabelRow);

    const signatureRow = document.createElement("tr");
    signatureRow.appendChild(setColSpan(createCell("td", "Người đánh giá", "signature-label"), 3));
    areas.forEach((area) => {
      const cell = createCell("td", "", `signature-cell${options.adminMode ? " editable-header" : ""}`);
      if (options.adminMode) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = getSignatureName(periodId, area) || "Chưa có";
        button.dataset.action = "edit-area-assessor";
        button.dataset.id = area.id;
        button.dataset.periodId = periodId;
        button.title = "Sửa assessor hiển thị ở dòng cuối";
        cell.appendChild(button);
      } else {
        cell.textContent = getSignatureName(periodId, area);
      }
      signatureRow.appendChild(cell);
    });
    signatureRow.appendChild(createCell("td", "", "signature-cell"));
    table.appendChild(signatureRow);
  }

  function getSignatureName(periodId, area) {
    const configuredAssessor = getAreaConfiguredAssessorNameForPeriod(periodId, area);
    if (configuredAssessor) {
      return configuredAssessor;
    }

    const latest = state.scores
      .filter((score) => score.periodId === periodId && score.areaId === area.id && Number.isFinite(score.score))
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];

    if (latest?.scorerName) {
      return latest.scorerName;
    }

    return "";
  }

  function getUserInitials(account = currentUser) {
    const displayName = getAccountDisplayName(account) || account?.username || "A";
    const parts = displayName
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (!parts.length) {
      return "A";
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 1).toLocaleUpperCase("vi");
    }

    return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toLocaleUpperCase("vi");
  }

  function renderCurrentUser() {
    const displayName = getAccountDisplayName(currentUser);
    const roleText = currentUser?.role === "admin" ? "Admin hệ thống" : "Assessor";
    const initials = getUserInitials(currentUser);
    elements.currentUserName.textContent = displayName;
    elements.currentUserRole.textContent = roleText;
    if (elements.accountAvatar) {
      elements.accountAvatar.textContent = initials;
    }
    if (elements.accountMenuAvatar) {
      elements.accountMenuAvatar.textContent = initials;
    }
    if (elements.accountMenuName) {
      elements.accountMenuName.textContent = displayName || "Người dùng";
    }
    if (elements.accountMenuUsername) {
      elements.accountMenuUsername.textContent = currentUser?.username || roleText;
    }
  }

  function closeAccountMenu() {
    if (!elements.accountMenu) {
      return;
    }

    elements.accountMenu.hidden = true;
    elements.accountMenuButton?.setAttribute("aria-expanded", "false");
  }

  function toggleAccountMenu() {
    if (!elements.accountMenu) {
      return;
    }

    const nextOpen = elements.accountMenu.hidden;
    elements.accountMenu.hidden = !nextOpen;
    elements.accountMenuButton?.setAttribute("aria-expanded", String(nextOpen));
  }

  function goToTab(tab) {
    if (!isTabAllowed(tab)) {
      showToast("Bạn không có quyền mở trang này.", true);
      return;
    }

    setActiveTab(tab);
  }

  function goHome() {
    setActiveTab(currentUser?.role === "admin" ? "home" : "assessor");
  }

  function renderRoleVisibility() {
    const isAdmin = currentUser?.role === "admin";
    elements.appShell.classList.toggle("admin-mode", isAdmin);
    document.querySelectorAll(".admin-only").forEach((element) => {
      element.hidden = !isAdmin;
    });
    document.querySelectorAll(".manager-only").forEach((element) => {
      element.hidden = isAdmin;
    });
    document.querySelectorAll(".assessor-only").forEach((element) => {
      element.hidden = isAdmin;
    });
  }

  function isTabAllowed(tab) {
    if (!currentUser) {
      return false;
    }

    if (currentUser.role === "admin") {
      return ["home", "summary", "safety", "issue-stats", "catalog", "accounts", "data"].includes(tab);
    }

    return ["assessor", "summary"].includes(tab);
  }

  function getFallbackTab() {
    return currentUser?.role === "admin" ? "home" : "assessor";
  }

  function setActiveTab(tab) {
    activeTab = isTabAllowed(tab) ? tab : getFallbackTab();
    closeAccountMenu();
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tab === activeTab);
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("is-active", panel.id === `tab-${activeTab}`);
    });
    renderActiveTab();
  }

  function renderAll() {
    if (!currentUser) {
      return;
    }

    const freshCurrentUser = state.accounts.find((account) => account.id === currentUser.id)
      || state.accounts.find((account) => account.username === currentUser.username);
    if (freshCurrentUser) {
      currentUser = freshCurrentUser;
    }

    renderRoleVisibility();
    ensureAllPeriodSnapshots();
    renderCurrentUser();
    populatePeriodSelects();
    populateManagerSelects();
    populateAssessorSelects();
    populateAreaSelects();
    setActiveTab(activeTab);
  }

  function renderActiveTab() {
    if (activeTab === "home") {
      renderAdminHome();
    } else if (activeTab === "assessor") {
      renderAssessorTab();
    } else if (activeTab === "summary") {
      renderSummaryTab();
    } else if (activeTab === "safety") {
      renderSafetyTab();
    } else if (activeTab === "issue-stats") {
      renderIssueStatsTab();
    } else if (activeTab === "catalog") {
      renderCatalogTab();
    } else if (activeTab === "accounts") {
      renderAccountsTab();
    } else if (activeTab === "data") {
      renderDataTab();
    }
  }

  function populatePeriodSelects() {
    const html = getPeriods()
      .map((period) => `<option value="${escapeHtml(period.id)}">${escapeHtml(periodLabel(period))}${period.archived ? " · Lưu trữ" : ""}</option>`)
      .join("");

    [elements.assessorPeriodSelect, elements.summaryPeriodSelect, elements.safetyPeriodSelect, elements.issueStatsPeriodSelect].forEach((select) => {
      if (!select) {
        return;
      }
      select.innerHTML = html;
      select.value = state.activePeriodId;
    });
  }

  function populateAreaSelects() {
    const periodId = state.activePeriodId;
    const periodAreas = getAreasForPeriod(periodId);
    const allowedAreaIds = getAllowedAreaIds(currentUser, periodId);
    const assignedAreas = periodAreas.filter((area) => allowedAreaIds.has(area.id));
    if (elements.assessorAreaSelect) {
      const current = elements.assessorAreaSelect.value;
      elements.assessorAreaSelect.innerHTML = assignedAreas
        .map((area) => `<option value="${escapeHtml(area.id)}">Zone ${escapeHtml(area.code)} · ${escapeHtml(getAreaResponsibleNameForPeriod(periodId, area))}</option>`)
        .join("");
      elements.assessorAreaSelect.value = assignedAreas.some((area) => area.id === current) ? current : assignedAreas[0]?.id || "";
    }

    if (elements.safetyAreaFilter) {
      const current = elements.safetyAreaFilter.value;
      elements.safetyAreaFilter.innerHTML = `<option value="">Tất cả zone</option>${periodAreas
        .map((area) => `<option value="${escapeHtml(area.id)}">Zone ${escapeHtml(area.code)}</option>`)
        .join("")}`;
      elements.safetyAreaFilter.value = periodAreas.some((area) => area.id === current) ? current : "";
    }
  }

  function populateManagerSelects() {
    const html = getManagers()
      .map((manager) => `<option value="${escapeHtml(manager.id)}">${escapeHtml(manager.name)}</option>`)
      .join("");

    if (elements.areaScorer) {
      elements.areaScorer.innerHTML = html;
    }
  }

  function populateAssessorSelects() {
    const html = assessorOptions("");

    [elements.areaAssessor, elements.accountAssessor].forEach((select) => {
      if (!select) {
        return;
      }
      const current = select.value;
      select.innerHTML = html;
      select.value = getAssessors().some((assessor) => assessor.id === current) ? current : "";
    });
  }

  function renderAccountZoneList(selectedIds = []) {
    if (!elements.accountZoneList) {
      return;
    }

    elements.accountZoneList.innerHTML = areaCheckboxListHtml(selectedIds);
  }

  function scoreButtonAttrs(periodId, area, item, criterion) {
    return `data-edit-score="true" data-period-id="${escapeHtml(periodId)}" data-area-id="${escapeHtml(area.id)}" data-item-id="${escapeHtml(item.id)}" data-criterion-id="${escapeHtml(criterion.id)}"`;
  }

  function cssSelectorValue(value) {
    if (window.CSS?.escape) {
      return CSS.escape(String(value));
    }

    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function applyScorePreview({ periodId, areaId, itemId, criterionId, rawScore, dirty = true }) {
    const selector = `[data-edit-score="true"][data-period-id="${cssSelectorValue(periodId)}"][data-area-id="${cssSelectorValue(areaId)}"][data-item-id="${cssSelectorValue(itemId)}"][data-criterion-id="${cssSelectorValue(criterionId)}"]`;
    const isCrossed = rawScore === SCORE_CROSSED;
    const nextScore = rawScore === "" || isCrossed ? null : Number(rawScore);
    const isLow = Number.isFinite(nextScore) && nextScore <= 2;
    const label = isCrossed ? "Gạch chéo" : Number.isFinite(nextScore) ? String(nextScore) : "Chấm điểm";

    document.querySelectorAll(selector).forEach((button) => {
      const scoreCell = button.closest(".score-cell");
      if (scoreCell) {
        scoreCell.classList.toggle("score-na", isCrossed);
        scoreCell.classList.toggle("score-low", !isCrossed && isLow);
        scoreCell.classList.toggle("score-empty", rawScore === "");
        button.textContent = isCrossed ? "" : Number.isFinite(nextScore) ? String(nextScore) : "";
        button.title = isCrossed ? "Gạch chéo" : Number.isFinite(nextScore) ? String(nextScore) : "Sửa điểm";
      }

      const criterionCard = button.closest(".assessment-criterion");
      if (criterionCard) {
        criterionCard.classList.toggle("is-crossed", isCrossed);
        criterionCard.classList.toggle("is-low", !isCrossed && isLow);
        button.textContent = label;
        button.title = label;
      }
    });

    if (dirty) {
      modalPreviewDirty = true;
    }
  }

  function renderAdminHome() {
    if (!currentUser || currentUser.role !== "admin") {
      return;
    }
  }

  function renderAssessorTab() {
    const period = getPeriod(elements.assessorPeriodSelect?.value || state.activePeriodId);
    const periodId = period?.id || "";
    const allowedAreaIds = getAllowedAreaIds(currentUser, periodId);
    const assignedAreas = getAreasForPeriod(periodId).filter((area) => allowedAreaIds.has(area.id));
    const selectedArea = assignedAreas.find((area) => area.id === elements.assessorAreaSelect?.value) || assignedAreas[0] || null;

    if (!selectedArea) {
      elements.assessorTitle.textContent = "Phiếu chấm 5S";
      elements.assessorProgress.textContent = "Tài khoản này chưa được phân quyền zone.";
      elements.assessorSheet.innerHTML = "";
      return;
    }

    elements.assessorAreaSelect.value = selectedArea.id;
    const completed = getCompletedCellCount(periodId, selectedArea);
    const required = getRequiredCellsForArea(selectedArea);
    const isArchived = isPeriodArchived(periodId);
    elements.assessorTitle.textContent = `Phiếu chấm 5S - Zone ${selectedArea.code} - ${periodLabel(period)}`;
    elements.assessorProgress.textContent = isArchived
      ? `Kỳ đã lưu trữ: chỉ xem. Đã chấm ${completed}/${required} ô. Điểm TB zone: ${formatNumber(areaAverage(periodId, selectedArea), 2)}`
      : `Đã chấm ${completed}/${required} ô. Điểm TB zone: ${formatNumber(areaAverage(periodId, selectedArea), 2)}`;
    elements.assessorSheet.innerHTML = DEFAULT_ITEMS.map((item) => renderAssessorItem(periodId, selectedArea, item)).join("");
  }

  function renderAssessorItem(periodId, area, item) {
    return `<article class="assessment-item">
      <div class="assessment-item-head">
        <strong>${escapeHtml(item.code)} ${escapeHtml(item.name)}</strong>
        <span>Điểm TB: ${formatNumber(itemAverageForArea(periodId, area, item), 1)}</span>
      </div>
      <div class="assessment-criteria">
        ${item.criteria.map((criterion) => renderAssessorCriterion(periodId, area, item, criterion)).join("")}
      </div>
    </article>`;
  }

  function itemAverageForArea(periodId, area, item) {
    return average(item.criteria.map((criterion) => getScoreValue(periodId, area.id, item.id, criterion.id)));
  }

  function renderAssessorCriterion(periodId, area, item, criterion) {
    const record = getScoreRecord(periodId, area.id, item.id, criterion.id);
    const hasIssue = Boolean(record?.note || record?.photoDataUrl);
    const scoreText = formatScoreRecord(record) || "Chấm điểm";
    const stateClass = isScoreCrossed(record) ? "is-crossed" : Number.isFinite(record?.score) && record.score <= 2 ? "is-low" : "";
    const note = hasIssue
      ? `<div class="assessment-note">
          <span>${escapeHtml(record.note || "Có ảnh minh họa")}</span>
          ${record.photoDataUrl ? `<img src="${record.photoDataUrl}" alt="Ảnh minh họa">` : ""}
        </div>`
      : "";

    return `<section class="assessment-criterion ${stateClass}">
      <div class="assessment-criterion-head">
        <h3>${escapeHtml(criterion.label)}</h3>
        ${
          isPeriodArchived(periodId)
            ? `<span class="score-readonly-pill">${escapeHtml(scoreText)}</span>`
            : `<button class="tiny-button" type="button" ${scoreButtonAttrs(periodId, area, item, criterion)}>${escapeHtml(scoreText)}</button>`
        }
      </div>
      ${scoreGuideHtml(item, criterion)}
      ${note}
    </section>`;
  }

  function renderSafetyTab() {
    const period = getPeriod(elements.safetyPeriodSelect?.value || state.activePeriodId);
    const periodId = period?.id || "";
    const report = getSafetyReportForPeriod(periodId);
    const issueDate = formatDateDisplay(getReportDateValue(report, period, "issueDate"));
    const reportDate = formatDateDisplay(getReportDateValue(report, period, "reportDate"));
    const rows = getIssueRecords(periodId, { areaId: elements.safetyAreaFilter?.value || "" });
    const canEdit = !isPeriodArchived(periodId);
    if (elements.editSafetyMetaButton) {
      elements.editSafetyMetaButton.disabled = !canEdit;
      elements.editSafetyMetaButton.title = canEdit ? "Thiết lập báo cáo" : "Kỳ đã lưu trữ: không sửa trên web";
    }
    elements.safetyTable.innerHTML = `
      <colgroup>
        <col style="width: 58px">
        <col style="width: 120px">
        <col style="width: 50px">
        <col style="width: 50px">
        <col style="width: 280px">
        <col style="width: 170px">
        <col style="width: 74px">
        ${Array.from({ length: 13 }, () => '<col style="width: 36px">').join("")}
        <col style="width: 260px">
        <col style="width: 170px">
        <col style="width: 120px">
        <col style="width: 120px">
        <col style="width: 92px">
        <col style="width: 150px">
        <col style="width: 150px">
      </colgroup>
      <thead>
        <tr class="safety-form-top">
          <th class="safety-logo-cell" colspan="3" rowspan="2">
            <img src="images/Logo.jpg" alt="LeGroup">
          </th>
          <th class="safety-title-cell" colspan="18" rowspan="2">
            <strong>BẢNG THEO DÕI NHẬN DẠNG NGUY HIỂM VÀ KHẮC PHỤC</strong>
            <span>HAZARD IDENTIFICATION &amp; ACTIVITY FOLLOW UP SHEET</span>
          </th>
          <th class="safety-date-label" colspan="3">Issue Date</th>
          <th class="safety-date-value" colspan="3">${escapeHtml(issueDate)}</th>
        </tr>
        <tr class="safety-form-top">
          <th class="safety-date-label" colspan="3">Report date</th>
          <th class="safety-date-value" colspan="3">${escapeHtml(reportDate)}</th>
        </tr>
        <tr class="safety-meta-row">
          <td colspan="6"><span>Người Thực Hiện:</span> ${escapeHtml(report.performer)}</td>
          <td colspan="5"><span>Người Kiểm Tra:</span></td>
          <td colspan="16"><strong>${escapeHtml(report.checker)}</strong></td>
        </tr>
        <tr class="safety-meta-row">
          <td colspan="6"><span>Chức Danh:</span> ${escapeHtml(report.performerTitle || "")}</td>
          <td colspan="5"><span>Chức Danh:</span> ${escapeHtml(report.checkerTitle || "")}</td>
          <td colspan="16"></td>
        </tr>
        <tr class="safety-meta-row">
          <td colspan="6"><span>Bộ Phận:</span> ${escapeHtml(report.department || "")}</td>
          <td colspan="5"><span>Bộ Phận:</span> ${escapeHtml(report.checkerDepartment || "")}</td>
          <td colspan="16"></td>
        </tr>
        <tr class="safety-main-header">
          <th rowspan="3">No</th>
          <th rowspan="3">Vị trí</th>
          <th rowspan="3">Ngày</th>
          <th rowspan="3">Tháng</th>
          <th rowspan="3">Mối nguy hiểm phát hiện được .</th>
          <th rowspan="3">Hình Ảnh Minh Họa</th>
          <th rowspan="3">Số lần phát hiện</th>
          <th colspan="13">${escapeHtml(report.instruction || DEFAULT_SAFETY_REPORT.instruction)}</th>
          <th rowspan="3">Nội dung cải tiến, xử lý</th>
          <th rowspan="3">Hình ảnh sau cải tiến, xử lý</th>
          <th rowspan="3">Đảm nhiệm</th>
          <th rowspan="3">Kế hoạch</th>
          <th colspan="3">Hoàn thành</th>
        </tr>
        <tr class="safety-main-header">
          <th colspan="${SAFETY_STOP6_COLUMNS.length}">Phân loại STOP 6</th>
          <th colspan="${SAFETY_LEVEL_COLUMNS.length}">Cấp bậc</th>
          <th colspan="${SAFETY_FOUND_COLUMNS.length}">Phát hiện</th>
          <th rowspan="2">Ngày</th>
          <th rowspan="2">Xác nhận theo cấp độ</th>
          <th rowspan="2">Xác nhận theo loại stop 6</th>
        </tr>
        <tr class="safety-main-header safety-vertical-row">
          ${SAFETY_STOP6_COLUMNS.map((column) => `<th><span>${escapeHtml(column.label)}</span></th>`).join("")}
          ${SAFETY_LEVEL_COLUMNS.map((column) => `<th><span>${escapeHtml(column.label)}</span></th>`).join("")}
          ${SAFETY_FOUND_COLUMNS.map((column) => `<th><span>${escapeHtml(column.label)}</span></th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${
          rows.length
            ? rows.map((row, index) => renderSafetyRow(row, index + 1, periodId, canEdit)).join("")
            : '<tr><td colspan="27" class="empty-cell">Chưa có ghi chú vấn đề trong kỳ này.</td></tr>'
        }
      </tbody>`;
  }

  function renderSafetyRow(row, index, periodId, canEdit = true) {
    const status = isIssueOpen(row.score) ? "open" : "closed";
    const actionLabel = status === "open" ? "Đóng" : "Mở lại";
    const completionDate = getCompletionDateDisplay(row.score);
    const actions = canEdit
      ? `<div class="safety-actions">
          <button class="tiny-button" type="button" data-action="edit-safety-record" data-id="${escapeHtml(row.score.id)}">Sửa</button>
          <button class="tiny-button" type="button" data-action="toggle-issue-status" data-id="${escapeHtml(row.score.id)}">${actionLabel}</button>
        </div>`
      : '<div class="safety-actions"><span class="item-meta">Lưu trữ</span></div>';

    return `<tr>
      <td class="safety-no-cell">
        <span>${index}</span>
        ${actions}
      </td>
      <td>${escapeHtml(getIssueLocation(row))}</td>
      <td>${escapeHtml(getIssueDay(row))}</td>
      <td>${escapeHtml(getIssueMonth(row, periodId))}</td>
      <td>${escapeHtml(row.score.note || getIssueDescription(row))}</td>
      <td>${row.score.photoDataUrl ? `<img class="safety-thumb" src="${row.score.photoDataUrl}" alt="Ảnh minh họa">` : ""}</td>
      <td>${escapeHtml(getIssueCount(row))}</td>
      ${SAFETY_STOP6_COLUMNS.map((column) => safetyMarkCell(isSafetyStop6Selected(row.score, column.value))).join("")}
      ${SAFETY_LEVEL_COLUMNS.map((column) => safetyMarkCell(isSafetyLevelSelected(row.score, column.value), "level-mark")).join("")}
      ${SAFETY_FOUND_COLUMNS.map((column) => safetyMarkCell(isSafetyFoundSelected(row.score, column.value), "", getIssueFoundBy(row) || "1")).join("")}
      <td>${escapeHtml(row.score.improvementContent || "")}</td>
      <td>${row.score.afterPhotoDataUrl ? `<img class="safety-thumb" src="${row.score.afterPhotoDataUrl}" alt="Ảnh sau cải tiến">` : ""}</td>
      <td>${escapeHtml(row.score.actionOwner || "")}</td>
      <td>${escapeHtml(row.score.actionPlan || "")}</td>
      <td>${escapeHtml(completionDate)}</td>
      <td>${escapeHtml(row.score.completionLevelConfirm || "")}</td>
      <td></td>
    </tr>`;
  }

  function renderIssueStatsTab() {
    const period = getPeriod(elements.issueStatsPeriodSelect?.value || state.activePeriodId);
    const rows = getIssueRecords(period?.id || "");
    const openRows = rows.filter((row) => isIssueOpen(row.score));
    const closedRows = rows.filter((row) => !isIssueOpen(row.score));
    const withPhoto = rows.filter((row) => row.score.photoDataUrl || row.score.afterPhotoDataUrl).length;
    elements.issueStatsGrid.innerHTML = `
      <article class="stat-card"><span>Tổng vấn đề</span><strong>${rows.length}</strong></article>
      <article class="stat-card"><span>Đang gặp phải</span><strong>${openRows.length}</strong></article>
      <article class="stat-card"><span>Đã xử lý</span><strong>${closedRows.length}</strong></article>
      <article class="stat-card"><span>Có ảnh</span><strong>${withPhoto}</strong></article>`;
    renderIssueBreakdown(elements.issueZoneStats, openRows, (row) => getIssueLocation(row));
    renderIssueBreakdown(elements.issueTypeStats, openRows, (row) => row.score.issueType || "Chưa phân loại");
  }

  function renderIssueBreakdown(container, rows, labelFactory) {
    const counts = new Map();
    rows.forEach((row) => {
      const label = labelFactory(row);
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "vi"));
    container.innerHTML = sorted.length
      ? sorted.map(([label, count]) => `<article class="compact-item"><strong>${escapeHtml(label)}</strong><span>${count} vấn đề đang gặp phải</span></article>`).join("")
      : '<article class="compact-item"><strong>Không có vấn đề đang mở</strong><span>Kỳ này chưa có vấn đề cần theo dõi.</span></article>';
  }

  function renderSummaryTab() {
    const period = getPeriod();
    const periodId = period?.id || "";
    const isAdmin = currentUser?.role === "admin";
    const isArchived = isPeriodArchived(periodId);
    const allowedAreaIds = getAllowedAreaIds(currentUser, periodId);
    const assignedAreas = getAreasForPeriod(periodId).filter((area) => allowedAreaIds.has(area.id));
    elements.summaryTitle.textContent = `Điểm Chi Tiết Theo Từng Hạng Mục - ${periodLabel(period)}${isArchived ? " (Lưu trữ - chỉ xem)" : ""}`;
    if (elements.assignedZoneSummary) {
      elements.assignedZoneSummary.textContent = isArchived
        ? "Kỳ này đã lưu trữ: chỉ xem và xuất Excel, không sửa trên web."
        : assignedAreas.length
        ? `Bạn được sửa zone: ${assignedAreas.map((area) => area.code).join(", ")}. Các zone khác chỉ xem.`
        : "Tài khoản này chưa được phân quyền zone.";
    }
    buildMatrixTable(elements.summaryTable, {
      periodId,
      editable: !isArchived,
      editableAreaIds: allowedAreaIds,
      adminMode: isAdmin && !isArchived,
    });
  }

  function renderCatalogTab() {
    renderPeriodList();
    renderScorerList();
    renderAssessorList();
    renderAreaList();
    renderItemList();
  }

  function renderPeriodList() {
    elements.periodList.innerHTML = getPeriods()
      .map((period) => {
        const active = period.id === state.activePeriodId ? "Đang mở" : "Mở kỳ";
        const statusBadge = period.archived
          ? '<span class="period-status-badge archived">Đã lưu trữ</span>'
          : '<span class="period-status-badge">Chưa lưu trữ</span>';
        return `<article class="compact-item">
          <div>
            <strong>${escapeHtml(periodLabel(period))}</strong>
            ${statusBadge}
          </div>
          <div class="compact-actions">
            <button class="tiny-button" type="button" data-action="activate-period" data-id="${escapeHtml(period.id)}">${active}</button>
            ${
              period.archived
                ? `<button class="tiny-button" type="button" data-action="unarchive-period" data-id="${escapeHtml(period.id)}">Bỏ lưu trữ</button>`
                : `<button class="tiny-button" type="button" data-action="archive-period" data-id="${escapeHtml(period.id)}">Lưu trữ</button>`
            }
            <button class="tiny-button danger-text-button" type="button" data-action="delete-period" data-id="${escapeHtml(period.id)}">Xóa</button>
          </div>
        </article>`;
      })
      .join("");
  }

  function renderDataTab() {
    if (!elements.archivedPeriodList) {
      return;
    }

    const archivedPeriods = getArchivedPeriods();
    elements.archivedPeriodList.innerHTML = archivedPeriods.length
      ? archivedPeriods
          .map((period) => `<article class="compact-item">
            <div>
              <strong>${escapeHtml(periodLabel(period))}</strong>
              <span>Đã lưu trữ${period.archivedAt ? ` lúc ${escapeHtml(formatDateDisplay(period.archivedAt) || period.archivedAt)}` : ""}. Chỉ xem/xuất Excel trên web.</span>
            </div>
            <div class="compact-actions">
              <button class="tiny-button" type="button" data-action="open-archived-period" data-id="${escapeHtml(period.id)}">Mở xem</button>
              <button class="tiny-button" type="button" data-action="export-summary-period" data-id="${escapeHtml(period.id)}">Xuất tổng hợp</button>
              <button class="tiny-button" type="button" data-action="export-safety-period" data-id="${escapeHtml(period.id)}">Xuất ĐG AT</button>
              <button class="tiny-button" type="button" data-action="unarchive-period" data-id="${escapeHtml(period.id)}">Bỏ lưu trữ</button>
            </div>
          </article>`)
          .join("")
      : '<article class="compact-item"><strong>Chưa có kỳ lưu trữ</strong><span>Vào Danh mục → Kỳ đánh giá và bấm “Lưu trữ” cho kỳ muốn khóa.</span></article>';
  }

  function renderScorerList() {
    elements.scorerList.innerHTML = getManagers()
      .map((manager) => {
        const zones = getAreas()
          .filter((area) => area.scorerId === manager.id)
          .map((area) => area.code);
        const emails = formatEmailList(manager.emails);
        return `<article class="compact-item">
          <div>
            <strong>${escapeHtml(manager.name)}</strong>
            <span>Zone phụ trách / được đánh giá: ${escapeHtml(zones.join(", ") || "chưa có")}</span>
            <span>Email nhận báo cáo: ${escapeHtml(emails || "chưa có")}</span>
          </div>
          <div class="compact-actions">
            <button class="tiny-button" type="button" data-action="edit-scorer" data-id="${escapeHtml(manager.id)}">Sửa</button>
            <button class="tiny-button danger-text-button" type="button" data-action="delete-scorer" data-id="${escapeHtml(manager.id)}">Xóa</button>
          </div>
        </article>`;
      })
      .join("");
  }

  function renderAssessorList() {
    if (!elements.catalogAssessorList) {
      return;
    }

    elements.catalogAssessorList.innerHTML = getAssessors()
      .map((assessor) => {
        const zones = getAreas()
          .filter((area) => area.assessorId === assessor.id)
          .map((area) => area.code);
        const accounts = state.accounts
          .filter((account) => account.assessorId === assessor.id)
          .map((account) => account.username);
        return `<article class="compact-item">
          <div>
            <strong>${escapeHtml(assessor.name)}</strong>
            <span>Zone chấm: ${escapeHtml(zones.join(", ") || "chưa có")}</span>
            <span>Tài khoản: ${escapeHtml(accounts.join(", ") || "chưa có")}</span>
          </div>
          <div class="compact-actions">
            <button class="tiny-button" type="button" data-action="edit-assessor" data-id="${escapeHtml(assessor.id)}">Sửa</button>
            <button class="tiny-button danger-text-button" type="button" data-action="delete-assessor" data-id="${escapeHtml(assessor.id)}">Xóa</button>
          </div>
        </article>`;
      })
      .join("") || '<article class="compact-item"><strong>Chưa có assessor</strong><span>Thêm assessor trước khi tạo zone hoặc tài khoản chấm.</span></article>';
  }

  function renderAreaList() {
    elements.areaList.innerHTML = getAreas()
      .map((area) => `<article class="compact-item">
        <div>
          <strong>Zone ${escapeHtml(area.code)}</strong>
          <span>Trưởng phòng: ${escapeHtml(area.departmentHead || "-")} · Nhóm tổng: ${escapeHtml(area.summaryGroup || "-")} · Người phụ trách zone: ${escapeHtml(getAreaResponsibleName(area))}</span>
          <span>Assessor dòng cuối: ${escapeHtml(getAreaConfiguredAssessorName(area) || "lấy theo assessor chấm gần nhất")}</span>
        </div>
        <div class="compact-actions">
          <button class="tiny-button" type="button" data-action="edit-area" data-id="${escapeHtml(area.id)}">Sửa</button>
          <button class="tiny-button danger-text-button" type="button" data-action="delete-area" data-id="${escapeHtml(area.id)}">Xóa</button>
        </div>
      </article>`)
      .join("");
  }

  function renderItemList() {
    elements.itemList.innerHTML = DEFAULT_ITEMS.map((item) => `<article class="item-card">
      <div>
        <strong>${escapeHtml(item.code)} ${escapeHtml(item.name)}</strong>
        <ul>${item.criteria.map((criterion) => `<li>${escapeHtml(criterion.label)}</li>`).join("")}</ul>
      </div>
      <span class="item-meta">Cố định theo file mẫu</span>
    </article>`).join("");
  }

  function renderAccountsTab() {
    renderAccountZoneList();
    elements.accountList.innerHTML = state.accounts
      .map((account) => {
        const isAdmin = account.role === "admin";
        const zones = isAdmin
          ? "Toàn quyền"
          : getAreas()
              .filter((area) => getAllowedAreaIds(account).has(area.id))
              .map((area) => area.code)
              .join(", ") || "chưa có zone";

        return `<article class="account-card">
          <div>
            <strong>${escapeHtml(account.username)}</strong>
            <span>${escapeHtml(isAdmin ? "Admin hệ thống" : getAccountDisplayName(account) || "Assessor")} · ${escapeHtml(zones)}</span>
          </div>
          <div class="account-actions">
            ${
              isAdmin
                ? '<span class="item-meta">Tài khoản cố định</span>'
                : `<button class="tiny-button" type="button" data-action="edit-account" data-id="${escapeHtml(account.id)}">Sửa</button>
                   <button class="tiny-button danger-text-button" type="button" data-action="delete-account" data-id="${escapeHtml(account.id)}">Xóa</button>`
            }
          </div>
        </article>`;
      })
      .join("");
  }

  function handleLogin(event) {
    event.preventDefault();
    const username = elements.loginUsername.value.trim();
    const password = elements.loginPassword.value;
    const account = state.accounts.find((item) => item.username === username && item.password === password);

    if (!account) {
      showToast("Sai tài khoản hoặc mật khẩu.", true);
      return;
    }

    currentUser = account;
    activeTab = account.role === "admin" ? "home" : "assessor";
    elements.loginScreen.hidden = true;
    elements.appShell.hidden = false;
    elements.loginForm.reset();
    renderAll();
  }

  function handleLogout() {
    currentUser = null;
    activeTab = "assessor";
    closeModal();
    closeAccountMenu();
    elements.appShell.hidden = true;
    elements.loginScreen.hidden = false;
    elements.loginUsername.focus();
  }

  function openScoreModal(button) {
    const periodId = button.dataset.periodId;
    const area = getAreaForPeriod(periodId, button.dataset.areaId);
    const item = getItem(button.dataset.itemId);
    const criterion = getCriterion(item, button.dataset.criterionId);

    if (blockIfArchivedPeriod(periodId)) {
      return;
    }

    if (!area || !item || !criterion || !getAllowedAreaIds(currentUser, periodId).has(area.id) || isNotApplicable(item.id, criterion.id, area)) {
      showToast("Bạn không có quyền sửa ô này.", true);
      return;
    }

    const isAdmin = currentUser?.role === "admin";
    const record = getScoreRecord(periodId, area.id, item.id, criterion.id);
    const hasRecord = Boolean(record);
    const selectedScore = isScoreCrossed(record) ? SCORE_CROSSED : Number.isFinite(record?.score) ? String(record.score) : "";
    const options = [
      { value: "", label: "Chưa chấm" },
      { value: SCORE_CROSSED, label: "Gạch chéo" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
    ]
      .map((score) => `<option value="${score.value}" ${score.value === selectedScore ? "selected" : ""}>${score.label}</option>`)
      .join("");

    const deleteBtn = isAdmin && hasRecord
      ? `<button class="danger-button" type="button" id="modal-delete-score-btn">Xóa điểm này</button>`
      : "";
    const photoPreview = record?.photoDataUrl
      ? `<div class="photo-preview">
          <img src="${record.photoDataUrl}" alt="Ảnh minh họa hiện tại">
          <label class="check-line">
            <input name="removePhoto" type="checkbox">
            <span>Xóa ảnh hiện tại</span>
          </label>
        </div>`
      : "";

    openFormModal({
      title: "Sửa điểm",
      submitText: "Lưu điểm",
      extraActions: deleteBtn,
      html: `
        <div class="modal-context">
          <span><strong>Zone:</strong> ${escapeHtml(area.code)} · ${escapeHtml(getAreaResponsibleNameForPeriod(periodId, area))}</span>
          <span><strong>Hạng mục:</strong> ${escapeHtml(item.code)} ${escapeHtml(item.name)}</span>
          <span><strong>Point:</strong> ${escapeHtml(criterion.label)}</span>
        </div>
        ${scoreGuideHtml(item, criterion)}
        <label>
          <span>Điểm</span>
          <select name="score">${options}</select>
        </label>
        <label>
          <span>Ghi chú vấn đề</span>
          <textarea name="note" placeholder="Nhập vấn đề phát hiện được nếu có">${escapeHtml(record?.note || "")}</textarea>
        </label>
        <label>
          <span>Ảnh minh họa</span>
          <input name="photo" type="file" accept="image/*">
        </label>
        ${photoPreview}
        <label>
          <span>Phân loại STOP 6</span>
          <select name="issueType">${optionHtml(STOP6_OPTIONS, record?.issueType || "")}</select>
        </label>
        <label>
          <span>Cấp bậc</span>
          <select name="issueLevel">${optionHtml(ISSUE_LEVEL_OPTIONS, record?.issueLevel || "")}</select>
        </label>
        <label>
          <span>Tình trạng vấn đề</span>
          <select name="issueStatus">
            <option value="open" ${(record?.issueStatus || "open") !== "closed" ? "selected" : ""}>Đang gặp phải</option>
            <option value="closed" ${record?.issueStatus === "closed" ? "selected" : ""}>Đã xử lý</option>
          </select>
        </label>
      `,
      async onSubmit(formData, form) {
        if (blockIfArchivedPeriod(periodId)) {
          return false;
        }

        const rawScore = formData.get("score");
        const isCrossed = rawScore === SCORE_CROSSED;
        const nextScore = rawScore === "" || isCrossed ? null : Number(rawScore);
        if (nextScore !== null && (!Number.isInteger(nextScore) || nextScore < 1 || nextScore > 5)) {
          showToast("Điểm phải từ 1 đến 5.", true);
          return false;
        }

        applyScorePreview({
          periodId,
          areaId: area.id,
          itemId: item.id,
          criterionId: criterion.id,
          rawScore,
        });
        const photoInput = form.elements.photo;
        const nextPhoto = await prepareScorePhoto(photoInput?.files?.[0], record, formData.get("removePhoto") === "on");
        await setScore({
          periodId,
          area,
          item,
          criterion,
          score: nextScore,
          status: isCrossed ? SCORE_CROSSED : "",
          note: String(formData.get("note") || "").trim(),
          photoDataUrl: nextPhoto.photoDataUrl,
          photoName: nextPhoto.photoName,
          issueType: String(formData.get("issueType") || ""),
          issueLevel: String(formData.get("issueLevel") || ""),
          issueStatus: String(formData.get("issueStatus") || "open"),
        });
        showToast("Đã lưu điểm.");
        renderAll();
        return true;
      },
    });

    const scoreSelect = elements.modalBody.querySelector('select[name="score"]');
    scoreSelect?.addEventListener("change", () => {
      applyScorePreview({
        periodId,
        areaId: area.id,
        itemId: item.id,
        criterionId: criterion.id,
        rawScore: scoreSelect.value,
      });
    });

    // Wire up the admin delete button after modal is rendered
    if (isAdmin && hasRecord) {
      setTimeout(() => {
        const deleteScoreBtn = document.getElementById("modal-delete-score-btn");
        if (deleteScoreBtn) {
          deleteScoreBtn.addEventListener("click", () => {
            closeModal();
            openConfirmModal({
              title: "Xóa điểm",
              message: `Xóa điểm của Zone ${area.code} – ${item.code} (${criterion.label})?`,
              confirmText: "Xóa điểm",
              danger: true,
              onConfirm() {
                deleteScore({ periodId, area, item, criterion, record })
                  .then(() => {
                    showToast("Đã xóa điểm.");
                    renderAll();
                  })
                  .catch(() => showToast("Lỗi khi xóa điểm.", true));
              },
            });
          });
        }
      }, 0);
    }
  }

  async function deleteScore({ periodId, area, item, criterion, record }) {
    if (!record) return;
    if (isPeriodArchived(periodId)) {
      throw new Error("Archived period is read-only");
    }

    // Remove from local state
    state.scores = state.scores.filter((s) => s.id !== record.id);

    // Remove from Firebase
    await deleteScoreFromDb(record.id);

    // Log history
    const historyEntry = {
      id: makeId("history"),
      timestamp: new Date().toISOString(),
      periodId,
      periodLabel: periodLabel(getPeriod(periodId)),
      userName: getAccountDisplayName(currentUser),
      username: currentUser?.username || "",
      areaId: area.id,
      areaCode: area.code,
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      criterionId: criterion.id,
      criterionLabel: criterion.label,
      beforeLabel: formatScoreRecord(record),
      afterLabel: "Đã xóa",
      note: "Admin xóa điểm",
    };
    state.history.unshift(historyEntry);
    await saveHistoryEntry(historyEntry);
  }

  async function setScore({ periodId, area, item, criterion, score, status, note, photoDataUrl, photoName, issueType, issueLevel, issueStatus }) {
    const existingIndex = state.scores.findIndex(
      (record) =>
        record.periodId === periodId &&
        record.areaId === area.id &&
        record.itemId === item.id &&
        record.criterionId === criterion.id,
    );
    const existing = existingIndex >= 0 ? state.scores[existingIndex] : null;
    const beforeLabel = formatScoreRecord(existing);
    const afterLabel = status === SCORE_CROSSED ? "Gạch chéo" : Number.isFinite(score) ? String(score) : "";
    const beforeNote = existing?.note || "";
    const nextHasIssue = Boolean(note || photoDataUrl);
    const normalizedIssueStatus = nextHasIssue ? issueStatus || "open" : "";
    const normalizedIssueType = nextHasIssue ? issueType || "" : "";
    const normalizedIssueLevel = nextHasIssue ? issueLevel || "" : "";
    const changed =
      beforeLabel !== afterLabel ||
      beforeNote !== note ||
      (existing?.photoDataUrl || "") !== (photoDataUrl || "") ||
      (existing?.issueType || "") !== normalizedIssueType ||
      (existing?.issueLevel || "") !== normalizedIssueLevel ||
      (existing?.issueStatus || "") !== normalizedIssueStatus;

    if (!changed) {
      return;
    }

    if (score === null && !status && !nextHasIssue) {
      if (existingIndex >= 0) {
        const removedId = state.scores[existingIndex].id;
        state.scores.splice(existingIndex, 1);
        await deleteScoreFromDb(removedId);
      }
    } else {
      const payload = {
        id: existing?.id || makeId("score"),
        periodId,
        areaId: area.id,
        itemId: item.id,
        criterionId: criterion.id,
        score,
        status,
        note,
        photoDataUrl: photoDataUrl || "",
        photoName: photoName || "",
        issueType: normalizedIssueType,
        issueLevel: normalizedIssueLevel,
        issueStatus: normalizedIssueStatus,
        issueLocation: existing?.issueLocation || "",
        issueDay: existing?.issueDay || "",
        issueMonth: existing?.issueMonth || "",
        issueCount: normalizeIssueCount(existing?.issueCount),
        issueFoundBy: existing?.issueFoundBy || "",
        issueItemLabel: existing?.issueItemLabel || "",
        foundChannel: existing?.foundChannel || "",
        improvementContent: existing?.improvementContent || "",
        afterPhotoDataUrl: existing?.afterPhotoDataUrl || "",
        afterPhotoName: existing?.afterPhotoName || "",
        actionOwner: existing?.actionOwner || "",
        actionPlan: existing?.actionPlan || "",
        completionDate: existing?.completionDate || "",
        completionLevelConfirm: existing?.completionLevelConfirm || "",
        completionStop6Confirm: existing?.completionStop6Confirm || "",
        scorerName: getAccountDisplayName(currentUser),
        accountUsername: currentUser?.username || "",
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        state.scores[existingIndex] = payload;
      } else {
        state.scores.push(payload);
      }
      await saveScore(payload);
    }

    const historyEntry = {
      id: makeId("history"),
      timestamp: new Date().toISOString(),
      periodId,
      periodLabel: periodLabel(getPeriod(periodId)),
      userName: getAccountDisplayName(currentUser),
      username: currentUser?.username || "",
      areaId: area.id,
      areaCode: area.code,
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      criterionId: criterion.id,
      criterionLabel: criterion.label,
      beforeLabel,
      afterLabel,
      note,
    };
    state.history.unshift(historyEntry);
    await saveHistoryEntry(historyEntry);
  }

  async function logAdminChange({ subjectLabel, beforeLabel = "", afterLabel = "", changeLabel = "", areaCode = "", note = "" }) {
    const period = getPeriod();
    const historyEntry = {
      id: makeId("history"),
      timestamp: new Date().toISOString(),
      periodId: period?.id || "",
      periodLabel: periodLabel(period),
      userName: getAccountDisplayName(currentUser),
      username: currentUser?.username || "",
      areaCode,
      subjectLabel,
      beforeLabel,
      afterLabel,
      changeLabel: changeLabel || `${beforeLabel || "-"} → ${afterLabel || "-"}`,
      note,
      source: "admin",
    };
    state.history.unshift(historyEntry);
    await saveHistoryEntry(historyEntry);
  }

  function openFormModal({ title, html, submitText = "Lưu", submitClass = "primary-button", extraActions = "", onSubmit }) {
    modalPreviewDirty = false;
    modalSubmitSucceeded = false;
    elements.modalTitle.textContent = title;
    elements.modalBody.innerHTML = `<form class="modal-form" id="modal-form">${html}</form>`;
    elements.modalActions.innerHTML = `
      ${extraActions ? `<div class="modal-actions-left">${extraActions}</div>` : ""}
      <div class="modal-actions-right">
        <button class="secondary-button" type="button" data-action="modal-cancel">Hủy</button>
        <button class="${submitClass}" type="submit" form="modal-form">${escapeHtml(submitText)}</button>
      </div>
    `;

    const form = document.getElementById("modal-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const shouldClose = await onSubmit(new FormData(form), form);
        if (shouldClose !== false) {
          modalSubmitSucceeded = true;
          closeModal();
        }
      } catch (error) {
        console.error(error);
        showToast("Lỗi khi lưu dữ liệu.", true);
      }
    });

    elements.modalBackdrop.hidden = false;
    const firstInput = elements.modalBody.querySelector("input, select, textarea, button");
    firstInput?.focus();
  }

  function openConfirmModal({ title, message, confirmText = "Xác nhận", danger = false, onConfirm }) {
    openFormModal({
      title,
      submitText: confirmText,
      submitClass: danger ? "danger-button" : "primary-button",
      html: `<p>${escapeHtml(message)}</p>`,
      async onSubmit() {
        await onConfirm();
        renderAll();
        return true;
      },
    });
  }

  function closeModal() {
    const shouldRefreshPreview = modalPreviewDirty && !modalSubmitSucceeded && currentUser && state;
    elements.modalBackdrop.hidden = true;
    elements.modalTitle.textContent = "";
    elements.modalBody.innerHTML = "";
    elements.modalActions.innerHTML = "";
    modalPreviewDirty = false;
    modalSubmitSucceeded = false;
    if (shouldRefreshPreview) {
      renderActiveTab();
    }
  }

  async function prepareScorePhoto(file, existingRecord, removePhoto) {
    if (removePhoto) {
      return { photoDataUrl: "", photoName: "" };
    }

    if (!file) {
      return {
        photoDataUrl: existingRecord?.photoDataUrl || "",
        photoName: existingRecord?.photoName || "",
      };
    }

    return {
      photoDataUrl: await resizeImageFile(file, 980, 0.78),
      photoName: file.name || "anh-minh-hoa.jpg",
    };
  }

  function resizeImageFile(file, maxSize, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Không đọc được ảnh."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("Ảnh không hợp lệ."));
        image.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        image.src = String(reader.result || "");
      };
      reader.readAsDataURL(file);
    });
  }

  async function handlePeriodSubmit(event) {
    event.preventDefault();
    const month = Number(elements.periodMonth.value);
    const year = Number(elements.periodYear.value);

    if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2020 || year > 2100) {
      showToast("Tháng hoặc năm không hợp lệ.", true);
      return;
    }

    let period = state.periods.find((item) => item.month === month && item.year === year);
    const existed = Boolean(period);
    await ensurePeriodSnapshot(state.activePeriodId);
    if (!period) {
      period = {
        id: `period-${year}-${String(month).padStart(2, "0")}`,
        month,
        year,
        label: `Tháng ${month}/${year}`,
        createdAt: new Date().toISOString(),
        archived: false,
        settingsSnapshot: makeSettingsSnapshot(),
      };
      state.periods.push(period);
      await dbRef(`periods/${period.id}`).set(period);
    } else {
      await ensurePeriodSnapshot(period.id);
    }

    state.activePeriodId = period.id;
    await saveMeta();
    await logAdminChange({
      subjectLabel: "Kỳ đánh giá",
      afterLabel: periodLabel(period),
      changeLabel: existed ? `Mở lại ${periodLabel(period)}` : `Tạo kỳ mới ${periodLabel(period)}`,
      note: existed ? "Kỳ đã tồn tại trên Firebase" : "Kỳ mới bắt đầu trống điểm",
    });
    elements.periodForm.reset();
    showToast("Đã tạo kỳ mới trống để chấm lại.");
    renderAll();
  }

  async function handleScorerSubmit(event) {
    event.preventDefault();
    const name = elements.scorerName.value.trim();
    if (!name) {
      showToast("Vui lòng nhập tên người phụ trách zone.", true);
      return;
    }

    const emails = normalizeEmailList(elements.scorerEmails?.value || "");
    const newManager = { id: makeId("scorer"), name, emails, createdAt: new Date().toISOString() };
    state.managers.push(newManager);
    await Promise.all([
      dbRef(`managers/${newManager.id}`).set(newManager),
      refreshLatestPeriodSnapshot(),
      logAdminChange({
        subjectLabel: "Người phụ trách zone",
        afterLabel: `${name} · ${formatEmailList(emails) || "chưa có email"}`,
        changeLabel: `Thêm người phụ trách zone ${name}`,
      }),
    ]);
    elements.scorerForm.reset();
    showToast("Đã thêm người phụ trách zone.");
    renderAll();
  }

  async function handleAssessorSubmit(event) {
    event.preventDefault();
    const name = elements.catalogAssessorName.value.trim();
    if (!name) {
      showToast("Vui lòng nhập tên assessor.", true);
      return;
    }

    if (getAssessors().some((assessor) => assessor.name.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi"))) {
      showToast("Assessor này đã tồn tại.", true);
      return;
    }

    const newAssessor = { id: makeId("assessor"), name, createdAt: new Date().toISOString() };
    state.assessors.push(newAssessor);
    await Promise.all([
      dbRef(`assessors/${newAssessor.id}`).set(newAssessor),
      refreshLatestPeriodSnapshot(),
      logAdminChange({
        subjectLabel: "Assessor",
        afterLabel: name,
        changeLabel: `Thêm assessor ${name}`,
      }),
    ]);
    elements.catalogAssessorForm.reset();
    showToast("Đã thêm assessor.");
    renderAll();
  }

  async function handleAreaSubmit(event) {
    event.preventDefault();
    const code = elements.areaCode.value.trim();
    const scorerId = elements.areaScorer.value;
    const assessorId = elements.areaAssessor.value;

    if (!code || !scorerId || !assessorId) {
      showToast("Vui lòng nhập đủ mã zone, người phụ trách zone và assessor.", true);
      return;
    }

    const newArea = {
      id: makeId("area"),
      order: Math.max(0, ...state.areas.map((area) => Number(area.order) || 0)) + 1,
      code,
      templateCode: code,
      departmentHead: elements.areaHead.value.trim(),
      summaryGroup: elements.areaSummaryGroup.value.trim(),
      scorerId,
      assessorId,
      assessorName: getAssessor(assessorId)?.name || "",
      highlight: elements.areaHighlight.checked,
      createdAt: new Date().toISOString(),
    };
    state.areas.push(newArea);
    await Promise.all([
      dbRef(`areas/${newArea.id}`).set(newArea),
      refreshLatestPeriodSnapshot(),
      logAdminChange({
        subjectLabel: "Zone",
        areaCode: code,
        afterLabel: `${code} · ${elements.areaHead.value.trim() || "-"} · ${getManager(scorerId)?.name || ""} · Assessor: ${newArea.assessorName || "-"}`,
        changeLabel: `Thêm zone ${code}`,
      }),
    ]);

    elements.areaForm.reset();
    showToast("Đã thêm zone.");
    renderAll();
  }

  async function handleAccountSubmit(event) {
    event.preventDefault();
    const assessorId = elements.accountAssessor.value;
    const assessor = getAssessor(assessorId);
    const name = assessor?.name || "";
    const areaIds = getCheckedAreaIds(elements.accountForm);
    const username = elements.accountUsername.value.trim();
    const password = elements.accountPassword.value;

    if (!assessorId || !assessor || !username || !password) {
      showToast("Vui lòng nhập đủ thông tin tài khoản.", true);
      return;
    }

    if (state.accounts.some((account) => account.username === username)) {
      showToast("Tên tài khoản đã tồn tại.", true);
      return;
    }

    const newAccount = {
      id: makeId("account"),
      role: "manager",
      assessorId,
      name,
      areaIds,
      username,
      password,
      createdAt: new Date().toISOString(),
    };
    state.accounts.push(newAccount);
    await dbRef(`accounts/${newAccount.id}`).set(newAccount);
    const effectiveAreaCodes = [...getAllowedAreaIds(newAccount)].map((areaId) => getArea(areaId)?.code).filter(Boolean).join(", ");
    await logAdminChange({
      subjectLabel: "Tài khoản assessor",
      afterLabel: `${username} · ${name} · Zone ${effectiveAreaCodes || "chưa có"}`,
      changeLabel: `Thêm tài khoản ${username}`,
    });

    elements.accountForm.reset();
    showToast("Đã thêm tài khoản assessor.");
    renderAll();
  }

  function editScorer(id) {
    const manager = getManager(id);
    if (!manager) {
      return;
    }

    openFormModal({
      title: "Sửa người phụ trách zone",
      html: `
        <label>
          <span>Tên người phụ trách zone</span>
          <input name="name" type="text" value="${escapeHtml(manager.name)}" required>
        </label>
        <label>
          <span>Email người phụ trách</span>
          <textarea name="emails" placeholder="Mỗi email cách nhau bằng dấu phẩy hoặc xuống dòng">${escapeHtml(formatEmailList(manager.emails))}</textarea>
        </label>
      `,
      onSubmit(formData) {
        const name = String(formData.get("name") || "").trim();
        const emails = normalizeEmailList(formData.get("emails"));
        if (!name) {
          showToast("Tên người phụ trách zone không được trống.", true);
          return false;
        }
        const beforeLabel = `${manager.name} · ${formatEmailList(manager.emails) || "chưa có email"}`;
        manager.name = name;
        manager.emails = emails;
        Promise.all([
          dbRef(`managers/${manager.id}`).update({ name, emails }),
          refreshLatestPeriodSnapshot(),
          logAdminChange({
            subjectLabel: "Người phụ trách zone",
            beforeLabel,
            afterLabel: `${name} · ${formatEmailList(emails) || "chưa có email"}`,
            changeLabel: `Sửa người phụ trách zone ${manager.name}`,
          }),
        ]).then(() => {
          showToast("Đã cập nhật người phụ trách zone.");
          renderAll();
        }).catch(() => showToast("Lỗi khi cập nhật.", true));
        return true;
      },
    });
  }

  function deleteScorer(id) {
    const manager = getManager(id);
    if (!manager) {
      return;
    }

    if (state.areas.some((area) => area.scorerId === id)) {
      showToast("Người phụ trách zone đang được gán zone, hãy đổi zone trước khi xóa.", true);
      return;
    }

    openConfirmModal({
      title: "Xóa người phụ trách zone",
      message: `Xóa ${manager.name}?`,
      confirmText: "Xóa",
      danger: true,
      onConfirm() {
        state.managers = state.managers.filter((item) => item.id !== id);
        const writes = [
          dbRef(`managers/${id}`).remove(),
          refreshLatestPeriodSnapshot(),
          logAdminChange({
            subjectLabel: "Người phụ trách zone",
            beforeLabel: manager.name,
            afterLabel: "Đã xóa",
            changeLabel: `Xóa người phụ trách zone ${manager.name}`,
          }),
        ];
        Promise.all(writes).then(() => showToast("Đã xóa người phụ trách zone.")).catch(() => showToast("Lỗi khi xóa.", true));
      },
    });
  }

  function editAssessor(id) {
    const assessor = getAssessor(id);
    if (!assessor) {
      return;
    }

    openFormModal({
      title: "Sửa assessor",
      html: `
        <label>
          <span>Tên assessor</span>
          <input name="name" type="text" value="${escapeHtml(assessor.name)}" required>
        </label>
      `,
      async onSubmit(formData) {
        const name = String(formData.get("name") || "").trim();
        if (!name) {
          showToast("Tên assessor không được trống.", true);
          return false;
        }

        if (getAssessors().some((item) => item.id !== id && item.name.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi"))) {
          showToast("Assessor này đã tồn tại.", true);
          return false;
        }

        const beforeName = assessor.name;
        assessor.name = name;
        const affectedAreas = state.areas.filter((area) => area.assessorId === assessor.id);
        const affectedAccounts = state.accounts.filter((account) => account.assessorId === assessor.id);
        affectedAreas.forEach((area) => {
          area.assessorName = name;
        });
        affectedAccounts.forEach((account) => {
          account.name = name;
        });

        await Promise.all([
          dbRef(`assessors/${assessor.id}`).set(assessor),
          ...affectedAreas.map((area) => dbRef(`areas/${area.id}`).set(area)),
          ...affectedAccounts.map((account) => dbRef(`accounts/${account.id}`).set(account)),
          refreshLatestPeriodSnapshot(),
          logAdminChange({
            subjectLabel: "Assessor",
            beforeLabel: beforeName,
            afterLabel: name,
            changeLabel: `Sửa assessor ${beforeName}`,
          }),
        ]);
        showToast("Đã cập nhật assessor.");
        renderAll();
        return true;
      },
    });
  }

  function deleteAssessor(id) {
    const assessor = getAssessor(id);
    if (!assessor) {
      return;
    }

    const usedByZones = getAreas().filter((area) => area.assessorId === id);
    const usedByAccounts = state.accounts.filter((account) => account.assessorId === id);
    if (usedByZones.length || usedByAccounts.length) {
      const zones = usedByZones.map((area) => area.code).join(", ") || "không có";
      const accounts = usedByAccounts.map((account) => account.username).join(", ") || "không có";
      showToast(`Assessor đang được dùng. Zone: ${zones}; tài khoản: ${accounts}.`, true);
      return;
    }

    openConfirmModal({
      title: "Xóa assessor",
      message: `Xóa assessor ${assessor.name}?`,
      confirmText: "Xóa",
      danger: true,
      async onConfirm() {
        state.assessors = state.assessors.filter((item) => item.id !== id);
        await Promise.all([
          dbRef(`assessors/${id}`).remove(),
          refreshLatestPeriodSnapshot(),
          logAdminChange({
            subjectLabel: "Assessor",
            beforeLabel: assessor.name,
            afterLabel: "Đã xóa",
            changeLabel: `Xóa assessor ${assessor.name}`,
          }),
        ]);
        showToast("Đã xóa assessor.");
      },
    });
  }

  function editArea(id, periodId = "") {
    if (blockIfArchivedPeriod(periodId)) {
      return;
    }

    const isSnapshotEdit = shouldEditPeriodSnapshot(periodId);
    const area = isSnapshotEdit ? getAreaForPeriod(periodId, id) : getArea(id);
    const period = getPeriod(periodId);
    if (!area) {
      return;
    }

    openFormModal({
      title: "Sửa zone",
      html: `
        ${isSnapshotEdit ? `<div class="modal-context"><span>Đang sửa trực tiếp trên bảng ${escapeHtml(periodLabel(period))}; danh mục hiện tại không bị đổi.</span></div>` : ""}
        <label>
          <span>Mã zone</span>
          <input name="code" type="text" value="${escapeHtml(area.code)}" required>
        </label>
        <label>
          <span>Trưởng phòng</span>
          <input name="departmentHead" type="text" value="${escapeHtml(area.departmentHead || "")}">
        </label>
        <label>
          <span>Nhóm tổng điểm cuối bảng</span>
          <input name="summaryGroup" type="text" value="${escapeHtml(area.summaryGroup || "")}">
        </label>
        ${
          isSnapshotEdit
            ? `<label>
                <span>Người phụ trách zone / người được đánh giá</span>
                <input name="responsibleName" type="text" value="${escapeHtml(getAreaResponsibleNameForPeriod(periodId, area))}" required>
              </label>
              <label>
                <span>Assessor mặc định trên dòng cuối</span>
                <input name="assessorName" type="text" value="${escapeHtml(getAreaConfiguredAssessorNameForPeriod(periodId, area))}">
              </label>`
            : `<label>
                <span>Người phụ trách zone / người được đánh giá</span>
                <select name="scorerId" required>${managerOptions(area.scorerId)}</select>
              </label>
              <label>
                <span>Assessor mặc định trên dòng cuối</span>
                <select name="assessorId">${assessorOptions(area.assessorId)}</select>
              </label>`
        }
        <label class="check-line">
          <input name="highlight" type="checkbox" ${area.highlight ? "checked" : ""}>
          <span>Tô vàng mã zone</span>
        </label>
      `,
      async onSubmit(formData) {
        const beforeLabel = `${area.code} · ${area.departmentHead || "-"} · ${area.summaryGroup || "-"} · ${getAreaResponsibleNameForPeriod(periodId, area)} · Assessor: ${getAreaConfiguredAssessorNameForPeriod(periodId, area) || "-"}`;
        area.code = String(formData.get("code") || "").trim();
        area.departmentHead = String(formData.get("departmentHead") || "").trim();
        area.summaryGroup = String(formData.get("summaryGroup") || "").trim();
        if (isSnapshotEdit) {
          area.responsibleName = String(formData.get("responsibleName") || "").trim();
          area.assessorName = String(formData.get("assessorName") || "").trim();
        } else {
          area.scorerId = String(formData.get("scorerId") || "");
          area.assessorId = String(formData.get("assessorId") || "");
          area.assessorName = getAssessor(area.assessorId)?.name || "";
        }
        area.highlight = formData.get("highlight") === "on";
        if (isSnapshotEdit) {
          await savePeriodSnapshot(getPeriod(periodId));
        } else {
          await Promise.all([
            dbRef(`areas/${area.id}`).set(area),
            refreshLatestPeriodSnapshot(),
          ]);
        }
        await Promise.all([
          logAdminChange({
            subjectLabel: "Zone",
            areaCode: area.code,
            beforeLabel,
            afterLabel: `${area.code} · ${area.departmentHead || "-"} · ${area.summaryGroup || "-"} · ${getAreaResponsibleNameForPeriod(periodId, area)} · Assessor: ${getAreaConfiguredAssessorNameForPeriod(periodId, area) || "-"}`,
            changeLabel: `Sửa zone ${area.code}`,
            note: isSnapshotEdit ? `Chỉ áp dụng cho ${periodLabel(period)}` : "",
          }),
        ]);
        showToast("Đã cập nhật zone.");
        renderAll();
        return true;
      },
    });
  }

  function deleteArea(id) {
    const area = getArea(id);
    if (!area) {
      return;
    }

    openConfirmModal({
      title: "Xóa zone",
      message: `Xóa zone ${area.code}? Điểm của zone này trên Firebase cũng sẽ bị xóa.`,
      confirmText: "Xóa",
      danger: true,
      onConfirm() {
        const removedScores = state.scores.filter((score) => score.areaId === id);
        state.areas = state.areas.filter((item) => item.id !== id);
        state.scores = state.scores.filter((score) => score.areaId !== id);
        const writes = [
          dbRef(`areas/${id}`).remove(),
          ...removedScores.map((s) => dbRef(`scores/${s.id}`).remove()),
          refreshLatestPeriodSnapshot(),
          logAdminChange({
            subjectLabel: "Zone",
            areaCode: area.code,
            beforeLabel: `${area.code} · ${area.departmentHead || "-"} · ${area.summaryGroup || "-"} · ${getAreaResponsibleName(area)}`,
            afterLabel: "Đã xóa",
            changeLabel: `Xóa zone ${area.code}`,
            note: "Điểm của zone đã bị xóa khỏi Firebase",
          }),
        ];
        Promise.all(writes).then(() => showToast("Đã xóa zone.")).catch(() => showToast("Lỗi khi xóa.", true));
      },
    });
  }

  function editDepartmentHeadGroup(currentName = "", periodId = "") {
    if (blockIfArchivedPeriod(periodId)) {
      return;
    }

    const isSnapshotEdit = shouldEditPeriodSnapshot(periodId);
    const period = getPeriod(periodId);
    const affectedAreas = getAreasForPeriod(periodId).filter((area) => (area.departmentHead || "") === currentName);
    if (!affectedAreas.length) {
      return;
    }

    openFormModal({
      title: "Sửa trưởng phòng",
      html: `
        <div class="modal-context">
          <span>Áp dụng cho zone: ${escapeHtml(affectedAreas.map((area) => area.code).join(", "))}</span>
          ${isSnapshotEdit ? `<span>Chỉ sửa trên bảng ${escapeHtml(periodLabel(period))}; không đổi danh mục hiện tại.</span>` : ""}
        </div>
        <label>
          <span>Tên trưởng phòng</span>
          <input name="departmentHead" type="text" value="${escapeHtml(currentName)}" placeholder="vd: Mr/Ms ...">
        </label>
      `,
      async onSubmit(formData) {
        const nextName = String(formData.get("departmentHead") || "").trim();
        const beforeLabel = currentName || "Chưa có";
        affectedAreas.forEach((area) => {
          area.departmentHead = nextName;
        });
        if (isSnapshotEdit) {
          await savePeriodSnapshot(getPeriod(periodId));
        } else {
          await Promise.all([
            ...affectedAreas.map((area) => dbRef(`areas/${area.id}`).set(area)),
            refreshLatestPeriodSnapshot(),
          ]);
        }
        await Promise.all([
          logAdminChange({
            subjectLabel: "Trưởng phòng",
            beforeLabel,
            afterLabel: nextName || "Chưa có",
            changeLabel: `Sửa trưởng phòng ${beforeLabel}`,
            note: `${isSnapshotEdit ? `${periodLabel(period)} · ` : ""}Áp dụng zone ${affectedAreas.map((area) => area.code).join(", ")}`,
          }),
        ]);
        showToast("Đã cập nhật trưởng phòng.");
        renderAll();
        return true;
      },
    });
  }

  function editSummaryGroup(currentName = "", periodId = "") {
    if (blockIfArchivedPeriod(periodId)) {
      return;
    }

    const isSnapshotEdit = shouldEditPeriodSnapshot(periodId);
    const period = getPeriod(periodId);
    const affectedAreas = getAreasForPeriod(periodId).filter((area) => (area.summaryGroup || "") === currentName);
    if (!affectedAreas.length) {
      return;
    }

    openFormModal({
      title: "Sửa nhóm tổng điểm",
      html: `
        <div class="modal-context">
          <span>Áp dụng cho zone: ${escapeHtml(affectedAreas.map((area) => area.code).join(", "))}</span>
          ${isSnapshotEdit ? `<span>Chỉ sửa trên bảng ${escapeHtml(periodLabel(period))}; không đổi danh mục hiện tại.</span>` : ""}
        </div>
        <label>
          <span>Tên nhóm tổng điểm</span>
          <input name="summaryGroup" type="text" value="${escapeHtml(currentName)}" placeholder="vd: Mr/Ms ...">
        </label>
      `,
      async onSubmit(formData) {
        const nextName = String(formData.get("summaryGroup") || "").trim();
        const beforeLabel = currentName || "Chưa có";
        affectedAreas.forEach((area) => {
          area.summaryGroup = nextName;
        });
        if (isSnapshotEdit) {
          await savePeriodSnapshot(getPeriod(periodId));
        } else {
          await Promise.all([
            ...affectedAreas.map((area) => dbRef(`areas/${area.id}`).set(area)),
            refreshLatestPeriodSnapshot(),
          ]);
        }
        await Promise.all([
          logAdminChange({
            subjectLabel: "Nhóm tổng điểm",
            beforeLabel,
            afterLabel: nextName || "Chưa có",
            changeLabel: `Sửa nhóm tổng điểm ${beforeLabel}`,
            note: `${isSnapshotEdit ? `${periodLabel(period)} · ` : ""}Áp dụng zone ${affectedAreas.map((area) => area.code).join(", ")}`,
          }),
        ]);
        showToast("Đã cập nhật nhóm tổng điểm.");
        renderAll();
        return true;
      },
    });
  }

  function editAreaResponsible(id, periodId = "") {
    editArea(id, periodId);
  }

  function editAreaAssessor(id, periodId = "") {
    if (blockIfArchivedPeriod(periodId)) {
      return;
    }

    const isSnapshotEdit = shouldEditPeriodSnapshot(periodId);
    const period = getPeriod(periodId);
    const area = isSnapshotEdit ? getAreaForPeriod(periodId, id) : getArea(id);
    if (!area) {
      return;
    }

    openFormModal({
      title: `Sửa assessor Zone ${area.code}`,
      html: `
        ${isSnapshotEdit ? `<div class="modal-context"><span>Đang sửa riêng cho ${escapeHtml(periodLabel(period))}; danh mục hiện tại không bị đổi.</span></div>` : ""}
        <label>
          <span>Assessor hiển thị ở dòng cuối</span>
          ${
            isSnapshotEdit
              ? `<input name="assessorName" type="text" value="${escapeHtml(getAreaConfiguredAssessorNameForPeriod(periodId, area))}">`
              : `<select name="assessorId">${assessorOptions(area.assessorId)}</select>`
          }
        </label>
      `,
      async onSubmit(formData) {
        const beforeLabel = getAreaConfiguredAssessorNameForPeriod(periodId, area) || "Chưa có";
        if (isSnapshotEdit) {
          area.assessorName = String(formData.get("assessorName") || "").trim();
          await savePeriodSnapshot(getPeriod(periodId));
        } else {
          area.assessorId = String(formData.get("assessorId") || "");
          area.assessorName = getAssessor(area.assessorId)?.name || "";
          await Promise.all([
            dbRef(`areas/${area.id}`).set(area),
            refreshLatestPeriodSnapshot(),
          ]);
        }
        await Promise.all([
          logAdminChange({
            subjectLabel: "Assessor",
            areaCode: area.code,
            beforeLabel,
            afterLabel: getAreaConfiguredAssessorNameForPeriod(periodId, area) || "Chưa có",
            changeLabel: `Sửa assessor Zone ${area.code}`,
            note: isSnapshotEdit ? `Chỉ áp dụng cho ${periodLabel(period)}` : "",
          }),
        ]);
        showToast("Đã cập nhật assessor.");
        renderAll();
        return true;
      },
    });
  }

  function editAccount(id) {
    const account = state.accounts.find((item) => item.id === id && item.role !== "admin");
    if (!account) {
      return;
    }

    openFormModal({
      title: "Sửa tài khoản",
      html: `
        <label>
          <span>Assessor</span>
          <select name="assessorId" required>${assessorOptions(account.assessorId, true)}</select>
        </label>
        <div class="form-field">
          <span>Zone bổ sung ngoài danh mục assessor</span>
          <div class="zone-check-list">${areaCheckboxListHtml(Array.isArray(account.areaIds) ? account.areaIds : [])}</div>
        </div>
        <label>
          <span>Tài khoản</span>
          <input name="username" type="text" value="${escapeHtml(account.username)}" required>
        </label>
        <label>
          <span>Mật khẩu</span>
          <input name="password" type="text" value="${escapeHtml(account.password)}" required minlength="4">
        </label>
      `,
      onSubmit(formData, form) {
        const assessorId = String(formData.get("assessorId") || "");
        const assessor = getAssessor(assessorId);
        const name = assessor?.name || "";
        const areaIds = getCheckedAreaIds(form);
        const username = String(formData.get("username") || "").trim();
        if (!assessor || !username || !String(formData.get("password") || "")) {
          showToast("Vui lòng nhập đủ thông tin tài khoản.", true);
          return false;
        }

        if (state.accounts.some((item) => item.id !== id && item.username === username)) {
          showToast("Tên tài khoản đã tồn tại.", true);
          return false;
        }

        const beforeLabel = `${account.username} · ${account.name || ""} · Zone ${[...getAllowedAreaIds(account)].map((areaId) => getArea(areaId)?.code).filter(Boolean).join(", ")}`;
        account.assessorId = assessorId;
        account.name = name;
        account.areaIds = areaIds;
        delete account.scorerId;
        account.username = username;
        account.password = String(formData.get("password") || "");
        delete account.email;
        delete account.senderEmail;
        Promise.all([
          dbRef(`accounts/${account.id}`).set(account),
          logAdminChange({
            subjectLabel: "Tài khoản assessor",
            beforeLabel,
            afterLabel: `${account.username} · ${account.name || ""} · Zone ${[...getAllowedAreaIds(account)].map((areaId) => getArea(areaId)?.code).filter(Boolean).join(", ") || "chưa có"}`,
            changeLabel: `Sửa tài khoản ${account.username}`,
          }),
        ]).then(() => {
          showToast("Đã cập nhật tài khoản.");
          renderAll();
        }).catch(() => showToast("Lỗi khi cập nhật.", true));
        return true;
      },
    });
  }

  function deleteAccount(id) {
    const account = state.accounts.find((item) => item.id === id && item.role !== "admin");
    if (!account) {
      return;
    }

    openConfirmModal({
      title: "Xóa tài khoản",
      message: `Xóa tài khoản ${account.username}?`,
      confirmText: "Xóa",
      danger: true,
      onConfirm() {
        state.accounts = state.accounts.filter((item) => item.id !== id);
        Promise.all([
          dbRef(`accounts/${id}`).remove(),
          logAdminChange({
            subjectLabel: "Tài khoản assessor",
            beforeLabel: `${account.username} · ${account.name || ""}`,
            afterLabel: "Đã xóa",
            changeLabel: `Xóa tài khoản ${account.username}`,
          }),
        ]).then(() => showToast("Đã xóa tài khoản.")).catch(() => showToast("Lỗi khi xóa.", true));
      },
    });
  }

  function managerOptions(selectedId) {
    return getManagers()
      .map((manager) => `<option value="${escapeHtml(manager.id)}" ${manager.id === selectedId ? "selected" : ""}>${escapeHtml(manager.name)}</option>`)
      .join("");
  }

  function assessorOptions(selectedId, includeBlank = true) {
    const options = getAssessors()
      .map((assessor) => `<option value="${escapeHtml(assessor.id)}" ${assessor.id === selectedId ? "selected" : ""}>${escapeHtml(assessor.name)}</option>`)
      .join("");
    return `${includeBlank ? '<option value="">Chọn assessor</option>' : ""}${options}`;
  }

  async function activatePeriod(id) {
    if (!state.periods.some((period) => period.id === id)) {
      return;
    }

    try {
      await ensurePeriodSnapshot(id);
      state.activePeriodId = id;
      await saveMeta();
      showToast("Đã đổi kỳ đánh giá.");
      renderAll();
    } catch (error) {
      console.error(error);
      showToast("Lỗi khi lưu kỳ đánh giá.", true);
    }
  }

  function deletePeriod(id) {
    const period = getPeriod(id);
    if (!period) {
      return;
    }

    if (state.periods.length <= 1) {
      showToast("Cần giữ lại ít nhất một kỳ đánh giá.", true);
      return;
    }

    openConfirmModal({
      title: "Xóa kỳ đánh giá",
      message: `Xóa ${periodLabel(period)} trên Firebase?`,
      confirmText: "Xóa",
      danger: true,
      onConfirm() {
        const removedScores = state.scores.filter((score) => score.periodId === id);
        state.periods = state.periods.filter((item) => item.id !== id);
        state.scores = state.scores.filter((score) => score.periodId !== id);
        if (state.activePeriodId === id) {
          state.activePeriodId = getPeriods()[0]?.id || "";
        }
        const writes = [
          dbRef(`periods/${id}`).remove(),
          ...removedScores.map((s) => dbRef(`scores/${s.id}`).remove()),
          saveMeta(),
          logAdminChange({
            subjectLabel: "Kỳ đánh giá",
            beforeLabel: periodLabel(period),
            afterLabel: "Đã xóa",
            changeLabel: `Xóa kỳ ${periodLabel(period)}`,
            note: "Điểm của kỳ đã bị xóa khỏi Firebase",
          }),
        ];
        Promise.all(writes).then(() => showToast("Đã xóa kỳ đánh giá.")).catch(() => showToast("Lỗi khi xóa.", true));
      },
    });
  }

  function archivePeriod(id) {
    const period = state.periods.find((item) => item.id === id);
    if (!period) {
      return;
    }

    if (period.archived) {
      showToast(`${periodLabel(period)} đã được lưu trữ.`);
      return;
    }

    openConfirmModal({
      title: "Lưu trữ kỳ đánh giá",
      message: `Lưu trữ ${periodLabel(period)}? Sau khi lưu trữ, web chỉ cho xem và xuất Excel, không cho sửa điểm hoặc bảng ĐG an toàn của kỳ này.`,
      confirmText: "Lưu trữ",
      onConfirm: async () => {
        await ensurePeriodSnapshot(id);
        period.archived = true;
        period.archivedAt = new Date().toISOString();
        await Promise.all([
          dbRef(`periods/${period.id}`).set(period),
          logAdminChange({
            subjectLabel: "Kỳ đánh giá",
            beforeLabel: periodLabel(period),
            afterLabel: `${periodLabel(period)} · Đã lưu trữ`,
            changeLabel: `Lưu trữ kỳ ${periodLabel(period)}`,
            note: "Khóa sửa trên web, vẫn cho xem và xuất Excel",
          }),
        ]);
        showToast("Đã lưu trữ kỳ đánh giá.");
        renderAll();
      },
    });
  }

  function unarchivePeriod(id) {
    const period = state.periods.find((item) => item.id === id);
    if (!period) {
      return;
    }

    if (!period.archived) {
      showToast(`${periodLabel(period)} chưa lưu trữ.`);
      return;
    }

    openConfirmModal({
      title: "Bỏ lưu trữ kỳ đánh giá",
      message: `Bỏ lưu trữ ${periodLabel(period)}? Sau khi mở khóa, admin có thể sửa trực tiếp dữ liệu của kỳ này trên web.`,
      confirmText: "Bỏ lưu trữ",
      onConfirm: async () => {
        period.archived = false;
        delete period.archivedAt;
        await Promise.all([
          dbRef(`periods/${period.id}`).set(period),
          logAdminChange({
            subjectLabel: "Kỳ đánh giá",
            beforeLabel: `${periodLabel(period)} · Đã lưu trữ`,
            afterLabel: `${periodLabel(period)} · Bỏ lưu trữ`,
            changeLabel: `Bỏ lưu trữ kỳ ${periodLabel(period)}`,
            note: "Mở lại quyền sửa trên web",
          }),
        ]);
        showToast("Đã bỏ lưu trữ kỳ đánh giá.");
        renderAll();
      },
    });
  }

  async function openArchivedPeriod(id) {
    const period = state.periods.find((item) => item.id === id);
    if (!period) {
      return;
    }

    await activatePeriod(id);
    setActiveTab("summary");
  }

  function toggleIssueStatus(scoreId) {
    const score = state.scores.find((item) => item.id === scoreId);
    if (!score) {
      return;
    }

    if (blockIfArchivedPeriod(score.periodId)) {
      return;
    }

    score.issueStatus = isIssueOpen(score) ? "closed" : "open";
    score.updatedAt = new Date().toISOString();
    saveScore(score)
      .then(() => {
        showToast(score.issueStatus === "closed" ? "Đã đóng vấn đề." : "Đã mở lại vấn đề.");
        renderAll();
      })
      .catch(() => showToast("Lỗi khi cập nhật trạng thái.", true));
  }

  function editSafetyMeta() {
    const period = getPeriod(state.activePeriodId);
    const periodId = period?.id || "";
    if (blockIfArchivedPeriod(periodId)) {
      return;
    }

    ensurePeriodSnapshotLocal(periodId);
    const report = getSafetyReportForPeriod(periodId);
    const isSnapshotEdit = shouldEditPeriodSnapshot(periodId);
    openFormModal({
      title: "Thiết lập báo cáo đánh giá an toàn",
      submitText: "Lưu thiết lập",
      html: `
        ${isSnapshotEdit ? `<div class="modal-context"><span>Đang sửa riêng cho ${escapeHtml(periodLabel(period))}; danh mục/kỳ mới nhất không bị đổi.</span></div>` : ""}
        <label>
          <span>Người thực hiện</span>
          <input name="performer" type="text" value="${escapeHtml(report.performer)}">
        </label>
        <label>
          <span>Chức danh người thực hiện</span>
          <input name="performerTitle" type="text" value="${escapeHtml(report.performerTitle || "")}">
        </label>
        <label>
          <span>Người kiểm tra</span>
          <input name="checker" type="text" value="${escapeHtml(report.checker)}">
        </label>
        <label>
          <span>Chức danh người kiểm tra</span>
          <input name="checkerTitle" type="text" value="${escapeHtml(report.checkerTitle || "")}">
        </label>
        <label>
          <span>Bộ phận người thực hiện</span>
          <input name="department" type="text" value="${escapeHtml(report.department)}">
        </label>
        <label>
          <span>Bộ phận người kiểm tra</span>
          <input name="checkerDepartment" type="text" value="${escapeHtml(report.checkerDepartment || "")}">
        </label>
        <label>
          <span>Dòng hướng dẫn</span>
          <input name="instruction" type="text" value="${escapeHtml(report.instruction)}">
        </label>
        <div class="form-grid">
          <label>
            <span>Issue Date</span>
            <input name="issueDate" type="date" value="${escapeHtml(getReportDateValue(report, period, "issueDate"))}">
          </label>
          <label>
            <span>Report date</span>
            <input name="reportDate" type="date" value="${escapeHtml(getReportDateValue(report, period, "reportDate"))}">
          </label>
        </div>
      `,
      async onSubmit(formData) {
        const beforeLabel = `${report.performer} · ${report.checker} · ${report.department}`;
        const nextReport = {
          performer: String(formData.get("performer") || "").trim() || DEFAULT_SAFETY_REPORT.performer,
          performerTitle: String(formData.get("performerTitle") || "").trim(),
          checker: String(formData.get("checker") || "").trim() || DEFAULT_SAFETY_REPORT.checker,
          department: String(formData.get("department") || "").trim() || DEFAULT_SAFETY_REPORT.department,
          checkerTitle: String(formData.get("checkerTitle") || "").trim(),
          checkerDepartment: String(formData.get("checkerDepartment") || "").trim(),
          instruction: String(formData.get("instruction") || "").trim() || DEFAULT_SAFETY_REPORT.instruction,
          issueDate: String(formData.get("issueDate") || "").trim(),
          reportDate: String(formData.get("reportDate") || "").trim(),
        };
        if (isSnapshotEdit) {
          const targetPeriod = getPeriod(periodId);
          const snapshot = ensurePeriodSnapshotLocal(periodId);
          snapshot.safetyReport = nextReport;
          await savePeriodSnapshot(targetPeriod);
        } else {
          state.safetyReport = nextReport;
          await Promise.all([
            saveSafetyReport(),
            refreshLatestPeriodSnapshot(),
          ]);
        }
        await Promise.all([
          logAdminChange({
            subjectLabel: "Thiết lập ĐG AT",
            beforeLabel,
            afterLabel: `${nextReport.performer} · ${nextReport.checker} · ${nextReport.department}`,
            changeLabel: "Sửa thiết lập báo cáo ĐG AT",
            note: isSnapshotEdit ? `Chỉ áp dụng cho ${periodLabel(period)}` : "Áp dụng cho kỳ mới nhất/danh mục hiện tại",
          }),
        ]);
        showToast("Đã lưu thiết lập báo cáo.");
        renderAll();
        return true;
      },
    });
  }

  function editSafetyRecord(scoreId) {
    const score = state.scores.find((item) => item.id === scoreId);
    if (!score) {
      return;
    }

    if (blockIfArchivedPeriod(score.periodId)) {
      return;
    }

    const area = getAreaForPeriod(score.periodId, score.areaId);
    const item = getItem(score.itemId);
    if (!area || !item) {
      showToast("Không tìm thấy dữ liệu gốc của vấn đề.", true);
      return;
    }

    const row = { score, area, item };
    const photoPreview = score.photoDataUrl
      ? `<div class="photo-preview">
          <img src="${score.photoDataUrl}" alt="Ảnh minh họa hiện tại">
          <label class="check-line">
            <input name="removePhoto" type="checkbox">
            <span>Xóa ảnh hiện tại</span>
          </label>
        </div>`
      : "";
    const afterPhotoPreview = score.afterPhotoDataUrl
      ? `<div class="photo-preview">
          <img src="${score.afterPhotoDataUrl}" alt="Ảnh sau cải tiến hiện tại">
          <label class="check-line">
            <input name="removeAfterPhoto" type="checkbox">
            <span>Xóa ảnh sau cải tiến hiện tại</span>
          </label>
        </div>`
      : "";

    openFormModal({
      title: "Sửa báo cáo đánh giá an toàn",
      submitText: "Lưu báo cáo",
      html: `
        <div class="modal-context">
          <span><strong>Zone gốc:</strong> ${escapeHtml(area.code)} · ${escapeHtml(getAreaResponsibleNameForPeriod(score.periodId, area))}</span>
          <span><strong>Ô chấm gốc:</strong> ${escapeHtml(getIssueItemLabel(row))}</span>
        </div>
        <label>
          <span>Vị trí</span>
          <input name="issueLocation" type="text" value="${escapeHtml(getIssueLocation(row))}" required>
        </label>
        <div class="form-grid">
          <label>
            <span>Ngày</span>
            <input name="issueDay" type="number" min="1" max="31" value="${escapeHtml(getIssueDay(row))}">
          </label>
          <label>
            <span>Tháng</span>
            <input name="issueMonth" type="number" min="1" max="12" value="${escapeHtml(getIssueMonth(row, score.periodId))}">
          </label>
        </div>
        <label>
          <span>Mối nguy hiểm phát hiện được</span>
          <textarea name="note" required>${escapeHtml(score.note || getIssueDescription(row))}</textarea>
        </label>
        <label>
          <span>Ảnh minh họa</span>
          <input name="photo" type="file" accept="image/*">
        </label>
        ${photoPreview}
        <div class="form-grid">
          <label>
            <span>Số lần phát hiện</span>
            <input name="issueCount" type="number" min="1" step="1" value="${escapeHtml(getIssueCount(row))}">
          </label>
          <label>
            <span>Phân loại STOP 6</span>
            <select name="issueType">${optionHtml(STOP6_OPTIONS, score.issueType || "")}</select>
          </label>
          <label>
            <span>Cấp bậc</span>
            <select name="issueLevel">${optionHtml(ISSUE_LEVEL_OPTIONS, score.issueLevel || "")}</select>
          </label>
          <label>
            <span>Phát hiện</span>
            <select name="foundChannel">${optionHtml(SAFETY_FOUND_OPTIONS, score.foundChannel || (getIssueFoundBy(row) ? "member" : ""))}</select>
          </label>
          <label>
            <span>Tình trạng</span>
            <select name="issueStatus">
              <option value="open" ${isIssueOpen(score) ? "selected" : ""}>Đang gặp phải</option>
              <option value="closed" ${!isIssueOpen(score) ? "selected" : ""}>Đã xử lý</option>
            </select>
          </label>
        </div>
        <label>
          <span>Phát hiện bởi</span>
          <input name="issueFoundBy" type="text" value="${escapeHtml(getIssueFoundBy(row))}">
        </label>
        <label>
          <span>Hạng mục hiển thị</span>
          <input name="issueItemLabel" type="text" value="${escapeHtml(getIssueItemLabel(row))}">
        </label>
        <label>
          <span>Nội dung cải tiến, xử lý</span>
          <textarea name="improvementContent" placeholder="Nhập nội dung xử lý/cải tiến">${escapeHtml(score.improvementContent || "")}</textarea>
        </label>
        <label>
          <span>Ảnh sau cải tiến, xử lý</span>
          <input name="afterPhoto" type="file" accept="image/*">
        </label>
        ${afterPhotoPreview}
        <div class="form-grid">
          <label>
            <span>Đảm nhiệm</span>
            <input name="actionOwner" type="text" value="${escapeHtml(score.actionOwner || "")}">
          </label>
          <label>
            <span>Kế hoạch</span>
            <input name="actionPlan" type="text" value="${escapeHtml(score.actionPlan || "")}">
          </label>
          <label>
            <span>Ngày hoàn thành</span>
            <input name="completionDate" type="date" value="${escapeHtml(toIsoDate(score.completionDate))}">
          </label>
          <label>
            <span>Xác nhận theo cấp độ</span>
            <input name="completionLevelConfirm" type="text" value="${escapeHtml(score.completionLevelConfirm || "")}">
          </label>
        </div>
      `,
      async onSubmit(formData, form) {
        const issueCountInput = String(formData.get("issueCount") || "").trim();
        const issueCount = normalizeIssueCount(issueCountInput);
        if (issueCountInput && issueCount === "") {
          showToast("Số lần phát hiện không hợp lệ.", true);
          return false;
        }

        const note = String(formData.get("note") || "").trim();
        if (!note) {
          showToast("Vui lòng nhập nội dung vấn đề.", true);
          return false;
        }

        const beforeLabel = `${getIssueLocation(row)} · ${score.note || ""}`;
        const photoInput = form.elements.photo;
        const afterPhotoInput = form.elements.afterPhoto;
        const nextPhoto = await prepareScorePhoto(photoInput?.files?.[0], score, formData.get("removePhoto") === "on");
        const nextAfterPhoto = await prepareScorePhoto(
          afterPhotoInput?.files?.[0],
          { photoDataUrl: score.afterPhotoDataUrl, photoName: score.afterPhotoName },
          formData.get("removeAfterPhoto") === "on",
        );
        score.issueLocation = String(formData.get("issueLocation") || "").trim();
        score.issueDay = String(formData.get("issueDay") || "").trim();
        score.issueMonth = String(formData.get("issueMonth") || "").trim();
        score.note = note;
        score.photoDataUrl = nextPhoto.photoDataUrl;
        score.photoName = nextPhoto.photoName;
        score.issueCount = issueCount;
        score.issueType = String(formData.get("issueType") || "");
        score.issueLevel = String(formData.get("issueLevel") || "");
        score.issueStatus = String(formData.get("issueStatus") || "open") === "closed" ? "closed" : "open";
        score.issueFoundBy = String(formData.get("issueFoundBy") || "").trim();
        score.issueItemLabel = String(formData.get("issueItemLabel") || "").trim();
        score.foundChannel = String(formData.get("foundChannel") || "");
        score.improvementContent = String(formData.get("improvementContent") || "").trim();
        score.afterPhotoDataUrl = nextAfterPhoto.photoDataUrl;
        score.afterPhotoName = nextAfterPhoto.photoName;
        score.actionOwner = String(formData.get("actionOwner") || "").trim();
        score.actionPlan = String(formData.get("actionPlan") || "").trim();
        score.completionDate = String(formData.get("completionDate") || "").trim();
        score.completionLevelConfirm = String(formData.get("completionLevelConfirm") || "").trim();
        score.completionStop6Confirm = "";
        score.updatedAt = new Date().toISOString();

        await Promise.all([
          saveScore(score),
          logAdminChange({
            subjectLabel: "Đánh giá an toàn",
            areaCode: area.code,
            beforeLabel,
            afterLabel: `${getIssueLocation(row)} · ${score.note}`,
            changeLabel: `Sửa báo cáo AT Zone ${area.code}`,
          }),
        ]);
        showToast("Đã cập nhật báo cáo an toàn.");
        renderAll();
        return true;
      },
    });
  }

  function exportExcel(periodId) {
    const period = getPeriod(periodId);
    const bytes = buildXlsxWorkbook(periodId);
    const safeName = `bang-diem-5s-thang-${period?.month || "x"}-${period?.year || "x"}.xlsx`;
    downloadFile(safeName, bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  async function exportSafetyExcel(periodId, options = {}) {
    const period = getPeriod(periodId);
    const areaId = Object.prototype.hasOwnProperty.call(options, "areaId")
      ? options.areaId
      : elements.safetyAreaFilter?.value || "";
    const rows = getIssueRecords(periodId, { areaId });
    const logoImage = await loadWorkbookImage("images/Logo.jpg", "legroup-logo.jpg", 1, 1, 3, 2);
    const bytes = buildSafetyXlsxWorkbook(periodId, rows, logoImage);
    const safeName = `danh-gia-an-toan-thang-${period?.month || "x"}-${period?.year || "x"}.xlsx`;
    downloadFile(safeName, bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  function openSendSafetyMailModal(periodId, options = {}) {
    const areaId = Object.prototype.hasOwnProperty.call(options, "areaId")
      ? options.areaId
      : elements.safetyAreaFilter?.value || "";
    const rows = getIssueRecords(periodId, { areaId }).filter((row) => isIssueOpen(row.score));
    const { recipients, missingAreaCodes } = collectSafetyRecipients(rows, periodId);
    const recipientEmails = recipients.map((recipient) => recipient.email).join(", ");
    const issueAreaCodes = [...new Set(rows.map((row) => row.area?.code).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "vi"));
    if (!rows.length) {
      showToast("Không có vấn đề đang gặp phải để thống kê email.", true);
      return;
    }

    openFormModal({
      title: "Email người phụ trách zone có vấn đề",
      submitText: "Copy toàn bộ email",
      html: `
        <div class="modal-context">
          <span><strong>${recipients.length}</strong> email phụ trách · <strong>${issueAreaCodes.length}</strong> zone · <strong>${rows.length}</strong> vấn đề đang gặp phải.</span>
          <span>Dữ liệu lấy từ email trong hồ sơ người phụ trách zone ở Danh mục.</span>
          ${missingAreaCodes.length ? `<span class="missing-email-note">Zone chưa có email: ${escapeHtml(missingAreaCodes.join(", "))}</span>` : ""}
        </div>
        <label class="email-copy-field">
          <span>Dãy email để dán vào Gmail</span>
          <textarea id="safety-recipient-emails" readonly>${escapeHtml(recipientEmails)}</textarea>
          <small>Copy toàn bộ rồi dán vào ô Người nhận, Cc hoặc Bcc trong Gmail.</small>
        </label>
        <div class="recipient-list email-recipient-list">
          ${recipients
            .map((recipient) => `<div class="recipient-card">
              <strong>${escapeHtml(recipient.email)}</strong>
              <span>Zone ${escapeHtml(recipient.areaCodes.join(", "))} · ${recipient.issueCount} vấn đề</span>
            </div>`)
            .join("") || '<div class="recipient-card muted-card">Chưa có email phụ trách cho các zone đang có vấn đề.</div>'}
        </div>
      `,
      async onSubmit() {
        await copyTextToClipboard(recipientEmails, "Đã copy toàn bộ email để dán vào Gmail.");
        return false;
      },
    });
  }

  function collectSafetyRecipients(rows, periodId) {
    const byEmail = new Map();
    const missingAreaCodes = new Set();
    rows.forEach((row) => {
      const emails = getAreaResponsibleEmailsForPeriod(periodId, row.area);
      if (!emails.length) {
        missingAreaCodes.add(row.area?.code || getIssueLocation(row));
      }

      emails.forEach((email) => {
        const key = email.toLocaleLowerCase();
        if (!byEmail.has(key)) {
          byEmail.set(key, { email, areaCodes: new Set(), issueCount: 0 });
        }
        const recipient = byEmail.get(key);
        if (row.area?.code) {
          recipient.areaCodes.add(row.area.code);
        }
        recipient.issueCount += 1;
      });
    });

    return {
      recipients: [...byEmail.values()]
        .map((recipient) => ({
          ...recipient,
          areaCodes: [...recipient.areaCodes].sort((a, b) => a.localeCompare(b, "vi")),
        }))
        .sort((a, b) => a.email.localeCompare(b.email)),
      missingAreaCodes: [...missingAreaCodes].sort((a, b) => a.localeCompare(b, "vi")),
    };
  }

  function buildSafetyXlsxWorkbook(periodId, issueRows, logoImage = null) {
    const images = [];
    if (logoImage) {
      images.push(logoImage);
    }
    issueRows.forEach((row, index) => {
      const rowNumber = 9 + index;
      const beforeImage = dataUrlToImage(row.score.photoDataUrl, images.length + 1, rowNumber, 6);
      if (beforeImage) {
        images.push(beforeImage);
      }
      const afterImage = dataUrlToImage(row.score.afterPhotoDataUrl, images.length + 1, rowNumber, 22);
      if (afterImage) {
        images.push(afterImage);
      }
    });
    const model = buildSafetyWorksheetModel(periodId, issueRows);
    const files = {
      "[Content_Types].xml": buildSafetyContentTypesXml(images),
      "_rels/.rels": buildRootRelationshipsXml(),
      "xl/workbook.xml": buildWorkbookXml("Đánh giá an toàn"),
      "xl/_rels/workbook.xml.rels": buildWorkbookRelationshipsXml(),
      "xl/styles.xml": buildXlsxStylesXml(),
      "xl/worksheets/sheet1.xml": buildSafetyWorksheetXml(model, images.length > 0),
    };

    if (images.length) {
      files["xl/worksheets/_rels/sheet1.xml.rels"] = buildSafetyWorksheetRelationshipsXml();
      files["xl/drawings/drawing1.xml"] = buildSafetyDrawingXml(images);
      files["xl/drawings/_rels/drawing1.xml.rels"] = buildSafetyDrawingRelationshipsXml(images);
      images.forEach((image) => {
        files[`xl/media/${image.name}`] = image.bytes;
      });
    }

    return zipFiles(files);
  }

  function buildSafetyWorksheetModel(periodId, issueRows) {
    const period = getPeriod(periodId);
    const report = getSafetyReportForPeriod(periodId);
    const issueDate = formatDateDisplay(getReportDateValue(report, period, "issueDate"));
    const reportDate = formatDateDisplay(getReportDateValue(report, period, "reportDate"));
    const rows = new Map();
    const rowHeights = new Map();
    const merges = [];
    const maxColumn = 27;

    function addCell(row, column, value, style, options = {}) {
      if (!rows.has(row)) {
        rows.set(row, []);
      }
      rows.get(row).push({ row, column, value, style, ...options });
    }

    function merge(rowStart, columnStart, rowEnd, columnEnd) {
      merges.push(`${cellRef(rowStart, columnStart)}:${cellRef(rowEnd, columnEnd)}`);
    }

    rowHeights.set(1, 34);
    rowHeights.set(2, 22);
    rowHeights.set(3, 20);
    rowHeights.set(4, 20);
    rowHeights.set(5, 20);
    rowHeights.set(6, 36);
    rowHeights.set(7, 32);
    rowHeights.set(8, 70);

    addCell(1, 1, "LeGroup", 2);
    merge(1, 1, 2, 3);
    addCell(1, 4, "BẢNG THEO DÕI NHẬN DẠNG NGUY HIỂM VÀ KHẮC PHỤC\nHAZARD IDENTIFICATION & ACTIVITY FOLLOW UP SHEET", 1);
    merge(1, 4, 2, 21);
    addCell(1, 22, "Issue Date", 13);
    merge(1, 22, 1, 24);
    addCell(1, 25, issueDate, 14);
    merge(1, 25, 1, 27);
    addCell(2, 22, "Report date", 13);
    merge(2, 22, 2, 24);
    addCell(2, 25, reportDate, 14);
    merge(2, 25, 2, 27);

    addCell(3, 1, `Người Thực Hiện: ${report.performer}`, 13);
    merge(3, 1, 3, 6);
    addCell(3, 7, "Người Kiểm Tra:", 13);
    merge(3, 7, 3, 11);
    addCell(3, 12, report.checker, 13);
    merge(3, 12, 3, 27);
    addCell(4, 1, `Chức Danh: ${report.performerTitle || ""}`, 13);
    merge(4, 1, 4, 6);
    addCell(4, 7, `Chức Danh: ${report.checkerTitle || ""}`, 13);
    merge(4, 7, 4, 11);
    merge(4, 12, 4, 27);
    addCell(5, 1, `Bộ Phận: ${report.department || ""}`, 13);
    merge(5, 1, 5, 6);
    addCell(5, 7, `Bộ Phận: ${report.checkerDepartment || ""}`, 13);
    merge(5, 7, 5, 11);
    merge(5, 12, 5, 27);

    [
      [1, "No"],
      [2, "Vị trí"],
      [3, "Ngày"],
      [4, "Tháng"],
      [5, "Mối nguy hiểm phát hiện được ."],
      [6, "Hình Ảnh Minh Họa"],
      [7, "Số lần phát hiện"],
      [21, "Nội dung cải tiến, xử lý"],
      [22, "Hình ảnh sau cải tiến, xử lý"],
      [23, "Đảm nhiệm"],
      [24, "Kế hoạch"],
    ].forEach(([column, label]) => {
      addCell(6, column, label, 2);
      merge(6, column, 8, column);
    });

    addCell(6, 8, report.instruction || DEFAULT_SAFETY_REPORT.instruction, 2);
    merge(6, 8, 6, 20);
    addCell(6, 25, "Hoàn thành", 2);
    merge(6, 25, 6, 27);
    addCell(7, 8, "Phân loại STOP 6", 2);
    merge(7, 8, 7, 14);
    addCell(7, 15, "Cấp bậc", 2);
    merge(7, 15, 7, 17);
    addCell(7, 18, "Phát hiện", 2);
    merge(7, 18, 7, 20);
    addCell(7, 25, "Ngày", 2);
    merge(7, 25, 8, 25);
    addCell(7, 26, "Xác nhận theo cấp độ", 2);
    merge(7, 26, 8, 26);
    addCell(7, 27, "Xác nhận theo loại stop 6", 2);
    merge(7, 27, 8, 27);
    SAFETY_STOP6_COLUMNS.forEach((column, index) => addCell(8, 8 + index, column.label, 26));
    SAFETY_LEVEL_COLUMNS.forEach((column, index) => addCell(8, 15 + index, column.label, 26));
    SAFETY_FOUND_COLUMNS.forEach((column, index) => addCell(8, 18 + index, column.label, 26));

    issueRows.forEach((row, index) => {
      const rowNumber = 9 + index;
      rowHeights.set(rowNumber, row.score.photoDataUrl || row.score.afterPhotoDataUrl ? 92 : 44);
      addCell(rowNumber, 1, index + 1, 14);
      addCell(rowNumber, 2, getIssueLocation(row), 24);
      addCell(rowNumber, 3, getIssueDay(row), 14);
      addCell(rowNumber, 4, getIssueMonth(row, periodId), 14);
      addCell(rowNumber, 5, row.score.note || getIssueDescription(row), 24);
      addCell(rowNumber, 6, "", 24);
      addCell(rowNumber, 7, getIssueCount(row), 14);
      SAFETY_STOP6_COLUMNS.forEach((column, columnIndex) => {
        const selected = isSafetyStop6Selected(row.score, column.value);
        addCell(rowNumber, 8 + columnIndex, selected ? 1 : "", selected ? 27 : 14);
      });
      SAFETY_LEVEL_COLUMNS.forEach((column, columnIndex) => {
        const selected = isSafetyLevelSelected(row.score, column.value);
        addCell(rowNumber, 15 + columnIndex, selected ? 1 : "", selected ? 27 : 14);
      });
      SAFETY_FOUND_COLUMNS.forEach((column, columnIndex) => {
        const selected = isSafetyFoundSelected(row.score, column.value);
        addCell(rowNumber, 18 + columnIndex, selected ? getIssueFoundBy(row) || 1 : "", selected ? 24 : 14);
      });
      addCell(rowNumber, 21, row.score.improvementContent || "", 24);
      addCell(rowNumber, 22, "", 24);
      addCell(rowNumber, 23, row.score.actionOwner || "", 24);
      addCell(rowNumber, 24, row.score.actionPlan || "", 24);
      addCell(rowNumber, 25, getCompletionDateDisplay(row.score), 14);
      addCell(rowNumber, 26, row.score.completionLevelConfirm || "", 24);
      addCell(rowNumber, 27, "", 24);
    });

    return {
      rows,
      rowHeights,
      merges,
      maxColumn,
      maxRow: Math.max(9, 8 + issueRows.length),
    };
  }

  function buildSafetyWorksheetXml(model, hasImages) {
    const sortedRows = [...model.rows.entries()].sort((a, b) => a[0] - b[0]);
    const rowXml = sortedRows
      .map(([rowNumber, cells]) => {
        const height = model.rowHeights.get(rowNumber);
        const heightAttrs = height ? ` ht="${height}" customHeight="1"` : "";
        const cellsXml = cells
          .sort((a, b) => a.column - b.column)
          .map((cell) => buildCellXml(cell))
          .join("");
        return `<row r="${rowNumber}"${heightAttrs}>${cellsXml}</row>`;
      })
      .join("");
    const mergeXml = model.merges.length
      ? `<mergeCells count="${model.merges.length}">${model.merges.map((ref) => `<mergeCell ref="${ref}"/>`).join("")}</mergeCells>`
      : "";
    const drawingXml = hasImages ? '<drawing r:id="rId1"/>' : "";

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:${excelColumnName(model.maxColumn)}${model.maxRow}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="5" customWidth="1"/>
    <col min="2" max="2" width="14" customWidth="1"/>
    <col min="3" max="4" width="7" customWidth="1"/>
    <col min="5" max="5" width="34" customWidth="1"/>
    <col min="6" max="6" width="24" customWidth="1"/>
    <col min="7" max="7" width="9" customWidth="1"/>
    <col min="8" max="20" width="4.2" customWidth="1"/>
    <col min="21" max="21" width="28" customWidth="1"/>
    <col min="22" max="22" width="24" customWidth="1"/>
    <col min="23" max="24" width="13" customWidth="1"/>
    <col min="25" max="25" width="11" customWidth="1"/>
    <col min="26" max="27" width="18" customWidth="1"/>
  </cols>
  <sheetData>${rowXml}</sheetData>
  ${mergeXml}
  <pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>
  ${drawingXml}
</worksheet>`;
  }

  function dataUrlToImage(dataUrl, index, rowNumber, columnNumber = 6) {
    const match = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(dataUrl || "");
    if (!match) {
      return null;
    }

    const extension = match[1].toLowerCase().startsWith("jp") ? "jpg" : "png";
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return {
      name: `image${index}.${extension}`,
      bytes,
      rowNumber,
      columnNumber,
      extension,
    };
  }

  async function loadWorkbookImage(src, name, rowNumber, columnNumber, toColumnNumber, toRowNumber) {
    try {
      const response = await fetch(src);
      if (!response.ok) {
        return null;
      }

      const bytes = new Uint8Array(await response.arrayBuffer());
      const extension = String(name).split(".").pop()?.toLowerCase() || "jpg";
      return { name, bytes, rowNumber, columnNumber, toColumnNumber, toRowNumber, extension };
    } catch (error) {
      console.warn("Không nhúng được logo vào Excel:", error);
      return null;
    }
  }

  function buildSafetyContentTypesXml(images) {
    const imageDefaults = [...new Set(images.map((image) => image.extension))]
      .map((extension) => `<Default Extension="${extension}" ContentType="image/${extension === "jpg" ? "jpeg" : extension}"/>`)
      .join("");
    const drawingOverride = images.length
      ? '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>'
      : "";

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${imageDefaults}
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${drawingOverride}
</Types>`;
  }

  function buildSafetyWorksheetRelationshipsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`;
  }

  function buildSafetyDrawingXml(images) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  ${images.map((image, index) => buildSafetyImageAnchorXml(image, index + 1)).join("")}
</xdr:wsDr>`;
  }

  function buildSafetyImageAnchorXml(image, index) {
    const row = image.rowNumber - 1;
    const column = image.columnNumber - 1;
    const toColumn = Number.isFinite(image.toColumnNumber) ? image.toColumnNumber : column + 1;
    const toRow = Number.isFinite(image.toRowNumber) ? image.toRowNumber : row;
    const toColumnOffset = Number.isFinite(image.toColumnNumber) ? 0 : 457200;
    const toRowOffset = Number.isFinite(image.toRowNumber) ? 0 : 914400;
    return `<xdr:twoCellAnchor editAs="oneCell">
  <xdr:from><xdr:col>${column}</xdr:col><xdr:colOff>91440</xdr:colOff><xdr:row>${row}</xdr:row><xdr:rowOff>91440</xdr:rowOff></xdr:from>
  <xdr:to><xdr:col>${toColumn}</xdr:col><xdr:colOff>${toColumnOffset}</xdr:colOff><xdr:row>${toRow}</xdr:row><xdr:rowOff>${toRowOffset}</xdr:rowOff></xdr:to>
  <xdr:pic>
    <xdr:nvPicPr><xdr:cNvPr id="${index}" name="Ảnh minh họa ${index}"/><xdr:cNvPicPr/></xdr:nvPicPr>
    <xdr:blipFill><a:blip r:embed="rId${index}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>
    <xdr:spPr><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr>
  </xdr:pic>
  <xdr:clientData/>
</xdr:twoCellAnchor>`;
  }

  function buildSafetyDrawingRelationshipsXml(images) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${images.map((image, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${image.name}"/>`).join("")}
</Relationships>`;
  }

  function buildXlsxWorkbook(periodId) {
    const model = buildWorksheetModel(periodId);
    const files = {
      "[Content_Types].xml": buildContentTypesXml(),
      "_rels/.rels": buildRootRelationshipsXml(),
      "xl/workbook.xml": buildWorkbookXml(),
      "xl/_rels/workbook.xml.rels": buildWorkbookRelationshipsXml(),
      "xl/styles.xml": buildXlsxStylesXml(),
      "xl/worksheets/sheet1.xml": buildWorksheetXml(model),
    };

    return zipFiles(files);
  }

  function buildWorksheetModel(periodId) {
    const period = getPeriod(periodId);
    const areas = getAreasForPeriod(periodId);
    const rows = new Map();
    const rowHeights = new Map();
    const merges = [];

    function addCell(row, column, value, style, options = {}) {
      if (!rows.has(row)) {
        rows.set(row, []);
      }
      rows.get(row).push({ row, column, value, style, ...options });
    }

    function merge(rowStart, columnStart, rowEnd, columnEnd) {
      merges.push(`${cellRef(rowStart, columnStart)}:${cellRef(rowEnd, columnEnd)}`);
    }

    const lastTableColumn = 4 + areas.length - 1;
    const averageColumn = lastTableColumn + 1;
    const firstScoreRow = 5;
    rowHeights.set(1, 38);
    rowHeights.set(2, 22);
    rowHeights.set(3, 22);
    rowHeights.set(4, 26);

    addCell(1, 1, `Điểm Chi Tiết Theo Từng Hạng Mục BP Tự Đánh giá (${periodLabel(period)})`, 1);
    merge(1, 1, 1, averageColumn);

    addCell(2, 1, "Tiêu Chuẩn Đánh\nGiá", 2);
    merge(2, 1, 3, 2);
    addCell(2, 3, "Zone", 3);
    areas.forEach((area, index) => addCell(2, 4 + index, area.code, area.highlight ? 5 : 4));
    addCell(2, averageColumn, "AVER", 6);
    merge(2, averageColumn, 4, averageColumn);

    addCell(3, 3, "T.Phòng", 3);
    buildGroupedSpans(areas, "departmentHead", false).forEach((group) => {
      const start = 4 + group.startIndex;
      const end = start + group.areas.length - 1;
      addCell(3, start, group.label, 7);
      if (group.areas.length > 1) {
        merge(3, start, 3, end);
      }
    });

    addCell(4, 1, "ITEMS", 8);
    merge(4, 1, 4, 2);
    addCell(4, 3, "Point", 9);
    areas.forEach((area, index) => addCell(4, 4 + index, getAreaResponsibleNameForPeriod(periodId, area), 10));

    let rowNumber = firstScoreRow;
    DEFAULT_ITEMS.forEach((item) => {
      const itemStart = rowNumber;
      const itemEnd = itemStart + item.criteria.length - 1;

      item.criteria.forEach((criterion, index) => {
        if (index === 0) {
          addCell(rowNumber, 1, item.code, 11);
          addCell(rowNumber, 2, item.name, 12);
          if (item.criteria.length > 1) {
            merge(rowNumber, 1, itemEnd, 1);
            merge(rowNumber, 2, itemEnd, 2);
          }
        }

        rowHeights.set(rowNumber, item.criteria.length === 1 ? 21 : 19);
        addCell(rowNumber, 3, item.criteria.length === 1 ? "" : criterion.label, 13);
        areas.forEach((area, areaIndex) => {
          const column = 4 + areaIndex;
          if (isNotApplicable(item.id, criterion.id, area)) {
            addCell(rowNumber, column, "", 16);
            return;
          }

          const record = getScoreRecord(periodId, area.id, item.id, criterion.id);
          const value = Number.isFinite(record?.score) ? record.score : null;
          const style = isScoreCrossed(record) ? 16 : Number.isFinite(value) && value <= 2 ? 15 : 14;
          addCell(rowNumber, column, isScoreCrossed(record) ? "" : value, style);
        });

        addCell(rowNumber, averageColumn, itemAverage(periodId, item, areas), 17);
        if (index === 0 && item.criteria.length > 1) {
          merge(rowNumber, averageColumn, itemEnd, averageColumn);
        }

        rowNumber += 1;
      });
    });

    const totalRow = rowNumber;
    const groupRow = totalRow + 1;
    const groupLabelRow = totalRow + 2;
    const signatureRow = totalRow + 3;
    [totalRow, groupRow, groupLabelRow].forEach((row) => rowHeights.set(row, 26));
    rowHeights.set(signatureRow, 34);

    addCell(totalRow, 1, "TOTAL SCORE:", 18);
    merge(totalRow, 1, groupLabelRow, 3);
    areas.forEach((area, index) => {
      const column = 4 + index;
      addCell(totalRow, column, areaAverage(periodId, area), 19);
    });
    addCell(totalRow, averageColumn, overallAverage(periodId, areas), 23);
    merge(totalRow, averageColumn, groupLabelRow, averageColumn);

    buildGroupedSpans(areas, "summaryGroup", false).forEach((group) => {
      const start = 4 + group.startIndex;
      const end = start + group.areas.length - 1;
      if (group.label && group.areas.length > 1) {
        addCell(groupRow, start, groupAverage(periodId, group.areas), 21);
        merge(groupRow, start, groupRow, end);
        addCell(groupLabelRow, start, group.label, 22);
        merge(groupLabelRow, start, groupLabelRow, end);
      } else {
        addCell(groupRow, start, group.label, 22);
        merge(groupRow, start, groupLabelRow, start);
      }
    });

    addCell(signatureRow, 1, "Người đánh giá", 20);
    merge(signatureRow, 1, signatureRow, 3);
    areas.forEach((area, index) => addCell(signatureRow, 4 + index, getSignatureName(periodId, area), 24));
    addCell(signatureRow, averageColumn, "", 24);

    return {
      rows,
      rowHeights,
      merges,
      period,
      maxColumn: averageColumn,
      maxRow: signatureRow,
      lastTableColumn,
      averageColumn,
    };
  }
  function buildWorksheetXml(model) {
    const sortedRows = [...model.rows.entries()].sort((a, b) => a[0] - b[0]);
    const rowXml = sortedRows
      .map(([rowNumber, cells]) => {
        const height = model.rowHeights.get(rowNumber);
        const heightAttrs = height ? ` ht="${height}" customHeight="1"` : "";
        const cellsXml = cells
          .sort((a, b) => a.column - b.column)
          .map((cell) => buildCellXml(cell))
          .join("");
        return `<row r="${rowNumber}"${heightAttrs}>${cellsXml}</row>`;
      })
      .join("");
    const mergeXml = model.merges.length
      ? `<mergeCells count="${model.merges.length}">${model.merges.map((ref) => `<mergeCell ref="${ref}"/>`).join("")}</mergeCells>`
      : "";

    const hiddenCols = Number.isFinite(model.hiddenSourceStartColumn) && Number.isFinite(model.hiddenSourceEndColumn)
      ? `<col min="${model.hiddenSourceStartColumn}" max="${model.hiddenSourceEndColumn}" width="0" hidden="1" customWidth="1"/>`
      : "";
    const averageCol = Number.isFinite(model.averageColumn) ? `<col min="${model.averageColumn}" max="${model.averageColumn}" width="10.5" customWidth="1"/>` : "";
    const drawingXml = model.drawingRelId ? `<drawing r:id="${escapeXml(model.drawingRelId)}"/>` : "";

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:${excelColumnName(model.maxColumn)}${model.maxRow}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>
    <col min="1" max="1" width="7" customWidth="1"/>
    <col min="2" max="2" width="21" customWidth="1"/>
    <col min="3" max="3" width="12" customWidth="1"/>
    <col min="4" max="${model.lastTableColumn}" width="6.4" customWidth="1"/>
    ${averageCol}
    ${hiddenCols}
  </cols>
  <sheetData>${rowXml}</sheetData>
  ${mergeXml}
  <pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>
  ${drawingXml}
</worksheet>`;
  }

  function buildCellXml(cell) {
    const ref = cellRef(cell.row, cell.column);
    const style = Number.isFinite(cell.style) && cell.style > 0 ? ` s="${cell.style}"` : "";
    const formula = cell.formula ? `<f>${escapeXml(cell.formula)}</f>` : "";

    if (Number.isFinite(cell.value)) {
      return `<c r="${ref}"${style}>${formula}<v>${cell.value}</v></c>`;
    }

    if (cell.formula) {
      return `<c r="${ref}"${style}>${formula}</c>`;
    }

    if (cell.value === null || cell.value === undefined || cell.value === "") {
      return `<c r="${ref}"${style}/>`;
    }

    return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell.value)}</t></is></c>`;
  }

  function buildContentTypesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
  }

  function buildRootRelationshipsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
  }

  function buildWorkbookXml(sheetName = "5S") {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <workbookPr/>
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="28800" windowHeight="17600"/></bookViews>
  <sheets><sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;
  }

  function buildWorkbookRelationshipsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
  }

  function buildWorksheetRelationshipsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`;
  }

  function buildDrawingRelationshipsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart2.xml"/>
</Relationships>`;
  }

  function buildXlsxStylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="2">
    <numFmt numFmtId="164" formatCode="0.0"/>
    <numFmt numFmtId="165" formatCode="0.00"/>
  </numFmts>
  <fonts count="16">
    <font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/></font>
    <font><sz val="12"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="12"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="20"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="16"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="14"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><sz val="18"/><color rgb="FF000000"/><name val="Arial"/><family val="2"/></font>
    <font><sz val="18"/><color rgb="FF000000"/><name val="Arial"/><family val="2"/></font>
    <font><b/><sz val="16"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="14"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="10"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="13"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="15"/><color rgb="FFD00000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="14"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="18"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="24"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
  </fonts>
  <fills count="7">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFF00"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF00B050"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF4B6C2"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFC7CE"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFF0000"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FF111111"/></left>
      <right style="thin"><color rgb="FF111111"/></right>
      <top style="thin"><color rgb="FF111111"/></top>
      <bottom style="thin"><color rgb="FF111111"/></bottom>
      <diagonal/>
    </border>
    <border diagonalUp="1">
      <left style="thin"><color rgb="FF111111"/></left>
      <right style="thin"><color rgb="FF111111"/></right>
      <top style="thin"><color rgb="FF111111"/></top>
      <bottom style="thin"><color rgb="FF111111"/></bottom>
      <diagonal style="thin"><color rgb="FF7A1723"/></diagonal>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="28">
    ${xf(0, 0, 0, 0)}
    ${xf(0, 15, 0, 0, "center", "center", true)}
    ${xf(0, 8, 0, 1, "center", "center", true)}
    ${xf(0, 8, 0, 1, "center", "center", false)}
    ${xf(0, 2, 0, 1, "center", "center", false)}
    ${xf(0, 2, 2, 1, "center", "center", false)}
    ${xf(0, 4, 0, 1, "center", "center", false)}
    ${xf(0, 9, 0, 1, "center", "center", false)}
    ${xf(0, 3, 0, 1, "center", "center", false)}
    ${xf(0, 3, 0, 1, "center", "center", false)}
    ${xf(0, 10, 0, 1, "center", "center", true)}
    ${xf(0, 11, 0, 1, "center", "center", false)}
    ${xf(0, 5, 0, 1, "center", "center", true)}
    ${xf(0, 5, 0, 1, "left", "center", false)}
    ${xf(0, 9, 0, 1, "center", "center", false)}
    ${xf(0, 12, 5, 1, "center", "center", false)}
    ${xf(0, 9, 4, 2, "center", "center", false)}
    ${xf(164, 4, 0, 1, "center", "center", false)}
    ${xf(0, 6, 3, 1, "center", "center", false)}
    ${xf(165, 13, 0, 1, "center", "center", false)}
    ${xf(0, 7, 0, 1, "center", "center", false)}
    ${xf(165, 14, 0, 1, "center", "center", false)}
    ${xf(0, 13, 0, 1, "center", "center", false)}
    ${xf(164, 3, 2, 1, "center", "center", false)}
    ${xf(0, 1, 0, 1, "center", "center", true)}
    ${xf(0, 1, 0, 1, "center", "center", true)}
    ${xf(0, 10, 0, 1, "center", "center", true, 90)}
    ${xf(0, 2, 6, 1, "center", "center", false)}
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;
  }

  function xf(numFmtId, fontId, fillId, borderId, horizontal = "center", vertical = "center", wrap = false, textRotation = "") {
    const numFmt = numFmtId ? ` numFmtId="${numFmtId}" applyNumberFormat="1"` : ' numFmtId="0"';
    const rotation = textRotation !== "" ? ` textRotation="${textRotation}"` : "";
    return `<xf${numFmt} fontId="${fontId}" fillId="${fillId}" borderId="${borderId}" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="${horizontal}" vertical="${vertical}"${wrap ? ' wrapText="1"' : ""}${rotation}/></xf>`;
  }

  function buildDrawingXml(charts) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  ${charts.map((chart, index) => buildChartAnchorXml(chart, index + 1)).join("")}
</xdr:wsDr>`;
  }

  function buildChartAnchorXml(chart, index) {
    return `<xdr:twoCellAnchor>
  <xdr:from><xdr:col>${chart.from.column - 1}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${chart.from.row - 1}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
  <xdr:to><xdr:col>${chart.to.column}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${chart.to.row}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
  <xdr:graphicFrame macro="">
    <xdr:nvGraphicFramePr><xdr:cNvPr id="${index + 1}" name="Dashboard ${index}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr>
    <xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
    <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart r:id="rId${index}"/></a:graphicData></a:graphic>
  </xdr:graphicFrame>
  <xdr:clientData/>
</xdr:twoCellAnchor>`;
  }

  function buildChartXml(chart, axisBase) {
    const catId = axisBase;
    const valId = axisBase + 1;
    const yMin = Number.isFinite(chart.yMin) ? `<c:min val="${chart.yMin}"/>` : "";
    const yMax = Number.isFinite(chart.yMax) ? `<c:max val="${chart.yMax}"/>` : "";
    const yMajorUnit = Number.isFinite(chart.yMajorUnit) ? `<c:majorUnit val="${chart.yMajorUnit}"/>` : "";
    const yMinorUnit = Number.isFinite(chart.yMinorUnit) ? `<c:minorUnit val="${chart.yMinorUnit}"/>` : "";
    const targetDash = chart.targetLineDash ? '<a:prstDash val="dash"/>' : "";

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:date1904 val="0"/>
  <c:lang val="vi-VN"/>
  <c:roundedCorners val="0"/>
  <c:chart>
    <c:title>${chartTitleXml(chart.title)}</c:title>
    <c:autoTitleDeleted val="0"/>
    <c:plotArea>
      <c:layout/>
      <c:barChart>
        <c:barDir val="col"/>
        <c:grouping val="clustered"/>
        <c:varyColors val="0"/>
        <c:ser>
          <c:idx val="0"/><c:order val="0"/>
          <c:tx><c:v>${escapeXml(chart.seriesName || "Series1")}</c:v></c:tx>
          <c:spPr><a:solidFill><a:srgbClr val="00B0F0"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr>
          <c:cat>${chartStringRefXml(chart.categoryRange, chart.categories)}</c:cat>
          <c:val>${chartNumberRefXml(chart.valueRange, chart.values)}</c:val>
        </c:ser>
        ${chartDataLabelsXml(chart)}
        <c:gapWidth val="${chart.gapWidth || 80}"/>
        <c:overlap val="0"/>
        <c:axId val="${catId}"/>
        <c:axId val="${valId}"/>
      </c:barChart>
      <c:lineChart>
        <c:grouping val="standard"/>
        <c:varyColors val="0"/>
        <c:ser>
          <c:idx val="1"/><c:order val="1"/>
          <c:tx><c:v>${escapeXml(chart.targetName || "Target")}</c:v></c:tx>
          <c:spPr><a:ln w="19050"><a:solidFill><a:srgbClr val="${chart.targetColor || "FF0000"}"/></a:solidFill>${targetDash}</a:ln></c:spPr>
          <c:marker><c:symbol val="none"/></c:marker>
          <c:cat>${chartStringRefXml(chart.categoryRange, chart.categories)}</c:cat>
          <c:val>${chartNumberRefXml(chart.targetRange, chart.targetValues)}</c:val>
        </c:ser>
        <c:axId val="${catId}"/>
        <c:axId val="${valId}"/>
      </c:lineChart>
      <c:catAx>
        <c:axId val="${catId}"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/><c:axPos val="b"/>
        ${chartTextPropertiesXml(800)}
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="${valId}"/><c:crosses val="autoZero"/>
        <c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="${valId}"/>
        <c:scaling><c:orientation val="minMax"/>${yMax}${yMin}</c:scaling>
        <c:delete val="0"/><c:axPos val="l"/>
        <c:majorGridlines><c:spPr><a:ln w="6350"><a:solidFill><a:srgbClr val="D9D9D9"/></a:solidFill></a:ln></c:spPr></c:majorGridlines>
        ${Number.isFinite(chart.yMinorUnit) ? '<c:minorGridlines><c:spPr><a:ln w="3175"><a:solidFill><a:srgbClr val="ECECEC"/></a:solidFill></a:ln></c:spPr></c:minorGridlines>' : ""}
        <c:numFmt formatCode="${chart.axisFormat || "0.00"}" sourceLinked="0"/>
        <c:majorTickMark val="out"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/>
        ${chartTextPropertiesXml(1100)}
        <c:crossAx val="${catId}"/><c:crosses val="autoZero"/><c:crossBetween val="between"/>
        ${yMajorUnit}
        ${yMinorUnit}
      </c:valAx>
      ${chartDataTableXml(chart)}
    </c:plotArea>
    ${chartLegendXml(chart)}
    <c:plotVisOnly val="0"/>
    <c:dispBlanksAs val="gap"/>
    <c:showDLblsOverMax val="0"/>
  </c:chart>
</c:chartSpace>`;
  }

  function chartDataLabelsXml(chart) {
    if (chart.showDataLabels === false) {
      return "";
    }

    const position = chart.dataLabelPosition ? `<c:dLblPos val="${chart.dataLabelPosition}"/>` : "";
    return `<c:dLbls><c:numFmt formatCode="${chart.labelFormat || "0.00"}" sourceLinked="0"/><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>${chartTextPropertiesXml(1000)}${position}<c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>`;
  }

  function chartDataTableXml(chart) {
    if (!chart.showDataTable) {
      return "";
    }

    return `<c:dTable><c:showHorzBorder val="1"/><c:showVertBorder val="1"/><c:showOutline val="1"/><c:showKeys val="1"/>${chartTextPropertiesXml(1000)}</c:dTable>`;
  }

  function chartLegendXml(chart) {
    if (chart.showLegend === false) {
      return "";
    }

    return `<c:legend><c:legendPos val="b"/><c:layout/><c:overlay val="0"/>${chartTextPropertiesXml(1100)}</c:legend>`;
  }

  function chartTextPropertiesXml(size, color = "4D4D4D") {
    return `<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="${size}"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="Arial"/></a:defRPr></a:pPr><a:endParaRPr lang="vi-VN"/></a:p></c:txPr>`;
  }

  function chartTitleXml(title) {
    return `<c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1800"><a:solidFill><a:srgbClr val="595959"/></a:solidFill><a:latin typeface="Arial"/></a:defRPr></a:pPr><a:r><a:rPr lang="vi-VN" sz="1800"><a:solidFill><a:srgbClr val="595959"/></a:solidFill><a:latin typeface="Arial"/></a:rPr><a:t>${escapeXml(title)}</a:t></a:r></a:p></c:rich></c:tx><c:layout/><c:overlay val="0"/>`;
  }

  function chartStringRefXml(range, labels) {
    return `<c:strRef><c:f>${escapeXml(range)}</c:f><c:strCache><c:ptCount val="${labels.length}"/>${labels
      .map((label, index) => `<c:pt idx="${index}"><c:v>${escapeXml(label)}</c:v></c:pt>`)
      .join("")}</c:strCache></c:strRef>`;
  }

  function chartNumberRefXml(range, values) {
    return `<c:numRef><c:f>${escapeXml(range)}</c:f><c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${values.length}"/>${values
      .map((value, index) => (Number.isFinite(value) ? `<c:pt idx="${index}"><c:v>${Number(value).toFixed(4)}</c:v></c:pt>` : ""))
      .join("")}</c:numCache></c:numRef>`;
  }

  function buildGroupedSpans(areas, propertyName, mergeBlankGroups) {
    const groups = [];

    areas.forEach((area, index) => {
      const label = area[propertyName] || "";
      const current = groups[groups.length - 1];
      if (current && current.label === label && (label || mergeBlankGroups)) {
        current.areas.push(area);
      } else {
        groups.push({ label, startIndex: index, areas: [area] });
      }
    });

    return groups;
  }

  function cellRef(row, column) {
    return `${excelColumnName(column)}${row}`;
  }

  function rangeRef(rowStart, columnStart, rowEnd, columnEnd) {
    return `'5S'!$${excelColumnName(columnStart)}$${rowStart}:$${excelColumnName(columnEnd)}$${rowEnd}`;
  }

  function wrapChartCategoryLabel(label, maxLineLength = 10) {
    const words = String(label ?? "")
      .replace(/\s+/g, " ")
      .replace(/\s*\(/g, " (")
      .trim()
      .split(" ")
      .filter(Boolean);
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const nextLine = currentLine ? `${currentLine} ${word}` : word;
      if (currentLine && nextLine.length > maxLineLength) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = nextLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join("\n");
  }

  function escapeXml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function zipFiles(files) {
    const encoder = new TextEncoder();
    const entries = Object.entries(files).map(([name, content]) => ({
      name,
      data: typeof content === "string" ? encoder.encode(content) : content,
    }));
    const parts = [];
    const centralDirectory = [];
    let offset = 0;
    const { date, time } = getDosDateTime(new Date());

    entries.forEach((entry) => {
      const nameBytes = encoder.encode(entry.name);
      const crc = crc32(entry.data);
      const localHeader = concatBytes([
        uint32(0x04034b50),
        uint16(20),
        uint16(0x0800),
        uint16(0),
        uint16(time),
        uint16(date),
        uint32(crc),
        uint32(entry.data.length),
        uint32(entry.data.length),
        uint16(nameBytes.length),
        uint16(0),
        nameBytes,
      ]);

      parts.push(localHeader, entry.data);
      centralDirectory.push(
        concatBytes([
          uint32(0x02014b50),
          uint16(20),
          uint16(20),
          uint16(0x0800),
          uint16(0),
          uint16(time),
          uint16(date),
          uint32(crc),
          uint32(entry.data.length),
          uint32(entry.data.length),
          uint16(nameBytes.length),
          uint16(0),
          uint16(0),
          uint16(0),
          uint16(0),
          uint32(0),
          uint32(offset),
          nameBytes,
        ]),
      );
      offset += localHeader.length + entry.data.length;
    });

    const centralStart = offset;
    centralDirectory.forEach((part) => {
      parts.push(part);
      offset += part.length;
    });
    const centralSize = offset - centralStart;

    parts.push(
      concatBytes([
        uint32(0x06054b50),
        uint16(0),
        uint16(0),
        uint16(entries.length),
        uint16(entries.length),
        uint32(centralSize),
        uint32(centralStart),
        uint16(0),
      ]),
    );

    return concatBytes(parts);
  }

  function getDosDateTime(dateValue) {
    const year = Math.max(1980, dateValue.getFullYear());
    const month = dateValue.getMonth() + 1;
    const day = dateValue.getDate();
    const hours = dateValue.getHours();
    const minutes = dateValue.getMinutes();
    const seconds = Math.floor(dateValue.getSeconds() / 2);
    return {
      date: ((year - 1980) << 9) | (month << 5) | day,
      time: (hours << 11) | (minutes << 5) | seconds,
    };
  }

  function uint16(value) {
    const bytes = new Uint8Array(2);
    const view = new DataView(bytes.buffer);
    view.setUint16(0, value, true);
    return bytes;
  }

  function uint32(value) {
    const bytes = new Uint8Array(4);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, value >>> 0, true);
    return bytes;
  }

  function concatBytes(chunks) {
    const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const output = new Uint8Array(length);
    let offset = 0;
    chunks.forEach((chunk) => {
      output.set(chunk, offset);
      offset += chunk.length;
    });
    return output;
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let index = 0; index < bytes.length; index += 1) {
      crc = CRC32_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  }

  function showToast(message, isError = false) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.toggle("is-error", isError);
    elements.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      elements.toast.classList.remove("is-visible");
    }, 2600);
  }

  async function copyTextToClipboard(text, successMessage = "Đã copy.") {
    if (!String(text || "").trim()) {
      showToast("Không có nội dung để copy.", true);
      return;
    }

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) {
          throw new Error("Copy command failed");
        }
      }

      showToast(successMessage);
    } catch (error) {
      console.error(error);
      const recipientTextarea = document.getElementById("safety-recipient-emails");
      recipientTextarea?.focus();
      recipientTextarea?.select();
      showToast("Không copy tự động được, hãy nhấn Ctrl+C.", true);
    }
  }

  function showProblemZoneEmails() {
    closeAccountMenu();
    openSendSafetyMailModal(state.activePeriodId, { areaId: "" });
  }

  function handleAction(action, id, sourceElement = null) {
    const periodId = sourceElement?.dataset.periodId || "";
    const handlers = {
      "go-home": () => goHome(),
      "activate-period": () => activatePeriod(id),
      "archive-period": () => archivePeriod(id),
      "unarchive-period": () => unarchivePeriod(id),
      "open-archived-period": () => openArchivedPeriod(id).catch((error) => {
        console.error(error);
        showToast("Lỗi khi mở dữ liệu lưu trữ.", true);
      }),
      "export-summary-period": () => exportExcel(id),
      "export-safety-period": () => exportSafetyExcel(id, { areaId: "" }).catch((error) => {
        console.error(error);
        showToast("Lỗi khi xuất file ĐG AT.", true);
      }),
      "delete-period": () => deletePeriod(id),
      "edit-scorer": () => editScorer(id),
      "delete-scorer": () => deleteScorer(id),
      "edit-assessor": () => editAssessor(id),
      "delete-assessor": () => deleteAssessor(id),
      "edit-area": () => editArea(id, periodId),
      "edit-department-head": () => editDepartmentHeadGroup(id || "", periodId),
      "edit-summary-group": () => editSummaryGroup(id || "", periodId),
      "edit-area-responsible": () => editAreaResponsible(id, periodId),
      "edit-area-assessor": () => editAreaAssessor(id, periodId),
      "show-problem-zone-emails": () => showProblemZoneEmails(),
      "delete-area": () => deleteArea(id),
      "edit-account": () => editAccount(id),
      "delete-account": () => deleteAccount(id),
      "edit-safety-record": () => editSafetyRecord(id),
      "toggle-issue-status": () => toggleIssueStatus(id),
      "modal-cancel": () => closeModal(),
    };

    handlers[action]?.();
  }

  function bindEvents() {
    elements.loginForm.addEventListener("submit", handleLogin);
    elements.logoutButton.addEventListener("click", handleLogout);
    elements.accountMenuButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleAccountMenu();
    });

    document.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", () => setActiveTab(button.dataset.tab));
    });

    [elements.assessorPeriodSelect, elements.summaryPeriodSelect, elements.safetyPeriodSelect, elements.issueStatsPeriodSelect].forEach((select) => {
      if (!select) {
        return;
      }
      select.addEventListener("change", () => {
        activatePeriod(select.value);
      });
    });

    elements.assessorAreaSelect?.addEventListener("change", renderAssessorTab);
    elements.safetyAreaFilter?.addEventListener("change", renderSafetyTab);
    elements.exportExcelButton.addEventListener("click", () => exportExcel(state.activePeriodId));
    elements.editSafetyMetaButton?.addEventListener("click", editSafetyMeta);
    elements.exportSafetyExcelButton?.addEventListener("click", () => {
      exportSafetyExcel(state.activePeriodId).catch((error) => {
        console.error(error);
        showToast("Lỗi khi xuất file ĐG AT.", true);
      });
    });
    elements.sendSafetyMailButton?.addEventListener("click", () => openSendSafetyMailModal(state.activePeriodId));

    elements.periodForm.addEventListener("submit", handlePeriodSubmit);
    elements.scorerForm.addEventListener("submit", handleScorerSubmit);
    elements.catalogAssessorForm?.addEventListener("submit", handleAssessorSubmit);
    elements.areaForm.addEventListener("submit", handleAreaSubmit);
    elements.accountForm.addEventListener("submit", handleAccountSubmit);

    elements.modalCloseButton.addEventListener("click", closeModal);
    elements.modalBackdrop.addEventListener("click", (event) => {
      if (event.target === elements.modalBackdrop) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.modalBackdrop.hidden) {
        closeModal();
      } else if (event.key === "Escape") {
        closeAccountMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (elements.userBox && !elements.userBox.contains(event.target)) {
        closeAccountMenu();
      }

      const tabTarget = event.target.closest("[data-go-tab]");
      if (tabTarget) {
        goToTab(tabTarget.dataset.goTab);
        return;
      }

      const editButton = event.target.closest("[data-edit-score]");
      if (editButton) {
        openScoreModal(editButton);
        return;
      }

      const actionButton = event.target.closest("[data-action]");
      if (actionButton) {
        handleAction(actionButton.dataset.action, actionButton.dataset.id, actionButton);
      }
    });
  }

  // ─── App initialisation ───────────────────────────────────────────────────────

  const elements_loading = document.getElementById("loading-screen");

  async function init() {
    bindEvents();

    try {
      // Load initial state from Firebase
      state = await loadStateFromFirebase();

      // Set up realtime listener — re-render when another client changes data
      dbRef().on("value", (snapshot) => {
        const raw = snapshot.val();
        if (raw && raw.version === DATA_VERSION) {
          state = normalizeState(raw);
          // Only re-render if user is already logged in
          if (currentUser) {
            // Keep currentUser in sync (account data may have changed)
            const updatedAccount = state.accounts.find((a) => a.id === currentUser.id);
            if (updatedAccount) {
              currentUser = updatedAccount;
            }
            renderAll();
          }
        }
      });

      // Hide loading, show login
      if (elements_loading) elements_loading.hidden = true;
      elements.loginScreen.hidden = false;
    } catch (error) {
      console.error("Firebase init error:", error);
      if (elements_loading) {
        elements_loading.querySelector("p").textContent =
          "Không kết nối được Firebase. Vui lòng kiểm tra firebase-config.js và kết nối mạng.";
        elements_loading.querySelector(".loading-spinner").style.display = "none";
      }
    }
  }

  init();
})();
