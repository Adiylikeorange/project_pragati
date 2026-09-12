import React from 'react';

const RiskMonitoring = ({ projects = [], riskPredictions = [], riskFactors = [] }) => {
  // Use mock data if props are empty for prototype purposes
  const escalations = projects.filter(p => p.status === 'Delayed' || p.status === 'At Risk').slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      {/* Left side: Escalations */}
      <div className="lg:col-span-8 bg-white rounded-lg shadow flex flex-col p-5 border border-gray-200">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">warning</span>
            Projects Requiring Immediate Attention
          </h2>
          <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
            Top 5 Escalations
          </span>
        </div>

        <div className="space-y-3">
          {escalations.map((project, idx) => (
            <div key={project.id || idx} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <span className={`material-symbols-outlined ${project.status === 'Delayed' ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
                    fiber_manual_record
                  </span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">{project.name}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    {project.sector} | {project.state} | {project.progress}% Progress | Slippage: {project.delay || '30+'} Days
                  </div>
                  <div className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-gray-500">crisis_alert</span>
                    Main Issue: {project.issue || 'Land Acquisition Delay'}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 md:mt-0 flex flex-col items-end">
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Risk Score</div>
                <div className={`text-xl font-black ${project.status === 'Delayed' ? 'text-red-600' : 'text-amber-600'}`}>
                  {project.riskScore || (90 - idx * 2)}/100
                </div>
                <div className={`text-xs px-2 py-0.5 rounded mt-1 font-bold ${project.status === 'Delayed' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                  {project.status === 'Delayed' ? 'Critical' : 'High Risk'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Prediction Engine */}
      <div className="lg:col-span-4 bg-gray-900 text-white rounded-lg shadow p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-symbols-outlined text-[100px]">memory</span>
        </div>
        
        <div className="flex justify-between items-start mb-6 z-10">
          <h2 className="text-lg font-bold text-white">Prediction Engine</h2>
          <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
            v4.2 Engine
          </span>
        </div>

        <p className="text-sm text-gray-300 mb-6 z-10">
          AI-driven predictive analysis indicates a high probability of severe cost overruns for the following project based on historical sector data.
        </p>

        <div className="flex items-center justify-center mb-6 z-10">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Simple circular indicator mock */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
              <circle cx="64" cy="64" r="56" stroke="#ef4444" strokeWidth="12" fill="none" strokeDasharray="351" strokeDashoffset="35" className="transition-all duration-1000" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">92</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Score</span>
            </div>
          </div>
        </div>

        <div className="mb-6 z-10 text-center">
          <div className="font-bold text-lg text-white mb-1">Mumbai-Ahmedabad HSR</div>
          <div className="text-sm text-red-400 font-semibold">92% probability of further slippage</div>
          <div className="text-xs text-gray-400">Forecast: +45 additional days if unmitigated</div>
        </div>

        <div className="space-y-3 z-10 mb-6">
          <div className="text-xs font-bold text-gray-400 uppercase">Risk Factor Weights</div>
          {(riskFactors.length ? riskFactors : [
            { name: 'Land Acquisition', weight: 85 },
            { name: 'Financial Approvals', weight: 65 },
            { name: 'Contractor Issues', weight: 45 },
            { name: 'Environmental Clearances', weight: 40 },
            { name: 'Supply Chain', weight: 20 }
          ]).map(factor => (
            <div key={factor.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{factor.name}</span>
                <span className="text-gray-400">{factor.weight}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${factor.weight}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto text-[10px] text-gray-500 border-t border-gray-800 pt-3 z-10">
          * Predictions inform the Cabinet Secretarial Protocol. Data refreshed hourly.
        </div>
      </div>
    </div>
  );
};

export default RiskMonitoring;
