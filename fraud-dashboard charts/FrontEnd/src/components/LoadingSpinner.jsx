import React from 'react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center gap-3">
    <div className="w-10 h-10 border-2 border-amber/20 border-t-amber rounded-full animate-spin"></div>
    <span className="text-[11px] text-muted font-mono tracking-wider">SYSTEM_INITIALIZING...</span>
  </div>
);

export default LoadingSpinner;
