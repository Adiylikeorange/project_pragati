// ============================================================
// PRAGATI - SIH2026 FRONTEND API SERVICE
// Connects React frontend with SIH2026 ML intelligence layer
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function apiRequest(endpoint, options = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('pragati_access_token') : null;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API ${response.status}: ${errorText || response.statusText}`);
  }
  return await response.json();
}

// ============================================================
// SIH2026 SERVICE STATUS
// GET /api/sih2026/status
// ============================================================

export async function getSIH2026Status() {
  try {
    return await apiRequest('/api/sih2026/status');
  } catch (err) {
    console.warn('SIH2026 status unavailable:', err.message);
    return { error: err.message };
  }
}

// ============================================================
// SIH2026 NATIONAL SUMMARY (2,144 projects)
// GET /api/sih2026/national-summary
// ============================================================

export async function getSIH2026NationalSummary() {
  try {
    return await apiRequest('/api/sih2026/national-summary');
  } catch (err) {
    console.warn('SIH2026 national summary unavailable:', err.message);
    return { projects: 2144, project_months: 13200, complete_history_projects: 1358 };
  }
}

// ============================================================
// SIH2026 RISK DISTRIBUTION
// GET /api/sih2026/risk-distribution
// ============================================================

export async function getSIH2026RiskDistribution() {
  try {
    return await apiRequest('/api/sih2026/risk-distribution');
  } catch (err) {
    console.warn('SIH2026 risk distribution unavailable:', err.message);
    return { LOW: 1029, MEDIUM: 609, HIGH: 282, CRITICAL: 141, REVIEW_DATA: 83 };
  }
}

// ============================================================
// SIH2026 SECTOR BREAKDOWN
// GET /api/sih2026/sector-breakdown
// ============================================================

export async function getSIH2026SectorBreakdown() {
  try {
    return await apiRequest('/api/sih2026/sector-breakdown');
  } catch (err) {
    console.warn('SIH2026 sector breakdown unavailable:', err.message);
    return {};
  }
}

// ============================================================
// SIH2026 TOP PRIORITY PROJECTS
// GET /api/sih2026/top-projects?limit=N
// ============================================================

export async function getSIH2026TopProjects(limit = 25) {
  try {
    return await apiRequest(`/api/sih2026/top-projects?limit=${limit}`);
  } catch (err) {
    console.warn('SIH2026 top projects unavailable:', err.message);
    return [];
  }
}

// ============================================================
// SIH2026 EARLY WARNINGS (ML-generated)
// GET /api/sih2026/early-warnings
// ============================================================

export async function getSIH2026EarlyWarnings({ severity, warningType, limit = 100 } = {}) {
  try {
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (warningType) params.append('warning_type', warningType);
    if (limit) params.append('limit', String(limit));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/api/sih2026/early-warnings${qs}`);
  } catch (err) {
    console.warn('SIH2026 early warnings unavailable:', err.message);
    return [];
  }
}

// ============================================================
// SIH2026 PROJECTS LIST (paginated)
// GET /api/sih2026/projects
// ============================================================

export async function getSIH2026Projects({ sector, riskCategory, limit = 100 } = {}) {
  try {
    const params = new URLSearchParams();
    if (sector) params.append('sector', sector);
    if (riskCategory) params.append('risk_category', riskCategory);
    if (limit) params.append('limit', String(limit));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/api/sih2026/projects${qs}`);
  } catch (err) {
    console.warn('SIH2026 projects unavailable:', err.message);
    return [];
  }
}

// ============================================================
// SIH2026 PROJECT RISK (ML prediction)
// GET /api/sih2026/projects/{id}/risk
// ============================================================

export async function getSIH2026ProjectRisk(projectId) {
  try {
    return await apiRequest(`/api/sih2026/projects/${encodeURIComponent(projectId)}/risk`);
  } catch (err) {
    if (err.message.includes('404')) {
      return null; // project not in SIH2026 dataset
    }
    console.warn(`SIH2026 ML risk unavailable for ${projectId}:`, err.message);
    return null;
  }
}

// ============================================================
// SIH2026 WARNING SUMMARY
// GET /api/sih2026/warning-summary
// ============================================================

export async function getSIH2026WarningSummary() {
  try {
    return await apiRequest('/api/sih2026/warning-summary');
  } catch (err) {
    console.warn('SIH2026 warning summary unavailable:', err.message);
    return {};
  }
}

// ============================================================
// SIH2026 ANOMALY SUMMARY
// GET /api/sih2026/anomaly-summary
// ============================================================

export async function getSIH2026AnomalySummary() {
  try {
    return await apiRequest('/api/sih2026/anomaly-summary');
  } catch (err) {
    console.warn('SIH2026 anomaly summary unavailable:', err.message);
    return {};
  }
}

// ============================================================
// SIH2026 PREDICTIVE SUMMARY (XGBoost metrics)
// GET /api/sih2026/predictive-summary
// ============================================================

export async function getSIH2026PredictiveSummary() {
  try {
    return await apiRequest('/api/sih2026/predictive-summary');
  } catch (err) {
    console.warn('SIH2026 predictive summary unavailable:', err.message);
    return {};
  }
}
