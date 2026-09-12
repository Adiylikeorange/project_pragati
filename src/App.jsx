import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import KPICards from './components/KPICards';
import ProjectTable from './components/ProjectTable';
import ProjectDrawer from './components/ProjectDrawer';
import RiskMonitoring from './components/RiskMonitoring';
import EarlyWarnings from './components/EarlyWarnings';
import DelayAnalysis from './components/DelayAnalysis';
import AlertBanner from './components/AlertBanner';
import SIH2026Intelligence from './components/SIH2026Intelligence';
import AITestWorkbench from './components/AITestWorkbench';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LandingPage from './pages/LandingPage';
import AccountPage from './pages/AccountPage';
import { getProjects, getProjectById, getProjectRisk, getAlerts, getDashboardSummary } from './services/api';
import { getRiskPrediction } from './services/riskService';
import './index.css';

function Dashboard({ projectsList, alertsList, summaryData, onRefresh }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [riskPrediction, setRiskPrediction] = useState(null);
  const [showAlert, setShowAlert] = useState(true);

  const handleViewDetails = useCallback(async (projectId) => {
    try {
      const project = await getProjectById(projectId);
      if (project) {
        setSelectedProject(project);
        const prediction = await getRiskPrediction(projectId);
        setRiskPrediction(prediction);
      }
    } catch (err) {
      console.error('Failed to view project details:', err);
    }
  }, []);

  const criticalAlert = alertsList.find(w => w.severity === 'Critical' || w.severity === 'critical');
  const riskSummary = summaryData.riskSummary || { critical: 24, high: 86, medium: 210, low: 680 };
  const portfolioMetrics = summaryData.portfolioMetrics || { totalProjects: 1048, onTrack: 680, inProgress: 175, atRisk: 110, delayed: 145, completed: 320, totalAllocation: '₹108.4 Lakh Cr' };

  return (
    <>
      {showAlert && criticalAlert && (
        <AlertBanner
          alert={criticalAlert}
          onDismiss={() => setShowAlert(false)}
          onInspect={() => handleViewDetails(criticalAlert.projectId)}
        />
      )}

      <div className="w-full px-4 lg:px-6 py-5 max-w-[1800px] mx-auto flex flex-col gap-8">
        {/* Dashboard Header */}
        <section>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-blue-800 uppercase tracking-wider">National Infrastructure Pipeline</span>
                <span className="text-gray-400">/</span>
                <span className="font-bold text-gray-500 uppercase">Portfolio Overview</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">Central Monitoring Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded">Live Audit • Updated Today</span>
              <button 
                onClick={onRefresh}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 text-sm font-medium rounded shadow-sm hover:bg-gray-50 border border-gray-200"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Refresh Data
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 text-sm font-medium rounded shadow-sm hover:bg-gray-50 border border-gray-200"
              >
                <span className="material-symbols-outlined text-base">print</span>
                Export Summary
              </button>
            </div>
          </div>
          <KPICards metrics={portfolioMetrics} />
        </section>

        {/* Sector Projects Table */}
        <section className="bg-white rounded shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sector-wise Projects</h2>
              <p className="text-sm text-gray-500">Explore, filter, and monitor high-value infrastructure projects across national priority sectors.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">
                <span className="material-symbols-outlined text-base">file_download</span>
                Export CSV
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">
                <span className="material-symbols-outlined text-base">description</span>
                Excel
              </button>
            </div>
          </div>
          <ProjectTable projects={projectsList} onViewDetails={handleViewDetails} />
        </section>

        {/* Project Detail Drawer */}
        <ProjectDrawer 
          project={selectedProject} 
          riskPrediction={riskPrediction}
          onClose={() => { setSelectedProject(null); setRiskPrediction(null); }} 
        />

        {/* Risk Monitoring Section */}
        <section>
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="font-bold text-red-600 uppercase tracking-wider">Predictive Oversight</span>
              <span className="text-gray-400">/</span>
              <span className="font-bold text-gray-500 uppercase">Early Risk Detection</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Risk Monitoring & Predictive Analytics</h2>
            <p className="text-sm text-gray-500 max-w-4xl">
              System evaluates schedule slippage, contractor capacity, clearance velocity, funding disbursement, and legal friction to forecast operational bottlenecks.
            </p>
          </div>

          {/* Risk Severity KPI Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase">Critical Risk</span>
                <div className="text-3xl font-bold text-red-600 mt-1 font-mono">{riskSummary.critical}</div>
                <div className="text-xs text-gray-500">Score &gt; 80 / 100</div>
              </div>
              <div className="w-12 h-12 rounded bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-3xl animate-pulse">crisis_alert</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase">High Risk</span>
                <div className="text-3xl font-bold text-amber-700 mt-1 font-mono">{riskSummary.high}</div>
                <div className="text-xs text-gray-500">Score 60 - 80 / 100</div>
              </div>
              <div className="w-12 h-12 rounded bg-amber-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-3xl">warning</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 uppercase">Medium Risk</span>
                <div className="text-3xl font-bold text-gray-800 mt-1 font-mono">{riskSummary.medium}</div>
                <div className="text-xs text-gray-500">Score 40 - 60 / 100</div>
              </div>
              <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-700 text-3xl">speed</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase">Low Risk / Stable</span>
                <div className="text-3xl font-bold text-emerald-700 mt-1 font-mono">{riskSummary.low}</div>
                <div className="text-xs text-gray-500">Score &lt; 40 / 100</div>
              </div>
              <div className="w-12 h-12 rounded bg-emerald-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
              </div>
            </div>
          </div>

          <RiskMonitoring projects={projectsList} riskFactors={summaryData.riskFactors} />
        </section>

        {/* Early Warning System */}
        <EarlyWarnings warnings={alertsList} />

        {/* Delay Analysis */}
        <DelayAnalysis delayCauses={summaryData.delayCauses} delayedProjects={summaryData.delayedProjects} />

        {/* SIH2026 AI Intelligence Layer */}
        <section className="bg-white rounded shadow-sm border border-purple-100 p-5">
          <SIH2026Intelligence />
        </section>

        {/* Operational Audit Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All data synced with FastAPI backend & Gatishakti GIS National Grid.</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>Directives Issued (Last 30d): 38</span>
            <span>Resolved Bottlenecks: 14</span>
          </div>
        </div>
      </div>
    </>
  );
}

function ProjectsPage({ projectsList }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [riskPrediction, setRiskPrediction] = useState(null);

  const handleViewDetails = useCallback(async (projectId) => {
    try {
      const project = await getProjectById(projectId);
      if (project) {
        setSelectedProject(project);
        const prediction = await getRiskPrediction(projectId);
        setRiskPrediction(prediction);
      }
    } catch (err) {
      console.error('Failed to view project details:', err);
    }
  }, []);

  return (
    <div className="w-full px-4 lg:px-6 py-5 max-w-[1800px] mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">All Projects</h1>
        <p className="text-sm text-gray-500">Complete directory of monitored infrastructure projects loaded live from FastAPI</p>
      </div>
      <div className="bg-white rounded shadow-sm border border-gray-200 p-5">
        <ProjectTable projects={projectsList} onViewDetails={handleViewDetails} />
      </div>
      <ProjectDrawer
        project={selectedProject}
        riskPrediction={riskPrediction}
        onClose={() => { setSelectedProject(null); setRiskPrediction(null); }}
      />
    </div>
  );
}

function RiskPage({ projectsList, summaryData }) {
  const riskSummary = summaryData.riskSummary || { critical: 24, high: 86, medium: 210, low: 680 };
  return (
    <div className="w-full px-4 lg:px-6 py-5 max-w-[1800px] mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Monitoring & Predictive Analytics</h1>
        <p className="text-sm text-gray-500 max-w-4xl">
          System evaluates schedule slippage, contractor capacity, clearance velocity, funding disbursement, and legal friction to forecast operational bottlenecks.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase">Critical Risk</span>
            <div className="text-3xl font-bold text-red-600 mt-1 font-mono">{riskSummary.critical}</div>
          </div>
          <div className="w-12 h-12 rounded bg-red-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-500 text-3xl animate-pulse">crisis_alert</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase">High Risk</span>
            <div className="text-3xl font-bold text-amber-700 mt-1 font-mono">{riskSummary.high}</div>
          </div>
          <div className="w-12 h-12 rounded bg-amber-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600 text-3xl">warning</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-800 uppercase">Medium Risk</span>
            <div className="text-3xl font-bold text-gray-800 mt-1 font-mono">{riskSummary.medium}</div>
          </div>
          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-700 text-3xl">speed</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase">Low Risk</span>
            <div className="text-3xl font-bold text-emerald-700 mt-1 font-mono">{riskSummary.low}</div>
          </div>
          <div className="w-12 h-12 rounded bg-emerald-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
          </div>
        </div>
      </div>
      <RiskMonitoring projects={projectsList} riskFactors={summaryData.riskFactors} />
    </div>
  );
}

function WarningsPage({ alertsList, summaryData }) {
  return (
    <div className="w-full px-4 lg:px-6 py-5 max-w-[1800px] mx-auto flex flex-col gap-8">
      <EarlyWarnings warnings={alertsList} />
      <DelayAnalysis delayCauses={summaryData.delayCauses} delayedProjects={summaryData.delayedProjects} />
    </div>
  );
}

function SectorsPage() {
  const sectorData = [
    { name: 'Roads & Highways', count: 240, budget: '₹12.4 Lakh Cr', onTrack: 65, atRisk: 20, delayed: 15 },
    { name: 'Railways', count: 185, budget: '₹8.9 Lakh Cr', onTrack: 60, atRisk: 22, delayed: 18 },
    { name: 'Airports', count: 42, budget: '₹2.1 Lakh Cr', onTrack: 72, atRisk: 15, delayed: 13 },
    { name: 'Ports & Shipping', count: 38, budget: '₹3.8 Lakh Cr', onTrack: 68, atRisk: 18, delayed: 14 },
    { name: 'Power & Energy', count: 160, budget: '₹15.2 Lakh Cr', onTrack: 55, atRisk: 25, delayed: 20 },
    { name: 'Urban Development', count: 124, budget: '₹6.7 Lakh Cr', onTrack: 58, atRisk: 24, delayed: 18 },
    { name: 'Water Resources', count: 65, budget: '₹4.2 Lakh Cr', onTrack: 62, atRisk: 20, delayed: 18 },
    { name: 'Telecommunications', count: 48, budget: '₹1.8 Lakh Cr', onTrack: 75, atRisk: 15, delayed: 10 },
  ];

  return (
    <div className="w-full px-4 lg:px-6 py-5 max-w-[1800px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Sector Directory</h1>
      <p className="text-sm text-gray-500 mb-6">Infrastructure investment overview by national priority sectors</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {sectorData.map(sector => (
          <div key={sector.name} className="bg-white rounded shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">{sector.name}</h3>
              <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{sector.count} Projects</span>
            </div>
            <div className="text-xl font-bold text-gray-900 font-mono mb-3">{sector.budget}</div>
            <div className="flex items-center gap-1 mb-2">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${sector.onTrack}%` }}></div>
              <div className="h-2 rounded-full bg-amber-500" style={{ width: `${sector.atRisk}%` }}></div>
              <div className="h-2 rounded-full bg-red-500" style={{ width: `${sector.delayed}%` }}></div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{sector.onTrack}% On Track</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>{sector.atRisk}% At Risk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>{sector.delayed}% Delayed</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsPage() {
  return (
    <div className="w-full px-4 lg:px-6 py-5 max-w-[1800px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
      <p className="text-sm text-gray-500 mb-6">Generate and download infrastructure monitoring reports</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Monthly Progress Digest', desc: 'Comprehensive overview of all project milestones and status changes', icon: 'summarize', date: 'Last generated: Feb 2024' },
          { title: 'Risk Assessment Report', desc: 'Detailed risk analysis with predictive scoring for all monitored projects', icon: 'assessment', date: 'Last generated: Feb 2024' },
          { title: 'Delay Root-Cause Analysis', desc: 'Portfolio-wide impediment distribution and remediation tracking', icon: 'troubleshoot', date: 'Last generated: Jan 2024' },
          { title: 'Financial Reconciliation', desc: 'CapEx disbursement, utilization certificates, and overrun analysis', icon: 'account_balance', date: 'Last generated: Feb 2024' },
          { title: 'Inter-Ministerial Clearance Log', desc: 'Statutory and regulatory approval pipeline status', icon: 'gavel', date: 'Last generated: Feb 2024' },
          { title: 'Cabinet Briefing Pack', desc: 'Executive summary prepared for the next PRAGATI review meeting', icon: 'co_present', date: 'Scheduled: Thursday 11:00 AM' },
        ].map((report, i) => (
          <div key={i} className="bg-white rounded shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-700">{report.icon}</span>
                </div>
                <h3 className="font-bold text-gray-900">{report.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">{report.desc}</p>
              <p className="text-xs text-gray-400 font-mono">{report.date}</p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button className="flex-1 py-2 px-3 bg-gray-900 text-white rounded text-xs font-semibold hover:bg-gray-800">Generate</button>
              <button className="py-2 px-3 bg-gray-100 text-gray-700 rounded text-xs font-semibold hover:bg-gray-200">
                <span className="material-symbols-outlined text-base">download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [projectsList, setProjectsList] = useState([]);
  const [alertsList, setAlertsList] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [loading, setLoading] = useState(true);

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [projData, alertData, summary] = await Promise.all([
        getProjects(),
        getAlerts(),
        getDashboardSummary()
      ]);
      setProjectsList(projData || []);
      setAlertsList(alertData || []);
      setSummaryData(summary || {});
    } catch (err) {
      console.error('Failed to load initial data from API:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
            <span className="material-symbols-outlined animate-spin text-2xl text-blue-600">sync</span>
            <span className="text-sm font-medium">Connecting to PRAGATI FastAPI backend...</span>
          </div>
        ) : (
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Dashboard 
                    projectsList={projectsList} 
                    alertsList={alertsList} 
                    summaryData={summaryData} 
                    onRefresh={loadData}
                  />
                ) : (
                  <LandingPage />
                )
              } 
            />
            <Route path="/landing" element={<LandingPage />} />
            <Route 
              path="/account" 
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <ProjectsPage projectsList={projectsList} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sectors" 
              element={
                <ProtectedRoute>
                  <SectorsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/risk" 
              element={
                <ProtectedRoute>
                  <RiskPage projectsList={projectsList} summaryData={summaryData} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warnings" 
              element={
                <ProtectedRoute>
                  <WarningsPage alertsList={alertsList} summaryData={summaryData} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/intelligence"
              element={
                <ProtectedRoute>
                  <div className="w-full px-4 lg:px-6 py-5 max-w-[1800px] mx-auto">
                    <div className="mb-4">
                      <h1 className="text-2xl font-bold text-gray-900">AI Intelligence Layer</h1>
                      <p className="text-sm text-gray-500">SIH 2026 Problem 26013 — XGBoost + IsolationForest ML pipeline over 2,144 PRAGATI projects</p>
                    </div>
                    <SIH2026Intelligence />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/test" 
              element={
                <ProtectedRoute>
                  <AITestWorkbench />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-playground" 
              element={
                <ProtectedRoute>
                  <AITestWorkbench />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
