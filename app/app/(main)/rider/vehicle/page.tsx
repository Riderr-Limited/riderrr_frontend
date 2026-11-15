"use client";

import { useEffect } from "react";
import { EmptyState, PageHeader } from "@/components/dashboard/primitives";
import { BackLink } from "@/components/app/BackLink";
import { KeyValue, StatusBadge } from "@/components/app/ui";
import { formatDate, humanize } from "@/lib/app/format";
import { useSession } from "@/lib/app/session";

export default function VehiclePage() {
  const { user, refreshUser } = useSession();
  const v = user?.driverProfile;

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const approval = v?.approvalStatus?.toLowerCase();
  const tone = approval === "approved" ? "success" : approval === "rejected" ? "danger" : "warning";

  return (
    <>
      <BackLink href="/app/profile" label="Profile" />
      <PageHeader title="Vehicle information" description="Managed by your company. Contact them to change these details." />
      {!v ? (
        <div className="rounded-lg border border-brand-hairline">
          <EmptyState title="No vehicle on file" description="Your company hasn't added your vehicle details yet." />
        </div>
      ) : (
        <div className="grid max-w-3xl gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-brand-hairline px-4 pt-3 pb-1">
            <p className="dash-eyebrow">Vehicle</p>
            <div className="divide-y divide-brand-hairline">
              <KeyValue label="Type">{v.vehicleType ? humanize(v.vehicleType) : "—"}</KeyValue>
              <KeyValue label="Make & model">{[v.vehicleMake, v.vehicleModel].filter(Boolean).join(" ") || "—"}</KeyValue>
              <KeyValue label="Year">{v.vehicleYear || "—"}</KeyValue>
              <KeyValue label="Colour">{v.vehicleColor || "—"}</KeyValue>
              <KeyValue label="Plate number">{v.plateNumber || "—"}</KeyValue>
            </div>
          </div>
          <div className="rounded-lg border border-brand-hairline px-4 pt-3 pb-1">
            <p className="dash-eyebrow">Licence & status</p>
            <div className="divide-y divide-brand-hairline">
              <KeyValue label="Licence number">{v.licenseNumber || "—"}</KeyValue>
              <KeyValue label="Licence expiry">{formatDate(v.licenseExpiry) || "—"}</KeyValue>
              <KeyValue label="Approval">{v.approvalStatus ? <StatusBadge tone={tone}>{humanize(v.approvalStatus)}</StatusBadge> : "—"}</KeyValue>
              <KeyValue label="Rating">
                {v.rating?.average ? `${Number(v.rating.average).toFixed(1)} (${v.rating.totalRatings ?? 0} ratings)` : "No ratings yet"}
              </KeyValue>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
