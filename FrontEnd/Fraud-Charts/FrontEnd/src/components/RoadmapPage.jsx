import React from 'react';

const RoadmapPage = () => {
  const roadmap = [
    {
      label: 'Day 1 AM',
      status: 'START HERE',
      tasks: [
        { title: 'Project scaffold + DB schema', desc: 'FastAPI backend · PostgreSQL · React frontend', icon: '✓', iconCls: 'bg-green/20 text-green border-green/30' },
        { title: 'Claims ingestion API', desc: 'POST /claims endpoint · CSV bulk upload', icon: '▶', iconCls: 'bg-amber/15 text-amber border-amber/30' },
        { title: 'Rule engine', desc: 'Duplicate detection · CPT benchmark lookup', icon: '○', iconCls: 'bg-white/5 text-muted border-border' },
      ]
    },
    {
      label: 'Day 1 PM',
      tasks: [
        { title: 'Risk scoring engine', desc: 'Weighted composite scorer', icon: '○', iconCls: 'bg-white/5 text-muted border-border' },
        { title: 'Claude API reasoning', desc: 'Feed claim + flags to Claude Sonnet 4', icon: '○', iconCls: 'bg-white/5 text-muted border-border' },
        { title: 'Provider velocity analysis', desc: 'Rolling 7/30/90 day claim counts', icon: '○', iconCls: 'bg-white/5 text-muted border-border' },
      ]
    },
    {
      label: 'Day 2 AM',
      tasks: [
        { title: 'Dashboard + live table', desc: 'React dashboard · WebSocket live feed', icon: '○', iconCls: 'bg-white/5 text-muted border-border' },
        { title: 'Claim Inspector view', desc: 'Full claim detail · AI reasoning chain', icon: '○', iconCls: 'bg-white/5 text-muted border-border' },
        { title: 'Provider network graph', desc: 'D3 force graph of relationships', icon: '○', iconCls: 'bg-white/5 text-muted border-border' },
      ]
    }
  ];

  return (
    <div className="grid grid-cols-[1fr_280px] gap-6 animate-[fadeUp_0.3s_ease_both]">
      <div>
        <header className="mb-6">
          <h2 className="text-[18px] font-bold mb-1">Hackathon Build Plan</h2>
          <p className="text-[12px] text-muted">Phased execution across 2 days. Ship a working demo.</p>
        </header>

        <div className="space-y-0">
          {roadmap.map((phase, pIdx) => (
            <div key={phase.label} className="relative grid grid-cols-[140px_1fr] border-l-2 border-border2">
              <div className="relative py-6 px-5 text-right font-mono text-[11px] font-bold text-muted border-r-2 border-border2">
                {phase.label.split(' ')[0]}<br/>{phase.label.split(' ')[1]}
                {phase.status && <div className="text-green text-[10px] mt-1">{phase.status}</div>}
                <div className="absolute right-[-6px] top-[22px] w-2.5 h-2.5 rounded-full bg-bg border-2 border-amber" />
              </div>
              <div className="py-4 px-6 space-y-2">
                {phase.tasks.map((task, tIdx) => (
                  <div key={tIdx} className="flex items-start gap-3 bg-bg3 border border-border p-3 rounded-md">
                    <div className={`w-4 h-4 rounded-sm flex items-center justify-center text-[10px] border flex-shrink-0 mt-0.5 ${task.iconCls}`}>
                      {task.icon}
                    </div>
                    <div>
                      <div className="text-[12px] font-medium">{task.title}</div>
                      <div className="text-[11px] text-muted mt-0.5">{task.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Tech Stack</span></div>
          <div className="p-4 space-y-4">
            {[
              { label: 'Frontend', stack: ['React 18', 'TypeScript', 'Tailwind'] },
              { label: 'Backend', stack: ['FastAPI', 'Python', 'Pydantic'] },
              { label: 'Database', stack: ['PostgreSQL', 'Redis'] },
              { label: 'AI / ML', stack: ['Claude API', 'scikit-learn'], highlight: true },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-[10px] uppercase tracking-widest text-muted mb-2">{item.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {item.stack.map(s => (
                    <span key={s} className={`px-2 py-1 rounded bg-bg3 border border-border2 font-mono text-[11px] ${item.highlight && s === 'Claude API' ? 'text-amber border-amber/40' : ''}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><span className="panel-title">Judge Talking Points</span></div>
          <div className="p-4 space-y-2.5">
            {[
              { text: '$300B lost to fraud annually — every insurer needs this', color: 'border-amber' },
              { text: 'Traceable flags build trust with investigators', color: 'border-blue' },
              { text: 'Real-time detection stops fraud before payout', color: 'border-green' },
            ].map((item, idx) => (
              <div key={idx} className={`p-2.5 bg-bg3 rounded text-[11px] leading-relaxed border-l-2 ${item.color}`}>
                "{item.text}"
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
