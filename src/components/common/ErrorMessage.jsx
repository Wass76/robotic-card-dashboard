import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { getErrorMessage } from '../../utils/errorHandler';

const ErrorMessage = ({
  error,
  onDismiss,
  onRetry,
  type = 'error',
  className = ''
}) => {
  const message = getErrorMessage(error);

  const typeClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`mb-4 p-4 ${typeClasses[type]} border rounded-lg flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2 flex-1">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm font-medium hover:underline ml-2"
          >
            إعادة المحاولة
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

