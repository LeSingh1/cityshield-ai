import { dashboardData } from "@/lib/mock-data";

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <section className="panel stat-card">
      <div className="eyebrow">{label}</div>
      <div className="metric">{value}</div>
      <div className="subtle">{note}</div>
    </section>
  );
}

export function DashboardShell() {
  const { overview, recommendations, timeline, impacts } = dashboardData;

  return (
    <main className="shell">
      <section className="topbar">
        <section className="panel headline-card">
          <div className="eyebrow">CityShield AI</div>
          <h1 className="headline">{overview.cityName}</h1>
          <div className="subtle">{overview.headline}</div>
        </section>
        <StatCard label="Unified risk" value={`${overview.cityRiskScore}`} note="Emergency delay dominant" />
        <StatCard label="Incidents" value={`${overview.activeIncidents}`} note="1 active collision" />
        <StatCard label="AQI" value={`${overview.summaryMetrics.avgAqi}`} note="Sensitive zone elevated" />
        <StatCard label="ETA delta" value={`+${overview.summaryMetrics.ambulanceEtaDeltaMinutes}m`} note="Ambulance route impacted" />
      </section>

      <section className="grid hero-grid">
        <section className="panel map-card map-surface">
          <div className="eyebrow">Live city canvas</div>
          <h2>Central corridor event spread</h2>
          <div className="subtle">Mapbox-ready shell with incident, spillback, school exposure, and ambulance route layers.</div>
          <div className="zone" style={{ left: "57%", top: "26%", width: 180, height: 180 }} />
          <div className="zone" style={{ left: "20%", top: "48%", width: 220, height: 220 }} />
          <div className="route" style={{ left: "16%", top: "54%", width: "58%", transform: "rotate(-12deg)" }} />
          <div className="route" style={{ left: "34%", top: "36%", width: "40%", transform: "rotate(11deg)", opacity: 0.7 }} />
          <div className="incident" style={{ left: "48%", top: "44%" }} />
        </section>

        <section className="grid">
          <section className="panel list-card">
            <div className="eyebrow">Recommendations</div>
            <h2>Operator actions</h2>
            {recommendations.map((item) => (
              <article className="recommendation" key={item.id}>
                <strong>{item.title}</strong>
                <div className="subtle">
                  {item.rationale} Confidence {item.confidence}%.
                </div>
                <div className="chip-row">
                  {item.expectedBenefits.map((benefit) => (
                    <span className="chip" key={benefit}>
                      {benefit}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <section className="panel list-card">
            <div className="eyebrow">Projected impact</div>
            <h2>Intervention upside</h2>
            <div className="chip-row">
              <span className="chip">{impacts.ambulanceEtaReductionPct}% faster ambulance ETA</span>
              <span className="chip">{impacts.queueLengthReductionPct}% less queue length</span>
              <span className="chip">{impacts.exposureReductionPct}% less exposure</span>
              <span className="chip">{impacts.energyShiftKw} kW load shifted</span>
            </div>
          </section>
        </section>
      </section>

      <section className="panel timeline-card" style={{ marginTop: 18 }}>
        <div className="eyebrow">Scenario timeline</div>
        <h2>Deterministic playback</h2>
        {timeline.map(([time, label]) => (
          <div className="timeline-step" key={time}>
            <strong>{time}</strong>
            <div className="subtle">{label}</div>
          </div>
        ))}
      </section>
    </main>
  );
}

