import React, { useState } from 'react';
import { markAlertAsRead } from '../services/api';

const EarlyWarnings = ({ warnings = [] }) => {
  const [alerts, setAlerts] = useState(warnings);

  // Sync if prop changes
  React.useEffect(() => {
    if (warnings && warnings.length) {
      setAlerts(warnings);
    }
  }, [warnings]);

  const handleInitiateProtocol = async (alertId) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true, protocol_initiated: true } : a));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const warningData = alerts.length ? alerts : [
    {
      id: 'EW-001',
      severity: 'Critical',
      riskScore: 94,
      delayProbability: 88,
      projectName: 'Mumbai Coastal Infrastructure (South Section)',
      sector: 'Urban Development',
      state: 'Maharashtra',
      description: 'Imminent stall due to contractor financial insolvency. Expected delay: 6+ months.',
      mandatedAction: 'Invoke emergency fund substitution protocol.'
    },
    {
      id: 'EW-002',
      severity: 'Critical',
      riskScore: 91,
      delayProbability: 82,
      projectName: 'Eastern Dedicated Freight Corridor',
      sector: 'Railways',
      state: 'Uttar Pradesh',
      description: 'Repeated local protests blocking ROW at segment 4B.',
      mandatedAction: 'Mandate central security deployment & state coordination meeting.'
    },
    {
      id: 'EW-003',
      severity: 'High',
      riskScore: 86,
      delayProbability: 75,
      projectName: 'Jewar International Airport (Noida Ph-1)',
      sector: 'Airports',
      state: 'Uttar Pradesh',
      description: 'Pending DGCA safety clearance for runway 2 extending beyond buffer.',
      mandatedAction: 'Escalate to Secretary, Civil Aviation.'
    }
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Early Warning System</h2>
        <span className="text-gray-400">/</span>
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Predictive Insights</span>
      </div>

      {/* Pipeline Visual */}
      <div className="hidden md:flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 text-xs font-bold text-gray-600 uppercase tracking-wide">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-500">sensors</span>
          Real-time Field Data
        </div>
        <span className="material-symbols-outlined text-gray-300">arrow_right_alt</span>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-500">analytics</span>
          14-Factor Risk Engine
        </div>
        <span className="material-symbols-outlined text-gray-300">arrow_right_alt</span>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-500">calculate</span>
          Score Computation
        </div>
        <span className="material-symbols-outlined text-gray-300">arrow_right_alt</span>
        <div className="flex items-center gap-2 text-amber-600">
          <span className="material-symbols-outlined">warning</span>
          Threshold Crossed (&gt;80)
        </div>
        <span className="material-symbols-outlined text-gray-300">arrow_right_alt</span>
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-2 py-1 rounded">
          <span className="material-symbols-outlined">assignment_late</span>
          Secretarial Intervention
        </div>
      </div>

      {/* Warning Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {warningData.map((warning) => {
          const title = warning.projectName || warning.project_name || warning.project || 'Project Warning';
          const severity = warning.severity || warning.level || 'High';
          const isCritical = severity.toLowerCase().includes('critical');
          const score = warning.riskScore || warning.score || 85;
          const prob = warning.delayProbability || warning.prob || 80;
          const desc = warning.description || warning.desc || warning.message || '';
          const action = warning.mandatedAction || warning.action || 'Review immediately';

          return (
            <div key={warning.id} className={`bg-white rounded-lg shadow-md border-t-4 ${isCritical ? 'border-red-500' : 'border-amber-500'} overflow-hidden flex flex-col`}>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                      {severity} • Score {score}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-gray-900">{prob}%</div>
                      <div className="text-[10px] text-gray-500 uppercase">Delay Prob.</div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2">{title}</h3>
                  <p className="text-xs text-gray-500 mb-4">{warning.sector || 'Infrastructure'} | {warning.state || 'National'}</p>
                  
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 mb-4 border border-gray-100">
                    <span className="font-semibold text-red-600 block mb-1">Impasse:</span>
                    {desc}
                  </div>
                </div>
                
                <div className="text-sm font-medium text-gray-900 flex items-start gap-2 mb-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px] mt-0.5">gavel</span>
                  <div>
                    <span className="text-xs text-indigo-600 font-bold uppercase block mb-0.5">Mandated Action</span>
                    {action}
                  </div>
                </div>
              </div>
              
              <div className="mt-auto border-t border-gray-100 p-4 bg-gray-50 flex gap-2">
                <button 
                  onClick={() => handleInitiateProtocol(warning.id)}
                  disabled={warning.protocol_initiated || warning.is_read}
                  className={`flex-1 font-semibold py-2 px-4 rounded text-sm transition-colors ${
                    warning.protocol_initiated || warning.is_read
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {warning.protocol_initiated || warning.is_read ? 'Protocol Initiated ✓' : 'Initiate Protocol'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EarlyWarnings;
