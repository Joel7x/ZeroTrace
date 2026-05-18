import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from './LoadingSpinner';

const ClaimInspectorPage = ({ claimId, onSelectClaim, claims }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!claimId) return;
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const selected = claims.find(c => c.id === claimId);
      if (selected) {
        // Mock detailed data based on the claim
        setData({
          ...selected,
          patientName: 'MBR-**' + Math.floor(Math.random() * 9000 + 1000),
          date: '2024-05-14',
          status: 'PENDING_REVIEW',
          flagReasons: [
            `Extreme overbilling vs benchmark: Procedure ${selected.icd} billed at ${selected.amount} which is vastly above normal distribution.`,
            `Provider velocity spike: 340% increase in billing volume over 7 days.`,
            `Shared NPI cluster: Network analysis shows association with known flagged entities.`,
            `Temporal check: Service date is plausible, but surrounding patterns are erratic.`,
            `Verdict: Composite score ${selected.score || selected.riskScore}/100. Recommend hold on payment.`
          ]
        });
      }
      setLoading(false);
    }, 600);
  }, [claimId, claims]);

  if (loading) return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
  if (!data) return <div className="p-20 text-center text-muted">Select a claim to inspect</div>;

  const scoreColor = data.riskScore > 70 ? 'text-red' : data.riskScore > 40 ? 'text-amber' : 'text-green';
  const scoreRingBorder = data.riskScore > 70 ? 'border-red' : data.riskScore > 40 ? 'border-amber' : 'border-green';

  return (
    <div className="grid grid-cols-[300px_1fr] gap-4 animate-[fadeUp_0.3s_ease_both]">
      {/* Left Sidebar: Score & Details */}
      <div className="space-y-3">
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Risk Score</span></div>
          <div className="p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-3 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border-4 opacity-10 ${scoreRingBorder}`} />
              <div className={`absolute inset-0 rounded-full border-4 ${scoreRingBorder}`} style={{ clipPath: `polygon(0 0, 100% 0, 100% ${data.riskScore}%, 0 ${data.riskScore}%)` }} />
              <div className="flex flex-col items-center">
                <span className={`font-mono text-2xl font-bold ${scoreColor}`}>{data.riskScore}</span>
                <span className="text-[10px] text-muted">/ 100</span>
              </div>
            </div>
            <div className={`risk-badge mb-2 ${data.riskScore > 70 ? 'risk-high' : data.riskScore > 40 ? 'risk-med' : 'risk-low'}`}>
              {data.riskScore > 70 ? '⚠ HIGH RISK' : data.riskScore > 40 ? 'MODERATE RISK' : 'LOW RISK'}
            </div>
            <div className="text-[11px] text-muted mt-2">Auto-escalated to investigator</div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><span className="panel-title">Claim Details</span></div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Claim ID', val: `#${data.id}`, cls: 'text-amber' },
              { label: 'Provider', val: data.provider },
              { label: 'Patient', val: data.patientName },
              { label: 'Service Date', val: data.date },
              { label: 'Billed', val: `${data.amount.toLocaleString()}`, cls: 'text-red font-bold' },
              { label: 'Procedure', val: data.procedureCode },
              { label: 'Status', val: data.status },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-1 border-b border-white/[0.03] text-[12px]">
                <span className="text-muted">{item.label}</span>
                <span className={`font-mono ${item.cls || 'text-text'}`}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><span className="panel-title">Score Breakdown</span></div>
          <div className="p-4 space-y-3">
            {[
              { label: 'Billing anomaly', score: 38, max: 40, color: 'bg-red' },
              { label: 'Provider pattern', score: 24, max: 30, color: 'bg-amber' },
              { label: 'Network anomaly', score: 18, max: 20, color: 'bg-amber' },
              { label: 'Temporal pattern', score: 7, max: 10, color: 'bg-green' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1 font-mono text-[11px]">
                  <span>{item.label}</span>
                  <span className="text-muted">{item.score}/{item.max}</span>
                </div>
                <div className="h-1 bg-bg3 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${(item.score/item.max)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: Reasoning Chain & Similar Cases */}
      <div className="space-y-3">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">AI Reasoning Chain</span>
            <span className="text-[10px] text-green font-mono">✓ FULLY TRACEABLE</span>
          </div>
          <div className="p-5 max-h-[500px] overflow-y-auto scrollable">
            <div className="space-y-0">
              {data.flagReasons?.map((reason, idx) => {
                const colors = [
                  { bg: 'bg-red/15', text: 'text-red', border: 'border-red/30' },
                  { bg: 'bg-amber/15', text: 'text-amber', border: 'border-amber/30' },
                  { bg: 'bg-amber/15', text: 'text-amber', border: 'border-amber/30' },
                  { bg: 'bg-green/15', text: 'text-green', border: 'border-green/30' },
                  { bg: 'bg-red/15', text: 'text-red', border: 'border-red/30' },
                ];
                const color = colors[idx % colors.length];
                return (
                  <div key={idx} className="relative grid grid-cols-[36px_1fr] gap-4">
                    {/* Connector line */}
                    {idx < data.flagReasons.length - 1 && (
                      <div className="absolute left-[17px] top-9 bottom-0 w-[1px] bg-border2" />
                    )}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-[12px] font-bold border ${color.bg} ${color.text} ${color.border}`}>
                      {idx + 1}
                    </div>
                    <div className="pb-6">
                      <div className="text-[12px] font-bold mb-1">{reason.split(':')[0] || 'Flag Detected'}</div>
                      <div className="text-[11px] text-muted leading-relaxed">
                        {reason.split(':')[1] || reason}
                      </div>
                      <div className="inline-block mt-2 px-2.5 py-1 bg-bg3 border border-border2 rounded font-mono text-[10px] text-amber">
                        evidence_id = CL-X{idx} · status = FLAG_ACTIVE
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><span className="panel-title">Similar Historical Cases</span></div>
          <div className="p-4">
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="text-muted border-b border-border">
                  <th className="pb-2">Case ID</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Outcome</th>
                  <th className="pb-2">Recovered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {[
                  { id: 'CLM-2024-6120', score: 91, outcome: 'Confirmed fraud', recovered: '₹22,100', color: 'text-red' },
                  { id: 'CLM-2024-3891', score: 83, outcome: 'Confirmed fraud', recovered: '₹17,400', color: 'text-red' },
                  { id: 'CLM-2024-1122', score: 71, outcome: 'Upcoding found', recovered: '₹9,800', color: 'text-amber' },
                ].map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-mono">#{item.id}</td>
                    <td className="py-2"><span className="risk-badge risk-high">{item.score}</span></td>
                    <td className={`py-2 ${item.color}`}>{item.outcome}</td>
                    <td className="py-2 font-mono text-green">{item.recovered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimInspectorPage;
