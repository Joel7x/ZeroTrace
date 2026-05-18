import React, { useState } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Cpu, 
  FolderSearch, 
  Workflow,
  HelpCircle,
  Network
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Simulator from './components/Simulator';
import ClaimsDesk from './components/ClaimsDesk';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', name: 'Analytics Dashboard', icon: LayoutDashboard },
    { id: 'simulator', name: 'Live ML Simulator', icon: Cpu },
    { id: 'claims', name: 'Claims Explorer Desk', icon: FolderSearch }
  ];

  return (
    <div className="flex min-h-screen bg-[#050811] text-slate-100 antialiased font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[#090D1A]/90 border-r border-slate-800/80 backdrop-blur-md flex flex-col justify-between p-6 shrink-0 hidden md:flex">
        <div className="space-y-8">
          
          {/* Main Logo Header */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Shield className="h-6 w-6 text-blue-400 fill-blue-400/10" />
            </div>
            <div>
              <span className="text-lg font-extrabold block tracking-tight text-white">ZeroTrace</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Fraud Engine</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-md shadow-blue-500/5' 
                      : 'text-slate-400 hover:bg-slate-900/50 hover:text-white border border-transparent'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Details */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 space-y-2.5">
            <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase space-x-2">
              <Network className="h-3.5 w-3.5 text-blue-400" />
              <span>Pipeline Integration</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Backend Port</span>
                <span className="font-semibold text-white">8088</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ML Model</span>
                <span className="font-semibold text-emerald-400">Active</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 text-center font-medium">
            ZeroTrace Engine © v1.0.0
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Panel bar */}
        <header className="h-20 bg-[#090D1A]/50 border-b border-slate-800/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white m-0 p-0 leading-none">
              {navigation.find(n => n.id === activeTab).name}
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">ZeroTrace Real-Time Fraud Diagnostics & Machine Learning Operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
              <Workflow className="h-3.5 w-3.5 mr-1" />
              Model Loaded (1.8.0)
            </div>
          </div>
        </header>

        {/* Tab content viewer panel */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'simulator' && <Simulator />}
          {activeTab === 'claims' && <ClaimsDesk />}
        </div>
      </main>
    </div>
  );
}
