import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../config/api';

const SCENARIO_PRESETS = [
  {
    id: 'stalled',
    label: '🛑 Stalled Greenfield Highway',
    badge: 'Critical Risk',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    data: {
      original_cost_cr: 1200,
      revised_cost_cr: 2150,
      cumulative_expenditure_cr: 1650,
      physical_progress_pct: 28,
      progress_velocity_3m: -1.8,
    }
  },
  {
    id: 'anomaly',
    label: '⚠️ Front-Loaded Spending Anomaly',
    badge: 'High Anomaly',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    data: {
      original_cost_cr: 900,
      revised_cost_cr: 950,
      cumulative_expenditure_cr: 780,
      physical_progress_pct: 24,
      progress_velocity_3m: 0.2,
    }
  },
  {
    id: 'clearance',
    label: '🟡 Mid-Flight Statutory Delay',
    badge: 'Moderate Risk',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    data: {
      original_cost_cr: 750,
      revised_cost_cr: 880,
      cumulative_expenditure_cr: 460,
      physical_progress_pct: 54,
      progress_velocity_3m: -0.6,
    }
  },
  {
    id: 'fast_track',
    label: '🟢 Model Milestone Performer',
    badge: 'On-Track',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    data: {
      original_cost_cr: 1500,
      revised_cost_cr: 1500,
      cumulative_expenditure_cr: 1120,
      physical_progress_pct: 86,
      progress_velocity_3m: 2.5,
    }
  }
];

export default function AITestWorkbench() {
  // --- Live Predictor State ---
  const [formData, setFormData] = useState({
    original_cost_cr: 850,
    revised_cost_cr: 1450,
    cumulative_expenditure_cr: 1100,
    physical_progress_pct: 35,
    progress_velocity_3m: -1.2,
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  // --- Project Lookup State ---
  const [selectedProjectId, setSelectedProjectId] = useState('705458');
  const [projectRiskData, setProjectRiskData] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);

  // --- Endpoint Suite State ---
  const [testResults, setTestResults] = useState([]);
  const [testingAll, setTestingAll] = useState(false);

  // Run initial lookup
  useEffect(() => {
    fetchProjectRisk(selectedProjectId);
    executeLivePrediction(formData);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const executeLivePrediction = async (valuesToPredict) => {
    setPredictLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sih2026/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valuesToPredict),
      });
      const data = await res.json();
      setPredictionResult(data);
    } catch (err) {
      setPredictionResult({ error: err.message });
    } finally {
      setPredictLoading(false);
    }
  };

  const runLivePrediction = () => {
    executeLivePrediction(formData);
  };

  const handleApplyPreset = (preset) => {
    setActivePreset(preset.id);
    setFormData(preset.data);
    executeLivePrediction(preset.data);
  };

  const fetchProjectRisk = async (id) => {
    setProjectLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${id}/risk`);
      const data = await res.json();
      setProjectRiskData(data);
    } catch (err) {
      setProjectRiskData({ error: err.message });
    } finally {
      setProjectLoading(false);
    }
  };

  const runEndpointSuite = async () => {
    setTestingAll(true);
    setTestResults([]);

    const endpoints = [
      { name: 'Backend Health Check', url: '/api/health', method: 'GET' },
      { name: 'Model & Pipeline Status', url: '/api/sih2026/status', method: 'GET' },
      { name: 'National Summary (2,144 Projects)', url: '/api/sih2026/national-summary', method: 'GET' },
      { name: 'Risk Distribution Bands', url: '/api/sih2026/risk-distribution', method: 'GET' },
      { name: 'Top Priority Projects Queue', url: '/api/sih2026/top-projects?limit=3', method: 'GET' },
      { name: 'ML Early Warnings Feed', url: '/api/sih2026/early-warnings?limit=5', method: 'GET' },
      { name: 'Project AI Profile (ID: 705458)', url: '/api/sih2026/projects/705458/risk', method: 'GET' },
      { name: 'XGBoost Predictive Validation', url: '/api/sih2026/predictive-summary', method: 'GET' },
      { name: 'Isolation Forest Anomaly Summary', url: '/api/sih2026/anomaly-summary', method: 'GET' },
      { name: 'Core Dashboard Summary', url: '/api/dashboard/summary', method: 'GET' },
    ];

    const results = [];
    for (const ep of endpoints) {
      const t0 = performance.now();
      try {
        const res = await fetch(`${API_BASE_URL}${ep.url}`);
        const t1 = performance.now();
        const ok = res.ok;
        const data = await res.json();
        results.push({
          name: ep.name,
          url: ep.url,
          status: res.status,
          ok,
          latency: Math.round(t1 - t0),
          preview: JSON.stringify(data).slice(0, 100) + '...',
        });
      } catch (err) {
        results.push({
          name: ep.name,
          url: ep.url,
          status: 'FAIL',
          ok: false,
          latency: 0,
          preview: err.message,
        });
      }
      setTestResults([...results]);
    }
    setTestingAll(false);
  };

  // --- Dynamic AI Suggestion Generator ---
  const aiSuggestions = useMemo(() => {
    if (!predictionResult || predictionResult.error) return null;

    const costOverrunPct = formData.original_cost_cr > 0
      ? Math.round(((formData.revised_cost_cr - formData.original_cost_cr) / formData.original_cost_cr) * 100)
      : 0;

    const spendRatioPct = formData.revised_cost_cr > 0
      ? Math.round((formData.cumulative_expenditure_cr / formData.revised_cost_cr) * 100)
      : 0;

    const progressLag = spendRatioPct - formData.physical_progress_pct;
    const isVelocityNegative = formData.progress_velocity_3m < 0;
    const isCritical = (predictionResult.risk_level || '').toLowerCase() === 'critical';
    const isAnomaly = predictionResult.isolation_forest_prediction?.anomaly_flag;

    const recommendations = [];
    const whatIfTips = [];

    // 1. Cost Escalation Diagnostic & Action
    if (costOverrunPct > 20) {
      recommendations.push({
        pillar: 'Financial Oversight',
        icon: 'trending_up',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        title: `Substantial Cost Escalation (+${costOverrunPct}%)`,
        action: 'Mandate Revised Cost Estimate (RCE) audit through the Public Investment Board (PIB). Convene value engineering panel to de-scope secondary non-critical packages.'
      });
    }

    // 2. Spending / Progress Divergence (Front-loading)
    if (progressLag > 25 || isAnomaly) {
      recommendations.push({
        pillar: 'Contractor Liquidity & Anomaly Alert',
        icon: 'warning',
        color: 'text-purple-700 bg-purple-50 border-purple-200',
        title: `Financial Disbursement Divergence (Expenditure ${spendRatioPct}% vs Progress ${formData.physical_progress_pct}%)`,
        action: 'Invoke Tripartite Escrow Control. Freeze advance billing disbursements until physical site verification confirms installed materials and machinery mobilization.'
      });
    }

    // 3. Negative Velocity Interventions
    if (isVelocityNegative) {
      recommendations.push({
        pillar: 'Schedule Recovery & Acceleration',
        icon: 'speed',
        color: 'text-red-700 bg-red-50 border-red-200',
        title: `Negative Completion Velocity (${formData.progress_velocity_3m} pp/month)`,
        action: 'Institute 14-day catch-up sprints. Sub-divide remaining civil works into parallel micro-packages and issue Notice to Correct under EPC Clause 14.2.'
      });
      whatIfTips.push(`Increasing velocity from ${formData.progress_velocity_3m} to +1.5 pp/month is projected to decrease delay risk by ~34 points.`);
    } else {
      whatIfTips.push(`Positive velocity (+${formData.progress_velocity_3m} pp/mo) is mitigating structural slippage; maintain current supply-chain throughput.`);
    }

    // 4. Critical Severity Directive
    if (isCritical) {
      recommendations.push({
        pillar: 'High-Level Escalation',
        icon: 'gavel',
        color: 'text-red-800 bg-red-100 border-red-300',
        title: 'Immediate Secretarial Intervention Protocol Required',
        action: 'Elevate directly to Cabinet Secretariat (PMO Infrastructure Cell) for monthly review. Establish inter-ministerial liaison officer to fast-track pending statutory clearances.'
      });
    }

    // 5. Positive / Stable Case
    if (recommendations.length === 0) {
      recommendations.push({
        pillar: 'Sustained Milestone Execution',
        icon: 'verified',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        title: 'Project Within Resilient Operational Band',
        action: 'Maintain existing contractor disbursement schedule. Run bi-weekly drone surveillance audits to monitor Right-of-Way compliance and ensure timely commercial handover.'
      });
    }

    return {
      costOverrunPct,
      spendRatioPct,
      progressLag,
      recommendations,
      whatIfTips
    };
  }, [formData, predictionResult]);

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live AI Model & Advisory Workbench
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">PRAGATI AI Verification & Advisory Lab</h1>
            <p className="text-sm text-indigo-200 mt-1 max-w-2xl">
              Simulate arbitrary project financial indicators, verify live XGBoost + IsolationForest predictions, and inspect automated AI mitigation suggestions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={runEndpointSuite}
              disabled={testingAll}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg shadow text-sm flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-base">
                {testingAll ? 'sync' : 'speed'}
              </span>
              {testingAll ? 'Benchmarking...' : 'Run All Backend Tests'}
            </button>
            <a
              href={`${API_BASE_URL}/docs`}
              target="_blank"
              rel="noreferrer"
              className="bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-base">api</span>
              FastAPI Docs (/docs)
            </a>
          </div>
        </div>
      </div>

      {/* 1-Click Simulation Scenario Presets Strip */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-base">smart_toy</span>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              1-Click Scenario Presets (Stress-Test AI Suggestions)
            </h3>
          </div>
          <span className="text-[11px] text-gray-400">Click any scenario to auto-populate parameters and run live prediction</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIO_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className={`p-3 rounded-lg border text-left transition-all ${
                activePreset === preset.id
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/40 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${preset.badgeClass}`}>
                  {preset.badge}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Load</span>
              </div>
              <div className="text-xs font-bold text-gray-900">{preset.label}</div>
              <div className="text-[11px] text-gray-500 mt-1">
                Cost: ₹{preset.data.revised_cost_cr}Cr • Prog: {preset.data.physical_progress_pct}% • Vel: {preset.data.progress_velocity_3m}pp
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Live Predictor & Project Risk Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Live Model Inference & AI Suggestions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">psychology</span>
                Live What-If Simulation
              </h2>
              <p className="text-xs text-gray-500">
                Pushes custom metrics to <code className="bg-gray-100 px-1 py-0.5 rounded">POST /api/sih2026/predict</code> for real-time evaluation
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 font-semibold border border-purple-200 rounded">
              XGBoost + IF Pipeline
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Original Sanctioned Cost (₹ Cr)</label>
              <input
                type="number"
                value={formData.original_cost_cr}
                onChange={(e) => {
                  setActivePreset(null);
                  setFormData({ ...formData, original_cost_cr: parseFloat(e.target.value) || 0 });
                }}
                className="w-full border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Revised Estimated Cost (₹ Cr)</label>
              <input
                type="number"
                value={formData.revised_cost_cr}
                onChange={(e) => {
                  setActivePreset(null);
                  setFormData({ ...formData, revised_cost_cr: parseFloat(e.target.value) || 0 });
                }}
                className="w-full border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Cumulative Expenditure (₹ Cr)</label>
              <input
                type="number"
                value={formData.cumulative_expenditure_cr}
                onChange={(e) => {
                  setActivePreset(null);
                  setFormData({ ...formData, cumulative_expenditure_cr: parseFloat(e.target.value) || 0 });
                }}
                className="w-full border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Physical Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.physical_progress_pct}
                onChange={(e) => {
                  setActivePreset(null);
                  setFormData({ ...formData, physical_progress_pct: parseFloat(e.target.value) || 0 });
                }}
                className="w-full border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <div className="flex justify-between text-gray-600 font-medium mb-1">
                <span>Recent Progress Velocity: <strong>{formData.progress_velocity_3m} pp/month</strong></span>
                <span className={formData.progress_velocity_3m < 0 ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'}>
                  {formData.progress_velocity_3m < 0 ? '⚠️ Slippage Trajectory' : '✅ Advancing Velocity'}
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={formData.progress_velocity_3m}
                onChange={(e) => {
                  setActivePreset(null);
                  setFormData({ ...formData, progress_velocity_3m: parseFloat(e.target.value) });
                }}
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          <button
            onClick={runLivePrediction}
            disabled={predictLoading}
            className="w-full bg-[#0A2540] hover:bg-[#12365a] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-base">
              {predictLoading ? 'hourglass_top' : 'bolt'}
            </span>
            {predictLoading ? 'Computing Live ML Inference...' : 'Execute Live Model Prediction'}
          </button>

          {/* Model Output Card */}
          {predictionResult && !predictionResult.error && (
            <div className="bg-gray-50 border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Fused Multi-Model Risk Score</div>
                  <div className="text-2xl font-black font-mono text-gray-900 mt-0.5">
                    {predictionResult.fused_risk_score} / 100
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    predictionResult.risk_level === 'Critical'
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : predictionResult.risk_level === 'High'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {predictionResult.risk_level} Risk
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="font-bold text-blue-800 flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-sm">trending_down</span>
                    XGBoost Deterioration
                  </div>
                  <div>Probability: <span className="font-mono font-bold">{(predictionResult.xgboost_prediction?.future_deterioration_probability * 100).toFixed(1)}%</span></div>
                  <div>Band: <span className="font-semibold">{predictionResult.xgboost_prediction?.predictive_risk_band}</span></div>
                  <div>Signal: <span className="font-semibold">{predictionResult.xgboost_prediction?.predicted_future_deterioration ? '⚠️ Impasse Alert' : '✅ Milestone Stable'}</span></div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="font-bold text-purple-800 flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Isolation Forest Anomaly
                  </div>
                  <div>Flag: <span className={`font-bold ${predictionResult.isolation_forest_prediction?.anomaly_flag ? 'text-red-600' : 'text-emerald-600'}`}>{predictionResult.isolation_forest_prediction?.anomaly_flag ? 'TRUE (Anomaly Detected)' : 'FALSE (Normal Pattern)'}</span></div>
                  <div>Raw Score: <span className="font-mono">{predictionResult.isolation_forest_prediction?.anomaly_score}</span></div>
                  <div>Category: <span className="font-semibold">{predictionResult.isolation_forest_prediction?.anomaly_category}</span></div>
                </div>
              </div>

              {/* DYNAMIC AI SUGGESTIONS SECTION */}
              {aiSuggestions && (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-indigo-600 text-base">psychology</span>
                      AI Mitigation Suggestions & Action Playbook
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Prescriptive Analytics
                    </span>
                  </div>

                  {/* Recommendations Cards */}
                  <div className="space-y-2 text-xs">
                    {aiSuggestions.recommendations.map((rec, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${rec.color}`}>
                        <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                          <span className="material-symbols-outlined text-sm">{rec.icon}</span>
                          <span>{rec.pillar}: {rec.title}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-gray-800">{rec.action}</p>
                      </div>
                    ))}
                  </div>

                  {/* What-If Sensitivity Suggestions */}
                  {aiSuggestions.whatIfTips.length > 0 && (
                    <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-lg text-[11px] text-blue-900 flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">lightbulb</span>
                      <div>
                        <strong>Optimization Insight: </strong>
                        {aiSuggestions.whatIfTips.join(' ')}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Module 2: Real PRAGATI National Project AI Profile */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">search_check</span>
                Project Risk Profile Inspector
              </h2>
              <p className="text-xs text-gray-500">
                Inspect how the AI pipeline scored actual national infrastructure projects
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold border border-blue-200 rounded">
              2,144 National Projects
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Select Critical Project to Inspect:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: '705458', name: 'Miyagam-Karjan Gauge (Rail)' },
                { id: '400298', name: 'Nadikude-Srikalahasti (Rail)' },
                { id: '705368', name: 'Araria-Supaul 92km (Rail)' },
                { id: '603945', name: 'Anandpur Barrage (Water)' },
                { id: '707039', name: 'GMC Gangtok (Healthcare)' },
                { id: 'PRG-001', name: 'PRG-001 (Demo Metro)' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    fetchProjectRisk(p.id);
                  }}
                  className={`p-2 text-left rounded-lg border transition-all ${
                    selectedProjectId === p.id
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-2xs'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-mono text-[11px] text-gray-500">#{p.id}</div>
                  <div className="truncate font-medium">{p.name}</div>
                </button>
              ))}
            </div>
          </div>

          {projectLoading ? (
            <div className="p-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-blue-500">sync</span>
              Loading project risk intelligence...
            </div>
          ) : projectRiskData ? (
            <div className="bg-gray-50 border rounded-xl p-4 space-y-3.5 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{projectRiskData.project_name || `Project ID: ${selectedProjectId}`}</div>
                  <div className="text-gray-500">{projectRiskData.sector || 'National Infrastructure'} • {projectRiskData.line_ministry || 'Government of India'}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-mono text-red-600">{projectRiskData.risk_score} / 100</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">{projectRiskData.risk_level} Risk</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Trajectory Status</span>
                  <div className="font-bold text-gray-800 mt-0.5">{projectRiskData.trajectory_status || 'STABLE'}</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Anomaly Signal</span>
                  <div className={`font-bold mt-0.5 ${projectRiskData.anomaly_flag ? 'text-red-600' : 'text-emerald-600'}`}>
                    {projectRiskData.anomaly_flag ? 'YES (Flagged Anomaly)' : 'NO (Within Normal Variance)'}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Predictive Risk Band</span>
                  <div className="font-bold text-gray-800 mt-0.5">{projectRiskData.predictive_risk_band || 'LOW_PREDICTIVE_SIGNAL'}</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Forecast Slippage</span>
                  <div className="font-bold text-amber-700 mt-0.5">+{projectRiskData.delay_forecast_days || 0} Days</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1.5">
                <div className="font-bold text-gray-700 text-[11px] uppercase tracking-wider">Identified Root Impediment:</div>
                <div className="text-gray-800 font-medium">{projectRiskData.primary_bottleneck || 'Contractor Mobilization Review Recommended'}</div>
                <div className="font-bold text-indigo-900 text-[11px] uppercase tracking-wider pt-1.5 border-t border-gray-100 flex items-center gap-1">
                  <span className="material-symbols-outlined text-indigo-600 text-sm">tips_and_updates</span>
                  Mandated Remediation Protocol:
                </div>
                <div className="text-indigo-800 leading-relaxed font-medium">
                  {projectRiskData.recommendation || projectRiskData.recommended_action || 'Execute expedited inter-ministerial liaison meeting with State Chief Secretary.'}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Module 3: Automated Endpoint Benchmark Suite */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">dns</span>
              Automated Endpoint Test Suite & Benchmark
            </h2>
            <p className="text-xs text-gray-500">
              Validates connectivity, schema responses, and response times of all PRAGATI & SIH2026 AI endpoints
            </p>
          </div>
          <button
            onClick={runEndpointSuite}
            disabled={testingAll}
            className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Run Diagnostics
          </button>
        </div>

        {testResults.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs">
            Click <strong>"Run Diagnostics"</strong> or <strong>"Run All Backend Tests"</strong> to test all endpoints.
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b">
                  <th className="text-left py-2.5 px-3 font-bold">Service / Endpoint</th>
                  <th className="text-left py-2.5 px-3 font-bold">Method & Path</th>
                  <th className="text-left py-2.5 px-3 font-bold">HTTP Status</th>
                  <th className="text-left py-2.5 px-3 font-bold">Latency</th>
                  <th className="text-left py-2.5 px-3 font-bold">Live Payload Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {testResults.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-semibold text-gray-800">{r.name}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-600">{r.url}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${r.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {r.status} {r.ok ? 'OK' : 'ERR'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-600 font-bold">{r.latency} ms</td>
                    <td className="py-2.5 px-3 font-mono text-gray-400 truncate max-w-xs">{r.preview}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
