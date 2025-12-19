// Constants for the application

export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor'
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.PENDING]: 'Chờ xác nhận',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Đã xác nhận',
  [APPOINTMENT_STATUS.CANCELLED]: 'Đã hủy',
  [APPOINTMENT_STATUS.COMPLETED]: 'Hoàn thành'
};

export const APPOINTMENT_STATUS_VARIANTS = {
  [APPOINTMENT_STATUS.PENDING]: 'warning',
  [APPOINTMENT_STATUS.CONFIRMED]: 'success',
  [APPOINTMENT_STATUS.CANCELLED]: 'danger',
  [APPOINTMENT_STATUS.COMPLETED]: 'info'
};

export const SPECIALTIES = [
  'Nội khoa',
  'Ngoại khoa',
  'Nhi khoa',
  'Phụ sản',
  'Tim mạch',
  'Thần kinh',
  'Tai mũi họng',
  'Mắt',
  'Răng hàm mặt',
  'Da liễu',
  'Chấn thương chỉnh hình'
];

export const GENDERS = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
  { value: 'Khác', label: 'Khác' }
];

export const DAYS_OF_WEEK = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy'
];

export const WORKING_HOURS = {
  START: '08:00',
  END: '17:00',
  LUNCH_START: '12:00',
  LUNCH_END: '13:00'
};
