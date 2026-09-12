import React from 'react';

const DelayAnalysis = ({ delayCauses = [], delayedProjects = [] }) => {
  const causes = delayCauses.length ? delayCauses : [
    { name: 'Land Acquisition', count: 68, capex: '₹42,500 Cr', width: '100%', color: 'bg-red-500' },
    { name: 'Environmental Clearance', count: 45, capex: '₹18,200 Cr', width: '66%', color: 'bg-amber-500' },
    { name: 'Fund Constraints', count: 32, capex: '₹12,400 Cr', width: '47%', color: 'bg-orange-500' },
    { name: 'Contractor Issues', count: 28, capex: '₹8,900 Cr', width: '41%', color: 'bg-blue-500' },
    { name: 'State Govt Approvals', count: 21, capex: '₹5,100 Cr', width: '30%', color: 'bg-indigo-500' },
    { name: 'Utility Shifting', count: 18, capex: '₹3,200 Cr', width: '26%', color: 'bg-purple-500' },
    { name: 'Court Cases', count: 12, capex: '₹14,800 Cr', width: '17%', color: 'bg-pink-500' }
  ];

  const projects = delayedProjects.length ? delayedProjects : [
    { name: 'Dwarka Expressway Pkg 3', state: 'Delhi', delay: 185, impediment: 'Land Acquisition' },
    { name: 'Mumbai Metro Line 3', state: 'Maharashtra', delay: 420, impediment: 'Court Case (Aarey)' },
    { name: 'Polavaram Irrigation', state: 'Andhra Pradesh', delay: 650, impediment: 'Fund Constraints' },
    { name: 'Kudankulam NPP Units 3&4', state: 'Tamil Nadu', delay: 310, impediment: 'Supply Chain (Foreign)' },
    { name: 'Zojila Tunnel', state: 'J&K', delay: 145, impediment: 'Harsh Weather / Contractor' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-10">
      <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-600">troubleshoot</span>
          Root Cause Analysis: Delayed Portfolio
        </h2>
        <button className="text-indigo-600 text-sm font-medium hover:underline">Download Report (PDF)</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Bar Chart */}
        <div className="lg:col-span-7 p-6 border-r border-gray-200">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-6">Primary Impediments by Occurrence</h3>
          
          <div className="space-y-5">
            {causes.map((cause, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-end mb-1">
                  <span className="font-semibold text-sm text-gray-800">{cause.name}</span>
                  <span className="text-xs text-gray-500 font-medium">{cause.count} Projects | {cause.capex}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-sm h-4 border border-gray-200">
                  <div className={`${cause.color} h-full rounded-sm`} style={{ width: cause.width }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Table */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Top Delayed Projects</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 font-semibold text-gray-700">Project</th>
                  <th className="p-3 font-semibold text-gray-700">State</th>
                  <th className="p-3 font-semibold text-gray-700">Delay</th>
                  <th className="p-3 font-semibold text-gray-700">Impediment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{p.name}</td>
                    <td className="p-3 text-gray-600">{p.state}</td>
                    <td className="p-3 text-red-600 font-bold">{p.delay}d</td>
                    <td className="p-3 text-gray-600">{p.impediment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelayAnalysis;
