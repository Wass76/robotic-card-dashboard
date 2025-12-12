import React from 'react';

const Button = ({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  icon,
  loading = false,
  ...props
}) => {
  const baseClasses = 'px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'gradient-robotics text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white text-robotics-primary border-2 border-robotics-light hover:border-robotics-primary hover:bg-robotics-light'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>جاري التحميل...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;

