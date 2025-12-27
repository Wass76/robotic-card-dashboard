import React from 'react';
import { CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import { useUnknownCardsQuery } from '../hooks';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../../components/common/ErrorMessage';
import Button from '../../../../components/common/Button';

const UnknownCards = () => {
  const { 
    data: unknownCards = [], 
    isLoading, 
    error, 
    refetch 
  } = useUnknownCardsQuery();

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">بطاقات جديدة</h2>
          <p className="text-sm text-gray-600 mt-1">
            بطاقات تم مسحها ولكن غير مسجلة في النظام
          </p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage 
          error={error.message || 'فشل في تحميل البطاقات غير المعروفة'} 
          onDismiss={() => {}} 
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="card">
          <div className="p-8">
            <LoadingSpinner message="جاري تحميل البطاقات غير المعروفة..." />
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="p-4 lg:p-6">
            {unknownCards.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  لا توجد بطاقات غير معروفة
                </p>
                <p className="text-sm text-gray-600">
                  جميع البطاقات المسحوبة مسجلة في النظام
                </p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      تم العثور على {unknownCards.length} بطاقة غير معروفة
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      هذه البطاقات تم مسحها ولكنها غير مسجلة في النظام. يرجى مراجعة هذه البطاقات وإضافتها إذا لزم الأمر.
                    </p>
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3">
                  {unknownCards.map((code, index) => (
                    <div 
                      key={`unknown-card-${index}-${code}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 gradient-robotics rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                          <CreditCard className="w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm lg:text-base">
                            رمز البطاقة: {code}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            بطاقة غير مسجلة
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚠️ غير معروفة
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnknownCards;

