import React, { useState, useEffect } from 'react';
import { fetchClaims, fetchFraudTrends, fetchPatternBreakdown, fetchSummaryMetrics } from '../services/api';
import InsightBanner from '../components/dashboard/InsightBanner';
import SummaryCards from '../components/dashboard/SummaryCards';
import RiskDistributionChart from '../components/dashboard/RiskDistributionChart';
import FraudTrendChart from '../components/dashboard/FraudTrendChart';
import PatternBreakdownChart from '../components/dashboard/PatternBreakdownChart';
import AuditTable from '../components/dashboard/AuditTable';
import { FilterProvider } from '../context/FilterContext';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({});
  const [claims, setClaims] = useState([]);
  const [trends, setTrends] = useState([]);
  const [patterns, setPatterns] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [metricsData, claimsData, trendsData, patternsData] = await Promise.all([
          fetchSummaryMetrics(),
          fetchClaims(),
          fetchFraudTrends(),
          fetchPatternBreakdown()
        ]);
        
        setMetrics(metricsData);
        setClaims(claimsData);
        setTrends(trendsData);
        setPatterns(patternsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <FilterProvider>
      <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-100 tracking-tight">Fraud Analytics</h1>
              <p className="text-sm text-gray-400 mt-1">Real-time monitoring and anomaly detection</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg border border-gray-700 transition-colors">
                Export Report
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                Run AI Scan
              </button>
            </div>
          </div>

          {/* Insight Banner */}
          <InsightBanner />

          {/* Summary Cards */}
          <SummaryCards metrics={metrics} loading={loading} />

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RiskDistributionChart data={metrics} loading={loading} />
            <FraudTrendChart data={trends} loading={loading} />
          </div>

          {/* Lower Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <PatternBreakdownChart data={patterns} loading={loading} />
            </div>
            <AuditTable claims={claims} loading={loading} />
          </div>
        </div>
      </div>
    </FilterProvider>
  );
};

export default Dashboard;
