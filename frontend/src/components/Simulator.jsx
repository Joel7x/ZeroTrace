import React, { useState } from 'react';
import axios from 'axios';
import { 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  HelpCircle, 
  Calendar, 
  DollarSign, 
  FileText,
  AlertCircle
} from 'lucide-react';

const PRESETS = {
  low: {
    Provider: "PRV51001",
    BeneID: "BENE11001",
    ClaimID: "CLM10001",
    InscClaimAmtReimbursed: 500,
    DeductibleAmtPaid: 0,
    AdmissionDt: "2020-01-10",
    DischargeDt: "2020-01-12"
  },
  high: {
    Provider: "PRV55912",
    BeneID: "BENE99999",
    ClaimID: "CLM99999",
    InscClaimAmtReimbursed: 35000,
    DeductibleAmtPaid: 1068,
    AdmissionDt: "2020-01-01",
    DischargeDt: "2020-02-15"
  }
};

export default function Simulator() {
  const [formData, setFormData] = useState({
    Provider: "PRV55912",
    BeneID: "BENE11001",
    ClaimID: "CLM0001",
    InscClaimAmtReimbursed: 15000,
    DeductibleAmtPaid: 1068,
    AdmissionDt: "2020-01-01",
    DischargeDt: "2020-01-15"
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const loadPreset = (type) => {
    setFormData(PRESETS[type]);
    setResult(null);
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("Amt") ? parseFloat(value) || 0 : value
    }));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // POST payload to the FastAPI backend analyze route
      const response = await axios.post("http://127.0.0.1:8088/api/v1/claims/analyze", formData);
      if (response.data && response.data.status === "success") {
        setResult(response.data);
      } else {
        setError("Error parsing API response data.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reach FastAPI backend server. Ensure backend is running on port 8088!");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColors = (level, score) => {
    if (score > 70 || level === "HIGH") {
      return {
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        text: "text-rose-400",
        glow: "shadow-rose-500/20",
        bar: "bg-rose-500"
      };
    }
    if (score > 30 || level === "MEDIUM") {
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-400",
        glow: "shadow-amber-500/20",
        bar: "bg-amber-500"
      };
    }
    return {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      glow: "shadow-emerald-500/20",
      bar: "bg-emerald-500"
    };
  };

  const activeColors = result ? getRiskColors(result.risk_level, result.risk_score) : null;

  return (
    <div className="space-y-6">
      {/* Header section with Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 glass-panel rounded-2xl">
        <div>
          <h3 className="text-lg font-semibold text-white">Live Claim Simulator</h3>
          <p className="text-xs text-slate-400">Inject raw claim data records directly into the active Isolation Forest model</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => loadPreset('low')}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold transition"
          >
            Load Safe Profile
          </button>
          <button 
            onClick={() => loadPreset('high')}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition"
          >
            Load Anomaly Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Claim Form */}
        <form onSubmit={handleAnalyze} className="glass-panel p-6 rounded-2xl space-y-4">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-blue-400" />
            Claim Details Input
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Provider ID</label>
              <input 
                type="text" 
                name="Provider" 
                value={formData.Provider} 
                onChange={handleInputChange}
                required
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Beneficiary ID</label>
              <input 
                type="text" 
                name="BeneID" 
                value={formData.BeneID} 
                onChange={handleInputChange}
                required
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Claim ID</label>
            <input 
              type="text" 
              name="ClaimID" 
              value={formData.ClaimID} 
              onChange={handleInputChange}
              required
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Claim Reimbursed (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="number" 
                  name="InscClaimAmtReimbursed" 
                  value={formData.InscClaimAmtReimbursed} 
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Deductible Paid (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="number" 
                  name="DeductibleAmtPaid" 
                  value={formData.DeductibleAmtPaid} 
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Admission Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="date" 
                  name="AdmissionDt" 
                  value={formData.AdmissionDt} 
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Discharge Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="date" 
                  name="DischargeDt" 
                  value={formData.DischargeDt} 
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold text-sm transition flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running Inference Engine...</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" />
                <span>Calculate Fraud Risk Score</span>
              </>
            )}
          </button>
        </form>

        {/* Right Side: Prediction Result Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative min-h-[400px]">
          {/* Fallback Empty State */}
          {!result && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <HelpCircle className="h-16 w-16 text-slate-600 stroke-[1.5]" />
              <div>
                <h5 className="text-white font-medium text-base">Awaiting Claim Data</h5>
                <p className="text-xs text-slate-500 max-w-[280px] mt-1">Enter values or load high/low presets then trigger inference scoring.</p>
              </div>
            </div>
          )}

          {/* Error Message display */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <AlertCircle className="h-16 w-16 text-rose-500/80 stroke-[1.5]" />
              <div className="space-y-1">
                <h5 className="text-rose-400 font-semibold text-base">Connection Offline</h5>
                <p className="text-xs text-slate-400 max-w-[320px]">{error}</p>
              </div>
            </div>
          )}

          {/* Model outputs */}
          {result && (
            <div className="space-y-6 w-full animate-fadeIn">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center">
                {result.risk_level === "HIGH" ? (
                  <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-2 text-emerald-400" />
                )}
                AI Diagnostic Report
              </h4>

              {/* Large Speed Score Gauge */}
              <div className="flex flex-col items-center justify-center py-6">
                <div className={`relative h-44 w-44 rounded-full border-4 ${activeColors.border} flex flex-col items-center justify-center shadow-lg ${activeColors.glow} transition duration-500`}>
                  <span className={`text-4xl font-extrabold tracking-tight ${activeColors.text}`}>{result.risk_score.toFixed(1)}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Risk Score</span>
                  <div className={`absolute top-2.5 right-6 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                    result.recommendation.startsWith("Investigate") ? 'bg-rose-500 text-white' :
                    result.recommendation.startsWith("Flag") ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-900'
                  }`}>
                    {result.recommendation}
                  </div>
                </div>
              </div>
 
              {/* Risk Levels Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border ${activeColors.border} ${activeColors.bg} transition duration-500`}>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Security Threat Rating</span>
                  <span className={`text-lg font-bold block mt-1 ${activeColors.text}`}>{result.risk_level}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-700/30">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Diagnostic Decision</span>
                  <span className={`text-lg font-bold block mt-1 ${
                    result.recommendation.startsWith("Investigate") ? 'text-rose-400' :
                    result.recommendation.startsWith("Flag") ? 'text-amber-400' : 'text-emerald-400'
                  }`}>{result.recommendation}</span>
                </div>
              </div>

              {/* Explainable Reasons */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Explainable AI (XAI) Reasons:</span>
                <p className="text-xs leading-relaxed text-slate-300 italic">{result.reasons}</p>
              </div>
            </div>
          )}

          {/* Footer baseline model info */}
          <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500">
            <span>Model: IsolationForest (M1)</span>
            <span>Target: Claim-level Anomaly</span>
          </div>
        </div>
      </div>
    </div>
  );
}
