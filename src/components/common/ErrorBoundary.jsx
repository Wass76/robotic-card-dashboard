import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Log error details
    this.setState({
      errorInfo,
    });

    // In production, you could log to an error reporting service
    // Example: logErrorToService(error, errorInfo, this.state.errorId);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              حدث خطأ غير متوقع
            </h2>
            
            <p className="text-gray-600 mb-6">
              نعتذر، حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-sm font-semibold text-red-800 mb-2">تفاصيل الخطأ:</p>
                <p className="text-xs text-red-700 font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer">
                      مكونات المكدس
                    </summary>
                    <pre className="text-xs text-red-700 mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={this.handleReset}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </Button>
              
              <Button
                variant="secondary"
                onClick={this.handleReload}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة تحميل الصفحة
              </Button>
              
              <Button
                variant="secondary"
                onClick={this.handleGoHome}
                className="flex-1"
              >
                <Home className="w-4 h-4 ml-2" />
                الصفحة الرئيسية
              </Button>
            </div>

            {this.state.errorId && (
              <p className="text-xs text-gray-500 mt-4">
                معرف الخطأ: {this.state.errorId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

