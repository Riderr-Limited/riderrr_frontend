export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By using Riderr, you agree to these terms. If you disagree, please do not use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
          <p className="text-gray-700 mb-4">
            Riderr connects customers with logistics partners for delivery services. We are a platform facilitator.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <p className="text-gray-700 mb-4">
            Users must provide accurate information and comply with all applicable laws when using our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            Riderr is not liable for damages arising from service use beyond the delivery fee paid.
          </p>
        </section>
      </div>
    </div>
  );
}
