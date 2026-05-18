import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartWrapper } from '../common/ChartWrapper';
import { ChartTooltip } from '../common/ChartTooltip';

const ChartSkeleton = () => (
  <div className="w-full h-[300px] flex items-end justify-between gap-2 p-4 animate-pulse">
    {[...Array(7)].map((_, i) => (
      <div key={i} className="w-full flex flex-col justify-end gap-1 h-full">
        <div className="w-full bg-red-500/20 rounded-t" style={{ height: `${Math.random() * 30 + 10}%` }}></div>
        <div className="w-full bg-yellow-400/20" style={{ height: `${Math.random() * 40 + 20}%` }}></div>
        <div className="w-full bg-green-500/20" style={{ height: `${Math.random() * 30 + 20}%` }}></div>
      </div>
    ))}
  </div>
);

const FraudTrendChart = ({ data, loading }) => {
  return (
    <ChartWrapper 
      title="Fraud Trends Over Time" 
      loading={loading} 
      skeleton={<ChartSkeleton />}
      className="lg:col-span-2"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '5 5' }} />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          <Line 
            type="monotone" 
            dataKey="high" 
            name="High"
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
            style={{ filter: 'drop-shadow(0px 4px 6px rgba(239,68,68,0.3))' }}
          />
          <Line 
            type="monotone" 
            dataKey="medium" 
            name="Medium"
            stroke="#facc15" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#facc15' }}
          />
          <Line 
            type="monotone" 
            dataKey="low" 
            name="Low"
            stroke="#22c55e" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#22c55e' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default FraudTrendChart;
