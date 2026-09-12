import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    runLivePrediction();
  }, []);

  const runLivePrediction = async () => {
    setPredictLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/sih2026/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setPredictionResult(data);
    } catch (err) {
      setPredictionResult({ error: err.message });
    } finally {
      setPredictLoading(false);
    }
  };

  const fetchProjectRisk = async (id) => {
    setProjectLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}/risk`);
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
        const res = await fetch(`${API_BASE}${ep.url}`);
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

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live AI Model & Backend Testing Workbench
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">PRAGATI AI Verification Lab</h1>
            <p className="text-sm text-indigo-200 mt-1 max-w-2xl">
              Interact directly with the loaded <strong>XGBoost</strong> and <strong>IsolationForest</strong> ML models.
              Simulate arbitrary project financial indicators, verify live predictions, and benchmark all backend endpoints.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={runEndpointSuite}
              disabled={testingAll}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-md shadow text-sm flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-base">
                {testingAll ? 'sync' : 'speed'}
              </span>
              {testingAll ? 'Benchmarking...' : 'Run All Backend Tests'}
            </button>
            <a
              href={`${API_BASE}/docs`}
              target="_blank"
              rel="noreferrer"
              className="bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-base">api</span>
              FastAPI Docs (/docs)
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Live Predictor & Project Risk Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Live Real-Time Model Inference */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">psychology</span>
                Live What-If Simulation
              </h2>
              <p className="text-xs text-gray-500">
                Pushes custom metrics to <code className="bg-gray-100 px-1 py-0.5 rounded">POST /api/sih2026/predict</code> for real-time XGBoost + IsolationForest evaluation
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 font-semibold border border-purple-200 rounded">
              Active Models: XGBoost + IF
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Original Cost (₹ Cr)</label>
              <input
                type="number"
                value={formData.original_cost_cr}
                onChange={(e) => setFormData({ ...formData, original_cost_cr: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-1.5 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Revised Cost (₹ Cr)</label>
              <input
                type="number"
                value={formData.revised_cost_cr}
                onChange={(e) => setFormData({ ...formData, revised_cost_cr: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-1.5 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Cumulative Expenditure (₹ Cr)</label>
              <input
                type="number"
                value={formData.cumulative_expenditure_cr}
                onChange={(e) => setFormData({ ...formData, cumulative_expenditure_cr: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-1.5 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Physical Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.physical_progress_pct}
                onChange={(e) => setFormData({ ...formData, physical_progress_pct: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-1.5 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="col-span-2">
              <div className="flex justify-between text-gray-600 font-medium mb-1">
                <span>Recent Progress Velocity: {formData.progress_velocity_3m} pp/month</span>
                <span className={formData.progress_velocity_3m < 0 ? 'text-red-500' : 'text-emerald-600'}>
                  {formData.progress_velocity_3m < 0 ? 'Deteriorating' : 'Advancing'}
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={formData.progress_velocity_3m}
                onChange={(e) => setFormData({ ...formData, progress_velocity_3m: parseFloat(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          <button
            onClick={runLivePrediction}
            disabled={predictLoading}
            className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-medium py-2 rounded text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-base">
              {predictLoading ? 'hourglass_top' : 'bolt'}
            </span>
            {predictLoading ? 'Computing Live ML Inference...' : 'Execute Live Model Prediction'}
          </button>

          {/* Model Output Card */}
          {predictionResult && (
            <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-semibold uppercase">Fused Model Risk Score</div>
                  <div className="text-2xl font-bold font-mono text-gray-900">
                    {predictionResult.fused_risk_score} / 100
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded text-xs font-bold uppercase border ${
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

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t">
                <div className="bg-white p-2.5 rounded border">
                  <div className="font-semibold text-blue-800 flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-sm">trending_down</span>
                    XGBoost Deterioration
                  </div>
                  <div>Probability: <span className="font-mono font-bold">{(predictionResult.xgboost_prediction?.future_deterioration_probability * 100).toFixed(1)}%</span></div>
                  <div>Band: <span className="font-semibold">{predictionResult.xgboost_prediction?.predictive_risk_band}</span></div>
                  <div>Signal: <span className="font-semibold">{predictionResult.xgboost_prediction?.predicted_future_deterioration ? '⚠️ Deterioration Predicted' : '✅ Stable'}</span></div>
                </div>

                <div className="bg-white p-2.5 rounded border">
                  <div className="font-semibold text-purple-800 flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Isolation Forest Anomaly
                  </div>
                  <div>Anomaly Flag: <span className={`font-bold ${predictionResult.isolation_forest_prediction?.anomaly_flag ? 'text-red-600' : 'text-emerald-600'}`}>{predictionResult.isolation_forest_prediction?.anomaly_flag ? 'TRUE (Anomaly Detected)' : 'FALSE (Normal)'}</span></div>
                  <div>Raw Score: <span className="font-mono">{predictionResult.isolation_forest_prediction?.anomaly_score}</span></div>
                  <div>Category: <span className="font-semibold">{predictionResult.isolation_forest_prediction?.anomaly_category}</span></div>
                </div>
              </div>

              {predictionResult.primary_risk_drivers && (
                <div className="text-xs">
                  <span className="text-gray-500 font-semibold">Identified Risk Drivers: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {predictionResult.primary_risk_drivers.map((d, i) => (
                      <span key={i} className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-[11px] font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Module 2: Real PRAGATI National Project AI Profile */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
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
                  className={`p-2 text-left rounded border transition-all ${
                    selectedProjectId === p.id
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-mono text-[11px] text-gray-500">#{p.id}</div>
                  <div className="truncate">{p.name}</div>
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
            <div className="bg-gray-50 border rounded-lg p-4 space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{projectRiskData.project_name || `Project ID: ${selectedProjectId}`}</div>
                  <div className="text-gray-500">{projectRiskData.sector || 'National Infrastructure'} • {projectRiskData.line_ministry || 'Government of India'}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-red-600">{projectRiskData.risk_score} / 100</div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">{projectRiskData.risk_level} Risk</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div className="bg-white p-2 rounded border">
                  <span className="text-gray-500">Trajectory Status:</span>
                  <div className="font-bold text-gray-800">{projectRiskData.trajectory_status || 'STABLE'}</div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <span className="text-gray-500">Anomaly Signal:</span>
                  <div className={`font-bold ${projectRiskData.anomaly_flag ? 'text-red-600' : 'text-emerald-600'}`}>
                    {projectRiskData.anomaly_flag ? 'YES (Flagged)' : 'NO (Normal)'}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <span className="text-gray-500">Predictive Risk Band:</span>
                  <div className="font-bold text-gray-800">{projectRiskData.predictive_risk_band || 'LOW_PREDICTIVE_SIGNAL'}</div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <span className="text-gray-500">Forecast Delay:</span>
                  <div className="font-bold text-amber-700">+{projectRiskData.delay_forecast_days || 0} Days</div>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded border space-y-1">
                <div className="font-semibold text-gray-700">Primary Bottleneck:</div>
                <div className="text-gray-800">{projectRiskData.primary_bottleneck || 'Data Review Recommended'}</div>
                <div className="font-semibold text-gray-700 pt-1">Recommended Action:</div>
                <div className="text-indigo-700">{projectRiskData.recommendation || projectRiskData.recommended_action || 'Routine portfolio monitoring.'}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Module 3: Automated Endpoint Benchmark Suite */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
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
            className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5"
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
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b">
                  <th className="text-left py-2 px-3">Service / Endpoint</th>
                  <th className="text-left py-2 px-3">Method & Path</th>
                  <th className="text-left py-2 px-3">HTTP Status</th>
                  <th className="text-left py-2 px-3">Latency</th>
                  <th className="text-left py-2 px-3">Live Payload Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {testResults.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-semibold text-gray-800">{r.name}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-600">{r.url}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${r.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {r.status} {r.ok ? 'OK' : 'ERR'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-600">{r.latency} ms</td>
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
