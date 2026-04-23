import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell" style={{ display: "grid", placeItems: "center" }}>
      <section className="panel headline-card" style={{ maxWidth: 760 }}>
        <div className="eyebrow">CityShield AI</div>
        <h1 className="headline">Predict urban stress before it spreads.</h1>
        <p className="subtle">
          CityShield AI unifies traffic, air quality, emergency response, and civic energy signals into a single command dashboard.
        </p>
        <p>
          <Link href="/dashboard">Open the dashboard</Link>
        </p>
      </section>
    </main>
  );
}

