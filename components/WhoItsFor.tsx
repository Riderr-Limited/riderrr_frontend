export function WhoItsFor() {
  const groups = [
    {
      title: "Users",
      desc: "Quick, affordable deliveries at your fingertips.",
    },
    {
      title: "Riders",
      desc: "Flexible jobs and steady delivery requests.",
    },
    {
      title: "Logistics Companies",
      desc: "Manage riders, deliveries, and performance in one dashboard.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-12">Who It’s For</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {groups.map((g) => (
          <div key={g.title} className="p-6 bg-white rounded-xl shadow">
            <h3 className="font-semibold text-xl mb-2">{g.title}</h3>
            <p className="text-gray-600">{g.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
