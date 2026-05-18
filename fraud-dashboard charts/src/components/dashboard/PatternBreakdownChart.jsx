import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartWrapper } from '../common/ChartWrapper';
import { ChartTooltip } from '../common/ChartTooltip';

const CustomFormatter = ({ label, payload }) => (
  <div className="glass p-3 rounded-lg border border-gray-700/50 shadow-xl">
    <p className="text-gray-300 font-medium mb-2">{label}</p>
    {payload.map((entry, index) => (
      <p key={index} className="text-sm font-bold flex justify-between gap-4" style={{ color: entry.color }}>
        <span>{entry.name}:</span>
        <span>{entry.value}</span>
      </p>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="w-full h-[300px] flex items-end justify-between gap-4 p-4 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="w-full flex gap-1 h-full items-end">
        <div className="w-1/2 bg-blue-500/20 rounded-t" style={{ height: `${Math.random() * 60 + 40}%` }}></div>
        <div className="w-1/2 bg-red-500/20 rounded-t" style={{ height: `${Math.random() * 30 + 10}%` }}></div>
      </div>
    ))}
  </div>
);

const PatternBreakdownChart = ({ data, loading }) => {
  return (
    <ChartWrapper title="Provider Claim Patterns" loading={loading} skeleton={<ChartSkeleton />}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            dataKey="entity" 
            type="category"
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<ChartTooltip formatter={CustomFormatter} />} cursor={{ fill: '#334155', opacity: 0.2 }} />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          <Bar 
            dataKey="claims" 
            name="Total Claims" 
            fill="#3b82f6" 
            radius={[0, 4, 4, 0]}
            barSize={12}
          />
          <Bar 
            dataKey="flagged" 
            name="Flagged (Risk)" 
            fill="#ef4444" 
            radius={[0, 4, 4, 0]}
            barSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default PatternBreakdownChart;
