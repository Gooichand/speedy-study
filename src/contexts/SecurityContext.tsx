
import React, { createContext, useContext, useState, useCallback } from 'react';

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
}

interface SecurityContextType {
  alerts: SecurityAlert[];
  addAlert: (type: SecurityAlert['type'], message: string) => void;
  clearAlerts: () => void;
  logSecurityEvent: (event: string, details?: any) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  const addAlert = useCallback((type: SecurityAlert['type'], message: string) => {
    const alert: SecurityAlert = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now()
    };
    
    setAlerts(prev => [...prev, alert]);
    
    // Auto-remove alerts after 10 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, 10000);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const logSecurityEvent = useCallback((event: string, details?: any) => {
    console.log(`[SECURITY] ${event}`, details || '');
    
    // In production, you might want to send this to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // monitoringService.log({ event, details, timestamp: Date.now() });
    }
  }, []);

  return (
    <SecurityContext.Provider value={{ alerts, addAlert, clearAlerts, logSecurityEvent }}>
      {children}
    </SecurityContext.Provider>
  );
};
