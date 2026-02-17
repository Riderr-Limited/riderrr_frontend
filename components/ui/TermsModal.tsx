"use client";
import { useState } from "react";
import { Button } from "./Button";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Terms and Conditions</h2>
          <p className="text-sm text-gray-600 mt-1">Please read and accept to continue</p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4 text-gray-700">
            <section>
              <h3 className="font-semibold text-lg mb-2">1. Service Agreement</h3>
              <p>By registering as a logistics partner with Riderrr, you agree to provide delivery services through our platform.</p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">2. Commission Structure</h3>
              <p className="font-medium text-gray-900">Riderrr charges a 10% commission on each completed delivery. This commission will be automatically deducted from your earnings.</p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">3. Rider Management Responsibility</h3>
              <p>You are fully responsible for all riders registered under your organization account, including:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Verification of rider credentials and documentation</li>
                <li>Rider conduct and professionalism</li>
                <li>Compliance with traffic laws and regulations</li>
                <li>Vehicle maintenance and safety standards</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">4. Liability for Loss and Damage</h3>
              <p>Your organization is responsible for:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Lost packages during delivery</li>
                <li>Damaged items in transit</li>
                <li>Theft or mishandling by your registered riders</li>
                <li>Any compensation claims from customers</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">5. Insurance and Indemnity</h3>
              <p>You agree to maintain appropriate insurance coverage and indemnify Riderrr against any claims arising from your delivery operations.</p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">6. Service Standards</h3>
              <p>You must maintain professional service standards, timely deliveries, and proper handling of all packages.</p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">7. Account Termination</h3>
              <p>Riderrr reserves the right to suspend or terminate accounts that violate these terms or fail to meet service standards.</p>
            </section>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">
              I have read and agree to the Terms and Conditions, including the 10% commission fee and full responsibility for riders and deliveries under my account.
            </span>
          </label>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onAccept} disabled={!agreed}>
              Accept & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
