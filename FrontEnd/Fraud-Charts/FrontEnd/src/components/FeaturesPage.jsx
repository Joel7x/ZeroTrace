import React from 'react';

const FeaturesPage = () => {
  const features = [
    { title: 'Multi-Layer Risk Scoring', desc: 'Composite 0–100 score across billing anomaly, provider pattern, network analysis, and temporal signals.', icon: '🎯', tag: 'AI-powered', tagCls: 'bg-purple-500/15 text-purple-400' },
    { title: 'Traceable AI Reasoning', desc: 'Claude API generates step-by-step reasoning chains for every flagged claim. Investigators see exactly why.', icon: '🧠', tag: 'Claude API', tagCls: 'bg-purple-500/15 text-purple-400' },
    { title: 'Universal Claims Ingestion', desc: 'Parses HL7 FHIR R4, EDI 837, CSV batch uploads, and REST API submissions.', icon: '📥', tag: 'Core', tagCls: 'bg-green-500/15 text-green-400' },
    { title: 'Provider Network Graph', desc: 'Neo4j-powered graph detects collusion rings, shared billing addresses, and referral anomalies.', icon: '🕸️', tag: 'Graph ML', tagCls: 'bg-purple-500/15 text-purple-400' },
    { title: 'Temporal Pattern Engine', desc: 'Detects billing velocity spikes, impossible same-day duplicates, and seasonal fraud patterns.', icon: '⏱️', tag: 'Real-time', tagCls: 'bg-amber-500/15 text-amber-400' },
    { title: 'CPT/ICD Benchmark Engine', desc: 'Compares every claim against CMS fee schedule benchmarks and specialty-specific norms.', icon: '📊', tag: 'Core', tagCls: 'bg-green-500/15 text-green-400' },
  ];

  return (
    <div className="space-y-6 animate-[fadeUp_0.3s_ease_both]">
      <header>
        <h2 className="text-[18px] font-bold mb-1">Platform Features</h2>
        <p className="text-[12px] text-muted">Every flag is explainable. Every decision is auditable.</p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {features.map((f) => (
          <div key={f.title} className="panel p-5 hover:border-border2 transition-colors group">
            <div className="w-9 h-9 rounded-md bg-white/[0.05] flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
              {f.icon}
            </div>
            <h3 className="text-[13px] font-bold mb-1.5">{f.title}</h3>
            <p className="text-[11px] text-muted leading-relaxed mb-3">{f.desc}</p>
            <span className={`px-2 py-0.5 rounded-[3px] font-mono text-[10px] ${f.tagCls}`}>
              {f.tag}
            </span>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header"><span className="panel-title">Winning Differentiators</span></div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { title: '🔍 Full Explainability', desc: 'Every flag has a numbered reasoning chain. Investigators see the evidence. Regulators love this.', color: 'border-amber/20' },
            { title: '📡 Real-time, not batch', desc: 'Most fraud detection runs overnight. ClaimGuard flags suspicious claims before payment clears.', color: 'border-blue/20' },
            { title: '🕸️ Graph-based network analysis', desc: 'Rule-based systems miss collusion rings. Graph ML finds coordinated fraud.', color: 'border-green/20' },
            { title: '🔌 Zero-integration design', desc: 'Reads existing claim formats (FHIR, EDI 837) without schema changes.', color: 'border-purple-500/20' },
          ].map((item) => (
            <div key={item.title} className={`p-4 bg-bg3 rounded-md border ${item.color}`}>
              <div className="text-[12px] font-bold text-text mb-1">{item.title}</div>
              <p className="text-[11px] text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
