import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartWrapper } from '../common/ChartWrapper';
import { ChartTooltip } from '../common/ChartTooltip';

const CustomFormatter = ({ label, payload }) => (
  <div className="glass p-3 rounded-lg border border-gray-700/50 shadow-xl">
    <p className="text-gray-300 font-medium mb-1">Feature: {label}</p>
    {payload.map((entry, index) => (
      <p key={index} className="text-sm font-bold" style={{ color: '#3b82f6' }}>
        Importance Weight: <span className="text-white">{(entry.value * 100).toFixed(1)}%</span>
      </p>
    ))}
  </div>
);

const FeatureImportanceChart = ({ loading }) => {
  const data = [
    { feature: 'Billing Amount', weight: 0.35 },
    { feature: 'Procedure Frequency', weight: 0.25 },
    { feature: 'Provider History', weight: 0.18 },
    { feature: 'Patient Location', weight: 0.12 },
    { feature: 'Service Code Match', weight: 0.10 },
  ];

  return (
    <ChartWrapper title="ML Model: Feature Importance" loading={loading}>
      <div className="h-full flex flex-col">
        <p className="text-[11px] text-muted mb-4 px-1 italic">
          What the AI looks at most when detecting fraud.
        </p>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="feature" 
                type="category" 
                stroke="#94a3b8" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip content={<ChartTooltip formatter={CustomFormatter} />} cursor={{ fill: '#334155', opacity: 0.1 }} />
              <Bar dataKey="weight" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fillOpacity={1 - (index * 0.15)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartWrapper>
  );
};

export default FeatureImportanceChart;
