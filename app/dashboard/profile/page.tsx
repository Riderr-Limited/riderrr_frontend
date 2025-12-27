"use client";

export default function OrganizationProfile() {
  return (
    <section className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Organization Profile</h1>

      {/* Company Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard title="Company Information">
          <InfoItem label="Company Name" value="Logi Express Ltd" />
          <InfoItem label="Business Type" value="Logistics Company" />
          <InfoItem label="Registration Number" value="RC 1234567" />
          <InfoItem label="Address" value="Lagos, Nigeria" />
        </InfoCard>

        <InfoCard title="Primary Contact">
          <InfoItem label="Contact Person" value="John Doe" />
          <InfoItem label="Email" value="info@logiexpress.com" />
          <InfoItem label="Phone" value="+234 800 000 0000" />
          <InfoItem label="Role" value="Operations Manager" />
        </InfoCard>
      </div>

      {/* Business Details */}
      <InfoCard title="Business Details">
        <div className="grid md:grid-cols-3 gap-4">
          <InfoItem label="Total Riders" value="42" />
          <InfoItem label="Active Riders" value="30" />
          <InfoItem label="Operating Cities" value="Lagos, Abuja" />
        </div>
      </InfoCard>

      {/* Verification */}
      <InfoCard title="Verification Status">
        <p className="text-green-600 font-semibold">✔ Verified Organization</p>
        <p className="text-sm text-gray-600">
          Documents reviewed and approved by Riderr.
        </p>
      </InfoCard>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-brand-600 text-white rounded-xl">
          Edit Profile
        </button>
        <button className="px-6 py-3 border rounded-xl">
          Download Company Report
        </button>
      </div>
    </section>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      {children}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
