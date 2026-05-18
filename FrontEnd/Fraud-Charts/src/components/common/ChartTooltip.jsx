import React from 'react';

export const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    if (formatter) {
      return formatter({ active, payload, label });
    }

    // Default formatting
    return (
      <div className="glass p-3 rounded-lg border border-gray-700/50 shadow-xl min-w-[150px]">
        {label && <p className="text-gray-300 font-medium mb-3 border-b border-gray-700/50 pb-2">{label}</p>}
        <div className="flex flex-col gap-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm text-gray-400 capitalize">{entry.name} Risk</span>
              </div>
              <span className="font-bold text-gray-100">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
