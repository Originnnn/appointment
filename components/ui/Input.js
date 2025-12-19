import { useState } from 'react';

export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  helpText,
  icon,
  className = "",
  validate,
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleBlur = (e) => {
    setTouched(true);
    if (validate && value) {
      const validationError = validate(value);
      setLocalError(validationError || "");
    }
    onBlur?.(e);
  };

  const handleChange = (e) => {
    onChange(e);
    if (touched && validate) {
      const validationError = validate(e.target.value);
      setLocalError(validationError || "");
    }
  };

  const displayError = error || localError;
  const hasError = touched && displayError;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-gray-700 font-medium mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="bắt buộc">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
            hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
          }`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : helpText ? `${name}-help` : undefined}
          {...props}
        />
      </div>
      {hasError && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600 animate-shake" role="alert">
          {displayError}
        </p>
      )}
      {helpText && !hasError && (
        <p id={`${name}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}
