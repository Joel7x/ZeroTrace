import React, { useEffect, useRef } from 'react';
import { ChartWrapper } from '../common/ChartWrapper';
import { Network } from 'lucide-react';

const ProviderNetworkGraph = ({ loading }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (loading || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Static simulation of a network graph
    const nodes = [
      { id: 1, x: width * 0.5, y: height * 0.5, label: 'Main Hosp', color: '#ef4444', size: 8 },
      { id: 2, x: width * 0.3, y: height * 0.3, label: 'Dr. Smith', color: '#f59e0b', size: 5 },
      { id: 3, x: width * 0.7, y: height * 0.3, label: 'Dr. Jane', color: '#f59e0b', size: 5 },
      { id: 4, x: width * 0.4, y: height * 0.7, label: 'Pharmacy X', color: '#3b82f6', size: 6 },
      { id: 5, x: width * 0.6, y: height * 0.7, label: 'Clinic Y', color: '#3b82f6', size: 6 },
      { id: 6, x: width * 0.2, y: height * 0.5, label: 'Patient A', color: '#94a3b8', size: 3 },
      { id: 7, x: width * 0.8, y: height * 0.5, label: 'Patient B', color: '#94a3b8', size: 3 },
    ];

    const links = [
      { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4 }, { from: 1, to: 5 },
      { from: 2, to: 6 }, { from: 4, to: 6 }, { from: 3, to: 7 }, { from: 5, to: 7 },
      { from: 2, to: 4, alert: true } // Potential collusion link
    ];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw links
      links.forEach(link => {
        const fromNode = nodes.find(n => n.id === link.from);
        const toNode = nodes.find(n => n.id === link.to);
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = link.alert ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = link.alert ? 2 : 1;
        if (link.alert) ctx.setLineDash([5, 3]);
        else ctx.setLineDash([]);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = node.color;
        
        ctx.font = '10px Inter';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.size + 12);
      });
    };

    draw();
  }, [loading]);

  return (
    <ChartWrapper title="Provider Relation Graph" loading={loading}>
      <div className="relative h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[11px] text-muted italic">Detecting collusion rings & shared addresses.</p>
          <div className="flex gap-3 text-[9px] uppercase tracking-wider font-mono">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Flagged</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Suspicious</span>
          </div>
        </div>
        <div className="flex-1 bg-white/[0.02] rounded-xl border border-white/5 relative overflow-hidden group">
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={300} 
            className="w-full h-full cursor-crosshair group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-bg to-transparent opacity-40"></div>
          <div className="absolute bottom-3 left-3 flex gap-2">
            <button className="p-1.5 rounded bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors">
              <Network size={12} />
            </button>
          </div>
        </div>
      </div>
    </ChartWrapper>
  );
};

export default ProviderNetworkGraph;
