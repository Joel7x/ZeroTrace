import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

export const ChartWrapper = ({ title, loading, skeleton, children, className }) => {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {title && <h3 className="text-lg font-semibold text-gray-200 mb-6">{title}</h3>}
      {loading ? (
        skeleton || <div className="flex-1 flex items-center justify-center animate-pulse"><div className="w-full h-full bg-gray-800/50 rounded-lg"></div></div>
      ) : (
        <div className="flex-1 w-full min-h-[300px]">
          {children}
        </div>
      )}
    </Card>
  );
};
