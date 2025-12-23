import { createContext, useContext } from 'react';

const AppContext = createContext(null);

// AppContext is now minimal - data fetching is handled by React Query
// This context can be used for UI state if needed in the future
export const AppProvider = ({ children }) => {
  const value = {
    // Reserved for future UI state management if needed
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

