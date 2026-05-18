import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({ level, className }) => {
  const styles = {
    High: 'bg-red-500/10 text-red-400 border-red-500/20',
    Medium: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    Low: 'bg-green-500/10 text-green-400 border-green-500/20',
    default: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  };

  const selectedStyle = styles[level] || styles.default;

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", selectedStyle, className)}>
      {level}
    </span>
  );
};
