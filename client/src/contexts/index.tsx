import React, { createContext, useState, ReactNode } from 'react';
import { ConfigManager } from './ConfigManager';

interface IContext {
  config: ConfigManager,
}

const config = new ConfigManager();

export const AppContext = createContext<IContext>({
  config: config
});

interface Props {
  children: ReactNode;
}

export const AppContextProvider: React.FC<Props> = ({ children }) => {
  const [configManager] = useState(config);

  const contextData = {
    config: configManager,
  }

  return (
    <AppContext.Provider value={contextData}>
      {children}
    </AppContext.Provider>
  );
};
