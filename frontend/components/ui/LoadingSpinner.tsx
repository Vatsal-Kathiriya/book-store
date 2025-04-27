// filepath: d:\SEM 6 Projects\AWP\Book-Store_management\book-store-management\frontend\components\ui\LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-primary-600 dark:border-primary-400',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 ${color}`}></div>
    </div>
  );
};

export default LoadingSpinner;