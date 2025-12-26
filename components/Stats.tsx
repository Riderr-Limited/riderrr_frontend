export function Stats() {
  const stats = [
    { label: "Deliveries Completed", value: "1,000+" },
    { label: "Active Riders", value: "300+" },
    { label: "Partner Companies", value: "50+" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="grid md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
        {stats.map((s) => (
          <div key={s.label}>
            <h3 className="text-4xl font-bold text-brand-700">{s.value}</h3>
            <p className="text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
