"""
Mock alerts and risk factors data for PRAGATI infrastructure monitoring.
"""

EARLY_WARNINGS_DATA = [
    {
        "id": "EW-001",
        "projectId": "PRG-002",
        "projectName": "Mumbai Coastal Infrastructure (South Section)",
        "sector": "Urban Development",
        "state": "Maharashtra",
        "severity": "critical",
        "riskScore": 91,
        "delayProbability": 87,
        "description": "Inter-tidal reclamation stay order pending review before the High Court division bench.",
        "mandatedAction": "Convene Chief Secretary-level resolution summit with Environment Department & Koliwada community reps.",
        "timestamp": "2024-02-14T08:30:00Z",
    },
    {
        "id": "EW-002",
        "projectId": "PRG-005",
        "projectName": "National Highway Package 14 (Trans-Rajasthan)",
        "sector": "Roads & Highways",
        "state": "Rajasthan",
        "severity": "high",
        "riskScore": 87,
        "delayProbability": 75,
        "description": "Land acquisition compensation dispute affecting 15km stretch in Pali district.",
        "mandatedAction": "Expedite district collector intervention and finalize enhanced compensation package.",
        "timestamp": "2024-02-13T14:45:00Z",
    },
    {
        "id": "EW-003",
        "projectId": "PRG-007",
        "projectName": "Chennai Metro Rail Phase 2",
        "sector": "Urban Development",
        "state": "Tamil Nadu",
        "severity": "high",
        "riskScore": 78,
        "delayProbability": 72,
        "description": "Utility shifting delays on Corridor 4 due to uncharted water mains.",
        "mandatedAction": "Joint coordination meeting required between CMRL, CMWSSB and TANGEDCO.",
        "timestamp": "2024-02-12T10:15:00Z",
    },
    {
        "id": "EW-004",
        "projectId": "PRG-009",
        "projectName": "Ken-Betwa National River Link Project",
        "sector": "Water Resources",
        "state": "MP / UP",
        "severity": "medium",
        "riskScore": 72,
        "delayProbability": 60,
        "description": "Wildlife clearance conditions compliance pending for core tiger reserve area.",
        "mandatedAction": "Submit compliance report to National Board for Wildlife at the earliest.",
        "timestamp": "2024-02-11T09:20:00Z",
    },
    {
        "id": "EW-005",
        "projectId": "PRG-010",
        "projectName": "Bengaluru Suburban Rail Project (BSRP)",
        "sector": "Railways",
        "state": "Karnataka",
        "severity": "high",
        "riskScore": 84,
        "delayProbability": 78,
        "description": "Tender finalization delayed for Corridor 1 due to low bidder response.",
        "mandatedAction": "Review tender conditions and initiate re-bidding process with relaxed eligibility criteria.",
        "timestamp": "2024-02-10T16:00:00Z",
    }
]

RISK_FACTORS_DATA = [
    {"name": "Statutory Clearances (Forest, CRZ, MoEFCC)", "weight": 28},
    {"name": "Land Acquisition & Right-of-Way", "weight": 35},
    {"name": "Fund Utilization & Financial Closures", "weight": 15},
    {"name": "Contractor Performance & Mobilization", "weight": 12},
    {"name": "Law & Order / Local Protests", "weight": 10}
]

DELAY_CAUSES_DATA = [
    {"cause": "Land Acquisition & Right-of-Way", "projectCount": 42, "capexAffected": 142800, "percentage": 72},
    {"cause": "Statutory Clearances", "projectCount": 38, "capexAffected": 89500, "percentage": 65},
    {"cause": "Fund Disbursement Issues", "projectCount": 25, "capexAffected": 56000, "percentage": 45},
    {"cause": "Utility Shifting", "projectCount": 20, "capexAffected": 42000, "percentage": 38},
    {"cause": "Contractor Insolvency", "projectCount": 15, "capexAffected": 35000, "percentage": 25},
    {"cause": "Geological Surprises", "projectCount": 10, "capexAffected": 28000, "percentage": 15},
    {"cause": "Local Agitations", "projectCount": 8, "capexAffected": 15000, "percentage": 10}
]

DELAYED_PROJECTS_DATA = [
    {"id": "PRG-002", "name": "Mumbai Coastal Infrastructure", "sector": "Urban Development", "slip": "+184d", "costImpact": "₹1200 Cr"},
    {"id": "PRG-007", "name": "Chennai Metro Rail Phase 2", "sector": "Urban Development", "slip": "+145d", "costImpact": "₹850 Cr"},
    {"id": "PRG-010", "name": "Bengaluru Suburban Rail Project", "sector": "Railways", "slip": "+115d", "costImpact": "₹420 Cr"},
    {"id": "PRG-011", "name": "Polavaram Irrigation Project", "sector": "Water Resources", "slip": "+210d", "costImpact": "₹3500 Cr"},
    {"id": "PRG-012", "name": "NH-66 Four Laning", "sector": "Roads & Highways", "slip": "+95d", "costImpact": "₹310 Cr"}
]

PORTFOLIO_METRICS = {
    "totalProjects": 1048,
    "onTrack": 680,
    "inProgress": 175,
    "atRisk": 110,
    "delayed": 145,
    "completed": 320,
    "totalAllocation": "₹108.4 Lakh Cr"
}

RISK_SUMMARY = {
    "critical": 24,
    "high": 86,
    "medium": 210,
    "low": 680
}
