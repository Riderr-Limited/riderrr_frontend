export function DownloadCTA() {
  return (
    <section className="py-20  text-white text-center">
      <h2 className="text-3xl font-bold mb-4">Download Our App</h2>
      <p className="text-[#337BFF] mb-8">
        Available on iOS and Android. Start delivering smarter today.
      </p>
      <div className="flex justify-center gap-4">
        <button className="px-6 py-3 bg-white text-brand-700 rounded-xl">
          App Store
        </button>
        <button className="px-6 py-3 bg-white text-brand-700 rounded-xl">
          Google Play
        </button>
      </div>
    </section>
  );
}
