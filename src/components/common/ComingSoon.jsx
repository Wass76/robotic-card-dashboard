import React from 'react';

// eslint-disable-next-line no-unused-vars
const ComingSoon = ({ title, description, icon: Icon }) => {
  return (
    <div className="flex items-center justify-center min-h-96 fade-in">
      <div className="text-center">
        <div className="w-20 h-20 lg:w-24 lg:h-24 gradient-robotics rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
        </div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4 text-sm lg:text-base">{description}</p>
        <p className="text-xs lg:text-sm text-gray-500">هذا القسم قيد التطوير وسيكون متاحاً قريباً</p>
      </div>
    </div>
  );
};

export default ComingSoon;

