"use client";

export function ReloadButton() {
  return (
    <button type="button" onClick={() => window.location.reload()} className="dash-btn dash-btn-primary mt-6">
      Try again
    </button>
  );
}
