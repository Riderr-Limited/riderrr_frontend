"use client";

export default function OrganizationSettings() {
  return (
    <section className="p-6 max-w-5xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Account */}
      <SettingsCard title="Account Settings">
        <Input label="Company Email" value="info@logiexpress.com" />
        <Input label="Phone Number" value="+234 800 000 0000" />
        <button className="btn-primary">Save Changes</button>
      </SettingsCard>

      {/* Business */}
      <SettingsCard title="Business Settings">
        <Input label="Operating Cities" value="Lagos, Abuja" />
        <Input label="Service Types" value="Same-day, Express" />
        <button className="btn-primary">Update Business Info</button>
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard title="Notification Preferences">
        <Checkbox label="Email Notifications" />
        <Checkbox label="SMS Alerts" />
        <Checkbox label="WhatsApp Updates" />
      </SettingsCard>

      {/* Security */}
      <SettingsCard title="Security">
        <button className="btn-secondary">Change Password</button>
        <button className="btn-secondary">Enable Two-Factor Auth</button>
      </SettingsCard>

      {/* Danger */}
      <SettingsCard title="Danger Zone">
        <button className="btn-danger">Deactivate Account</button>
      </SettingsCard>
    </section>
  );
}

function SettingsCard({
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

function Input({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        defaultValue={value}
        className="w-full mt-2 px-4 py-3 border rounded-xl"
      />
    </div>
  );
}

function Checkbox({ label }: { label: string }) {
  return (
    <label className="flex items-center gap-3">
      <input type="checkbox" className="w-4 h-4" />
      <span>{label}</span>
    </label>
  );
}
