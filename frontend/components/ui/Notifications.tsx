// components/ui/Notifications.tsx
'use client';

import { useNotification } from '@/contexts/NotificationContext';
import { useEffect, useState } from 'react';

// Icons for different notification types
const icons = {
  success: (
    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

// Color classes for different notification types
const colorClasses = {
  success: 'bg-green-50 border-green-100',
  error: 'bg-red-50 border-red-100',
  warning: 'bg-yellow-50 border-yellow-100',
  info: 'bg-blue-50 border-blue-100'
};

// Text color classes for different notification types
const textColorClasses = {
  success: 'text-green-800',
  error: 'text-red-800',
  warning: 'text-yellow-800',
  info: 'text-blue-800'
};

export default function Notifications() {
  const { notifications, removeNotification } = useNotification();
  const [mounted, setMounted] = useState(false);

  // Only render on client side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-md w-full">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`${colorClasses[notification.type]} border rounded-lg p-4 shadow-md transform transition-all duration-300 hover:shadow-lg`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {icons[notification.type]}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${textColorClasses[notification.type]}`}>
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => removeNotification(notification.id)}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}