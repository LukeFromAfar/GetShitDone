import { createContext, useState, useContext } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);

  return (
    <UIContext.Provider value={{ 
      isTaskPanelOpen, 
      setIsTaskPanelOpen 
    }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);