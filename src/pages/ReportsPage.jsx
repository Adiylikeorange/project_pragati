import React, { useState, useMemo } from 'react';

const REPORT_TEMPLATES = [
  {
    id: 'cabinet',
    name: 'Executive Cabinet Briefing Pack',
    icon: 'co_present',
    description: 'High-level synthesis designed for Prime Minister Office & Cabinet Secretariat reviews.',
    targetAudience: 'PMO & Central Ministers'
  },
  {
    id: 'monthly',
    name: 'Monthly Progress Digest',
    icon: 'summarize',
    description: 'Comprehensive audit of physical milestone completions, slippages, and completion velocity.',
    targetAudience: 'Line Ministry Secretaries'
  },
  {
    id: 'risk_impediment',
    name: 'Risk & Delay Root-Cause Matrix',
    icon: 'troubleshoot',
    description: 'Detailed impediment breakdown covering land disputes, forest approvals, and contractor solvency.',
    targetAudience: 'Empowered Inter-Ministerial Committee'
  },
  {
    id: 'financial',
    name: 'CapEx Reconciliation & Cost Overrun Audit',
    icon: 'account_balance',
    description: 'Financial outlay review comparing sanctioned vs revised expenditure and cost escalation trends.',
    targetAudience: 'Ministry of Finance / Expenditure Dept'
  }
];

export default function ReportsPage({ projectsList = [] }) {
  // Report Configuration
  const [selectedTemplate, setSelectedTemplate] = useState('cabinet');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All');
  const [dateRange, setDateRange] = useState('Current Cycle (Q1 2026)');
  const [includeAIInsights, setIncludeAIInsights] = useState(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [copiedStatus, setCopiedStatus] = useState(false);

  // History state
  const [reportHistory, setReportHistory] = useState([
    {
      id: 'REP-2026-091',
      title: 'Monthly Progress Digest — National Highway Corridor',
      date: '12 Sep 2026, 11:30 AM',
      sector: 'Roads & Highways',
      format: 'PDF / Print'
    },
    {
      id: 'REP-2026-088',
      title: 'Executive Cabinet Briefing Pack',
      date: '10 Sep 2026, 04:45 PM',
      sector: 'All Sectors',
      format: 'CSV Export'
    }
  ]);

  // Extract sectors from projects
  const sectors = useMemo(() => {
    const sList = new Set(projectsList.map(p => p.sector).filter(Boolean));
    return ['All', ...Array.from(sList)];
  }, [projectsList]);

  // Compile Dynamic Report Data
  const compileReportData = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Filter projects based on selections
      let filtered = [...projectsList];
      if (selectedSector !== 'All') {
        filtered = filtered.filter(p => p.sector?.toLowerCase() === selectedSector.toLowerCase());
      }
      if (selectedRiskFilter !== 'All') {
        filtered = filtered.filter(p => p.riskLevel?.toLowerCase() === selectedRiskFilter.toLowerCase());
      }

      // Default sample if filtered empty
      const sampleList = filtered.length > 0 ? filtered : [
        { id: 'PRG-001', name: 'Delhi-Mumbai Expressway (Ph-1 & 2)', sector: 'Roads & Highways', cost: 98000, progress: 84, status: 'On Track', riskLevel: 'Low' },
        { id: 'PRG-002', name: 'Western Dedicated Freight Corridor (Dadri-JNPT)', sector: 'Railways', cost: 81459, progress: 68, status: 'Delayed', riskLevel: 'High' },
        { id: 'PRG-003', name: 'Jewar International Airport (Noida Ph-1)', sector: 'Airports', cost: 29560, progress: 52, status: 'At Risk', riskLevel: 'Critical' },
        { id: 'PRG-004', name: 'Mumbai Trans Harbour Link (MTHL Approaches)', sector: 'Roads & Highways', cost: 17843, progress: 96, status: 'On Track', riskLevel: 'Low' },
        { id: 'PRG-005', name: 'Polavaram Multi-Purpose National Irrigation', sector: 'Water Resources', cost: 55548, progress: 48, status: 'Delayed', riskLevel: 'Critical' },
      ];

      // Calculate totals
      const totalProjects = sampleList.length;
      const totalCost = sampleList.reduce((acc, p) => acc + (p.cost || p.budget || 0), 0);
      const avgProgress = Math.round(sampleList.reduce((acc, p) => acc + (p.progress || 0), 0) / (totalProjects || 1));
      const criticalCount = sampleList.filter(p => (p.riskLevel || '').toLowerCase() === 'critical').length;
      const delayedCount = sampleList.filter(p => (p.status || '').toLowerCase() === 'delayed').length;

      const templateMeta = REPORT_TEMPLATES.find(t => t.id === selectedTemplate) || REPORT_TEMPLATES[0];

      const reportPayload = {
        meta: {
          id: `PRG-REP-${Date.now().toString().slice(-6)}`,
          title: templateMeta.name,
          generatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          sector: selectedSector,
          riskFilter: selectedRiskFilter,
          dateRange,
          targetAudience: templateMeta.targetAudience
        },
        metrics: {
          totalProjects,
          totalCostCr: totalCost,
          avgProgress,
          criticalCount,
          delayedCount
        },
        projects: sampleList.slice(0, 8),
        impediments: [
          { cause: 'Land Acquisition & Resettlement (Right of Way)', share: '38%', impact: 'High', status: 'Inter-ministerial Action' },
          { cause: 'Statutory Environmental & Forest Clearances', share: '26%', impact: 'High', status: 'State Committee Pending' },
          { cause: 'Contractor Liquidity & Work Packaging Dispute', share: '21%', impact: 'Medium', status: 'Escrow Substitution Underway' },
          { cause: 'Utility Shifting (Power Grid / Water Mains)', share: '15%', impact: 'Low', status: 'Routine Approvals' }
        ],
        directives: [
          'Direct MoRTH and NHAI to fast-track remaining 14 km contiguous ROW handover.',
          'Mandate weekly progress monitoring on critical-tier corridor packages.',
          'Invoke penalty clauses on non-mobilized sub-contractors after 30-day curing notice.'
        ]
      };

      setGeneratedReport(reportPayload);
      setIsGenerating(false);

      // Add to history
      setReportHistory(prev => [
        {
          id: reportPayload.meta.id,
          title: reportPayload.meta.title,
          date: 'Just now',
          sector: selectedSector,
          format: 'Interactive'
        },
        ...prev.slice(0, 5)
      ]);
    }, 600);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!generatedReport) return;
    const headers = ['Project ID', 'Project Name', 'Sector', 'Sanctioned Cost (Cr)', 'Physical Progress (%)', 'Status', 'Risk Level'];
    const rows = generatedReport.projects.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sector,
      p.cost || p.budget,
      p.progress,
      p.status,
      p.riskLevel
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PRAGATI_${generatedReport.meta.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Markdown Digest
  const handleCopyMarkdown = () => {
    if (!generatedReport) return;
    const md = `
# ${generatedReport.meta.title}
*Generated:* ${generatedReport.meta.generatedAt} | *Scope:* ${generatedReport.meta.sector} | *Audience:* ${generatedReport.meta.targetAudience}

## Portfolio Highlights
- **Monitored Projects:** ${generatedReport.metrics.totalProjects}
- **Total CapEx Monitored:** ₹${generatedReport.metrics.totalCostCr.toLocaleString()} Cr
- **Average Progress:** ${generatedReport.metrics.avgProgress}%
- **Critical Projects:** ${generatedReport.metrics.criticalCount}
- **Delayed Projects:** ${generatedReport.metrics.delayedCount}

## Top Critical Projects
${generatedReport.projects.map(p => `- **${p.name}** (${p.sector}): ${p.progress}% progress, Status: ${p.status}, Risk: ${p.riskLevel}`).join('\n')}

## Recommended Directives
${generatedReport.directives.map(d => `1. ${d}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(md);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  return (
    <div className="w-full px-4 lg:px-6 py-6 max-w-[1800px] mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Interactive Report Studio</h1>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded tracking-wide">
              On-Demand Intelligence
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure, generate, preview, and export high-level ministerial briefings and technical audits in real time.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Report Builder & Template Selection (5 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Step 1: Select Template */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold">1</span>
              Select Report Template
            </h3>

            <div className="space-y-2.5">
              {REPORT_TEMPLATES.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedTemplate === tpl.id
                      ? 'border-[#0A2540] bg-blue-50/40 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedTemplate === tpl.id ? 'bg-[#0A2540] text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <span className="material-symbols-outlined text-lg">{tpl.icon}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{tpl.name}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{tpl.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Configure Filters */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold">2</span>
              Configure Scope & Filters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">Target Sector</label>
                <select
                  value={selectedSector}
                  onChange={e => setSelectedSector(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">Risk Severity Filter</label>
                <select
                  value={selectedRiskFilter}
                  onChange={e => setSelectedRiskFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="All">All Projects</option>
                  <option value="Critical">Critical Risk Only</option>
                  <option value="High">High Risk Only</option>
                  <option value="Low">Low Risk / On-Track</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">Audit Timeframe</label>
                <select
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Current Cycle (Q1 2026)">Current Cycle (Q1 2026)</option>
                  <option value="Last 30 Days (Real-time)">Last 30 Days (Real-time)</option>
                  <option value="Full FY 2025-26 Cumulative">Full FY 2025-26 Cumulative</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAIInsights}
                    onChange={e => setIncludeAIInsights(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-700">Include SIH2026 AI Predictive Risk Diagnostics</span>
                </label>
              </div>
            </div>

            <button
              onClick={compileReportData}
              disabled={isGenerating}
              className="w-full py-3 bg-[#0A2540] hover:bg-[#12365a] text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  Synthesizing Report Data...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">auto_graph</span>
                  Generate Dynamic Report
                </>
              )}
            </button>
          </div>

          {/* Recent Reports Audit Log */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Recent Reports</h3>
            <div className="space-y-2.5">
              {reportHistory.map(rep => (
                <div key={rep.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-gray-900 leading-tight">{rep.title}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{rep.date} • {rep.sector}</div>
                  </div>
                  <span className="text-[10px] font-bold font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                    {rep.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Report Preview & Actions (7 cols) */}
        <div className="lg:col-span-8">
          {generatedReport ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6 print:p-0 print:border-none print:shadow-none">
              {/* Report Action Bar (Hidden when printing) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-gray-200 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    Report Ready
                  </span>
                  <span className="text-xs font-mono text-gray-400 font-bold">{generatedReport.meta.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">print</span>
                    Print / PDF
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Export CSV
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A2540] hover:bg-[#12365a] text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">
                      {copiedStatus ? 'done' : 'content_copy'}
                    </span>
                    {copiedStatus ? 'Digest Copied!' : 'Copy Summary'}
                  </button>
                </div>
              </div>

              {/* Printable Header */}
              <div className="space-y-2 border-b border-gray-100 pb-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                      Government of India • Project PRAGATI
                    </span>
                    <h2 className="text-2xl font-black text-gray-900 mt-1">{generatedReport.meta.title}</h2>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>Generated: <strong className="text-gray-800">{generatedReport.meta.generatedAt}</strong></div>
                    <div>Target Audience: <strong className="text-gray-800">{generatedReport.meta.targetAudience}</strong></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                  <span>Sector Scope: <strong>{generatedReport.meta.sector}</strong></span>
                  <span>•</span>
                  <span>Timeframe: <strong>{generatedReport.meta.dateRange}</strong></span>
                  <span>•</span>
                  <span>Risk Filter: <strong>{generatedReport.meta.riskFilter}</strong></span>
                </div>
              </div>

              {/* Executive Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monitored Projects</div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">{generatedReport.metrics.totalProjects}</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monitored CapEx</div>
                  <div className="text-2xl font-black text-blue-700 mt-0.5">₹{(generatedReport.metrics.totalCostCr / 1000).toFixed(1)}k Cr</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg. Completion</div>
                  <div className="text-2xl font-black text-emerald-700 mt-0.5">{generatedReport.metrics.avgProgress}%</div>
                </div>

                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
                  <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Critical Bottlenecks</div>
                  <div className="text-2xl font-black text-red-700 mt-0.5">{generatedReport.metrics.criticalCount}</div>
                </div>
              </div>

              {/* Detailed Project Matrix */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Priority Projects Status Matrix
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Project Name</th>
                        <th className="p-3">Sector</th>
                        <th className="p-3 text-right">Cost (₹ Cr)</th>
                        <th className="p-3 text-right">Progress</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {generatedReport.projects.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                          <td className="p-3 font-mono font-bold text-gray-500">{p.id}</td>
                          <td className="p-3 font-semibold text-gray-900">{p.name}</td>
                          <td className="p-3 text-gray-600">{p.sector}</td>
                          <td className="p-3 text-right font-mono">₹{(p.cost || p.budget || 0).toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-blue-700">{p.progress}%</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'On Track' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' : p.riskLevel === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {p.riskLevel || 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Root Cause Impediments Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Portfolio Delay Impediment Breakdown
                  </h4>
                  <div className="space-y-3 text-xs">
                    {generatedReport.impediments.map((imp, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                        <div>
                          <div className="font-semibold text-gray-800">{imp.cause}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{imp.status}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-blue-700 text-sm">{imp.share}</div>
                          <div className="text-[10px] font-bold text-red-600 uppercase">{imp.impact} Impact</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-indigo-50/20">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-indigo-600 text-base">gavel</span>
                    Secretarial Directives & Actions
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    {generatedReport.directives.map((dir, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-indigo-950 bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
                        <span className="font-bold text-indigo-600">{idx + 1}.</span>
                        <span className="leading-relaxed">{dir}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">summarize</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Report Generated Yet</h3>
              <p className="text-xs text-gray-500 max-w-md mt-1 mb-6">
                Choose a briefing template, select your sector and risk criteria on the left, and click <strong>Generate Dynamic Report</strong> to preview and export live metrics.
              </p>
              <button
                onClick={compileReportData}
                className="px-6 py-2.5 bg-[#0A2540] hover:bg-[#12365a] text-white rounded-lg text-xs font-bold shadow-sm transition-all"
              >
                Generate Executive Briefing Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
