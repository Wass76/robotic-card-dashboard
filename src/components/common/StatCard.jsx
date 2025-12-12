import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'gradient-robotics',
  trend,
  className = ''
}) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs lg:text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 lg:w-16 lg:h-16 ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center">
          <TrendingUp className="w-4 h-4 text-green-500 ml-1" />
          <span className="text-xs lg:text-sm text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

