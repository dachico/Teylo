// components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'primary',
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  
  // Size classes
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3'
  };
  
  // Color classes
  const colorClasses = {
    primary: 'border-indigo-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-300 border-t-transparent'
  };
  
  // Text size classes
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };
  
  // Wrapper classes
  const wrapperClasses = fullScreen ? 
    'fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-50' : 
    'flex flex-col items-center justify-center';
  
  return (
    <div className={wrapperClasses}>
      <div 
        className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className={`mt-2 ${textSizeClasses[size]} text-gray-700`}>
          {text}
        </p>
      )}
    </div>
  );
}