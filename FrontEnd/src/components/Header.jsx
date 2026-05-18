import React from 'react';
import { ShieldAlert } from 'lucide-react';

const Header = () => {
  return (
    <div className="header bg-[#111827]/70 backdrop-blur-xl border-b border-white/10 px-6 flex items-center h-[60px] gap-5 sticky top-0 z-[100] shadow-sm">
      <div className="logo flex items-center gap-3 font-mono text-[14px] font-bold tracking-widest text-white">
        <div className="logo-icon w-8 h-8 rounded-lg bg-gradient-to-br from-red to-amber flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)] relative">
          <ShieldAlert size={16} className="text-white" />
          <div className="absolute inset-0 rounded-lg border border-white/20"></div>
        </div>
        <div className="flex flex-col">
          <span>CLAIMGUARD <span className="text-amber">AI</span></span>
        </div>
      </div>
      <div className="h-6 w-px bg-white/10"></div>
      <span className="text-white/50 text-[11px] font-mono tracking-widest uppercase">Healthcare Fraud Detection Platform</span>

    </div>
  );
};

export default Header;
