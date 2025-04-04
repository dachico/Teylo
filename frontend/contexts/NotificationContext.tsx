// frontend/contexts/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, timeout?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add a new notification
  const addNotification = useCallback((type: NotificationType, message: string, timeout = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setNotifications(prev => [...prev, { id, type, message }]);
    
    // Automatically remove notification after timeout
    if (timeout > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }
    
    return id;
  }, []);

  // Remove a notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use the notification context
export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
}