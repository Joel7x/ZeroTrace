import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, ShieldCheck, Activity } from 'lucide-react';
import FraudTrendChart from './dashboard/FraudTrendChart';
import RiskDistributionChart from './dashboard/RiskDistributionChart';
import PatternBreakdownChart from './dashboard/PatternBreakdownChart';
import ScoreDistributionChart from './dashboard/ScoreDistributionChart';
import FeatureImportanceChart from './dashboard/FeatureImportanceChart';
import ProviderNetworkGraph from './dashboard/ProviderNetworkGraph';
import FileUpload from './dashboard/FileUpload';
import { fetchFraudTrends, fetchSummaryMetrics, fetchPatternBreakdown } from '../services/chartApi';

const DashboardPage = ({ claims: initialClaims = [], onInspect }) => {
  const [claims, setClaims] = useState(initialClaims || []);
  const [trends, setTrends] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  const renderIcon = (Icon, props = {}) => {
    if (!Icon) return <div className="w-4 h-4 bg-white/10 rounded-full" />;
    return <Icon {...props} />;
  };

  useEffect(() => {
    console.log("DashboardPage: initialClaims changed", initialClaims);
    setClaims(initialClaims || []);
  }, [initialClaims]);

  const handleUploadSuccess = (newResults) => {
    if (!newResults) return;
    // Prepend new results to the claims feed
    const updatedResults = newResults.map(r => ({ ...r, isNew: true }));
    setClaims([...updatedResults, ...claims]);
  };

  useEffect(() => {
    const loadChartData = async () => {
      setChartsLoading(true);
      try {
        console.log("DashboardPage: Loading chart data...");
        const [trendsData, metricsData, patternsData] = await Promise.all([
          fetchFraudTrends(),
          fetchSummaryMetrics(),
          fetchPatternBreakdown()
        ]);
        setTrends(trendsData || []);
        setMetrics(metricsData);
        setPatterns(patternsData || []);
      } catch (error) {
        console.error("DashboardPage: Failed to load chart data:", error);
      } finally {
        setChartsLoading(false);
      }
    };
    loadChartData();
  }, []);

  if (!claims) return <div className="p-10 text-center text-muted">No claims data available.</div>;

  const totalClaims = (claims || []).length;
  const flaggedCount = (claims || []).filter(c => c && (c.score || c.riskScore || 0) > 70).length;
  const avgScore = totalClaims > 0 
    ? ((claims || []).reduce((acc, curr) => acc + (curr ? (curr.score || curr.riskScore || 0) : 0), 0) / totalClaims).toFixed(1) 
    : '0.0';

  const riskBadge = (score = 0) => {
    let cls = 'risk-low';
    if (score > 70) { cls = 'risk-high'; }
    else if (score > 40) { cls = 'risk-med'; }
    return <span className={`risk-badge ${cls}`}>{score || 0}</span>;
  };

  const scoreBar = (score = 0) => {
    let col = 'bg-green';
    if (score > 70) col = 'bg-red shadow-[0_0_8px_rgba(239,68,68,0.6)]';
    else if (score > 40) col = 'bg-amber shadow-[0_0_8px_rgba(245,158,11,0.6)]';
    else col = 'bg-green shadow-[0_0_8px_rgba(16,185,129,0.6)]';
    
    return (
      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden inline-block align-middle backdrop-blur-sm">
        <div className={`h-full rounded-full ${col}`} style={{ width: `${score || 0}%` }} />
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-[fadeUp_0.4s_ease_both]">
      {/* Header with Upload */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Overview</h2>
          <p className="text-sm text-muted">System-wide fraud metrics and live feed</p>
        </div>
        <FileUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="panel p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">{renderIcon(Activity, { size: 40 })}</div>
          <div className="text-[11px] text-white/50 uppercase tracking-[0.15em] mb-2">Claims Today</div>
          <div className="font-mono text-[28px] font-bold text-white mb-1 drop-shadow-md">{totalClaims.toLocaleString()}</div>
          <div className="text-[11px] text-white/40 mt-2 flex items-center gap-1.5">
            <span className="text-red flex items-center">{renderIcon(TrendingUp, { size: 12, className: "mr-0.5" })} 12%</span> vs yesterday
          </div>
        </div>
        <div className="panel p-5 relative overflow-hidden group border-red/20 hover:border-red/40 bg-red/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red">{renderIcon(AlertCircle, { size: 40 })}</div>
          <div className="text-[11px] text-red/60 uppercase tracking-[0.15em] mb-2">Flagged High Risk</div>
          <div className="font-mono text-[28px] font-bold text-red drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] mb-1">{flaggedCount}</div>
          <div className="text-[11px] text-white/40 mt-2 flex items-center gap-1.5">
            <span className="text-red flex items-center">{renderIcon(TrendingUp, { size: 12, className: "mr-0.5" })} 3</span> in last hour
          </div>
        </div>
        <div className="panel p-5 relative overflow-hidden group border-green/20 hover:border-green/40 bg-green/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green">{renderIcon(ShieldCheck, { size: 40 })}</div>
          <div className="text-[11px] text-green/60 uppercase tracking-[0.15em] mb-2">Fraud Prevented</div>
          <div className="font-mono text-[28px] font-bold text-green drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] mb-1">₹1.2Cr</div>
          <div className="text-[11px] text-white/40 mt-2 flex items-center gap-1.5">
            <span className="text-green flex items-center">{renderIcon(TrendingDown, { size: 12, className: "mr-0.5" })} saved</span> this month
          </div>
        </div>
        <div className="panel p-5 relative overflow-hidden group border-amber/20 hover:border-amber/40 bg-amber/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber">{renderIcon(Activity, { size: 40 })}</div>
          <div className="text-[11px] text-amber/60 uppercase tracking-[0.15em] mb-2">Avg Risk Score</div>
          <div className="font-mono text-[28px] font-bold text-amber drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] mb-1">{avgScore}</div>
          <div className="text-[11px] text-white/40 mt-2">across all claims</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics && (
          <RiskDistributionChart data={metrics} loading={chartsLoading} />
        )}
        {trends && trends.length > 0 && (
          <FraudTrendChart data={trends} loading={chartsLoading} />
        )}
        <div className="lg:col-span-2">
          <ScoreDistributionChart loading={chartsLoading} />
        </div>
        <FeatureImportanceChart loading={chartsLoading} />
        <ProviderNetworkGraph loading={chartsLoading} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Claims Feed */}
        <div className="panel col-span-2">
          <div className="panel-header">
            <span className="panel-title">Live Claims Feed</span>
            <button className="text-[11px] text-amber font-mono bg-transparent border-none cursor-pointer">
              Inspect claim →
            </button>
          </div>
          <div className="max-h-[320px] overflow-y-auto scrollable">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-bg2">
                <tr className="border-b border-border">
                  <th className="p-3 text-[10px] font-semibold text-muted uppercase tracking-[0.8px]">Claim ID</th>
                  <th className="p-3 text-[10px] font-semibold text-muted uppercase tracking-[0.8px]">Provider</th>
                  <th className="p-3 text-[10px] font-semibold text-muted uppercase tracking-[0.8px]">Amount</th>
                  <th className="p-3 text-[10px] font-semibold text-muted uppercase tracking-[0.8px]">ICD-10</th>
                  <th className="p-3 text-[10px] font-semibold text-muted uppercase tracking-[0.8px]">Risk</th>
                  <th className="p-3 text-[10px] font-semibold text-muted uppercase tracking-[0.8px]">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {claims.map((claim) => (
                  <tr 
                    key={claim.id} 
                    className={cn(
                      "hover:bg-white/[0.03] transition-colors cursor-pointer relative group",
                      claim.isNew && "bg-blue/5 border-l-2 border-blue/50"
                    )}
                    onClick={() => onInspect(claim.id)}
                  >
                    <td className="p-3 font-mono text-amber text-[11px] flex items-center gap-2">
                      #{claim.id}
                      {claim.isNew && <span className="px-1.5 py-0.5 rounded-[4px] bg-blue/20 text-blue-400 text-[8px] font-bold animate-pulse">NEW</span>}
                    </td>
                    <td className="p-3 text-[12px]">{claim.provider}</td>
                    <td className="p-3 font-mono text-[12px]">{claim.amount}</td>
                    <td className="p-3 font-mono text-muted text-[11px]">{claim.icd}</td>
                    <td className="p-3">{riskBadge(claim.score || claim.riskScore)}</td>
                    <td className="p-3">{scoreBar(claim.score || claim.riskScore)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-3">
          <PatternBreakdownChart data={patterns} loading={chartsLoading} />

          <div className="panel">
            <div className="panel-header"><span className="panel-title">Claims/hour</span></div>
            <div className="p-4">
              <div className="flex items-end gap-1 h-10">
                {[28,35,42,38,55,67,44,51,48,72,89,61].map((v, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-t-sm ${v > 70 ? 'bg-red/60' : v > 50 ? 'bg-amber/50' : 'bg-blue/40'}`} 
                    style={{ height: `${v/89*100}%` }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
