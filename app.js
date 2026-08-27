(() => {
  "use strict";

  const DATA_VERSION = 4;
  const STORAGE_KEY = "legroup-5s-local-v4";
  const BENCHMARK = 3.3;
  const PAGE_SIZE = 10;
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

  const NA_RULES = {
    a1: { "phan-loai": ["18.2", "24"], "sap-xep": ["18.2", "24"], "lau-don": ["18.2", "24"] },
    a2: { "phan-loai": ["18.2", "15", "2"], "sap-xep": ["18.2", "15", "2"], "lau-don": ["18.2", "15", "2"] },
    a3: {
      "phan-loai": ["19", "18.1", "18.2", "5", "1", "26", "15", "12.1", "12.2", "13", "8", "9", "16", "2", "3", "24", "22", "11", "23", "20", "27"],
      "sap-xep": ["19", "18.1", "18.2", "5", "1", "26", "15", "12.1", "12.2", "13", "8", "9", "16", "2", "3", "24", "22", "11", "23", "20", "27"],
      "lau-don": ["19", "18.1", "18.2", "5", "1", "26", "15", "12.1", "12.2", "13", "8", "9", "16", "2", "3", "24", "22", "11", "23", "20", "27"],
    },
    b1: { "phan-loai": ["19", "18.2", "2", "20", "27"], "sap-xep": ["19", "18.2", "2", "20", "27"], "lau-don": ["19", "18.2", "2", "20", "27"] },
    b2: { "phan-loai": ["18.2", "3"], "sap-xep": ["18.2", "3"], "lau-don": ["18.2", "3"] },
    b3: { "phan-loai": ["18.2"], "sap-xep": ["18.2"], "lau-don": ["18.2"] },
    c2: { "phan-loai": ["2"], "sap-xep": ["2"], "lau-don": ["2"] },
    c3: { "phan-loai": ["18.2", "16", "2", "3", "20", "27"], "sap-xep": ["18.2", "16", "2", "3", "20", "27"], "lau-don": ["18.2", "16", "2", "3", "20", "27"] },
    c4: { "phan-loai": ["18.2", "16", "2", "3", "21"], "sap-xep": ["18.2", "16", "2", "3", "21"], "lau-don": ["18.2", "16", "2", "3", "21"] },
    d1: {
      "phan-loai": ["25", "19", "18.2", "5", "7", "26", "15", "12.1", "12.2", "14", "10", "8", "9", "3", "24", "22", "23", "20", "27"],
      "sap-xep": ["25", "19", "18.2", "5", "7", "26", "15", "12.1", "12.2", "14", "10", "8", "9", "3", "24", "22", "23", "20", "27"],
      "lau-don": ["25", "19", "18.2", "5", "7", "26", "15", "12.1", "12.2", "14", "10", "8", "9", "3", "24", "22", "23", "20", "27"],
    },
    d2: { "phan-loai": ["18.2", "23"], "sap-xep": ["18.2", "23"], "lau-don": ["18.2", "23"] },
    d3: { "phan-loai": ["18.2", "2"], "sap-xep": ["18.2", "2"], "lau-don": ["18.2", "2"] },
  };

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
    currentUserName: document.getElementById("current-user-name"),
    currentUserRole: document.getElementById("current-user-role"),
    logoutButton: document.getElementById("logout-button"),
    summaryPeriodSelect: document.getElementById("summary-period-select"),
    assignedZoneSummary: document.getElementById("assigned-zone-summary"),
    summaryTable: document.getElementById("summary-table"),
    summaryTitle: document.getElementById("summary-title"),
    exportExcelButton: document.getElementById("export-excel-button"),
    periodForm: document.getElementById("period-form"),
    periodMonth: document.getElementById("period-month"),
    periodYear: document.getElementById("period-year"),
    periodList: document.getElementById("period-list"),
    scorerForm: document.getElementById("scorer-form"),
    scorerName: document.getElementById("scorer-name"),
    scorerList: document.getElementById("scorer-list"),
    areaForm: document.getElementById("area-form"),
    areaCode: document.getElementById("area-code"),
    areaHead: document.getElementById("area-head"),
    areaSummaryGroup: document.getElementById("area-summary-group"),
    areaScorer: document.getElementById("area-scorer"),
    areaHighlight: document.getElementById("area-highlight"),
    areaList: document.getElementById("area-list"),
    itemList: document.getElementById("item-list"),
    accountForm: document.getElementById("account-form"),
    accountScorer: document.getElementById("account-scorer"),
    accountUsername: document.getElementById("account-username"),
    accountPassword: document.getElementById("account-password"),
    accountList: document.getElementById("account-list"),
    resetDataButton: document.getElementById("reset-data-button"),
    modalBackdrop: document.getElementById("modal-backdrop"),
    modalTitle: document.getElementById("modal-title"),
    modalBody: document.getElementById("modal-body"),
    modalActions: document.getElementById("modal-actions"),
    modalCloseButton: document.getElementById("modal-close-button"),
    toast: document.getElementById("toast"),
  };

  let state = loadState();
  let currentUser = null;
  let activeTab = "summary";
  let toastTimer = 0;

  function createDefaultState() {
    const now = new Date().toISOString();
    const managers = [];
    const managerIdsByName = new Map();

    DEFAULT_AREA_COLUMNS.forEach((column) => {
      if (!managerIdsByName.has(column.scorerName)) {
        const id = `scorer-${managers.length + 1}`;
        managerIdsByName.set(column.scorerName, id);
        managers.push({ id, name: column.scorerName, createdAt: now });
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
      highlight: column.highlight,
      createdAt: now,
    }));

    const periodId = "period-2025-12";

    return {
      version: DATA_VERSION,
      benchmark: BENCHMARK,
      activePeriodId: periodId,
      periods: [
        { id: periodId, month: 12, year: 2025, label: "Tháng 12/2025", createdAt: now },
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
      scores: buildSampleScores(periodId, areas, managers, now),
      history: [],
    };
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
            scorerName: managerById.get(area.scorerId)?.name || "",
            accountUsername: "file-mau",
            updatedAt: timestamp,
          });
        });
      });
    });

    return scores;
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored?.version === DATA_VERSION) {
        return normalizeState(stored);
      }
    } catch (error) {
      console.warn("Cannot read localStorage", error);
    }

    const defaultState = createDefaultState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return defaultState;
  }

  function normalizeState(raw) {
    const normalized = {
      ...raw,
      version: DATA_VERSION,
      benchmark: Number(raw.benchmark) || BENCHMARK,
      periods: Array.isArray(raw.periods) ? raw.periods : [],
      managers: Array.isArray(raw.managers) ? raw.managers : [],
      areas: Array.isArray(raw.areas) ? raw.areas : [],
      accounts: Array.isArray(raw.accounts) ? raw.accounts : [],
      scores: Array.isArray(raw.scores) ? raw.scores : [],
      history: Array.isArray(raw.history) ? raw.history : [],
    };

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
        summaryGroup: area.summaryGroup ?? defaultAreaByCode.get(area.templateCode || area.code)?.summaryGroup ?? area.departmentHead ?? "",
        highlight: area.highlight ?? Boolean(defaultAreaByCode.get(area.templateCode || area.code)?.highlight),
      }))
      .sort((a, b) => a.order - b.order);

    return normalized;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function makeId(prefix) {
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${Date.now().toString(36)}-${randomPart}`;
  }

  function getPeriods() {
    return [...state.periods].sort((a, b) => b.year - a.year || b.month - a.month);
  }

  function getAreas() {
    return [...state.areas].sort((a, b) => a.order - b.order);
  }

  function getManagers() {
    return [...state.managers].sort((a, b) => a.name.localeCompare(b.name, "vi"));
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

    return getManager(account.scorerId)?.name || account.name || account.username;
  }

  function getAreaScorerName(area) {
    return getManager(area.scorerId)?.name || "Chưa phân quyền";
  }

  function getAllowedAreaIds(account = currentUser) {
    if (!account) {
      return new Set();
    }

    if (account.role === "admin") {
      return new Set(getAreas().map((area) => area.id));
    }

    const explicitIds = Array.isArray(account.areaIds) ? account.areaIds : [];
    const byScorer = getAreas()
      .filter((area) => area.scorerId === account.scorerId)
      .map((area) => area.id);

    return new Set([...explicitIds, ...byScorer]);
  }

  function isNotApplicable(itemId, criterionId, area) {
    const zoneCode = String(area?.templateCode || area?.code || "");
    return Boolean(NA_RULES[itemId]?.[criterionId]?.includes(zoneCode));
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

  function itemAverage(periodId, item) {
    const values = [];
    getAreas().forEach((area) => {
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

  function overallAverage(periodId) {
    return average(getAreas().map((area) => areaAverage(periodId, area)));
  }

  function getCompletedCellCount(periodId, area) {
    let count = 0;
    DEFAULT_ITEMS.forEach((item) => {
      item.criteria.forEach((criterion) => {
        if (!isNotApplicable(item.id, criterion.id, area) && Number.isFinite(getScoreValue(periodId, area.id, item.id, criterion.id))) {
          count += 1;
        }
      });
    });
    return count;
  }

  function getPeriodStats(periodId) {
    const areas = getAreas();
    const areaAverages = areas.map((area) => ({ area, average: areaAverage(periodId, area) }));
    const completedAreas = areas.filter((area) => {
      const required = getRequiredCellsForArea(area);
      return required > 0 && getCompletedCellCount(periodId, area) >= required;
    });

    return {
      overall: overallAverage(periodId),
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

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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
    const areas = getAreas();
    const editableAreaIds = options.editableAreaIds || new Set();
    const canEdit = options.editable && currentUser?.role !== "admin";
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
      const cell = createCell("th", area.code, area.highlight ? "zone-code is-highlight" : "zone-code");
      zoneRow.appendChild(cell);
    });
    zoneRow.appendChild(setRowSpan(createCell("th", "AVER", "aver-head"), 3));
    table.appendChild(zoneRow);

    const departmentRow = document.createElement("tr");
    departmentRow.appendChild(createCell("th", "T.Phòng", "zone-title"));
    buildConsecutiveGroups(areas, "departmentHead", false).forEach((group) => {
      departmentRow.appendChild(setColSpan(createCell("th", group.label, "department-head"), group.areas.length));
    });
    table.appendChild(departmentRow);

    const picRow = document.createElement("tr");
    picRow.appendChild(setColSpan(createCell("th", "ITEMS", "items-head"), 2));
    picRow.appendChild(createCell("th", "Point", "point-head"));
    areas.forEach((area) => picRow.appendChild(createCell("th", getAreaScorerName(area), "pic-name")));
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
          const value = getScoreValue(periodId, area.id, item.id, criterion.id);
          const isEditable = canEdit && editableAreaIds.has(area.id) && !isNa;
          const classNames = ["score-cell"];

          if (isNa) {
            classNames.push("score-na");
          } else if (!Number.isFinite(value)) {
            classNames.push("score-empty");
          } else if (value <= 2) {
            classNames.push("score-low");
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
            button.textContent = formatScore(value);
            button.dataset.editScore = "true";
            button.dataset.periodId = periodId;
            button.dataset.areaId = area.id;
            button.dataset.itemId = item.id;
            button.dataset.criterionId = criterion.id;
            button.title = "Sửa điểm";
            cell.appendChild(button);
          } else {
            cell.textContent = formatScore(value);
          }
          row.appendChild(cell);
        });

        if (criterionIndex === 0) {
          const averageCell = setRowSpan(createCell("td", formatNumber(itemAverage(periodId, item), 1), "item-average"), item.criteria.length);
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

    const overallCell = setRowSpan(createCell("td", formatNumber(overallAverage(periodId), 1), "overall-total"), 3);
    if (options.includeFormulas) {
      overallCell.setAttribute("x:fmla", `=IFERROR(AVERAGE(D${options.totalRowNumber}:${options.lastAreaColumn}${options.totalRowNumber}),"")`);
    }
    areaTotalRow.appendChild(overallCell);
    table.appendChild(areaTotalRow);

    const summaryGroups = buildConsecutiveGroups(areas, "summaryGroup", false);
    const groupAverageRow = document.createElement("tr");
    const groupLabelRow = document.createElement("tr");

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
        groupLabelRow.appendChild(setColSpan(createCell("td", group.label, "group-label"), span));
      } else {
        groupAverageRow.appendChild(setRowSpan(createCell("td", group.label, "group-label"), 2));
      }
    });

    table.appendChild(groupAverageRow);
    table.appendChild(groupLabelRow);

    const signatureRow = document.createElement("tr");
    signatureRow.appendChild(setColSpan(createCell("td", "Người đánh giá", "signature-label"), 3));
    areas.forEach((area) => signatureRow.appendChild(createCell("td", getSignatureName(periodId, area), "signature-cell")));
    signatureRow.appendChild(createCell("td", "", "signature-cell"));
    table.appendChild(signatureRow);
  }

  function getSignatureName(periodId, area) {
    const latest = state.scores
      .filter((score) => score.periodId === periodId && score.areaId === area.id && Number.isFinite(score.score))
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];

    if (latest?.scorerName) {
      return latest.scorerName;
    }

    return Number.isFinite(areaAverage(periodId, area)) ? getAreaScorerName(area) : "";
  }

  function renderRoleVisibility() {
    const isAdmin = currentUser?.role === "admin";
    document.querySelectorAll(".admin-only").forEach((element) => {
      element.hidden = !isAdmin;
    });
    document.querySelectorAll(".manager-only").forEach((element) => {
      element.hidden = isAdmin;
    });
  }

  function isTabAllowed(tab) {
    if (!currentUser) {
      return false;
    }

    if (currentUser.role === "admin") {
      return ["summary", "catalog", "accounts"].includes(tab);
    }

    return tab === "summary";
  }

  function setActiveTab(tab) {
    activeTab = isTabAllowed(tab) ? tab : "summary";
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

    renderRoleVisibility();
    elements.currentUserName.textContent = getAccountDisplayName(currentUser);
    elements.currentUserRole.textContent = currentUser.role === "admin" ? "Admin xuất Excel" : "Người chấm điểm";
    populatePeriodSelects();
    populateManagerSelects();
    setActiveTab(activeTab);
  }

  function renderActiveTab() {
    if (activeTab === "summary") {
      renderSummaryTab();
    } else if (activeTab === "catalog") {
      renderCatalogTab();
    } else if (activeTab === "accounts") {
      renderAccountsTab();
    }
  }

  function populatePeriodSelects() {
    const html = getPeriods()
      .map((period) => `<option value="${escapeHtml(period.id)}">${escapeHtml(periodLabel(period))}</option>`)
      .join("");

    [elements.summaryPeriodSelect].forEach((select) => {
      if (!select) {
        return;
      }
      select.innerHTML = html;
      select.value = state.activePeriodId;
    });
  }

  function populateManagerSelects() {
    const html = getManagers()
      .map((manager) => `<option value="${escapeHtml(manager.id)}">${escapeHtml(manager.name)}</option>`)
      .join("");

    [elements.areaScorer, elements.accountScorer].forEach((select) => {
      if (!select) {
        return;
      }
      select.innerHTML = html;
    });
  }

  function renderSummaryTab() {
    const period = getPeriod();
    const editable = currentUser?.role !== "admin";
    const allowedAreaIds = getAllowedAreaIds();
    const assignedAreas = getAreas().filter((area) => allowedAreaIds.has(area.id));
    elements.summaryTitle.textContent = `Điểm Chi Tiết Theo Từng Hạng Mục - ${periodLabel(period)}`;
    if (elements.assignedZoneSummary) {
      elements.assignedZoneSummary.textContent = assignedAreas.length
        ? `Bạn được sửa zone: ${assignedAreas.map((area) => area.code).join(", ")}. Các zone khác chỉ xem.`
        : "Tài khoản này chưa được phân quyền zone.";
    }
    buildMatrixTable(elements.summaryTable, {
      periodId: period?.id,
      editable,
      editableAreaIds: allowedAreaIds,
    });
  }

  function renderCatalogTab() {
    renderPeriodList();
    renderScorerList();
    renderAreaList();
    renderItemList();
  }

  function renderPeriodList() {
    elements.periodList.innerHTML = getPeriods()
      .map((period) => {
        const active = period.id === state.activePeriodId ? "Đang mở" : "Mở kỳ";
        return `<article class="compact-item">
          <div>
            <strong>${escapeHtml(periodLabel(period))}</strong>
            <span>${period.id === state.activePeriodId ? "Kỳ đang dùng để chấm và xuất file" : "Kỳ lưu trong localStorage"}</span>
          </div>
          <div class="compact-actions">
            <button class="tiny-button" type="button" data-action="activate-period" data-id="${escapeHtml(period.id)}">${active}</button>
            <button class="tiny-button danger-text-button" type="button" data-action="delete-period" data-id="${escapeHtml(period.id)}">Xóa</button>
          </div>
        </article>`;
      })
      .join("");
  }

  function renderScorerList() {
    elements.scorerList.innerHTML = getManagers()
      .map((manager) => {
        const zones = getAreas()
          .filter((area) => area.scorerId === manager.id)
          .map((area) => area.code);
        return `<article class="compact-item">
          <div>
            <strong>${escapeHtml(manager.name)}</strong>
            <span>Zone được chấm: ${escapeHtml(zones.join(", ") || "chưa có")}</span>
          </div>
          <div class="compact-actions">
            <button class="tiny-button" type="button" data-action="edit-scorer" data-id="${escapeHtml(manager.id)}">Sửa</button>
            <button class="tiny-button danger-text-button" type="button" data-action="delete-scorer" data-id="${escapeHtml(manager.id)}">Xóa</button>
          </div>
        </article>`;
      })
      .join("");
  }

  function renderAreaList() {
    elements.areaList.innerHTML = getAreas()
      .map((area) => `<article class="compact-item">
        <div>
          <strong>Zone ${escapeHtml(area.code)}</strong>
          <span>Trưởng phòng: ${escapeHtml(area.departmentHead || "-")} · Nhóm tổng: ${escapeHtml(area.summaryGroup || "-")} · Người chấm: ${escapeHtml(getAreaScorerName(area))}</span>
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
    const managerById = new Map(state.managers.map((manager) => [manager.id, manager]));
    elements.accountList.innerHTML = state.accounts
      .map((account) => {
        const isAdmin = account.role === "admin";
        const manager = managerById.get(account.scorerId);
        const zones = isAdmin
          ? "Toàn quyền"
          : getAreas()
              .filter((area) => area.scorerId === account.scorerId)
              .map((area) => area.code)
              .join(", ") || "chưa có zone";

        return `<article class="account-card">
          <div>
            <strong>${escapeHtml(account.username)}</strong>
            <span>${escapeHtml(isAdmin ? "Admin xuất Excel" : manager?.name || "Người chấm")} · ${escapeHtml(zones)}</span>
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
    activeTab = "summary";
    elements.loginScreen.hidden = true;
    elements.appShell.hidden = false;
    elements.loginForm.reset();
    renderAll();
  }

  function handleLogout() {
    currentUser = null;
    activeTab = "summary";
    closeModal();
    elements.appShell.hidden = true;
    elements.loginScreen.hidden = false;
    elements.loginUsername.focus();
  }

  function openScoreModal(button) {
    const periodId = button.dataset.periodId;
    const area = getArea(button.dataset.areaId);
    const item = getItem(button.dataset.itemId);
    const criterion = getCriterion(item, button.dataset.criterionId);

    if (!area || !item || !criterion || !getAllowedAreaIds().has(area.id) || isNotApplicable(item.id, criterion.id, area)) {
      showToast("Bạn không có quyền sửa ô này.", true);
      return;
    }

    const record = getScoreRecord(periodId, area.id, item.id, criterion.id);
    const value = Number.isFinite(record?.score) ? String(record.score) : "";
    const options = ["", "1", "2", "3", "4", "5"]
      .map((score) => `<option value="${score}" ${score === value ? "selected" : ""}>${score || "Chưa chấm"}</option>`)
      .join("");

    openFormModal({
      title: "Sửa điểm",
      submitText: "Lưu điểm",
      html: `
        <div class="modal-context">
          <span><strong>Zone:</strong> ${escapeHtml(area.code)} · ${escapeHtml(getAreaScorerName(area))}</span>
          <span><strong>Hạng mục:</strong> ${escapeHtml(item.code)} ${escapeHtml(item.name)}</span>
          <span><strong>Point:</strong> ${escapeHtml(criterion.label)}</span>
        </div>
        <label>
          <span>Điểm</span>
          <select name="score" required>${options}</select>
        </label>
        <label>
          <span>Ghi chú</span>
          <textarea name="note" placeholder="Nhập ghi chú nếu có">${escapeHtml(record?.note || "")}</textarea>
        </label>
      `,
      onSubmit(formData) {
        const rawScore = formData.get("score");
        const nextScore = rawScore === "" ? null : Number(rawScore);
        if (nextScore !== null && (!Number.isInteger(nextScore) || nextScore < 1 || nextScore > 5)) {
          showToast("Điểm phải từ 1 đến 5.", true);
          return false;
        }

        setScore({
          periodId,
          area,
          item,
          criterion,
          score: nextScore,
          note: String(formData.get("note") || "").trim(),
        });
        showToast("Đã lưu điểm.");
        renderAll();
        return true;
      },
    });
  }

  function setScore({ periodId, area, item, criterion, score, note }) {
    const existingIndex = state.scores.findIndex(
      (record) =>
        record.periodId === periodId &&
        record.areaId === area.id &&
        record.itemId === item.id &&
        record.criterionId === criterion.id,
    );
    const existing = existingIndex >= 0 ? state.scores[existingIndex] : null;
    const beforeLabel = Number.isFinite(existing?.score) ? String(existing.score) : "";
    const afterLabel = Number.isFinite(score) ? String(score) : "";
    const beforeNote = existing?.note || "";
    const changed = beforeLabel !== afterLabel || beforeNote !== note;

    if (!changed) {
      return;
    }

    if (score === null && !note) {
      if (existingIndex >= 0) {
        state.scores.splice(existingIndex, 1);
      }
    } else {
      const payload = {
        id: existing?.id || makeId("score"),
        periodId,
        areaId: area.id,
        itemId: item.id,
        criterionId: criterion.id,
        score,
        note,
        scorerName: getAccountDisplayName(currentUser),
        accountUsername: currentUser?.username || "",
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        state.scores[existingIndex] = payload;
      } else {
        state.scores.push(payload);
      }
    }

    state.history.unshift({
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
    });

    saveState();
  }

  function logAdminChange({ subjectLabel, beforeLabel = "", afterLabel = "", changeLabel = "", areaCode = "", note = "" }) {
    const period = getPeriod();
    state.history.unshift({
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
    });
  }

  function openFormModal({ title, html, submitText = "Lưu", submitClass = "primary-button", onSubmit }) {
    elements.modalTitle.textContent = title;
    elements.modalBody.innerHTML = `<form class="modal-form" id="modal-form">${html}</form>`;
    elements.modalActions.innerHTML = `
      <button class="secondary-button" type="button" data-action="modal-cancel">Hủy</button>
      <button class="${submitClass}" type="submit" form="modal-form">${escapeHtml(submitText)}</button>
    `;

    const form = document.getElementById("modal-form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const shouldClose = onSubmit(new FormData(form), form);
      if (shouldClose !== false) {
        closeModal();
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
      onSubmit() {
        onConfirm();
        renderAll();
        return true;
      },
    });
  }

  function closeModal() {
    elements.modalBackdrop.hidden = true;
    elements.modalTitle.textContent = "";
    elements.modalBody.innerHTML = "";
    elements.modalActions.innerHTML = "";
  }

  function handlePeriodSubmit(event) {
    event.preventDefault();
    const month = Number(elements.periodMonth.value);
    const year = Number(elements.periodYear.value);

    if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2020 || year > 2100) {
      showToast("Tháng hoặc năm không hợp lệ.", true);
      return;
    }

    let period = state.periods.find((item) => item.month === month && item.year === year);
    const existed = Boolean(period);
    if (!period) {
      period = {
        id: `period-${year}-${String(month).padStart(2, "0")}`,
        month,
        year,
        label: `Tháng ${month}/${year}`,
        createdAt: new Date().toISOString(),
      };
      state.periods.push(period);
    }

    state.activePeriodId = period.id;
    logAdminChange({
      subjectLabel: "Kỳ đánh giá",
      afterLabel: periodLabel(period),
      changeLabel: existed ? `Mở lại ${periodLabel(period)}` : `Tạo kỳ mới ${periodLabel(period)}`,
      note: existed ? "Kỳ đã tồn tại trong localStorage" : "Kỳ mới bắt đầu trống điểm",
    });
    saveState();
    elements.periodForm.reset();
    showToast("Đã tạo kỳ mới trống để chấm lại.");
    renderAll();
  }

  function handleScorerSubmit(event) {
    event.preventDefault();
    const name = elements.scorerName.value.trim();
    if (!name) {
      showToast("Vui lòng nhập tên người chấm.", true);
      return;
    }

    state.managers.push({ id: makeId("scorer"), name, createdAt: new Date().toISOString() });
    logAdminChange({
      subjectLabel: "Người chấm",
      afterLabel: name,
      changeLabel: `Thêm người chấm ${name}`,
    });
    saveState();
    elements.scorerForm.reset();
    showToast("Đã thêm người chấm.");
    renderAll();
  }

  function handleAreaSubmit(event) {
    event.preventDefault();
    const code = elements.areaCode.value.trim();
    const scorerId = elements.areaScorer.value;

    if (!code || !scorerId) {
      showToast("Vui lòng nhập đủ mã zone và người chấm.", true);
      return;
    }

    state.areas.push({
      id: makeId("area"),
      order: Math.max(0, ...state.areas.map((area) => Number(area.order) || 0)) + 1,
      code,
      templateCode: code,
      departmentHead: elements.areaHead.value.trim(),
      summaryGroup: elements.areaSummaryGroup.value.trim(),
      scorerId,
      highlight: elements.areaHighlight.checked,
      createdAt: new Date().toISOString(),
    });
    logAdminChange({
      subjectLabel: "Zone",
      areaCode: code,
      afterLabel: `${code} · ${elements.areaHead.value.trim() || "-"} · ${getManager(scorerId)?.name || ""}`,
      changeLabel: `Thêm zone ${code}`,
    });

    saveState();
    elements.areaForm.reset();
    showToast("Đã thêm zone.");
    renderAll();
  }

  function handleAccountSubmit(event) {
    event.preventDefault();
    const scorerId = elements.accountScorer.value;
    const username = elements.accountUsername.value.trim();
    const password = elements.accountPassword.value;

    if (!scorerId || !username || !password) {
      showToast("Vui lòng nhập đủ thông tin tài khoản.", true);
      return;
    }

    if (state.accounts.some((account) => account.username === username)) {
      showToast("Tên tài khoản đã tồn tại.", true);
      return;
    }

    state.accounts.push({
      id: makeId("account"),
      role: "manager",
      scorerId,
      username,
      password,
      createdAt: new Date().toISOString(),
    });
    logAdminChange({
      subjectLabel: "Tài khoản người chấm",
      afterLabel: `${username} · ${getManager(scorerId)?.name || ""}`,
      changeLabel: `Thêm tài khoản ${username}`,
    });

    saveState();
    elements.accountForm.reset();
    showToast("Đã thêm tài khoản người chấm.");
    renderAll();
  }

  function editScorer(id) {
    const manager = getManager(id);
    if (!manager) {
      return;
    }

    openFormModal({
      title: "Sửa người chấm",
      html: `
        <label>
          <span>Tên người chấm</span>
          <input name="name" type="text" value="${escapeHtml(manager.name)}" required>
        </label>
      `,
      onSubmit(formData) {
        const name = String(formData.get("name") || "").trim();
        if (!name) {
          showToast("Tên người chấm không được trống.", true);
          return false;
        }
        const beforeName = manager.name;
        manager.name = name;
        logAdminChange({
          subjectLabel: "Người chấm",
          beforeLabel: beforeName,
          afterLabel: name,
          changeLabel: `Sửa người chấm ${beforeName}`,
        });
        saveState();
        showToast("Đã cập nhật người chấm.");
        renderAll();
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
      showToast("Người chấm đang được gán zone, hãy đổi zone trước khi xóa.", true);
      return;
    }

    openConfirmModal({
      title: "Xóa người chấm",
      message: `Xóa ${manager.name}?`,
      confirmText: "Xóa",
      danger: true,
      onConfirm() {
        logAdminChange({
          subjectLabel: "Người chấm",
          beforeLabel: manager.name,
          afterLabel: "Đã xóa",
          changeLabel: `Xóa người chấm ${manager.name}`,
        });
        state.managers = state.managers.filter((item) => item.id !== id);
        state.accounts = state.accounts.filter((account) => account.scorerId !== id);
        saveState();
        showToast("Đã xóa người chấm.");
      },
    });
  }

  function editArea(id) {
    const area = getArea(id);
    if (!area) {
      return;
    }

    openFormModal({
      title: "Sửa zone",
      html: `
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
        <label>
          <span>Người chấm</span>
          <select name="scorerId" required>${managerOptions(area.scorerId)}</select>
        </label>
        <label class="check-line">
          <input name="highlight" type="checkbox" ${area.highlight ? "checked" : ""}>
          <span>Tô vàng mã zone</span>
        </label>
      `,
      onSubmit(formData) {
        const beforeLabel = `${area.code} · ${area.departmentHead || "-"} · ${area.summaryGroup || "-"} · ${getAreaScorerName(area)}`;
        area.code = String(formData.get("code") || "").trim();
        area.departmentHead = String(formData.get("departmentHead") || "").trim();
        area.summaryGroup = String(formData.get("summaryGroup") || "").trim();
        area.scorerId = String(formData.get("scorerId") || "");
        area.highlight = formData.get("highlight") === "on";
        logAdminChange({
          subjectLabel: "Zone",
          areaCode: area.code,
          beforeLabel,
          afterLabel: `${area.code} · ${area.departmentHead || "-"} · ${area.summaryGroup || "-"} · ${getAreaScorerName(area)}`,
          changeLabel: `Sửa zone ${area.code}`,
        });
        saveState();
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
      message: `Xóa zone ${area.code}? Điểm của zone này trong localStorage cũng sẽ bị xóa.`,
      confirmText: "Xóa",
      danger: true,
      onConfirm() {
        logAdminChange({
          subjectLabel: "Zone",
          areaCode: area.code,
          beforeLabel: `${area.code} · ${area.departmentHead || "-"} · ${area.summaryGroup || "-"} · ${getAreaScorerName(area)}`,
          afterLabel: "Đã xóa",
          changeLabel: `Xóa zone ${area.code}`,
          note: "Điểm của zone đã bị xóa khỏi localStorage",
        });
        state.areas = state.areas.filter((item) => item.id !== id);
        state.scores = state.scores.filter((score) => score.areaId !== id);
        saveState();
        showToast("Đã xóa zone.");
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
          <span>Người chấm</span>
          <select name="scorerId" required>${managerOptions(account.scorerId)}</select>
        </label>
        <label>
          <span>Tài khoản</span>
          <input name="username" type="text" value="${escapeHtml(account.username)}" required>
        </label>
        <label>
          <span>Mật khẩu</span>
          <input name="password" type="text" value="${escapeHtml(account.password)}" required minlength="4">
        </label>
      `,
      onSubmit(formData) {
        const username = String(formData.get("username") || "").trim();
        if (state.accounts.some((item) => item.id !== id && item.username === username)) {
          showToast("Tên tài khoản đã tồn tại.", true);
          return false;
        }

        const beforeLabel = `${account.username} · ${getManager(account.scorerId)?.name || ""}`;
        account.scorerId = String(formData.get("scorerId") || "");
        account.username = username;
        account.password = String(formData.get("password") || "");
        logAdminChange({
          subjectLabel: "Tài khoản người chấm",
          beforeLabel,
          afterLabel: `${account.username} · ${getManager(account.scorerId)?.name || ""}`,
          changeLabel: `Sửa tài khoản ${account.username}`,
        });
        saveState();
        showToast("Đã cập nhật tài khoản.");
        renderAll();
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
        logAdminChange({
          subjectLabel: "Tài khoản người chấm",
          beforeLabel: `${account.username} · ${getManager(account.scorerId)?.name || ""}`,
          afterLabel: "Đã xóa",
          changeLabel: `Xóa tài khoản ${account.username}`,
        });
        state.accounts = state.accounts.filter((item) => item.id !== id);
        saveState();
        showToast("Đã xóa tài khoản.");
      },
    });
  }

  function managerOptions(selectedId) {
    return getManagers()
      .map((manager) => `<option value="${escapeHtml(manager.id)}" ${manager.id === selectedId ? "selected" : ""}>${escapeHtml(manager.name)}</option>`)
      .join("");
  }

  function activatePeriod(id) {
    if (!state.periods.some((period) => period.id === id)) {
      return;
    }

    state.activePeriodId = id;
    historyPage = 1;
    saveState();
    showToast("Đã đổi kỳ đánh giá.");
    renderAll();
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
      message: `Xóa ${periodLabel(period)} khỏi localStorage?`,
      confirmText: "Xóa",
      danger: true,
      onConfirm() {
        logAdminChange({
          subjectLabel: "Kỳ đánh giá",
          beforeLabel: periodLabel(period),
          afterLabel: "Đã xóa",
          changeLabel: `Xóa kỳ ${periodLabel(period)}`,
          note: "Điểm của kỳ đã bị xóa khỏi localStorage",
        });
        state.periods = state.periods.filter((item) => item.id !== id);
        state.scores = state.scores.filter((score) => score.periodId !== id);
        if (state.activePeriodId === id) {
          state.activePeriodId = getPeriods()[0]?.id || "";
        }
        saveState();
        showToast("Đã xóa kỳ đánh giá.");
      },
    });
  }

  function resetAllData() {
    openConfirmModal({
      title: "Reset dữ liệu local",
      message: "Reset sẽ đưa web app về đúng dữ liệu mẫu 5S ban đầu và xóa tài khoản/điểm/lịch sử đang lưu trên trình duyệt này.",
      confirmText: "Reset",
      danger: true,
      onConfirm() {
        state = createDefaultState();
        currentUser = null;
        saveState();
        closeModal();
        elements.appShell.hidden = true;
        elements.loginScreen.hidden = false;
        showToast("Đã reset dữ liệu local.");
      },
    });
  }

  function exportExcel(periodId) {
    const period = getPeriod(periodId);
    const bytes = buildXlsxWorkbook(periodId);
    const safeName = `bang-diem-5s-thang-${period?.month || "x"}-${period?.year || "x"}.xlsx`;
    downloadFile(safeName, bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
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
    const areas = getAreas();
    const rows = new Map();
    const rowHeights = new Map();
    const merges = [];
    const itemAverageRows = new Map();

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
    const targetColumn = averageColumn + 1;
    const firstScoreRow = 5;
    rowHeights.set(1, 64.5);
    rowHeights.set(2, 14.4);
    rowHeights.set(3, 14.4);
    rowHeights.set(4, 18.8);

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
    areas.forEach((area, index) => addCell(4, 4 + index, getAreaScorerName(area), 10));

    let rowNumber = firstScoreRow;
    DEFAULT_ITEMS.forEach((item) => {
      const itemStart = rowNumber;
      const itemEnd = itemStart + item.criteria.length - 1;
      itemAverageRows.set(item.id, itemStart);

      item.criteria.forEach((criterion, index) => {
        if (index === 0) {
          addCell(rowNumber, 1, item.code, 11);
          addCell(rowNumber, 2, item.name, 12);
          if (item.criteria.length > 1) {
            merge(rowNumber, 1, itemEnd, 1);
            merge(rowNumber, 2, itemEnd, 2);
          }
        }

        rowHeights.set(rowNumber, item.criteria.length === 1 ? 14.3 : 11.3);
        addCell(rowNumber, 3, item.criteria.length === 1 ? "" : criterion.label, 13);
        areas.forEach((area, areaIndex) => {
          const column = 4 + areaIndex;
          if (isNotApplicable(item.id, criterion.id, area)) {
            addCell(rowNumber, column, "", 16);
            return;
          }

          const value = getScoreValue(periodId, area.id, item.id, criterion.id);
          const style = Number.isFinite(value) && value <= 2 ? 15 : 14;
          addCell(rowNumber, column, value, style);
        });

        addCell(rowNumber, averageColumn, itemAverage(periodId, item), 17, {
          formula: `IFERROR(AVERAGE(${cellRef(itemStart, 4)}:${cellRef(itemEnd, lastTableColumn)}),"")`,
        });
        addCell(rowNumber, targetColumn, state.benchmark, 25);
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
    [totalRow, groupRow, groupLabelRow].forEach((row) => rowHeights.set(row, 14.3));
    rowHeights.set(signatureRow, 19.5);

    addCell(totalRow, 1, "TOTAL SCORE:", 18);
    merge(totalRow, 1, groupLabelRow, 3);
    areas.forEach((area, index) => {
      const column = 4 + index;
      addCell(totalRow, column, areaAverage(periodId, area), 19, {
        formula: `IFERROR(AVERAGE(${cellRef(firstScoreRow, column)}:${cellRef(totalRow - 1, column)}),"")`,
      });
    });
    addCell(totalRow, averageColumn, overallAverage(periodId), 23, {
      formula: `IFERROR(AVERAGE(${cellRef(totalRow, 4)}:${cellRef(totalRow, lastTableColumn)}),"")`,
    });
    merge(totalRow, averageColumn, groupLabelRow, averageColumn);

    buildGroupedSpans(areas, "summaryGroup", false).forEach((group) => {
      const start = 4 + group.startIndex;
      const end = start + group.areas.length - 1;
      if (group.label && group.areas.length > 1) {
        addCell(groupRow, start, groupAverage(periodId, group.areas), 21, {
          formula: `IFERROR(AVERAGE(${cellRef(totalRow, start)}:${cellRef(totalRow, end)}),"")`,
        });
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
    addCell(signatureRow, targetColumn, "", 24);

    return {
      rows,
      rowHeights,
      merges,
      period,
      maxColumn: targetColumn,
      maxRow: signatureRow,
      lastTableColumn,
      averageColumn,
      targetColumn,
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

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:${excelColumnName(model.maxColumn)}${model.maxRow}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>
    <col min="1" max="1" width="6" customWidth="1"/>
    <col min="2" max="2" width="18" customWidth="1"/>
    <col min="3" max="3" width="12" customWidth="1"/>
    <col min="4" max="32" width="5" customWidth="1"/>
    <col min="33" max="33" width="8" customWidth="1"/>
    <col min="${model.hiddenSourceStartColumn}" max="${model.hiddenSourceEndColumn}" width="0" hidden="1" customWidth="1"/>
  </cols>
  <sheetData>${rowXml}</sheetData>
  ${mergeXml}
  <pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>
  <drawing r:id="rId1"/>
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
  <Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>
  <Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>
  <Override PartName="/xl/charts/chart2.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>
</Types>`;
  }

  function buildRootRelationshipsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
  }

  function buildWorkbookXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <workbookPr/>
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="28800" windowHeight="17600"/></bookViews>
  <sheets><sheet name="5S" sheetId="1" r:id="rId1"/></sheets>
  <calcPr calcId="0" fullCalcOnLoad="1" forceFullCalc="1"/>
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
    <font><b/><sz val="28"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="18"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="14"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><sz val="25"/><color rgb="FF000000"/><name val="Arial"/><family val="2"/></font>
    <font><sz val="24"/><color rgb="FF000000"/><name val="Arial"/><family val="2"/></font>
    <font><b/><sz val="20"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="17"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="10"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="15"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="17"/><color rgb="FFD00000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="16"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="24"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
    <font><b/><sz val="34"/><color rgb="FF000000"/><name val="Times New Roman"/><family val="1"/></font>
  </fonts>
  <fills count="6">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFF00"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF00B050"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF4B6C2"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFC7CE"/><bgColor indexed="64"/></patternFill></fill>
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
  <cellXfs count="25">
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
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;
  }

  function xf(numFmtId, fontId, fillId, borderId, horizontal = "center", vertical = "center", wrap = false) {
    const numFmt = numFmtId ? ` numFmtId="${numFmtId}" applyNumberFormat="1"` : ' numFmtId="0"';
    return `<xf${numFmt} fontId="${fontId}" fillId="${fillId}" borderId="${borderId}" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="${horizontal}" vertical="${vertical}"${wrap ? ' wrapText="1"' : ""}/></xf>`;
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

  function handleAction(action, id) {
    const handlers = {
      "activate-period": () => activatePeriod(id),
      "delete-period": () => deletePeriod(id),
      "edit-scorer": () => editScorer(id),
      "delete-scorer": () => deleteScorer(id),
      "edit-area": () => editArea(id),
      "delete-area": () => deleteArea(id),
      "edit-account": () => editAccount(id),
      "delete-account": () => deleteAccount(id),
      "modal-cancel": () => closeModal(),
    };

    handlers[action]?.();
  }

  function bindEvents() {
    elements.loginForm.addEventListener("submit", handleLogin);
    elements.logoutButton.addEventListener("click", handleLogout);

    document.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", () => setActiveTab(button.dataset.tab));
    });

    [elements.summaryPeriodSelect].forEach((select) => {
      select.addEventListener("change", () => {
        state.activePeriodId = select.value;
        saveState();
        renderAll();
      });
    });

    elements.exportExcelButton.addEventListener("click", () => exportExcel(state.activePeriodId));

    elements.periodForm.addEventListener("submit", handlePeriodSubmit);
    elements.scorerForm.addEventListener("submit", handleScorerSubmit);
    elements.areaForm.addEventListener("submit", handleAreaSubmit);
    elements.accountForm.addEventListener("submit", handleAccountSubmit);
    elements.resetDataButton.addEventListener("click", resetAllData);

    elements.modalCloseButton.addEventListener("click", closeModal);
    elements.modalBackdrop.addEventListener("click", (event) => {
      if (event.target === elements.modalBackdrop) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.modalBackdrop.hidden) {
        closeModal();
      }
    });

    document.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit-score]");
      if (editButton) {
        openScoreModal(editButton);
        return;
      }

      const actionButton = event.target.closest("[data-action]");
      if (actionButton) {
        handleAction(actionButton.dataset.action, actionButton.dataset.id);
      }
    });
  }

  bindEvents();
})();