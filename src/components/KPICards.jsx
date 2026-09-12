import React from 'react';

const KPICards = ({ metrics = {} }) => {
  const totalProjects = metrics.totalProjects ?? 1048;
  const onTrack = metrics.onTrack ?? 680;
  const inProgress = metrics.inProgress ?? 175;
  const atRisk = metrics.atRisk ?? 110;
  const delayed = metrics.delayed ?? 145;
  const completed = metrics.completed ?? 320;
  const totalAllocation = metrics.totalAllocation || '₹108.4 Lakh Cr';

  const onTrackPct = totalProjects ? Math.round((onTrack / totalProjects) * 1000) / 10 : 64.9;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {/* Total Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Monitored</span>
          <span className="material-symbols-outlined text-gray-400 text-xl">account_tree</span>
        </div>
        <div className="text-3xl font-bold font-mono text-gray-900 mb-1">{totalProjects.toLocaleString()}</div>
        <div className="text-xs text-gray-500 mb-3">Across 28 States & 8 UTs</div>
        <div className="mt-auto bg-gray-100 text-gray-700 text-xs font-mono font-medium py-1 px-2 rounded truncate">
          {totalAllocation} Allocated
        </div>
      </div>

      {/* On Track */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">On Track</span>
          <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
        </div>
        <div className="text-3xl font-bold font-mono text-emerald-600 mb-1">{onTrack.toLocaleString()}</div>
        <div className="text-xs text-gray-500 mb-3">{onTrackPct}% of portfolio</div>
        <div className="mt-auto bg-emerald-50 text-emerald-800 text-xs font-medium py-1 px-2 rounded">
          Zero Slippage Baseline
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">In Progress</span>
          <span className="material-symbols-outlined text-blue-500 text-xl">engineering</span>
        </div>
        <div className="text-3xl font-bold font-mono text-blue-600 mb-1">{inProgress.toLocaleString()}</div>
        <div className="text-xs text-gray-500 mb-3">Active construction</div>
        <div className="mt-auto bg-blue-50 text-blue-700 text-xs font-medium py-1 px-2 rounded">
          Under Target - Active
        </div>
      </div>

      {/* At Risk */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">At Risk</span>
          <span className="material-symbols-outlined text-amber-500 text-xl">warning</span>
        </div>
        <div className="text-3xl font-bold font-mono text-amber-600 mb-1">{atRisk.toLocaleString()}</div>
        <div className="text-xs text-gray-500 mb-3">Close oversight required</div>
        <div className="mt-auto bg-amber-50 text-amber-800 text-xs font-medium py-1 px-2 rounded">
          Watchlist Active
        </div>
      </div>

      {/* Delayed */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Delayed</span>
          <span className="material-symbols-outlined text-red-500 text-xl">crisis_alert</span>
        </div>
        <div className="text-3xl font-bold font-mono text-red-600 mb-1">{delayed.toLocaleString()}</div>
        <div className="text-xs text-gray-500 mb-3">Slippage &gt; 30 days</div>
        <div className="mt-auto bg-red-50 text-red-800 text-xs font-medium py-1 px-2 rounded">
          Escalated - Action Reqd
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Completed</span>
          <span className="material-symbols-outlined text-blue-600 text-xl">task_alt</span>
        </div>
        <div className="text-3xl font-bold font-mono text-blue-700 mb-1">{completed.toLocaleString()}</div>
        <div className="text-xs text-gray-500 mb-3">Fully commissioned</div>
        <div className="mt-auto bg-blue-50 text-blue-800 text-xs font-medium py-1 px-2 rounded">
          Handed Over 100%
        </div>
      </div>
    </div>
  );
};

export default KPICards;
