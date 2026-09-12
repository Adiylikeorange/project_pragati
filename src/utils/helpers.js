export function formatCurrency(crores) {
  if (crores == null) return '₹0 Cr';
  return `₹${crores.toLocaleString('en-IN')} Cr`;
}

export function getStatusColor(status) {
  switch (status) {
    case 'On Track':
      return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
    case 'In Progress':
      return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' };
    case 'At Risk':
      return { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' };
    case 'Delayed':
      return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
    case 'Completed':
      return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
  }
}

export function getRiskColor(riskLevel) {
  switch (riskLevel?.toLowerCase()) {
    case 'low':
      return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
    case 'medium':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
    case 'high':
      return { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' };
    case 'critical':
      return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
  }
}

export function filterProjects(projects, { search = '', sector = '', state = '', status = '' } = {}) {
  return projects.filter(project => {
    const matchesSearch = !search || project.name.toLowerCase().includes(search.toLowerCase()) || project.id.toLowerCase().includes(search.toLowerCase());
    const matchesSector = !sector || project.sector === sector;
    const matchesState = !state || project.state.includes(state);
    const matchesStatus = !status || project.status === status;
    
    return matchesSearch && matchesSector && matchesState && matchesStatus;
  });
}

export function sortProjects(projects, field, direction = 'asc') {
  return [...projects].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}
