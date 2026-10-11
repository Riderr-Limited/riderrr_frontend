"use client";

import { IconX, IconMapPin } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: unknown) => unknown;
        Marker: new (options: unknown) => unknown;
        Point: new (x: number, y: number) => unknown;
        Animation: {
          DROP: unknown;
        };
      };
    };
  }
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  title: string;
  address?: string;
  updatedAt?: string;
}

export default function MapModal({
  isOpen,
  onClose,
  lat,
  lng,
  title,
  address,
  updatedAt,
}: MapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      isOpen &&
      mapRef.current &&
      typeof window !== "undefined" &&
      window.google
    ) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: "M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2ZM16 8H8C7.45 8 7 8.45 7 9V11C7 11.55 7.45 12 8 12H9V20C9 20.55 9.45 21 10 21H11C11.55 21 12 20.55 12 20V15H12V20C12 20.55 12.45 21 13 21H14C14.55 21 15 20.55 15 20V12H16C16.55 12 17 11.55 17 11V9C17 8.45 16.55 8 16 8Z",
          fillColor: "#1E5FD8",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 21),
        },
      });
    }
  }, [isOpen, lat, lng, title]);

  if (!isOpen) return null;

  return (
    <div className="dash-overlay">
      <div className="dash-modal max-w-3xl">
        {/* Header */}
        <div className="dash-modal-header">
          <div className="min-w-0">
            <h3 className="dash-modal-title">{title}</h3>
            {address && (
              <p className="mt-0.5 text-[13px] text-brand-ink-muted">{address}</p>
            )}
            {updatedAt && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-ink-muted">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Updated{" "}
                {new Date(updatedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="dash-icon-btn -mr-1.5"
            aria-label="Close"
          >
            <IconX className="size-[18px]" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative h-[60vh] max-h-[500px] min-h-0">
          {window.google ? (
            <div ref={mapRef} className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-canvas-soft">
              <div className="text-center">
                <IconMapPin className="mx-auto size-6 text-brand-ink-faint" stroke={1.75} />
                <p className="mt-2 text-sm text-brand-ink-secondary">Loading map...</p>
                <p className="mt-0.5 font-mono text-xs text-brand-ink-muted">
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dash-modal-footer">
          <button onClick={onClose} className="dash-btn dash-btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
