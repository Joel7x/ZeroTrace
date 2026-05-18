import React from 'react';
import { AlertCircle, TrendingUp, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

const InsightBanner = ({ className }) => {
  return (
    <div className={cn("glass rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-l-4 border-l-blue-500", className)}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <ShieldAlert className="text-blue-400 w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-200">System Insights</h3>
          <p className="text-xs text-gray-400">AI model detected an anomaly spike in orthopedic claims.</p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-2 text-xs">
          <TrendingUp className="text-red-400 w-4 h-4" />
          <span className="text-gray-300">High Risk Claims <span className="text-red-400 font-bold">+12%</span></span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <AlertCircle className="text-yellow-400 w-4 h-4" />
          <span className="text-gray-300">Flagged Providers <span className="text-yellow-400 font-bold">4</span></span>
        </div>
      </div>
    </div>
  );
};

export default InsightBanner;
