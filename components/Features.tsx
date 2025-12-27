export function Features() {
  const features = [
    "Nearby rider matching",
    "Real-time tracking",
    "Transparent pricing",
    "Partner dashboard",
    "Verified riders & companies",
  ];

  return (
    <section className="py-20 bg-white">
      <h2 className="text-3xl font-bold text-center mb-10">Key Features</h2>
      <ul className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
        {features.map((f) => (
          <li key={f} className="p-4 border rounded-lg text-gray-700">
            ✔ {f}
          </li>
        ))}
      </ul>
    </section>
  );
}
