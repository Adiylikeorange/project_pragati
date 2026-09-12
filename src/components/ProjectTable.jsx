import React, { useState, useMemo } from 'react';

const ProjectTable = ({ projects = [], onViewDetails }) => {
  const [activeSector, setActiveSector] = useState('All Sectors');
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('All States');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Extract dynamic sector & state options from incoming projects list
  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(new Set(projects.map(p => p.sector).filter(Boolean)));
    return ['All Sectors', ...uniqueSectors];
  }, [projects]);

  const states = useMemo(() => {
    const uniqueStates = Array.from(new Set(projects.map(p => p.state || p.location).filter(Boolean)));
    return ['All States', ...uniqueStates];
  }, [projects]);

  const statuses = ['All Statuses', 'On Track', 'In Progress', 'At Risk', 'Delayed', 'Completed'];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (activeSector !== 'All Sectors' && p.sector !== activeSector) return false;
      const projState = p.state || p.location || '';
      if (stateFilter !== 'All States' && projState !== stateFilter) return false;
      if (statusFilter !== 'All Statuses' && p.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name ? p.name.toLowerCase().includes(query) : false;
        const matchId = p.id ? String(p.id).toLowerCase().includes(query) : false;
        const matchSector = p.sector ? p.sector.toLowerCase().includes(query) : false;
        if (!matchName && !matchId && !matchSector) return false;
      }
      return true;
    }).sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, activeSector, stateFilter, statusFilter, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage) || 1;
  const currentData = filteredProjects.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getStatusColor = (status) => {
    switch(status) {
      case 'On Track': return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'In Progress': return 'text-blue-700 bg-blue-50 border border-blue-200';
      case 'At Risk': return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'Delayed': return 'text-red-700 bg-red-50 border border-red-200';
      case 'Completed': return 'text-emerald-800 bg-emerald-100 border border-emerald-300';
      default: return 'text-gray-700 bg-gray-50 border border-gray-200';
    }
  };

  const getStatusDot = (status) => {
    switch(status) {
      case 'On Track': return 'text-emerald-500';
      case 'In Progress': return 'text-blue-500';
      case 'At Risk': return 'text-amber-500';
      case 'Delayed': return 'text-red-500';
      case 'Completed': return 'text-emerald-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg flex flex-col">
      {/* Sector Tabs */}
      <div className="flex overflow-x-auto pb-3 mb-2 gap-2 border-b border-gray-100">
        {sectors.map((sector) => (
          <button
            key={sector}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeSector === sector 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => { setActiveSector(sector); setCurrentPage(1); }}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="py-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 min-w-[240px] relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
          <input
            type="text"
            placeholder="Search project name, ID, or sector..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            value={stateFilter}
            onChange={(e) => { setStateFilter(e.target.value); setCurrentPage(1); }}
          >
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
              <th className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>
                Project ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                Project Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('sector')}>
                Sector {sortField === 'sector' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('state')}>
                State / Location {sortField === 'state' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 cursor-pointer hover:bg-gray-100 text-right" onClick={() => handleSort('cost')}>
                Cost (₹ Cr) {sortField === 'cost' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('progress')}>
                Progress {sortField === 'progress' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('expectedCompletion')}>
                Completion {sortField === 'expectedCompletion' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-gray-200">
            {currentData.length > 0 ? (
              currentData.map((project) => (
                <tr key={project.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-blue-900">{project.id}</td>
                  <td className="p-3 font-semibold text-gray-900 max-w-[280px] truncate">{project.name}</td>
                  <td className="p-3 text-gray-600 font-medium">{project.sector}</td>
                  <td className="p-3 text-gray-600">{project.state || project.location}</td>
                  <td className="p-3 text-right font-mono font-bold text-gray-900">
                    ₹{typeof project.cost === 'number' ? project.cost.toLocaleString() : (project.budget ? (project.budget / 10000000).toLocaleString() : 'N/A')}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(project.progress, 100)}%` }}></div>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-gray-700">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold gap-1 ${getStatusColor(project.status)}`}>
                      <span className={`material-symbols-outlined text-[10px] ${getStatusDot(project.status)}`}>fiber_manual_record</span>
                      {project.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 font-mono text-[11px]">{project.expectedCompletion || project.expected_end_date || 'N/A'}</td>
                  <td className="p-3 text-center">
                    <button
                      className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded text-[11px] transition-colors shadow-sm"
                      onClick={() => onViewDetails(project.id)}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-500 font-medium">
                  No projects found matching the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pt-3 flex items-center justify-between text-xs text-gray-500">
        <div>
          Showing <span className="font-semibold text-gray-800">{Math.min((currentPage - 1) * rowsPerPage + 1, filteredProjects.length)}</span> to <span className="font-semibold text-gray-800">{Math.min(currentPage * rowsPerPage, filteredProjects.length)}</span> of <span className="font-semibold text-gray-800">{filteredProjects.length}</span> projects
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </button>
          <span className="px-2 font-mono font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
          <button
            className="px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTable;
