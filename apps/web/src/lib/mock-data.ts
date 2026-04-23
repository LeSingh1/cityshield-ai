export const dashboardData = {
  overview: {
    cityName: "MetroSim",
    currentTime: "2026-04-22T14:05:00Z",
    mode: "simulation",
    activeIncidents: 1,
    cityRiskScore: 74,
    dominantFactor: "emergency_delay",
    headline:
      "Crash near Central Ave is causing congestion spillback and elevated school zone exposure risk.",
    summaryMetrics: {
      avgCongestionIndex: 68,
      avgAqi: 112,
      ambulanceEtaDeltaMinutes: 3.4,
      publicBuildingStrainAvg: 59,
    },
  },
  recommendations: [
    {
      id: "rec-01",
      title: "Activate ambulance green wave",
      confidence: 94,
      rationale: "Emergency corridor delay is now the highest-risk domain.",
      expectedBenefits: ["Lower ETA by 20-40%", "Preserve hospital access"],
    },
    {
      id: "rec-02",
      title: "Reroute general traffic",
      confidence: 89,
      rationale: "Spillback is spreading into the school connector.",
      expectedBenefits: ["Reduce queue growth", "Slow AQI deterioration"],
    },
    {
      id: "rec-03",
      title: "Issue school zone air alert",
      confidence: 86,
      rationale: "AQI has crossed the sensitive population threshold.",
      expectedBenefits: ["Reduce exposure window", "Support school response"],
    },
  ],
  timeline: [
    ["14:05", "Baseline loaded"],
    ["14:13", "Collision blocks one lane on Central Ave"],
    ["14:21", "Traffic spillback reaches school connector"],
    ["14:29", "AQI warning at Jefferson Elementary"],
    ["14:37", "Ambulance ETA rises to 11.2 minutes"],
  ],
  impacts: {
    ambulanceEtaReductionPct: 38,
    queueLengthReductionPct: 19,
    exposureReductionPct: 21,
    energyShiftKw: 74,
  },
};

