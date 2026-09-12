import React, { useState, useMemo } from 'react';
import { markAlertAsRead } from '../services/api';

const DEFAULT_WARNINGS = [
  {
    id: 'EW-001',
    severity: 'Critical',
    riskScore: 94,
    delayProbability: 88,
    projectName: 'Mumbai Coastal Infrastructure (South Section)',
    sector: 'Urban Development',
    state: 'Maharashtra',
    description: 'Imminent stall due to contractor financial insolvency and equipment de-mobilization. Expected delay: 6+ months.',
    mandatedAction: 'Invoke emergency fund substitution protocol & appoint interim concessionaire.',
    status: 'Pending',
    detectedDate: 'Today, 08:30 AM',
    escalatedTo: null,
    notes: ''
  },
  {
    id: 'EW-002',
    severity: 'Critical',
    riskScore: 91,
    delayProbability: 82,
    projectName: 'Eastern Dedicated Freight Corridor (Segment 4B)',
    sector: 'Railways',
    state: 'Uttar Pradesh',
    description: 'Repeated local protests blocking Right-of-Way (ROW) access over 14 km stretch.',
    mandatedAction: 'Mandate central security deployment & state coordination taskforce.',
    status: 'Pending',
    detectedDate: 'Yesterday, 04:15 PM',
    escalatedTo: null,
    notes: ''
  },
  {
    id: 'EW-003',
    severity: 'High',
    riskScore: 86,
    delayProbability: 75,
    projectName: 'Jewar International Airport (Noida Ph-1)',
    sector: 'Airports',
    state: 'Uttar Pradesh',
    description: 'Pending DGCA statutory safety clearance for runway 2 extending beyond designated buffer window.',
    mandatedAction: 'Escalate to Secretary, Civil Aviation for expedited joint committee review.',
    status: 'Pending',
    detectedDate: '2 days ago',
    escalatedTo: null,
    notes: ''
  },
  {
    id: 'EW-004',
    severity: 'High',
    riskScore: 81,
    delayProbability: 69,
    projectName: 'Zojila Tunnel Strategic Highway',
    sector: 'Roads & Highways',
    state: 'Ladakh / J&K',
    description: 'Severe winter geotechnical slippage along portal 2; rock-bolting progress slowed by 45%.',
    mandatedAction: 'Deploy specialized BRO high-altitude boring machinery.',
    status: 'Pending',
    detectedDate: '3 days ago',
    escalatedTo: null,
    notes: ''
  },
  {
    id: 'EW-005',
    severity: 'Medium',
    riskScore: 74,
    delayProbability: 58,
    projectName: 'Kaza Solar Ultra-Mega Power Park',
    sector: 'Power & Energy',
    state: 'Himachal Pradesh',
    description: 'Grid connectivity transmission line clearance held at state environmental department.',
    mandatedAction: 'Dispatch state liaison officer for green corridor clearance signoff.',
    status: 'Pending',
    detectedDate: '4 days ago',
    escalatedTo: null,
    notes: ''
  }
];

export default function EarlyWarnings({ warnings = [] }) {
  // Normalize incoming warnings or use defaults
  const [alerts, setAlerts] = useState(() => {
    if (warnings && warnings.length > 0) {
      return warnings.map((w, idx) => ({
        id: w.id || `EW-00${idx + 1}`,
        severity: w.severity || (w.risk_level ? w.risk_level.charAt(0).toUpperCase() + w.risk_level.slice(1) : 'High'),
        riskScore: w.riskScore || w.score || 85,
        delayProbability: w.delayProbability || w.prob || 75,
        projectName: w.projectName || w.project_name || w.project || 'National Infrastructure Project',
        sector: w.sector || 'Infrastructure',
        state: w.state || 'National',
        description: w.description || w.desc || w.message || 'Anomaly detected requiring secretarial attention.',
        mandatedAction: w.mandatedAction || w.action || 'Initiate review with line ministry.',
        status: w.status || (w.protocol_initiated || w.is_read ? 'Protocol Initiated' : 'Pending'),
        detectedDate: w.detectedDate || 'Recent',
        escalatedTo: w.escalatedTo || null,
        notes: w.notes || ''
      }));
    }
    return DEFAULT_WARNINGS;
  });

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Interactive Escalation Modal State
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [escalationAuthority, setEscalationAuthority] = useState('Cabinet Secretariat');
  const [escalationDeadline, setEscalationDeadline] = useState('48 Hours');
  const [escalationNotes, setEscalationNotes] = useState('');

  // New Simulation Modal State
  const [showSimModal, setShowSimModal] = useState(false);
  const [newAlertForm, setNewAlertForm] = useState({
    projectName: '',
    sector: 'Roads & Highways',
    state: 'Maharashtra',
    severity: 'Critical',
    description: '',
    mandatedAction: ''
  });

  // Unique sectors for filter
  const sectors = useMemo(() => {
    const list = new Set(alerts.map(a => a.sector).filter(Boolean));
    return ['All', ...Array.from(list)];
  }, [alerts]);

  // Filtered Alert List
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = 
        alert.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.state.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSeverity = severityFilter === 'All' || alert.severity.toLowerCase() === severityFilter.toLowerCase();
      const matchesSector = sectorFilter === 'All' || alert.sector.toLowerCase() === sectorFilter.toLowerCase();
      const matchesStatus = statusFilter === 'All' || alert.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesSeverity && matchesSector && matchesStatus;
    });
  }, [alerts, searchQuery, severityFilter, sectorFilter, statusFilter]);

  // Real-time Counter Stats
  const stats = useMemo(() => {
    const total = alerts.length;
    const critical = alerts.filter(a => a.severity.toLowerCase().includes('critical')).length;
    const high = alerts.filter(a => a.severity.toLowerCase().includes('high')).length;
    const pending = alerts.filter(a => a.status === 'Pending').length;
    const initiated = alerts.filter(a => a.status === 'Protocol Initiated').length;
    return { total, critical, high, pending, initiated };
  }, [alerts]);

  // Open Escalation Modal
  const handleOpenEscalate = (alert) => {
    setSelectedAlert(alert);
    setEscalationNotes(alert.notes || `Priority directive issued for ${alert.projectName}.`);
  };

  // Submit Escalation Protocol
  const handleConfirmEscalation = async () => {
    if (!selectedAlert) return;
    try {
      await markAlertAsRead(selectedAlert.id);
    } catch {
      // best-effort
    }

    setAlerts(prev => prev.map(a => {
      if (a.id === selectedAlert.id) {
        return {
          ...a,
          status: 'Protocol Initiated',
          escalatedTo: escalationAuthority,
          notes: `${escalationNotes} [Deadline: ${escalationDeadline}]`,
          protocol_initiated: true,
          is_read: true,
        };
      }
      return a;
    }));

    setSelectedAlert(null);
  };

  // Quick Resolve Toggle
  const handleToggleResolve = (alertId) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        const nextStatus = a.status === 'Resolved' ? 'Protocol Initiated' : 'Resolved';
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  // Add Simulated Anomaly
  const handleAddSimulatedAlert = (e) => {
    e.preventDefault();
    const newId = `EW-SIM-${Math.floor(100 + Math.random() * 900)}`;
    const createdAlert = {
      id: newId,
      projectName: newAlertForm.projectName || 'Simulated Greenfield Corridor',
      sector: newAlertForm.sector,
      state: newAlertForm.state,
      severity: newAlertForm.severity,
      riskScore: newAlertForm.severity === 'Critical' ? 95 : 82,
      delayProbability: newAlertForm.severity === 'Critical' ? 89 : 72,
      description: newAlertForm.description || 'Dynamic anomaly detected by real-time monitoring engine.',
      mandatedAction: newAlertForm.mandatedAction || 'Immediate inter-ministerial coordination review.',
      status: 'Pending',
      detectedDate: 'Just now',
      escalatedTo: null,
      notes: ''
    };

    setAlerts(prev => [createdAlert, ...prev]);
    setShowSimModal(false);
    setNewAlertForm({
      projectName: '',
      sector: 'Roads & Highways',
      state: 'Maharashtra',
      severity: 'Critical',
      description: '',
      mandatedAction: ''
    });
  };

  return (
    <div className="mb-10 font-sans">
      {/* Page / Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">AI Early Warning System</h2>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded tracking-wide">
              Predictive Impasse Detection
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time anomaly identification and automated secretarial intervention protocols across mega-projects.
          </p>
        </div>

        <button
          onClick={() => setShowSimModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-base">add_alert</span>
          Simulate Field Impasse
        </button>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Warnings</div>
          <div className="text-2xl font-black text-gray-900 mt-0.5">{stats.total}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-red-200 bg-red-50/30 shadow-sm">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            Critical Triggers
          </div>
          <div className="text-2xl font-black text-red-700 mt-0.5">{stats.critical}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">High Risk Warnings</div>
          <div className="text-2xl font-black text-amber-700 mt-0.5">{stats.high}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pending Action</div>
          <div className="text-2xl font-black text-indigo-700 mt-0.5">{stats.pending}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Protocols Active</div>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">{stats.initiated}</div>
        </div>
      </div>

      {/* Interactive Filter & Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Search warnings by project, ID, impasse..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Severity */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-500">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 outline-none"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>

          {/* Sector */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-500">Sector:</span>
            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 outline-none"
            >
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Protocol Initiated">Protocol Initiated</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {(searchQuery || severityFilter !== 'All' || sectorFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setSeverityFilter('All'); setSectorFilter('All'); setStatusFilter('All'); }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Warning Cards Grid */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border-2 border-dashed border-gray-200 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">filter_alt_off</span>
          <p className="text-sm font-semibold text-gray-600">No warnings match your current filters.</p>
          <p className="text-xs text-gray-400 mt-1">Try resetting the search terms or changing severity filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlerts.map(warning => {
            const isCritical = warning.severity.toLowerCase().includes('critical');
            const isInitiated = warning.status === 'Protocol Initiated';
            const isResolved = warning.status === 'Resolved';

            return (
              <div 
                key={warning.id}
                className={`bg-white rounded-xl shadow-sm border-t-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  isResolved
                    ? 'border-t-emerald-400 opacity-80'
                    : isCritical
                      ? 'border-t-red-600'
                      : 'border-t-amber-500'
                } border border-gray-200`}
              >
                <div className="p-5">
                  {/* Card Header: Severity & Delay Prob */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {warning.severity} • Score {warning.riskScore}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                        {warning.id}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-gray-900 leading-none">{warning.delayProbability}%</div>
                      <div className="text-[9px] text-gray-400 uppercase tracking-tight">Slippage Prob.</div>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <h3 className="font-bold text-base text-gray-900 leading-snug mb-1">
                    {warning.projectName}
                  </h3>
                  <div className="text-xs text-gray-500 mb-3.5 flex items-center gap-2">
                    <span className="font-semibold text-gray-700">{warning.sector}</span>
                    <span>•</span>
                    <span>{warning.state}</span>
                    <span>•</span>
                    <span className="text-gray-400">{warning.detectedDate}</span>
                  </div>

                  {/* Impasse Breakdown */}
                  <div className="bg-red-50/40 border border-red-100 rounded-lg p-3 text-xs text-gray-800 mb-3.5">
                    <div className="flex items-center gap-1 font-bold text-red-700 mb-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      Field Impasse Driver
                    </div>
                    <p className="leading-relaxed text-gray-700">{warning.description}</p>
                  </div>

                  {/* Mandated Action */}
                  <div className="text-xs text-gray-800 flex items-start gap-2 bg-indigo-50/40 border border-indigo-100 p-3 rounded-lg">
                    <span className="material-symbols-outlined text-indigo-700 text-base mt-0.5">gavel</span>
                    <div>
                      <div className="font-bold text-indigo-900 uppercase tracking-tight mb-0.5">Mandated Action</div>
                      <p className="text-indigo-800 leading-relaxed">{warning.mandatedAction}</p>
                    </div>
                  </div>

                  {/* Active Protocol Badge if initiated */}
                  {isInitiated && warning.escalatedTo && (
                    <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                        Escalated to: <strong>{warning.escalatedTo}</strong>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase">Active</span>
                    </div>
                  )}

                  {warning.notes && (
                    <p className="text-[11px] text-gray-500 italic mt-2">
                      Note: {warning.notes}
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="border-t border-gray-100 bg-gray-50 p-3.5 flex items-center justify-between gap-2 rounded-b-xl">
                  {isResolved ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        Impasse Resolved
                      </span>
                      <button
                        onClick={() => handleToggleResolve(warning.id)}
                        className="text-[11px] text-gray-500 hover:text-gray-700 font-semibold"
                      >
                        Re-open
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenEscalate(warning)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                          isInitiated
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-[#0A2540] hover:bg-[#12365a] text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isInitiated ? 'task_alt' : 'bolt'}
                        </span>
                        {isInitiated ? 'Update Protocol' : 'Initiate Protocol'}
                      </button>

                      <button
                        onClick={() => handleToggleResolve(warning.id)}
                        className="py-2 px-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold"
                        title="Mark as Resolved"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Escalation Action Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-xl">admin_panel_settings</span>
                <h3 className="font-bold text-lg text-gray-900">Initiate Escalation Protocol</h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="my-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900 text-sm">{selectedAlert.projectName}</div>
                <div className="text-gray-500 mt-0.5">{selectedAlert.sector} • {selectedAlert.state} • Score: {selectedAlert.riskScore}</div>
                <p className="text-red-700 font-medium mt-1.5">{selectedAlert.description}</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Designated Intervention Authority
                </label>
                <select
                  value={escalationAuthority}
                  onChange={e => setEscalationAuthority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Cabinet Secretariat">Cabinet Secretariat (PMO Infrastructure Cell)</option>
                  <option value="Line Ministry Taskforce">Line Ministry Standing Empowered Committee</option>
                  <option value="Chief Secretary (State)">State Government — Chief Secretary Directorate</option>
                  <option value="NHAI / PMO Project Directorate">NHAI / PMO Project Directorate</option>
                  <option value="Ministry of Environment & Forest">MoEFCC Expedited Fast-Track Committee</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Resolution Target Deadline
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['24 Hours', '48 Hours', '7 Days'].map(dl => (
                    <button
                      key={dl}
                      type="button"
                      onClick={() => setEscalationDeadline(dl)}
                      className={`py-2 px-3 rounded-lg font-bold border text-xs ${
                        escalationDeadline === dl
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {dl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Secretarial Directives / Special Instructions
                </label>
                <textarea
                  rows="3"
                  value={escalationNotes}
                  onChange={e => setEscalationNotes(e.target.value)}
                  placeholder="Enter specific remediation orders, contractor notices, or inter-ministerial liaison requirements..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEscalation}
                className="px-5 py-2 text-xs font-bold bg-[#0A2540] hover:bg-[#12365a] text-white rounded-lg shadow-sm"
              >
                Dispatch Secretarial Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Impasse Simulation Modal */}
      {showSimModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddSimulatedAlert} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-xl">sensors</span>
                <h3 className="font-bold text-lg text-gray-900">Simulate Real-time Field Impasse</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru-Chennai Expressway Package 3"
                  value={newAlertForm.projectName}
                  onChange={e => setNewAlertForm({ ...newAlertForm, projectName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Sector</label>
                  <select
                    value={newAlertForm.sector}
                    onChange={e => setNewAlertForm({ ...newAlertForm, sector: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Roads & Highways">Roads & Highways</option>
                    <option value="Railways">Railways</option>
                    <option value="Urban Development">Urban Development</option>
                    <option value="Airports">Airports</option>
                    <option value="Power & Energy">Power & Energy</option>
                    <option value="Water Resources">Water Resources</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Karnataka"
                    value={newAlertForm.state}
                    onChange={e => setNewAlertForm({ ...newAlertForm, state: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Severity Level</label>
                <div className="flex gap-4">
                  {['Critical', 'High', 'Medium'].map(sev => (
                    <label key={sev} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="severity"
                        checked={newAlertForm.severity === sev}
                        onChange={() => setNewAlertForm({ ...newAlertForm, severity: sev })}
                        className="text-indigo-600"
                      />
                      <span className="font-semibold text-gray-800">{sev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Impasse Description *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Environmental stay order issued by NGT halting bridge pillar foundation."
                  value={newAlertForm.description}
                  onChange={e => setNewAlertForm({ ...newAlertForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Recommended Action</label>
                <input
                  type="text"
                  placeholder="e.g. File expedited review petition and modify pillar span design."
                  value={newAlertForm.mandatedAction}
                  onChange={e => setNewAlertForm({ ...newAlertForm, mandatedAction: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
              >
                Trigger Warning
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
