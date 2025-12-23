import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/common';
import { AuthProvider } from './context';
import { AppProvider } from './context';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
