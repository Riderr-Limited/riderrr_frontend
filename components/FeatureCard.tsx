// components/FeatureCard.tsx
export default function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
