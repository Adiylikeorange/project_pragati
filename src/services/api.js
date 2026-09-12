// ============================================================
// PRAGATI - FRONTEND API SERVICE
// Connects React frontend with FastAPI backend
// ============================================================

import {
  earlyWarnings as fallbackWarnings,
  riskFactors as fallbackRiskFactors,
  delayCauses as fallbackDelayCauses,
  delayedProjects as fallbackDelayedProjects,
  portfolioMetrics as fallbackMetrics,
  riskSummary as fallbackRiskSummary
} from '../data/alerts';

import { projects as fallbackProjects } from '../data/projects';


// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';


// ============================================================
// COMMON API REQUEST HELPER
// ============================================================

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `API ${response.status}: ${errorText || response.statusText}`
    );
  }

  return await response.json();
}


// ============================================================
// NORMALIZE PROJECT DATA
// Converts FastAPI snake_case fields to frontend camelCase
// ============================================================

function normalizeProject(project) {
  if (!project) {
    return null;
  }

  return {
    // Basic information
    id: project.id || project.project_id,
    name: project.name || project.project_name || '',
    sector: project.sector || '',
    location: project.location || '',
    state: project.state || '',
    description: project.description || '',

    // Financial
    budget:
      project.budget ??
      project.original_cost_cr ??
      project.cost ??
      0,

    cost:
      project.cost ??
      project.revised_cost_cr ??
      project.original_cost_cr ??
      0,

    originalCost:
      project.original_cost_cr ??
      project.originalCost ??
      0,

    revisedCost:
      project.revised_cost_cr ??
      project.revisedCost ??
      0,

    cumulativeExpenditure:
      project.cumulative_expenditure_cr ??
      project.cumulativeExpenditure ??
      0,

    // Progress
    progress:
      project.progress ??
      project.physical_progress_pct ??
      0,

    physicalProgress:
      project.physical_progress_pct ??
      project.progress ??
      0,

    financialProgress:
      project.financial_progress ??
      0,

    // Status
    status: project.status || 'Unknown',

    // Dates
    startDate:
      project.start_date ??
      project.startDate ??
      project.commencement ??
      '',

    commencement:
      project.commencement ??
      project.start_date ??
      '',

    expectedEndDate:
      project.expected_end_date ??
      project.expectedEndDate ??
      project.expected_completion ??
      '',

    expectedCompletion:
      project.expected_completion ??
      project.expected_end_date ??
      project.expectedCompletion ??
      '',

    originalTarget:
      project.original_completion_date ??
      project.originalTarget ??
      '',

    revisedTarget:
      project.revised_completion_date ??
      project.revisedTarget ??
      '',

    // Delay / slippage
    slippage:
      project.slippage ??
      null,

    // Risk
    riskScore:
      project.risk_score ??
      project.riskScore ??
      0,

    riskLevel:
      project.risk_level ??
      project.riskLevel ??
      'Unknown',

    // Organization
    executingAgency:
      project.executingAgency ??
      project.executing_agency ??
      project.agency ??
      '',

    agency:
      project.agency ??
      project.executingAgency ??
      project.executing_agency ??
      '',

    ministry:
      project.ministry ??
      project.line_ministry ??
      '',

    lineMinistry:
      project.line_ministry ??
      project.ministry ??
      '',

    // Dataset information
    observationMonth:
      project.observation_month ??
      '',

    sourceFile:
      project.source_file ??
      '',

    sourcePage:
      project.source_page ??
      '',

    canonicalProjectId:
      project.canonical_project_id ??
      '',

    identityMatch:
      project.identity_match ??
      '',

    identityConfidence:
      project.identity_confidence ??
      ''
  };
}


// ============================================================
// DASHBOARD SUMMARY
// GET /api/dashboard/summary
// ============================================================

export async function getDashboardSummary() {
  try {
    const data = await apiRequest(
      '/api/dashboard/summary'
    );

    console.log(
      'Dashboard data loaded from FastAPI:',
      data
    );

    return data;

  } catch (error) {

    console.warn(
      'Dashboard API unavailable. Using fallback data:',
      error.message
    );

    return {
      total_projects: fallbackProjects.length,

      high_risk_projects:
        fallbackProjects.filter(
          (p) =>
            p.riskLevel === 'High' ||
            p.riskLevel === 'Critical'
        ).length,

      critical_projects:
        fallbackProjects.filter(
          (p) =>
            p.riskLevel === 'Critical'
        ).length,

      projects_on_track:
        fallbackProjects.filter(
          (p) =>
            p.status === 'On Track'
        ).length,

      projects_delayed:
        fallbackProjects.filter(
          (p) =>
            p.status === 'Delayed'
        ).length,

      portfolioMetrics: fallbackMetrics,
      riskSummary: fallbackRiskSummary,
      riskFactors: fallbackRiskFactors,
      delayCauses: fallbackDelayCauses,
      delayedProjects: fallbackDelayedProjects
    };
  }
}


// ============================================================
// GET ALL PROJECTS
// GET /api/projects
// ============================================================

export async function getProjects(sector, status) {

  try {

    const params = new URLSearchParams();

    if (sector) {
      params.append('sector', sector);
    }

    if (status) {
      params.append('status', status);
    }

    const queryString =
      params.toString()
        ? `?${params.toString()}`
        : '';

    const data = await apiRequest(
      `/api/projects${queryString}`
    );

    console.log(
      'Projects loaded from PostgreSQL → FastAPI:',
      data
    );

    // FastAPI may return:
    // [ {...}, {...} ]
    //
    // or:
    // { projects: [...] }

    const projectsArray =
      Array.isArray(data)
        ? data
        : data.projects || data.items || [];

    return projectsArray.map(
      normalizeProject
    );

  } catch (error) {

    console.warn(
      'Projects API unavailable. Using fallback projects:',
      error.message
    );

    let filtered =
      [...fallbackProjects];

    if (sector) {
      filtered = filtered.filter(
        (p) =>
          p.sector?.toLowerCase() ===
          sector.toLowerCase()
      );
    }

    if (status) {
      filtered = filtered.filter(
        (p) =>
          p.status?.toLowerCase() ===
          status.toLowerCase()
      );
    }

    return filtered;
  }
}


// ============================================================
// GET SINGLE PROJECT
// GET /api/projects/{project_id}
// ============================================================

export async function getProjectById(projectId) {

  try {

    const data = await apiRequest(
      `/api/projects/${encodeURIComponent(projectId)}`
    );

    console.log(
      'Project loaded from FastAPI:',
      data
    );

    return normalizeProject(data);

  } catch (error) {

    console.warn(
      `Project ${projectId} API unavailable. Using fallback:`,
      error.message
    );

    return (
      fallbackProjects.find(
        (p) => p.id === projectId
      ) ||
      fallbackProjects[0]
    );
  }
}


// ============================================================
// GET PROJECT RISK
// GET /api/projects/{project_id}/risk
// ============================================================

export async function getProjectRisk(projectId) {

  try {

    const data = await apiRequest(
      `/api/projects/${encodeURIComponent(projectId)}/risk`
    );

    console.log(
      'Risk data loaded from FastAPI:',
      data
    );

    return data;

  } catch (error) {

    console.warn(
      `Risk API unavailable for ${projectId}. Using fallback:`,
      error.message
    );

    const project =
      fallbackProjects.find(
        (p) => p.id === projectId
      );

    return {

      project_id: projectId,

      risk_score:
        project?.riskScore ?? 78,

      risk_level:
        project?.riskLevel ?? 'High',

      confidence: 0.91,

      risk_factors: [
        'Schedule slippage',
        'Budget overrun risk',
        'Statutory clearance delay'
      ],

      primary_bottleneck:
        'Statutory clearances & land compensation disputes',

      delay_forecast_days: 60,

      key_risk_drivers: [
        {
          factor: 'Statutory Clearances',
          contribution: 40
        },
        {
          factor: 'Land Acquisition',
          contribution: 35
        },
        {
          factor: 'Fund Release Velocity',
          contribution: 25
        }
      ],

      recommendation:
        'Initiate inter-ministerial review via PRAGATI monitoring portal.'
    };
  }
}


// ============================================================
// GET HIGH-RISK PROJECTS
// GET /api/risks/high-risk
// ============================================================

export async function getHighRiskProjects() {

  try {

    const data = await apiRequest(
      '/api/risks/high-risk'
    );

    console.log(
      'High-risk projects loaded from FastAPI:',
      data
    );

    const projectsArray =
      Array.isArray(data)
        ? data
        : data.projects || data.items || [];

    return projectsArray.map(
      normalizeProject
    );

  } catch (error) {

    console.warn(
      'High-risk API unavailable:',
      error.message
    );

    return fallbackProjects.filter(
      (p) =>
        p.riskLevel === 'High' ||
        p.riskLevel === 'Critical'
    );
  }
}


// ============================================================
// GET RISK SUMMARY
// GET /api/risks/summary
// ============================================================

export async function getRiskSummary() {

  try {

    const data = await apiRequest(
      '/api/risks/summary'
    );

    console.log(
      'Risk summary loaded from FastAPI:',
      data
    );

    return data;

  } catch (error) {

    console.warn(
      'Risk summary API unavailable:',
      error.message
    );

    return fallbackRiskSummary;
  }
}


// ============================================================
// GET ALERTS
// GET /api/alerts
// ============================================================

export async function getAlerts() {

  try {

    const data = await apiRequest(
      '/api/alerts'
    );

    console.log(
      'Alerts loaded from FastAPI:',
      data
    );

    return data;

  } catch (error) {

    console.warn(
      'Alerts API unavailable. Using fallback alerts:',
      error.message
    );

    return fallbackWarnings;
  }
}


// ============================================================
// MARK ALERT AS READ
// PUT /api/alerts/{alert_id}/read
// ============================================================

export async function markAlertAsRead(alertId) {

  try {

    const data = await apiRequest(
      `/api/alerts/${encodeURIComponent(alertId)}/read`,
      {
        method: 'PUT'
      }
    );

    return data;

  } catch (error) {

    console.warn(
      'Mark alert read API unavailable:',
      error.message
    );

    return {
      id: alertId,
      is_read: true
    };
  }
}


// ============================================================
// CREATE PROJECT
// POST /api/projects
// ============================================================

export async function createProject(projectData) {

  const data = await apiRequest(
    '/api/projects',
    {
      method: 'POST',
      body: JSON.stringify(projectData)
    }
  );

  return normalizeProject(data);
}


// ============================================================
// UPDATE PROJECT
// PUT /api/projects/{project_id}
// ============================================================

export async function updateProject(
  projectId,
  updates
) {

  const data = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates)
    }
  );

  return normalizeProject(data);
}


// ============================================================
// DELETE PROJECT
// DELETE /api/projects/{project_id}
// ============================================================

export async function deleteProject(projectId) {

  await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}`,
    {
      method: 'DELETE'
    }
  );

  return true;
}


// ============================================================
// HEALTH CHECK
// GET /api/health
// ============================================================

export async function checkBackendHealth() {

  try {

    const data = await apiRequest(
      '/api/health'
    );

    console.log(
      'FastAPI backend:',
      data
    );

    return true;

  } catch (error) {

    console.error(
      'FastAPI backend unavailable:',
      error.message
    );

    return false;
  }
}