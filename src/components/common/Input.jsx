import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  label,
  error,
  required = false,
  icon,
  showPasswordToggle = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-3 ${icon ? 'pr-10' : ''} ${showPasswordToggle ? 'pl-10' : ''} border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-xl focus:ring-2 focus:ring-robotics-primary focus:border-transparent ${
            error ? 'focus:ring-red-500' : ''
          }`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;

