import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * Simple error fallback component for inline errors
 */
export const ErrorFallback = ({ error, resetError }) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg" dir="rtl">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            حدث خطأ
          </h3>
          <p className="text-sm text-red-700 mb-3">
            {error?.message || 'حدث خطأ غير متوقع'}
          </p>
          {resetError && (
            <Button
              variant="secondary"
              onClick={resetError}
              className="text-sm py-1.5 px-3"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

