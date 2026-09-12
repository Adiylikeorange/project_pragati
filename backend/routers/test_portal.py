"""
Standalone Testing Portal for PRAGATI AI & Backend.
Accessible at: http://127.0.0.1:8000/test
"""

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter(tags=["Testing Portal"])

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PRAGATI AI & Backend Testing Site</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
  <style>
    body { background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .header-gradient { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%); color: white; }
    .card { border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .badge-status { font-family: monospace; font-size: 0.75rem; }
    .metric-value { font-family: monospace; font-weight: 700; }
  </style>
</head>
<body class="p-3 p-md-4">
  <div class="container-fluid" style="max-width: 1400px;">
    <!-- Top Header -->
    <div class="p-4 p-md-5 mb-4 rounded-3 header-gradient shadow-sm">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <span class="badge bg-success mb-2 px-3 py-1">LIVE TEST ENVIRONMENT</span>
          <h1 class="display-6 fw-bold mb-1">PRAGATI AI & Backend Testing Site</h1>
          <p class="mb-0 text-light opacity-75">
            Test live <strong>XGBoost</strong> and <strong>Isolation Forest</strong> predictions, evaluate 2,144 national projects, and benchmark backend APIs.
          </p>
        </div>
        <div class="d-flex gap-2">
          <a href="http://localhost:5173/test" target="_blank" class="btn btn-light fw-semibold">
            React App Playground (/test)
          </a>
          <a href="/docs" target="_blank" class="btn btn-outline-light">
            Swagger Docs (/docs)
          </a>
        </div>
      </div>
    </div>

    <!-- Status Strip -->
    <div class="row g-3 mb-4" id="status-strip">
      <div class="col-md-3 col-6">
        <div class="card p-3">
          <div class="text-muted small text-uppercase fw-bold">Backend Health</div>
          <div class="fs-4 text-success fw-bold" id="kpi-health">Checking...</div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card p-3">
          <div class="text-muted small text-uppercase fw-bold">Active ML Models</div>
          <div class="fs-4 text-primary fw-bold" id="kpi-models">Checking...</div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card p-3">
          <div class="text-muted small text-uppercase fw-bold">National Projects</div>
          <div class="fs-4 text-dark fw-bold" id="kpi-projects">2,144</div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card p-3">
          <div class="text-muted small text-uppercase fw-bold">ML Early Warnings</div>
          <div class="fs-4 text-danger fw-bold" id="kpi-warnings">1,312</div>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="row g-4 mb-4">
      <!-- Section 1: Real-Time Model Inference -->
      <div class="col-lg-6">
        <div class="card h-100 p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h5 class="fw-bold mb-0 text-dark">Live Model Inference Playground</h5>
            <span class="badge bg-primary-subtle text-primary border">POST /api/sih2026/predict</span>
          </div>
          <p class="text-muted small mb-3">
            Change the metrics below and execute live inference. The running XGBoost model will compute the deterioration probability, and IsolationForest will calculate the anomaly score.
          </p>

          <form id="predict-form" class="row g-3 small">
            <div class="col-6">
              <label class="form-label fw-semibold">Original Cost (₹ Cr)</label>
              <input type="number" class="form-control form-control-sm" id="orig-cost" value="650">
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold">Revised Cost (₹ Cr)</label>
              <input type="number" class="form-control form-control-sm" id="rev-cost" value="1350">
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold">Cumulative Expenditure (₹ Cr)</label>
              <input type="number" class="form-control form-control-sm" id="expenditure" value="980">
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold">Physical Progress (%)</label>
              <input type="number" min="0" max="100" class="form-control form-control-sm" id="progress" value="38">
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Progress Velocity (pp/month): <span id="vel-val">-1.5</span></label>
              <input type="range" class="form-range" id="velocity" min="-5" max="5" step="0.1" value="-1.5" oninput="document.getElementById('vel-val').innerText = this.value">
            </div>
            <div class="col-12">
              <button type="button" class="btn btn-primary w-100 fw-semibold" onclick="executePrediction()">
                ⚡ Run Live AI Model Prediction
              </button>
            </div>
          </form>

          <!-- Result Display -->
          <div id="predict-output" class="mt-4 p-3 bg-light rounded border d-none">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-bold">PREDICTED RISK ASSESSMENT</span>
              <span id="res-badge" class="badge bg-danger px-3 py-1">CRITICAL</span>
            </div>
            <div class="row g-2 text-center my-2">
              <div class="col-4">
                <div class="p-2 bg-white rounded border">
                  <div class="text-muted" style="font-size: 0.7rem;">FUSED RISK</div>
                  <div class="metric-value fs-5" id="res-fused">0</div>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 bg-white rounded border">
                  <div class="text-muted" style="font-size: 0.7rem;">XGBOOST PROB</div>
                  <div class="metric-value fs-5 text-primary" id="res-xgb">0%</div>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 bg-white rounded border">
                  <div class="text-muted" style="font-size: 0.7rem;">ANOMALY SIGNAL</div>
                  <div class="metric-value fs-5" id="res-anomaly">NORMAL</div>
                </div>
              </div>
            </div>
            <div class="small mt-2">
              <div class="fw-semibold text-secondary">Risk Drivers:</div>
              <div id="res-drivers" class="mt-1 d-flex flex-wrap gap-1"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Real Project Inspector -->
      <div class="col-lg-6">
        <div class="card h-100 p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h5 class="fw-bold mb-0 text-dark">National Project AI Risk Inspector</h5>
            <span class="badge bg-success-subtle text-success border">GET /api/projects/{id}/risk</span>
          </div>
          <p class="text-muted small mb-3">
            Inspect pre-computed and live-fused AI profiles for national projects from the Jan–Jul 2026 monitoring cycle.
          </p>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Choose Project to Inspect:</label>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-sm btn-outline-secondary" onclick="loadProjectRisk('705458')">#705458 Miyagam Gauge</button>
              <button class="btn btn-sm btn-outline-secondary" onclick="loadProjectRisk('400298')">#400298 Nadikude Rail</button>
              <button class="btn btn-sm btn-outline-secondary" onclick="loadProjectRisk('705368')">#705368 Araria-Supaul</button>
              <button class="btn btn-sm btn-outline-secondary" onclick="loadProjectRisk('603945')">#603945 Anandpur Barrage</button>
              <button class="btn btn-sm btn-outline-secondary" onclick="loadProjectRisk('PRG-001')">#PRG-001 Demo Metro</button>
            </div>
          </div>

          <div id="project-output" class="p-3 bg-light rounded border">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="fw-bold mb-0 text-dark" id="proj-name">Loading...</h6>
                <div class="text-muted small" id="proj-meta">-</div>
              </div>
              <div class="text-end">
                <div class="fs-4 fw-bold text-danger" id="proj-score">-</div>
                <div class="badge bg-secondary" id="proj-level">-</div>
              </div>
            </div>
            <hr class="my-2">
            <div class="row g-2 small">
              <div class="col-6"><strong>Trajectory:</strong> <span id="proj-traj">-</span></div>
              <div class="col-6"><strong>Anomaly Flag:</strong> <span id="proj-anom">-</span></div>
              <div class="col-6"><strong>Predictive Band:</strong> <span id="proj-band">-</span></div>
              <div class="col-6"><strong>Forecast Delay:</strong> <span id="proj-delay" class="text-danger">-</span></div>
              <div class="col-12 mt-2"><strong>Primary Bottleneck:</strong> <span id="proj-bottleneck">-</span></div>
              <div class="col-12 mt-1"><strong>Action:</strong> <span id="proj-action" class="text-primary">-</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Automated API Diagnostic Suite -->
    <div class="card p-4 mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom gap-2">
        <div>
          <h5 class="fw-bold mb-0 text-dark">Backend & ML API Benchmark Suite</h5>
          <span class="text-muted small">Automatic validation of connectivity, response payloads, and latency</span>
        </div>
        <button class="btn btn-dark btn-sm fw-semibold" onclick="runDiagnostics()">
          🔄 Run Diagnostic Benchmark
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover table-sm align-middle small mb-0">
          <thead class="table-light">
            <tr>
              <th>Endpoint / Capability</th>
              <th>Path</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Payload Preview</th>
            </tr>
          </thead>
          <tbody id="diag-tbody">
            <tr><td colspan="5" class="text-center text-muted py-3">Click "Run Diagnostic Benchmark" to test.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    async function checkStatus() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) document.getElementById('kpi-health').innerText = 'Online (200)';
      } catch (e) {
        document.getElementById('kpi-health').innerText = 'Offline';
      }

      try {
        const res = await fetch('/api/sih2026/status');
        const data = await res.json();
        if (data.xgboost_model && data.isolation_forest_model) {
          document.getElementById('kpi-models').innerText = 'XGBoost + IF';
        }
      } catch (e) {
        document.getElementById('kpi-models').innerText = 'Unavailable';
      }
    }

    async function executePrediction() {
      const payload = {
        original_cost_cr: parseFloat(document.getElementById('orig-cost').value) || 0,
        revised_cost_cr: parseFloat(document.getElementById('rev-cost').value) || 0,
        cumulative_expenditure_cr: parseFloat(document.getElementById('expenditure').value) || 0,
        physical_progress_pct: parseFloat(document.getElementById('progress').value) || 0,
        progress_velocity_3m: parseFloat(document.getElementById('velocity').value) || 0
      };

      try {
        const res = await fetch('/api/sih2026/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        document.getElementById('predict-output').classList.remove('d-none');
        document.getElementById('res-fused').innerText = data.fused_risk_score + '/100';
        document.getElementById('res-badge').innerText = data.risk_level.toUpperCase();
        document.getElementById('res-badge').className = 'badge px-3 py-1 ' + (data.risk_level === 'Critical' ? 'bg-danger' : (data.risk_level === 'High' ? 'bg-warning text-dark' : 'bg-success'));
        
        const prob = (data.xgboost_prediction.future_deterioration_probability * 100).toFixed(1);
        document.getElementById('res-xgb').innerText = prob + '%';
        
        const isAnom = data.isolation_forest_prediction.anomaly_flag;
        document.getElementById('res-anomaly').innerText = isAnom ? 'ANOMALY' : 'NORMAL';
        document.getElementById('res-anomaly').className = 'metric-value fs-5 ' + (isAnom ? 'text-danger' : 'text-success');

        const driversBox = document.getElementById('res-drivers');
        driversBox.innerHTML = '';
        (data.primary_risk_drivers || []).forEach(d => {
          const s = document.createElement('span');
          s.className = 'badge bg-secondary-subtle text-secondary border';
          s.innerText = d;
          driversBox.appendChild(s);
        });
      } catch (err) {
        alert('Prediction error: ' + err.message);
      }
    }

    async function loadProjectRisk(id) {
      try {
        const res = await fetch('/api/projects/' + id + '/risk');
        const data = await res.json();
        document.getElementById('proj-name').innerText = data.project_name || 'Project #' + id;
        document.getElementById('proj-meta').innerText = (data.sector || 'National Infrastructure') + ' • ' + (data.line_ministry || 'Government of India');
        document.getElementById('proj-score').innerText = data.risk_score + '/100';
        document.getElementById('proj-level').innerText = data.risk_level;
        document.getElementById('proj-traj').innerText = data.trajectory_status || 'STABLE';
        document.getElementById('proj-anom').innerText = data.anomaly_flag ? 'YES (Unusual pattern)' : 'NO (Normal)';
        document.getElementById('proj-band').innerText = data.predictive_risk_band || 'LOW_PREDICTIVE_SIGNAL';
        document.getElementById('proj-delay').innerText = '+' + (data.delay_forecast_days || 0) + ' Days';
        document.getElementById('proj-bottleneck').innerText = data.primary_bottleneck || 'None detected';
        document.getElementById('proj-action').innerText = data.recommendation || 'Continue routine monitoring.';
      } catch (e) {
        alert('Failed to load project ' + id);
      }
    }

    async function runDiagnostics() {
      const endpoints = [
        { name: 'Health Check', path: '/api/health' },
        { name: 'Pipeline Status', path: '/api/sih2026/status' },
        { name: 'National Summary', path: '/api/sih2026/national-summary' },
        { name: 'Risk Distribution', path: '/api/sih2026/risk-distribution' },
        { name: 'Top Critical Projects', path: '/api/sih2026/top-projects?limit=3' },
        { name: 'ML Early Warnings', path: '/api/sih2026/early-warnings?limit=5' },
        { name: 'Project AI Profile', path: '/api/sih2026/projects/705458/risk' },
        { name: 'XGBoost Validation', path: '/api/sih2026/predictive-summary' },
        { name: 'Dashboard Overview', path: '/api/dashboard/summary' }
      ];

      const tbody = document.getElementById('diag-tbody');
      tbody.innerHTML = '';

      for (const ep of endpoints) {
        const row = document.createElement('tr');
        const t0 = performance.now();
        try {
          const res = await fetch(ep.path);
          const t1 = performance.now();
          const json = await res.json();
          const latency = Math.round(t1 - t0);
          row.innerHTML = `
            <td class="fw-semibold">${ep.name}</td>
            <td><code>${ep.path}</code></td>
            <td><span class="badge bg-success-subtle text-success border">${res.status} OK</span></td>
            <td><span class="font-monospace">${latency} ms</span></td>
            <td class="text-truncate text-muted font-monospace" style="max-width: 300px;">${JSON.stringify(json).slice(0, 80)}...</td>
          `;
        } catch (err) {
          row.innerHTML = `
            <td class="fw-semibold">${ep.name}</td>
            <td><code>${ep.path}</code></td>
            <td><span class="badge bg-danger-subtle text-danger border">ERR</span></td>
            <td>-</td>
            <td class="text-danger">${err.message}</td>
          `;
        }
        tbody.appendChild(row);
      }
    }

    // Initialize
    window.onload = function() {
      checkStatus();
      loadProjectRisk('705458');
      executePrediction();
      runDiagnostics();
    };
  </script>
</body>
</html>
"""

@router.api_route("/test", methods=["GET", "HEAD"], response_class=HTMLResponse)
def testing_site():
    """
    Renders the dedicated PRAGATI AI & Backend Testing Site.
    """
    return HTML_CONTENT
