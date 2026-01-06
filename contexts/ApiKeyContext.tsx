import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isApiKeySet: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const STORAGE_KEY = 'gemini_api_key';

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  // 從 localStorage 載入 API Key
  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    if (savedKey) {
      setApiKeyState(savedKey);
    }
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem(STORAGE_KEY, key);
  };

  const clearApiKey = () => {
    setApiKeyState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: ApiKeyContextType = {
    apiKey,
    setApiKey,
    clearApiKey,
    isApiKeySet: !!apiKey,
  };

  return (
    <ApiKeyContext.Provider value={value}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};

