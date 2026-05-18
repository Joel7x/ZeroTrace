import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Info,
  Calendar,
  Activity,
  User,
  ShieldCheck,
  ShieldAlert,
  X,
  RefreshCw
} from 'lucide-react';

export default function ClaimsDesk() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClaims = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get('http://127.0.0.1:8088/api/v1/claims');
      setClaims(response.data);
    } catch (err) {
      console.error("Failed to load claims from database:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    // Refresh claims desk every 8 seconds automatically to sync live simulator injections
    const interval = setInterval(fetchClaims, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.ClaimID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.Provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.BeneID.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterLevel === "ALL" || claim.Level === filterLevel;

    return matchesSearch && matchesFilter;
  });

  const getBadgeClass = (level) => {
    if (level === "HIGH") return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    if (level === "MEDIUM") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  };

  return (
    <div className="space-y-6 relative">
      {/* Search and Filters Panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-6 glass-panel rounded-2xl">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by Claim ID, Provider, or Beneficiary ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button 
            onClick={fetchClaims}
            disabled={refreshing}
            className="p-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white rounded-xl transition duration-150 flex items-center space-x-1 text-xs"
            title="Refresh Database Claim list"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline">Sync DB</span>
          </button>
          
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk Only</option>
            <option value="LOW">Low Risk Only</option>
          </select>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <span>Querying live SQLite medicare dataset claims...</span>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Claim ID</th>
                  <th className="py-4 px-6">Provider</th>
                  <th className="py-4 px-6">Bene ID</th>
                  <th className="py-4 px-6">Reimbursed Amount</th>
                  <th className="py-4 px-6">Deductible</th>
                  <th className="py-4 px-6">Risk Rating</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredClaims.map((claim, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/35 transition duration-150">
                    <td className="py-4 px-6 font-semibold text-white">{claim.ClaimID}</td>
                    <td className="py-4 px-6 text-slate-400">{claim.Provider}</td>
                    <td className="py-4 px-6 text-slate-400">{claim.BeneID}</td>
                    <td className="py-4 px-6 font-medium text-white">₹{claim.Amount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-400">₹{claim.Deductible.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeClass(claim.Level)}`}>
                        {claim.Level} ({claim.Score}%)
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => setSelectedClaim(claim)}
                        className="inline-flex items-center text-xs font-bold text-blue-400 hover:text-blue-300 transition duration-150 hover:underline"
                      >
                        Audit Details <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredClaims.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            No matching claim records found in database.
          </div>
        )}
      </div>

      {/* Details Slide-out Panel Modal Drawer */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end animate-fadeIn">
          <div className="w-full max-w-lg h-full bg-[#090D1A]/95 border-l border-slate-800/80 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slideLeft">
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
                <div>
                  <h3 className="text-lg font-bold text-white">Audit Diagnostic Panel</h3>
                  <p className="text-xs text-slate-400">Deep inspection of Flagged Claim {selectedClaim.ClaimID}</p>
                </div>
                <button 
                  onClick={() => setSelectedClaim(null)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-xl text-slate-400 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Security Level Gauge Card */}
              <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                selectedClaim.Level === "HIGH" 
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                  : selectedClaim.Level === "MEDIUM"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Classification Level</span>
                  <span className="text-2xl font-extrabold">{selectedClaim.Level} RISK RATING</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Scoring Index</span>
                  <span className="text-3xl font-extrabold">{selectedClaim.Score}%</span>
                </div>
              </div>

              {/* Claim Metadata Information List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Claim Metadata</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl flex items-center space-x-3">
                    <User className="h-4 w-4 text-blue-400" />
                    <div>
                      <span className="block text-[9px] text-slate-500 font-bold uppercase">Beneficiary ID</span>
                      <span className="text-sm font-semibold text-white">{selectedClaim.BeneID}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-blue-400" />
                    <div>
                      <span className="block text-[9px] text-slate-500 font-bold uppercase">Provider Code</span>
                      <span className="text-sm font-semibold text-white">{selectedClaim.Provider}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Insc Reimbursed (₹)</span>
                    <span className="text-base font-extrabold text-white">₹{selectedClaim.Amount.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Deductible Paid (₹)</span>
                    <span className="text-base font-extrabold text-white">₹{selectedClaim.Deductible.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-800/40 rounded-xl space-y-2">
                  <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase space-x-2">
                    <Calendar className="h-3.5 w-3.5 text-blue-400" />
                    <span>Hospitalization Duration Timeline</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Admission Date</span>
                      <span className="font-semibold text-white">{selectedClaim.Admission}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Discharge Date</span>
                      <span className="font-semibold text-white">{selectedClaim.Discharge}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explainable AI Diagnosis */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Explainable AI (XAI) Reasons:</span>
                <p className="text-xs leading-relaxed text-slate-200 italic">{selectedClaim.Reason}</p>
              </div>
            </div>

            {/* Bottom Actions inside drawer */}
            <div className="pt-4 border-t border-slate-800/50 flex space-x-3">
              <button 
                onClick={() => setSelectedClaim(null)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl py-2.5 text-xs transition uppercase flex items-center justify-center space-x-1"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Auto-Approve Claim</span>
              </button>
              <button 
                onClick={() => setSelectedClaim(null)}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-2.5 text-xs transition uppercase flex items-center justify-center space-x-1"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Flag For Deep Audit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
