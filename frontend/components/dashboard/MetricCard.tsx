import React, { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'amber' | 'indigo';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon,
  color = 'blue'
}) => {
  const colorStyles = {
    blue: {
      light: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800'
    },
    green: {
      light: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800'
    },
    red: {
      light: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800'
    },
    purple: {
      light: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800'
    },
    amber: {
      light: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800'
    },
    indigo: {
      light: 'bg-indigo-50 dark:bg-indigo-900/20',
      icon: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800'
    }
  };

  const selectedColor = colorStyles[color];

  return (
    <div className={`rounded-xl border ${selectedColor.border} bg-white dark:bg-gray-800 p-6 shadow-sm`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${selectedColor.light}`}>
          <div className={`${selectedColor.icon}`}>
            {icon}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </dt>
            <dd>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {value}
              </div>
            </dd>
          </dl>
        </div>
      </div>
      <div className="mt-4">
        <div className={`inline-flex items-center text-sm ${
          isPositive 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {change}
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">from last month</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
