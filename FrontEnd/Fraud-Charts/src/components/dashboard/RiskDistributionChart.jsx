import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartWrapper } from '../common/ChartWrapper';
import { ChartTooltip } from '../common/ChartTooltip';
import { useFilters } from '../../context/FilterContext';
import { formatNumber } from '../../utils/formatters';

const COLORS = {
  High: '#ef4444',
  Medium: '#facc15',
  Low: '#22c55e'
};

const CustomFormatter = ({ payload }) => (
  <div className="glass p-3 rounded-lg border border-gray-700/50 shadow-xl">
    <p className="text-gray-300 font-medium mb-1">{payload[0].name} Risk</p>
    <p className="text-xl font-bold" style={{ color: payload[0].payload.color }}>
      {formatNumber(payload[0].value)} <span className="text-sm font-normal text-gray-400">claims</span>
    </p>
  </div>
);

const ChartSkeleton = () => (
  <div className="w-full h-[300px] flex items-center justify-center animate-pulse">
    <div className="w-48 h-48 rounded-full border-[16px] border-gray-700/50"></div>
  </div>
);

const RiskDistributionChart = ({ data, loading }) => {
  const { toggleRiskFilter, activeRiskFilter } = useFilters();

  const chartData = data ? [
    { name: 'High', value: data.highRisk, color: COLORS.High },
    { name: 'Medium', value: data.mediumRisk, color: COLORS.Medium },
    { name: 'Low', value: data.lowRisk, color: COLORS.Low },
  ].filter(d => d.value > 0) : [];

  return (
    <ChartWrapper title="Risk Distribution" loading={loading} skeleton={<ChartSkeleton />}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={5}
            dataKey="value"
            onClick={(entry) => toggleRiskFilter(entry.name)}
            className="cursor-pointer"
            stroke="none"
          >
            {chartData.map((entry, index) => {
              const isSelected = activeRiskFilter === entry.name;
              const opacity = !activeRiskFilter || isSelected ? 1 : 0.3;
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="transition-all duration-300 hover:opacity-80 outline-none"
                  style={{ 
                    filter: `drop-shadow(0px 0px ${isSelected ? '12px' : '8px'} ${entry.color}40)`,
                    opacity 
                  }}
                />
              );
            })}
          </Pie>
          <Tooltip content={<ChartTooltip formatter={CustomFormatter} />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value, entry) => (
              <span className="text-gray-300 ml-1">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default RiskDistributionChart;
