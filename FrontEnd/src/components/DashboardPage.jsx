import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, ShieldCheck, Activity } from 'lucide-react';

const DashboardPage = ({ claims, onInspect }) => {
  const totalClaims = claims.length;
  const flaggedCount = claims.filter(c => c.riskScore > 70).length;
  const avgScore = totalClaims > 0 
    ? (claims.reduce((acc, curr) => acc + curr.riskScore, 0) / totalClaims).toFixed(1) 
    : '0.0';

  const riskBadge = (score) => {
    let cls = 'risk-low';
    let label = 'LOW';
    if (score > 70) { cls = 'risk-high'; label = 'HIGH'; }
    else if (score > 40) { cls = 'risk-med'; label = 'MED'; }
    return <span className={`risk-badge ${cls}`}>{score}</span>;
  };

  const scoreBar = (score) => {
    let col = 'bg-green';
    if (score > 70) col = 'bg-red shadow-[0_0_8px_rgba(239,68,68,0.6)]';
    else if (score > 40) col = 'bg-amber shadow-[0_0_8px_rgba(245,158,11,0.6)]';
    else col = 'bg-green shadow-[0_0_8px_rgba(16,185,129,0.6)]';
    
    return (
      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden inline-block align-middle backdrop-blur-sm">
        <div className={`h-full rounded-full ${col}`} style={{ width: `${score}%` }} />
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-[fadeUp_0.4s_ease_both]">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="panel p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={40} /></div>
          <div className="text-[11px] text-white/50 uppercase tracking-[0.15em] mb-2">Claims Today</div>
          <div className="font-mono text-[28px] font-bold text-white mb-1 drop-shadow-md">{totalClaims.toLocaleString()}</div>
          <div className="text-[11px] text-white/40 mt-2 flex items-center gap-1.5">
            <span className="text-red flex items-center"><TrendingUp size={12} className="mr-0.5" /> 12%</span> vs yesterday
          </div>
        </div>
        <div className="panel p-5 relative overflow-hidden group border-red/20 hover:border-red/40 bg-red/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red"><AlertCircle size={40} /></div>
          <div className="text-[11px] text-red/60 uppercase tracking-[0.15em] mb-2">Flagged High Risk</div>
          <div className="font-mono text-[28px] font-bold text-red drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] mb-1">{flaggedCount}</div>
          <div className="text-[11px] text-white/40 mt-2 flex items-center gap-1.5">
            <span className="text-red flex items-center"><TrendingUp size={12} className="mr-0.5" /> 3</span> in last hour
          </div>
        </div>
        <div className="panel p-5 relative overflow-hidden group border-green/20 hover:border-green/40 bg-green/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green"><ShieldCheck size={40} /></div>
          <div className="text-[11px] text-green/60 uppercase tracking-[0.15em] mb-2">Fraud Prevented</div>
          <div className="font-mono text-[28px] font-bold text-green drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] mb-1">₹1.2Cr</div>
          <div className="text-[11px] text-white/40 mt-2 flex items-center gap-1.5">
            <span className="text-green flex items-center"><TrendingDown size={12} className="mr-0.5" /> saved</span> this month
          </div>
        </div>
        <div className="panel p-5 relative overflow-hidden group border-amber/20 hover:border-amber/40 bg-amber/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber"><Activity size={40} /></div>
          <div className="text-[11px] text-amber/60 uppercase tracking-[0.15em] mb-2">Avg Risk Score</div>
          <div className="font-mono text-[28px] font-bold text-amber drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] mb-1">{avgScore}</div>
          <div className="text-[11px] text-white/40 mt-2">across all claims</div>
        </div>
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
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => onInspect(claim.id)}
                  >
                    <td className="p-3 font-mono text-amber text-[11px]">#{claim.id}</td>
                    <td className="p-3 text-[12px]">{claim.provider}</td>
                    <td className="p-3 font-mono text-[12px]">{claim.amount}</td>
                    <td className="p-3 font-mono text-muted text-[11px]">{claim.procedureCode}</td>
                    <td className="p-3">{riskBadge(claim.riskScore)}</td>
                    <td className="p-3">{scoreBar(claim.riskScore)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-3">
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Risk Distribution</span></div>
            <div className="p-4 space-y-3">
              {[
                { label: 'High (>70)', val: flaggedCount, color: 'text-red', bg: 'bg-red', pct: (flaggedCount/totalClaims*100) || 0 },
                { label: 'Medium (40-70)', val: claims.filter(c => c.riskScore > 40 && c.riskScore <= 70).length, color: 'text-amber', bg: 'bg-amber', pct: (claims.filter(c => c.riskScore > 40 && c.riskScore <= 70).length/totalClaims*100) || 0 },
                { label: 'Low (<40)', val: claims.filter(c => c.riskScore <= 40).length, color: 'text-green', bg: 'bg-green', pct: (claims.filter(c => c.riskScore <= 40).length/totalClaims*100) || 0 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5 font-mono text-[11px]">
                    <span className={item.color}>{item.label}</span>
                    <span className={item.color}>{item.val} ({item.pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-1.5 bg-bg3 rounded-full overflow-hidden">
                    <div className={`h-full ${item.bg}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><span className="panel-title">Top Fraud Patterns</span></div>
            <div className="p-4 space-y-2.5">
              {[
                { label: 'Duplicate billing', val: 14, color: 'text-red' },
                { label: 'Upcoding', val: 9, color: 'text-red' },
                { label: 'Ghost patient', val: 6, color: 'text-amber' },
                { label: 'Phantom service', val: 5, color: 'text-amber' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-[11px]">
                  <span>{item.label}</span>
                  <span className={`font-mono ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
