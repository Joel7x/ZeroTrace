import React from 'react';
import { Activity, AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '../common/Card';
import { formatNumber } from '../../utils/formatters';
import { cn } from '../../utils/cn';

const CardSkeleton = () => (
  <Card className="animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-4 w-24 bg-gray-700 rounded"></div>
      <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
    </div>
    <div className="h-8 w-16 bg-gray-700 rounded mb-2"></div>
    <div className="h-3 w-32 bg-gray-700 rounded"></div>
  </Card>
);

const SummaryCards = ({ metrics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Claims',
      value: metrics.total || 0,
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20',
      trend: '+14% from last week'
    },
    {
      title: 'High Risk',
      value: metrics.highRisk || 0,
      icon: AlertOctagon,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      trend: '+2% from last week'
    },
    {
      title: 'Medium Risk',
      value: metrics.mediumRisk || 0,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20',
      trend: '-5% from last week'
    },
    {
      title: 'Low Risk',
      value: metrics.lowRisk || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      trend: '+10% from last week'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card 
            key={idx} 
            className={cn(
              "transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg cursor-pointer group",
              "border", card.borderColor,
              "hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{card.title}</h3>
              <div className={cn("p-2 rounded-lg transition-colors", card.bgColor)}>
                <Icon className={cn("w-5 h-5", card.color)} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-gray-100">{formatNumber(card.value)}</span>
              <span className="text-xs text-gray-500">{card.trend}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default SummaryCards;
