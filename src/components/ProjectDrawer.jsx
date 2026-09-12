import React, { useState } from 'react';
import { updateProject } from '../services/api';

const ProjectDrawer = ({ project, riskPrediction, onClose }) => {
  const [updating, setUpdating] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState(null);

  if (!project) return null;

  const currentStatus = updatedStatus || project.status || 'In Progress';
  const isDelayed = currentStatus === 'Delayed' || currentStatus === 'At Risk';
  const headerBg = isDelayed ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';

  const riskScore = riskPrediction?.risk_score ?? riskPrediction?.riskScore ?? project.risk_score ?? project.riskScore ?? 45;
  const riskLevel = riskPrediction?.risk_level ?? riskPrediction?.riskLevel ?? project.risk_level ?? project.riskLevel ?? 'Medium';
  const primaryBottleneck = riskPrediction?.primary_bottleneck ?? riskPrediction?.primaryBottleneck ?? 'Pending clearance review';
  const recommendation = riskPrediction?.recommendation ?? 'Initiate Secretarial Review Summit';
  const drivers = riskPrediction?.key_risk_drivers ?? riskPrediction?.keyRiskDrivers ?? [];

  const handleStatusEscalation = async (newStatus) => {
    setUpdating(true);
    try {
      await updateProject(project.id, { status: newStatus });
      setUpdatedStatus(newStatus);
    } catch (err) {
      console.error('Failed to update project status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const stages = [
    { label: 'Planning', status: 'completed' },
    { label: 'Cabinet Approval', status: 'completed' },
    { label: 'Land & ROW', status: isDelayed ? 'blocked' : 'completed' },
    { label: 'EPC Tender', status: isDelayed ? 'in-progress' : 'completed' },
    { label: 'Civil Works', status: 'in-progress' },
    { label: 'Safety Audit', status: 'pending' },
    { label: 'Commissioning', status: 'pending' }
  ];

  const getStageColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'blocked': return 'bg-red-500';
      case 'in-progress': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-gray-200">
      {/* Header */}
      <div className={`p-6 border-b flex justify-between items-start ${headerBg}`}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Project Dossier</span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${isDelayed ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
              {currentStatus}
            </span>
            <span className="text-xs font-mono font-bold text-gray-400">ID: {project.id}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{project.name}</h2>
          <p className="text-xs text-gray-600">
            Agency: <span className="font-semibold">{project.executingAgency || project.agency || 'NHAI'}</span> | 
            Ministry: <span className="font-semibold">{project.ministry || 'MoRTH'}</span> | 
            Sector: <span className="font-semibold">{project.sector}</span>
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <span className="material-symbols-outlined text-gray-500">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <div className="text-[11px] text-gray-500 uppercase font-bold">Sanctioned Cost</div>
            <div className="text-lg font-bold font-mono text-gray-900">₹ {project.cost || project.sanctionedCost || '1,000'} Cr</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-500 uppercase font-bold">State / Location</div>
            <div className="text-sm font-bold text-gray-900">{project.state || project.location || 'India'}</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-500 uppercase font-bold">Target Completion</div>
            <div className="text-sm font-bold font-mono text-gray-900">{project.expectedCompletion || project.expected_end_date || 'Dec 2026'}</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-500 uppercase font-bold">AI Risk Score</div>
            <div className={`text-lg font-bold font-mono ${riskScore > 80 ? 'text-red-600' : riskScore > 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {riskScore} / 100 ({riskLevel})
            </div>
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Physical & Financial Progress</h3>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700">Physical Progress</span>
              <span className="font-mono font-bold text-blue-900">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700">Financial Disbursement (CapEx)</span>
              <span className="font-mono font-bold text-emerald-800">{project.financialProgress || Math.round(project.progress * 0.95)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${project.financialProgress || Math.round(project.progress * 0.95)}%` }}></div>
            </div>
          </div>
        </div>

        {/* AI Model Risk Analysis Section */}
        <div className="p-5 bg-gradient-to-br from-gray-900 to-slate-800 text-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">psychology</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">Predictive AI Risk Analysis</h3>
            </div>
            <span className="text-[10px] font-mono bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
              Confidence: {Math.round((riskPrediction?.confidence || 0.91) * 100)}%
            </span>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Primary Identified Bottleneck</div>
            <div className="text-sm font-bold text-amber-300">{primaryBottleneck}</div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Actionable Recommendation</div>
            <div className="text-xs text-slate-200 bg-slate-800/80 p-2.5 rounded border border-slate-700">{recommendation}</div>
          </div>

          {drivers.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 uppercase font-semibold mb-2">Key Risk Drivers</div>
              <div className="space-y-1.5">
                {drivers.map((driver, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{driver.factor}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${driver.contribution}%` }}></div>
                      </div>
                      <span className="font-mono text-amber-300 w-8 text-right">{driver.contribution}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Milestone Lifecycle */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Project Milestone Pipeline</h3>
          <div className="relative pt-2">
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10"></div>
            <div className="flex justify-between">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center w-20">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1.5 shadow border-2 border-white ${getStageColor(stage.status)}`}>
                    {stage.status === 'completed' && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                    {stage.status === 'blocked' && <span className="material-symbols-outlined text-white text-[12px]">close</span>}
                    {stage.status === 'in-progress' && <span className="material-symbols-outlined text-white text-[12px]">sync</span>}
                  </div>
                  <div className="text-[10px] text-center font-semibold text-gray-600 uppercase leading-tight">
                    {stage.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleStatusEscalation('On Track')}
              disabled={updating}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Mark On Track
            </button>
            <button 
              onClick={() => handleStatusEscalation('At Risk')}
              disabled={updating}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Flag At Risk
            </button>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-semibold transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDrawer;
