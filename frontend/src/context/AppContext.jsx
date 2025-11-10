import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [processingVideos, setProcessingVideos] = useState({});

  const updateVideoProgress = (videoId, progress) => {
    setProcessingVideos(prev => ({
      ...prev,
      [videoId]: progress
    }));
  };

  return (
    <AppContext.Provider value={{ processingVideos, updateVideoProgress }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;