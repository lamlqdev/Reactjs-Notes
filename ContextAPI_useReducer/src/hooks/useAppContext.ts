import { useContext } from 'react';
import { AppContext, AppContextValue } from '../context/AppContext';

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}

