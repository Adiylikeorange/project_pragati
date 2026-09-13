"""
Alert Service: Handles early warning alerts and status updates.
Pulls real project impasse reasons and solutions from the SIH2026 dataset.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

_alerts_cache: Optional[List[Dict[str, Any]]] = None

def _generate_tailored_action(r: Any) -> str:
    import hashlib
    pname = str(r.get("project_name") or "Project").strip()
    clean_pname = pname[:40].strip()
    sector = str(r.get("sector") or "").strip().lower()
    ministry = str(r.get("line_ministry") or "concerned ministry").strip()
    
    try:
        esc = float(r.get("cost_escalation_pct") or 0)
    except (ValueError, TypeError):
        esc = 0.0
    try:
        gap = float(r.get("expenditure_progress_gap_pct") or 0)
    except (ValueError, TypeError):
        gap = 0.0
    try:
        vel = float(r.get("progress_velocity_3m") or 0)
    except (ValueError, TypeError):
        vel = 0.0
        
    traj = str(r.get("trajectory_status") or "").strip().upper()
    pid = str(r.get("project_id") or "")
    h = int(hashlib.md5(pid.encode()).hexdigest(), 16)
    
    # Check severe cost inflation
    if esc > 250:
        variants = [
            f"Mandate urgent Revised Cost Estimate (RCE-II) appraisal before Public Investment Board (PIB). Place immediate ceiling on scope expansion and order independent financial audit on +{esc:.1f}% cost escalation for {clean_pname}.",
            f"Direct Secretary, {ministry}, to freeze non-critical variation orders on {clean_pname}. Convene expenditure finance committee (EFC) review to address +{esc:.1f}% budget escalation.",
            f"Require joint CVC and CAG technical-financial appraisal on +{esc:.1f}% cost overrun for {clean_pname}. Restructure uncommitted EPC tender packages under {ministry}."
        ]
        return variants[h % len(variants)]
        
    # Check severe expenditure vs progress divergence
    if gap > 80:
        variants = [
            f"Enforce forensic financial reconciliation: cumulative expenditure exceeds physical progress by +{gap:.1f}%. Freeze uncertified milestone advances on {clean_pname} pending joint secretarial audit with {ministry}.",
            f"Halt discretionary fund disbursements on {clean_pname}. Mandate physical milestone verification by third-party inspection agency to reconcile +{gap:.1f}% outlay overhang under {ministry}."
        ]
        return variants[h % len(variants)]
        
    # Check combined moderate escalation and outlay gap
    if esc > 60 and gap > 25:
        return f"Direct {ministry} to issue formal cure notice under contractual terms for {clean_pname}. Freeze additional budget variations (+{esc:.1f}%) and reconcile +{gap:.1f}% expenditure lead via PMG intervention."

    # Sector specific tailored actions
    if "railway" in sector:
        if vel < -5:
            variants = [
                f"Convene Railway Board & Zonal General Manager emergency review for {clean_pname}. Issue 14-day cure notice to EPC concessionaire on declining velocity ({vel:.1f}%/mo) and mobilize reserve engineering battalions.",
                f"Direct Principal Chief Engineer and CAO (Construction) to conduct on-site review for {clean_pname}. Reallocate critical track doubling and formation packages to standby contractors."
            ]
            return variants[h % len(variants)]
        elif traj == "DETERIORATING":
            variants = [
                f"Direct Zonal Chief Administrative Officer (Construction) and District Revenue Officers to clear RoW disputes along {clean_pname}. Enforce weekly milestone certification for track formation and OHE substations.",
                f"Mandate joint coordination between {ministry} and State Chief Secretary to expedite land handover for {clean_pname}. Institute bi-weekly CRS (Commissioner of Railway Safety) pre-inspection milestones.",
                f"Order DRM (Divisional Railway Manager) corridor taskforce to clear utility infringements on {clean_pname} and enforce strict critical-path scheduling on bridge and signaling works."
            ]
            return variants[h % len(variants)]
        elif esc > 50:
            return f"Mandate Financial Commissioner (Railways) audit of yard remodeling and alignment costs (+{esc:.1f}%) on {clean_pname}. Cap discretionary scope changes under {ministry}."
        else:
            return f"Establish dedicated Railway-State joint taskforce to expedite pending forest clearance and land parcels for {clean_pname}, reporting progress directly to {ministry}."
            
    elif "water" in sector or "irrigation" in sector:
        if esc > 80:
            variants = [
                f"Convene Central Water Commission (CWC) and State Water Resources Department to cap dam-spillway scope inflation (+{esc:.1f}%) on {clean_pname}. Finalize pending Resettlement & Rehabilitation (R&R) packages.",
                f"Mandate CWC technical review on {clean_pname} headworks and canal network. Freeze further budget variation (+{esc:.1f}%) until state equity reconciliation is concluded under {ministry}."
            ]
            return variants[h % len(variants)]
        elif traj == "STAGNATING":
            return f"Direct State Principal Secretary (Irrigation) and District Magistrate to expedite Stage-II forest compliance for {clean_pname}. Enforce contractor remobilization under Clause 14."
        else:
            return f"Intervene via Central Water Commission to reconcile inter-state water sharing clearances and fast-track land handover for {clean_pname} distribution canals."
            
    elif "road" in sector or "highway" in sector or "transport" in sector:
        if traj == "STAGNATING" or vel <= 0:
            variants = [
                f"Direct NHAI / MoRTH Regional Officer to coordinate with state administration for vacant 80% ROW possession on {clean_pname} and issue immediate tree-felling NOCs.",
                f"Convene district land acquisition arbitrations with District Collector for {clean_pname}. Require EPC concessionaire to deploy additional paving trains within 21 days."
            ]
            return variants[h % len(variants)]
        elif gap > 20:
            return f"Deploy drone-based corridor audit on {clean_pname} to reconcile mobilization advances (+{gap:.1f}% gap) against certified pavement and structural completion."
        else:
            return f"Invoke contractual dispute escalation clause on {clean_pname}; mandate weekly target schedules for bypass and interchange flyover packages under {ministry}."
            
    elif "power" in sector or "electricity" in sector or "energy" in sector:
        if esc > 70:
            return f"Require Central Electricity Authority (CEA) technical evaluation on heavy electromechanical equipment procurement for {clean_pname} (+{esc:.1f}% escalation) under {ministry}."
        else:
            return f"Direct {ministry} to resolve transmission evacuation corridor bottlenecks and expedite substation interconnectivity synchronization for {clean_pname}."
            
    elif "health" in sector:
        return f"Direct CPWD/NBCC and State Medical Education Directorate to fast-track super-specialty block handover for {clean_pname} and synchronize medical equipment procurement."
        
    elif "mine" in sector or "metal" in sector or "coal" in sector:
        return f"Convene inter-ministerial panel between {ministry} and MoEF&CC to clear Stage-II forest land handover and environmental compliance monitoring for {clean_pname}."
        
    elif "petroleum" in sector or "oil" in sector:
        return f"Expedite pipeline Right of User (RoU) gazette notifications with state revenue authorities and clear hydrocarbon safety directorate clearances for {clean_pname} under {ministry}."
        
    elif "urban" in sector or "smart" in sector or "metro" in sector:
        return f"Direct State Urban Development Directorate and Municipal Commissioners to clear utility shifting and station footprint land acquisition for {clean_pname} under {ministry}."
        
    # General fallback tailored with project name, ministry and specific metrics
    if traj == "DETERIORATING":
        return f"Convene urgent review chaired by Secretary, {ministry}, to address severe trajectory decline ({vel:.1f}%/mo) on {clean_pname} and restructure lagging EPC packages."
    elif traj == "STAGNATING":
        return f"Direct {ministry} Project Monitoring Unit to conduct on-site appraisal for {clean_pname}, clear statutory encumbrances, and establish hard completion milestones."
    else:
        return f"Prioritize high-level review with {ministry} for {clean_pname} to resolve inter-agency bottlenecks and enforce strict quarterly milestone compliance."


def _build_dataset_alerts(limit: int = 50) -> List[Dict[str, Any]]:
    backend_root = Path(__file__).resolve().parents[1]
    csv_path = backend_root / "sih2026_outputs" / "pragati_priority_queue.csv"
    
    if not csv_path.exists():
        logger.warning("pragati_priority_queue.csv not found, using fallback alerts")
        from data.mock_data import ALERTS
        return ALERTS

    try:
        import pandas as pd
        df = pd.read_csv(csv_path, low_memory=False)
        # Filter for valid project names and critical/high risk categories
        valid_mask = (
            df["project_name"].notna() & 
            (df["project_name"].astype(str).str.strip() != "") & 
            (df["project_name"].astype(str).str.lower() != "nan") &
            df["risk_category"].isin(["CRITICAL", "HIGH"])
        )
        subset = df[valid_mask].sort_values(
            by="final_risk_score", ascending=False
        ).head(limit)
        
        alerts = []
        for _, r in subset.iterrows():
            pid = str(r["project_id"])
            score = int(round(float(r.get("final_risk_score") or 85)))
            sev = "Critical" if str(r.get("risk_category")).upper() == "CRITICAL" else "High"
            
            det_prob = r.get("future_deterioration_probability")
            if pd.notna(det_prob) and float(det_prob) > 0:
                prob = int(round(float(det_prob) * 100))
            else:
                prob = max(60, min(95, score - 10))
                
            parts = []
            gap = r.get("expenditure_progress_gap_pct")
            esc = r.get("cost_escalation_pct")
            vel = r.get("progress_velocity_3m")
            status = r.get("trajectory_status")
            drivers = [str(r.get(f"risk_driver_{i}") or "") for i in range(1, 4)]
            drivers = [d for d in drivers if d and d != "nan"]
            
            if "HIGH_EXPENDITURE_PROGRESS_GAP" in drivers and pd.notna(gap) and gap > 0:
                parts.append(f"Outlay is +{gap:.1f}% ahead of physical completion")
            if "HIGH_COST_ESCALATION" in drivers and pd.notna(esc) and esc > 0:
                parts.append(f"Sanctioned cost has escalated by +{esc:.1f}%")
            if "PROGRESS_STAGNATION" in drivers:
                parts.append("Physical milestone progress stagnating (0.0% velocity over recent cycles)")
            elif "PROGRESS_DETERIORATION" in drivers and pd.notna(vel):
                parts.append(f"Completion velocity is declining ({vel:.1f}%/month)")
            elif status == "DETERIORATING":
                parts.append("Physical trajectory status is deteriorating")
                
            if not parts:
                exp = r.get("risk_explanation")
                if exp and str(exp) != "nan":
                    parts.append(str(exp))
                else:
                    parts.append("Multi-dimensional schedule and expenditure slippage detected")
            reason = "; ".join(parts) + "."
            
            solution = _generate_tailored_action(r)
                
            alert = {
                "id": f"EW-{pid}",
                "project_id": pid,
                "projectId": pid,
                "project_name": str(r["project_name"]),
                "projectName": str(r["project_name"]),
                "sector": str(r.get("sector") or "Infrastructure"),
                "state": str(r.get("line_ministry") or "National Pipeline"),
                "severity": sev,
                "riskScore": score,
                "delayProbability": prob,
                "title": f"Priority Impasse: {str(r['project_name'])[:45]}",
                "message": reason,
                "description": reason,
                "mandatedAction": solution,
                "created_at": "2026-07-01T08:30:00Z",
                "timestamp": "2026-07-01T08:30:00Z",
                "is_read": False
            }
            alerts.append(alert)
        return alerts
    except Exception as e:
        logger.error("Error building dataset alerts: %s", e)
        from data.mock_data import ALERTS
        return ALERTS

def get_all_alerts() -> List[Dict[str, Any]]:
    global _alerts_cache
    if _alerts_cache is None:
        _alerts_cache = _build_dataset_alerts(limit=50)
    return _alerts_cache

def get_alert_by_id(alert_id: str) -> Optional[Dict[str, Any]]:
    alerts = get_all_alerts()
    for alert in alerts:
        if str(alert["id"]).lower() == str(alert_id).lower() or str(alert.get("project_id", "")).lower() == str(alert_id).lower():
            return alert
    return None

def create_alert(data: Dict[str, Any]) -> Dict[str, Any]:
    new_id = f"EW-0{len(ALERTS) + 1:02d}"
    project_id = data.get("project_id") or data.get("projectId") or "PRG-001"
    project_name = data.get("project_name") or data.get("projectName") or "Infrastructure Project"
    
    new_alert = {
        "id": new_id,
        "project_id": project_id,
        "projectId": project_id,
        "project_name": project_name,
        "projectName": project_name,
        "sector": data.get("sector", "Infrastructure"),
        "state": data.get("state", "National"),
        "severity": data["severity"],
        "title": data.get("title") or f"{data['severity']} Alert on {project_name}",
        "message": data.get("message") or data.get("description") or "Immediate action required.",
        "description": data.get("description") or data.get("message") or "Immediate action required.",
        "mandatedAction": data.get("mandatedAction") or "Review and intervene.",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "is_read": False
    }
    ALERTS.insert(0, new_alert)
    return new_alert

def update_alert(alert_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    alert = get_alert_by_id(alert_id)
    if not alert:
        return None
    for key, value in updates.items():
        if value is not None:
            alert[key] = value
    return alert

def mark_alert_as_read(alert_id: str) -> Optional[Dict[str, Any]]:
    alert = get_alert_by_id(alert_id)
    if not alert:
        return None
    alert["is_read"] = True
    return alert

def delete_alert(alert_id: str) -> bool:
    alert = get_alert_by_id(alert_id)
    if alert:
        ALERTS.remove(alert)
        return True
    return False
