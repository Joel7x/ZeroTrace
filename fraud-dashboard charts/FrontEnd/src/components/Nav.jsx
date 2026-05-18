import React from 'react';
import { LayoutDashboard, FileSearch, Sparkles, Map, Network } from 'lucide-react';

const Nav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'claim', label: 'Claim Inspector', icon: FileSearch },
    { id: 'features', label: 'Features', icon: Sparkles },
  ];

  return (
    <div className="nav flex gap-2 px-6 pt-3 pb-0 bg-transparent border-b border-white/10 relative z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-[12px] font-bold tracking-wider transition-all duration-300 font-sans uppercase rounded-t-xl relative overflow-hidden group ${
              isActive
                ? 'text-amber bg-white/5 border-b-2 border-amber'
                : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02] border-b-2 border-transparent'
            }`}
          >
            {isActive && <div className="absolute inset-0 bg-gradient-to-t from-amber/10 to-transparent pointer-events-none"></div>}
            <Icon size={14} className={isActive ? 'text-amber' : 'text-white/40 group-hover:text-white/60'} />
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Nav;
