// Validation utilities

export const validators = {
  email: (value) => {
    if (!value) return "Email là bắt buộc";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Email không hợp lệ";
    return "";
  },

  phone: (value) => {
    if (!value) return "Số điện thoại là bắt buộc";
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(value)) return "Số điện thoại phải có 10-11 chữ số";
    return "";
  },

  required: (fieldName) => (value) => {
    if (!value || value.trim() === "") return `${fieldName} là bắt buộc`;
    return "";
  },

  minLength: (min, fieldName) => (value) => {
    if (!value) return "";
    if (value.length < min) return `${fieldName} phải có ít nhất ${min} ký tự`;
    return "";
  },

  maxLength: (max, fieldName) => (value) => {
    if (!value) return "";
    if (value.length > max) return `${fieldName} không được vượt quá ${max} ký tự`;
    return "";
  },

  date: (value) => {
    if (!value) return "Ngày là bắt buộc";
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return "Không thể chọn ngày trong quá khứ";
    return "";
  },

  futureDate: (value) => {
    if (!value) return "Ngày là bắt buộc";
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate <= today) return "Vui lòng chọn ngày trong tương lai";
    return "";
  },

  time: (value) => {
    if (!value) return "Giờ là bắt buộc";
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) return "Giờ không hợp lệ (HH:MM)";
    return "";
  },

  password: (value) => {
    if (!value) return "Mật khẩu là bắt buộc";
    if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    return "";
  }
};

// Compose multiple validators
export const composeValidators = (...validators) => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return "";
};
