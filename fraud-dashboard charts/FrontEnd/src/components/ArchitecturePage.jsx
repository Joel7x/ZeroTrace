import React from 'react';

const ArchitecturePage = () => {
  return (
    <div className="space-y-6 animate-[fadeUp_0.3s_ease_both]">
      <header>
        <h2 className="text-[18px] font-bold mb-1">System Architecture</h2>
        <p className="text-[12px] text-muted">End-to-end flow from claim submission to investigator action.</p>
      </header>

      <div className="panel p-6">
        <div className="panel-header mb-6 !p-0 border-none"><span className="panel-title">Data Flow</span></div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollable">
          {[
            { label: 'Claim Input', desc: 'FHIR/EDI/CSV/API' },
            { label: 'Ingestion Layer', desc: 'Normalize + validate', cls: 'border-blue/30' },
            { label: 'Rule Engine', desc: '40+ deterministic rules', cls: 'border-amber/30' },
            { label: 'ML Scoring', desc: 'XGBoost anomaly', cls: 'border-purple-500/30' },
            { label: 'Claude Reasoning', desc: 'Explanation chain', cls: 'border-red/30' },
            { label: 'Dashboard + Alert', desc: 'Investigator action', cls: 'border-green/30' },
          ].map((step, idx, arr) => (
            <React.Fragment key={step.label}>
              <div className={`flex-shrink-0 bg-bg3 border rounded-md p-3 min-w-[140px] ${step.cls || 'border-border2'}`}>
                <div className="font-mono text-[11px] font-bold mb-1">{step.label}</div>
                <div className="text-[10px] text-muted">{step.desc}</div>
              </div>
              {idx < arr.length - 1 && <span className="text-amber">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Backend Services</span></div>
          <div className="p-4 space-y-3">
            {[
              { layer: 'API Gateway', stack: ['FastAPI', 'OAuth2', 'Rate limit'] },
              { layer: 'Rule Engine', stack: ['Python', 'Drools-style', 'Config YAML'] },
              { layer: 'ML Service', stack: ['scikit-learn', 'IsolationForest', 'XGBoost'] },
              { layer: 'AI Reasoning', stack: ['Claude Sonnet', 'Structured prompt'], highlight: true },
              { layer: 'Graph Engine', stack: ['NetworkX', 'Community detect'] },
            ].map((item) => (
              <div key={item.layer} className="flex items-center gap-4 py-2 border-b border-white/[0.03]">
                <div className="w-24 flex-shrink-0 uppercase tracking-wider text-[10px] text-muted">{item.layer}</div>
                <div className="flex flex-wrap gap-1.5">
                  {item.stack.map(s => (
                    <span key={s} className={`px-2 py-0.5 rounded bg-bg3 border border-border2 font-mono text-[11px] ${item.highlight && s === 'Claude Sonnet' ? 'text-amber border-amber/40' : ''}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><span className="panel-title">Data Layer</span></div>
          <div className="p-4 space-y-3">
            {[
              { layer: 'Claims DB', stack: ['PostgreSQL 16', 'JSONB flags'] },
              { layer: 'Cache', stack: ['Redis', 'Provider stats', 'TTL 1h'] },
              { layer: 'Benchmarks', stack: ['CMS fee schedule', 'CSV → Postgres'] },
              { layer: 'Audit Log', stack: ['Append-only table', 'HIPAA compliant'] },
              { layer: 'Infra', stack: ['Docker Compose', 'Nginx proxy'] },
            ].map((item) => (
              <div key={item.layer} className="flex items-center gap-4 py-2 border-b border-white/[0.03]">
                <div className="w-24 flex-shrink-0 uppercase tracking-wider text-[10px] text-muted">{item.layer}</div>
                <div className="flex flex-wrap gap-1.5">
                  {item.stack.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-bg3 border border-border2 font-mono text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitecturePage;
