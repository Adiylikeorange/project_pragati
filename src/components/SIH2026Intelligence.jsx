import React, { useState, useEffect } from 'react';
import {
  getSIH2026NationalSummary,
  getSIH2026RiskDistribution,
  getSIH2026TopProjects,
  getSIH2026WarningSummary,
  getSIH2026AnomalySummary,
  getSIH2026PredictiveSummary,
  getSIH2026SectorBreakdown,
} from '../services/sih2026Api';

// ─── Risk band color helpers ──────────────────────────────────────────────────

function riskColor(cat) {
  const c = (cat || '').toUpperCase();
  if (c === 'CRITICAL') return 'text-red-600 bg-red-50 border-red-200';
  if (c === 'HIGH') return 'text-amber-700 bg-amber-50 border-amber-200';
  if (c === 'MEDIUM') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  if (c === 'LOW') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  return 'text-gray-500 bg-gray-50 border-gray-200';
}

function bandColor(band) {
  const b = (band || '').toUpperCase();
  if (b === 'HIGH_PREDICTIVE_SIGNAL') return 'text-red-600 font-semibold';
  if (b === 'ELEVATED') return 'text-amber-700 font-semibold';
  if (b === 'WATCH') return 'text-yellow-700';
  return 'text-emerald-700';
}

function trajectoryIcon(status) {
  if (status === 'DETERIORATING') return { icon: 'trending_down', color: 'text-red-500' };
  if (status === 'STAGNATING') return { icon: 'trending_flat', color: 'text-amber-500' };
  if (status === 'IMPROVING') return { icon: 'trending_up', color: 'text-emerald-500' };
  if (status === 'STABLE') return { icon: 'remove', color: 'text-gray-400' };
  return { icon: 'help_outline', color: 'text-gray-300' };
}

// ─── KPI Tile ─────────────────────────────────────────────────────────────────

function KPITile({ label, value, sub, color = 'text-gray-900', icon }) {
  return (
    <div className="bg-white rounded shadow-sm border border-gray-200 p-4 flex items-center justify-between">
      <div>
        <div className={`text-xs font-bold uppercase tracking-wider ${color}`}>{label}</div>
        <div className={`text-3xl font-bold font-mono mt-1 ${color}`}>{value ?? '—'}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      {icon && (
        <div className="w-12 h-12 rounded bg-gray-50 flex items-center justify-center border border-gray-100">
          <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SIH2026Intelligence() {
  const [summary, setSummary] = useState(null);
  const [riskDist, setRiskDist] = useState(null);
  const [topProjects, setTopProjects] = useState([]);
  const [warningSummary, setWarningSummary] = useState(null);
  const [anomalySummary, setAnomalySummary] = useState(null);
  const [predictiveSummary, setPredictiveSummary] = useState(null);
  const [sectorBreakdown, setSectorBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [ns, rd, tp, ws, as_, ps, sb] = await Promise.all([
          getSIH2026NationalSummary(),
          getSIH2026RiskDistribution(),
          getSIH2026TopProjects(15),
          getSIH2026WarningSummary(),
          getSIH2026AnomalySummary(),
          getSIH2026PredictiveSummary(),
          getSIH2026SectorBreakdown(),
        ]);
        if (!cancelled) {
          setSummary(ns);
          setRiskDist(rd);
          setTopProjects(tp || []);
          setWarningSummary(ws);
          setAnomalySummary(as_);
          setPredictiveSummary(ps);
          setSectorBreakdown(sb);
        }
      } catch (err) {
        console.error('SIH2026 intelligence load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
        <span className="material-symbols-outlined animate-spin text-xl text-blue-500">sync</span>
        <span className="text-sm">Loading SIH2026 AI Intelligence Layer...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'priority', label: 'Priority Queue' },
    { id: 'sector', label: 'Sector Breakdown' },
    { id: 'model', label: 'AI Model Info' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs mb-1">
          <span className="font-bold text-purple-700 uppercase tracking-wider">SIH 2026 · Problem 26013</span>
          <span className="text-gray-400">/</span>
          <span className="font-bold text-gray-500 uppercase">ML Intelligence Layer</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">AI-Powered National Risk Intelligence</h2>
        <p className="text-sm text-gray-500 max-w-4xl mt-0.5">
          XGBoost + IsolationForest models trained on Jan–Jul 2026 PRAGATI monitoring data.
          Covers {summary?.projects?.toLocaleString() ?? '2,144'} infrastructure projects across all national priority sectors.
          Risk fusion: 70% current domain + 15% trajectory + 10% anomaly + 5% XGBoost predictive.
        </p>
      </div>

      {/* National KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile
          label="Total Projects"
          value={summary?.projects?.toLocaleString()}
          sub="Jan–Jul 2026 PRAGATI data"
          color="text-blue-700"
          icon="inventory_2"
        />
        <KPITile
          label="Critical Risk"
          value={riskDist?.CRITICAL}
          sub={`+ ${riskDist?.HIGH ?? 0} High Risk`}
          color="text-red-600"
          icon="crisis_alert"
        />
        <KPITile
          label="ML Anomalies"
          value={anomalySummary?.count}
          sub={`${anomalySummary?.percentage ?? 5}% of portfolio`}
          color="text-purple-700"
          icon="biotech"
        />
        <KPITile
          label="Predicted Deterioration"
          value={predictiveSummary?.predicted_future_deterioration}
          sub="XGBoost forward signal"
          color="text-amber-700"
          icon="model_training"
        />
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b border-gray-200 mb-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <div className="bg-white rounded shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-gray-500">donut_large</span>
                Risk Distribution — 2,144 Projects
              </h3>
              <div className="space-y-3">
                {riskDist && Object.entries(riskDist).map(([band, count]) => {
                  const total = Object.values(riskDist).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const barColor = band === 'CRITICAL' ? 'bg-red-500' : band === 'HIGH' ? 'bg-amber-500' : band === 'MEDIUM' ? 'bg-yellow-400' : band === 'REVIEW_DATA' ? 'bg-gray-300' : 'bg-emerald-500';
                  return (
                    <div key={band}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">{band.replace('_', ' ')}</span>
                        <span className="font-mono text-gray-500">{count.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warning Summary */}
            <div className="bg-white rounded shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-amber-500">warning</span>
                ML-Generated Warning Types
              </h3>
              <div className="space-y-2">
                {warningSummary && Object.entries(warningSummary)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-xs text-gray-700 font-medium">{type.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* PRIORITY QUEUE TAB */}
        {activeTab === 'priority' && (
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Top Priority Projects — Ranked by Final Risk Score</h3>
              <p className="text-xs text-gray-500 mt-0.5">XGBoost + IsolationForest + Domain Risk fusion. Sorted highest risk first.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">#</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Project</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Risk Score</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Category</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Predictive Band</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Primary Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {topProjects.map((p, i) => {
                    const traj = trajectoryIcon(p.trajectory_status);
                    return (
                      <tr key={p.project_id || i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-mono font-bold text-gray-500">{p.priority_rank || i + 1}</td>
                        <td className="px-4 py-2.5 max-w-xs">
                          <div className="font-medium text-gray-900 truncate">{p.project_name || `Project ${p.project_id}`}</div>
                          <div className="text-gray-400">{p.sector}</div>
                        </td>
                        <td className="px-4 py-2.5 font-mono font-bold text-gray-900">
                          {typeof p.final_risk_score === 'number' ? p.final_risk_score.toFixed(1) : '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${riskColor(p.risk_category)}`}>
                            {p.risk_category || '—'}
                          </span>
                        </td>
                        <td className={`px-4 py-2.5 text-xs ${bandColor(p.predictive_risk_band)}`}>
                          {(p.predictive_risk_band || '—').replace(/_/g, ' ')}
                          {p.future_deterioration_probability != null && (
                            <span className="text-gray-400 font-normal ml-1">
                              ({Math.round(p.future_deterioration_probability * 100)}%)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className={`material-symbols-outlined text-sm ${traj.color}`}>{traj.icon}</span>
                            {(p.primary_risk_driver || '—').replace(/_/g, ' ')}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTOR BREAKDOWN TAB */}
        {activeTab === 'sector' && (
          <div className="bg-white rounded shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Sector-Wise Risk Distribution</h3>
            {sectorBreakdown && Object.keys(sectorBreakdown).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {Object.entries(sectorBreakdown)
                  .filter(([sec]) => sec !== 'NaN')
                  .sort(([, a], [, b]) => (b.CRITICAL || 0) - (a.CRITICAL || 0))
                  .map(([sector, dist]) => {
                    const total = Object.values(dist).reduce((s, v) => s + v, 0);
                    return (
                      <div key={sector} className="border border-gray-200 rounded p-3 hover:shadow-sm transition-shadow">
                        <div className="font-semibold text-gray-800 text-sm mb-2">{sector}</div>
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-2">
                          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(band => {
                            const count = dist[band] || 0;
                            const pct = total > 0 ? (count / total) * 100 : 0;
                            const color = band === 'CRITICAL' ? 'bg-red-500' : band === 'HIGH' ? 'bg-amber-500' : band === 'MEDIUM' ? 'bg-yellow-400' : 'bg-emerald-500';
                            return pct > 0 ? <div key={band} className={`h-full ${color}`} style={{ width: `${pct}%` }} /> : null;
                          })}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500">
                          {dist.CRITICAL > 0 && <span className="text-red-600 font-semibold">{dist.CRITICAL} Critical</span>}
                          {dist.HIGH > 0 && <span className="text-amber-700">{dist.HIGH} High</span>}
                          <span className="text-gray-400">{total} total</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-sm text-gray-400 py-8 text-center">Sector breakdown data unavailable</div>
            )}
          </div>
        )}

        {/* AI MODEL INFO TAB */}
        {activeTab === 'model' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">model_training</span>
                XGBoost Predictive Model
              </h3>
              {predictiveSummary?.test_metrics ? (
                <div className="space-y-3">
                  <div className="text-xs text-gray-500 mb-3">
                    Target: future progress deterioration (progress_pct(t+1) &lt; progress_pct(t))
                  </div>
                  {[
                    ['Accuracy', predictiveSummary.test_metrics.accuracy],
                    ['Precision', predictiveSummary.test_metrics.precision],
                    ['Recall', predictiveSummary.test_metrics.recall],
                    ['F1 Score', predictiveSummary.test_metrics.f1],
                    ['ROC AUC', predictiveSummary.test_metrics.roc_auc],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                      <span className="text-xs font-medium text-gray-600">{label}</span>
                      <span className="font-mono text-xs font-bold text-gray-900">
                        {typeof val === 'number' ? val.toFixed(4) : '—'}
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                    <strong>Note:</strong> Model trained on Jan–May 2026, validated on Jun 2026, tested on Jul 2026.
                    Modest precision/recall is expected — no defensible future-risk outcome labels available.
                    The continuous deterioration probability is the primary operational signal.
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Model metrics unavailable</div>
              )}
            </div>

            <div className="bg-white rounded shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">biotech</span>
                IsolationForest Anomaly Detection
              </h3>
              {anomalySummary ? (
                <div className="space-y-3">
                  {[
                    ['Backend', anomalySummary.backend],
                    ['Total Anomalies', anomalySummary.count],
                    ['Anomaly Rate', `${anomalySummary.percentage}%`],
                    ['Contamination', '5% (fixed)'],
                    ['N Estimators', '300'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                      <span className="text-xs font-medium text-gray-600">{label}</span>
                      <span className="font-mono text-xs font-bold text-gray-900">{val ?? '—'}</span>
                    </div>
                  ))}
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-800">
                    An anomaly flag is a <strong>review signal</strong>, not proof of wrongdoing.
                    It indicates an unusual pattern relative to the current portfolio.
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Anomaly model data unavailable</div>
              )}

              {/* Risk Fusion Methodology */}
              <div className="mt-5">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">Risk Fusion Methodology</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Current Domain Risk', pct: 70, color: 'bg-blue-500' },
                    { label: 'Trajectory Risk', pct: 15, color: 'bg-amber-500' },
                    { label: 'Anomaly Signal', pct: 10, color: 'bg-purple-500' },
                    { label: 'XGBoost Predictive', pct: 5, color: 'bg-emerald-500' },
                  ].map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-mono font-bold text-gray-700">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
