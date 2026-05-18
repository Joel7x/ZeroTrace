import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartWrapper } from '../common/ChartWrapper';
import { ChartTooltip } from '../common/ChartTooltip';

const CustomFormatter = ({ label, payload }) => (
  <div className="glass p-3 rounded-lg border border-gray-700/50 shadow-xl">
    <p className="text-gray-300 font-medium mb-1">Score Range: {label}</p>
    {payload.map((entry, index) => (
      <p key={index} className="text-xl font-bold" style={{ color: entry.color }}>
        {entry.value} <span className="text-sm font-normal text-gray-400">providers</span>
      </p>
    ))}
  </div>
);

const ScoreDistributionChart = ({ data, loading }) => {
  // If no data is provided, generate the "mountain and flat line" mock data
  const distributionData = data || [
    { range: '0-10', count: 15, color: '#22c55e' },
    { range: '10-20', count: 35, color: '#22c55e' },
    { range: '20-30', count: 85, color: '#22c55e' },
    { range: '30-40', count: 180, color: '#facc15' },
    { range: '40-50', count: 210, color: '#facc15' },
    { range: '50-60', count: 95, color: '#facc15' },
    { range: '60-70', count: 40, color: '#ef4444' },
    { range: '70-80', count: 15, color: '#ef4444' },
    { range: '80-90', count: 8, color: '#ef4444' },
    { range: '90-100', count: 4, color: '#ef4444' },
  ];

  return (
    <ChartWrapper title="Risk Score Distribution" loading={loading}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="range" 
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
          <Tooltip content={<ChartTooltip formatter={CustomFormatter} />} cursor={{ fill: '#334155', opacity: 0.1 }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {distributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default ScoreDistributionChart;
