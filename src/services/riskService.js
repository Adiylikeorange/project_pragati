import { getProjectRisk, getAlerts, getDashboardSummary } from './api';

export async function getRiskPrediction(projectId) {
  const prediction = await getProjectRisk(projectId);
  return {
    riskScore: prediction.risk_score || prediction.riskScore || 78,
    riskLevel: prediction.risk_level || prediction.riskLevel || 'High',
    confidence: prediction.confidence || 0.91,
    riskFactors: prediction.risk_factors || [],
    primaryBottleneck: prediction.primary_bottleneck,
    delayForecastDays: prediction.delay_forecast_days,
    keyRiskDrivers: prediction.key_risk_drivers,
    recommendation: prediction.recommendation
  };
}

export async function getMetrics() {
  return await getDashboardSummary();
}

export async function getPortfolioRiskSummary() {
  const data = await getDashboardSummary();
  return data.riskSummary || {
    critical: 24,
    high: 86,
    medium: 210,
    low: 680,
    overallRiskTrend: 'increasing'
  };
}

export async function getEarlyWarnings() {
  return await getAlerts();
}
