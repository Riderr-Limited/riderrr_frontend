export function Stats() {
  const stats = [
    { label: "Deliveries Completed", value: "1,000+" },
    { label: "Active Riders", value: "300+" },
    { label: "Partner Companies", value: "50+" },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-5xl font-bold text-blue-500 mb-2">{stat.value}</h3>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
