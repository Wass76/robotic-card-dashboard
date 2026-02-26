import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = ''
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/50"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden my-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex-shrink-0 border-b border-gray-200 px-4 py-3 sm:p-4 flex items-center justify-between gap-3 min-h-[52px]">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{title}</h3>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        )}
        {!title ? (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {children}
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-4 sm:p-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

