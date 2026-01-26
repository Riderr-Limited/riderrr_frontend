export function FAQ() {
  const faqs = [
    {
      q: "How are riders verified?",
      a: "All riders are verified by partner logistics companies.",
    },
    {
      q: "How is delivery cost calculated?",
      a: "Cost is based on distance and rider availability.",
    },
    {
      q: "Can companies manage multiple riders?",
      a: "Yes, from a single partner dashboard.",
    },
  ];

  return (
    <section id="faqs" className="py-20 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-10">FAQs</h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="p-5 bg-white rounded-xl border">
            <h4 className="font-semibold">{f.q}</h4>
            <p className="text-gray-600 mt-2">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
