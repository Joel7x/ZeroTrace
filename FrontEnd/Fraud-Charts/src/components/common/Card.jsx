import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn("glass rounded-xl p-6", className)} 
      {...props}
    >
      {children}
    </div>
  );
};
