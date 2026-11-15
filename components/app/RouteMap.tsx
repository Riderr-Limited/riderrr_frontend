"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { MapPinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadGoogleMaps } from "@/lib/app/maps";

type LatLng = { lat: number; lng: number };

const MAP_STYLES = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

function valid(p?: LatLng | null): p is LatLng {
  return !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng) && !(p.lat === 0 && p.lng === 0);
}

/**
 * Pickup, drop-off and (optionally) the rider's live position.
 * Re-fits the view only when the stops change, so a moving rider doesn't fight the user's zoom.
 */
export function RouteMap({
  pickup,
  dropoff,
  rider,
  self,
  className,
}: {
  pickup?: LatLng | null;
  dropoff?: LatLng | null;
  rider?: LatLng | null;
  self?: LatLng | null;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const layers = useRef<{ pickup?: any; dropoff?: any; rider?: any; self?: any; line?: any }>({});
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((google) => {
      if (cancelled || !el.current) return;
      if (!google) {
        setState("unavailable");
        return;
      }
      map.current = new google.maps.Map(el.current, {
        center: { lat: 6.5244, lng: 3.3792 },
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "cooperative",
        clickableIcons: false,
        styles: MAP_STYLES,
      });
      setState("ready");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Stops + route line; fit bounds when they change.
  useEffect(() => {
    if (state !== "ready") return;
    const google = (window as any).google;
    const m = map.current;
    const L = layers.current;

    const dot = (fill: string, stroke: string, scale = 7) => ({
      path: google.maps.SymbolPath.CIRCLE,
      scale,
      fillColor: fill,
      fillOpacity: 1,
      strokeColor: stroke,
      strokeWeight: 2,
    });

    const place = (key: "pickup" | "dropoff", pos: LatLng | null | undefined, icon: any, title: string) => {
      if (!valid(pos)) {
        L[key]?.setMap(null);
        L[key] = undefined;
        return;
      }
      if (!L[key]) L[key] = new google.maps.Marker({ map: m, title, icon, zIndex: 2 });
      L[key].setPosition(pos);
    };

    place("pickup", pickup, dot("#ffffff", "#31302e"), "Pickup");
    place("dropoff", dropoff, dot("#1e5fd8", "#ffffff"), "Drop-off");

    L.line?.setMap(null);
    if (valid(pickup) && valid(dropoff)) {
      L.line = new google.maps.Polyline({
        map: m,
        path: [pickup, dropoff],
        strokeOpacity: 0,
        icons: [
          {
            icon: { path: "M 0,-1 0,1", strokeOpacity: 0.7, strokeColor: "#1e5fd8", scale: 3 },
            offset: "0",
            repeat: "14px",
          },
        ],
      });
    }

    const pts = [pickup, dropoff, rider, self].filter(valid);
    if (pts.length === 1) {
      m.setCenter(pts[0]);
      m.setZoom(15);
    } else if (pts.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      pts.forEach((p) => bounds.extend(p));
      m.fitBounds(bounds, 56);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  // Live positions move without refitting.
  useEffect(() => {
    if (state !== "ready") return;
    const google = (window as any).google;
    const L = layers.current;
    const live = (key: "rider" | "self", pos: LatLng | null | undefined, color: string, title: string) => {
      if (!valid(pos)) {
        L[key]?.setMap(null);
        L[key] = undefined;
        return;
      }
      if (!L[key]) {
        L[key] = new google.maps.Marker({
          map: map.current,
          title,
          zIndex: 3,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });
      }
      L[key].setPosition(pos);
    };
    live("rider", rider, "#0f2454", "Rider");
    live("self", self, "#0f2454", "You");
  }, [state, rider?.lat, rider?.lng, self?.lat, self?.lng, rider, self]);

  return (
    <div className={cn("relative overflow-hidden bg-brand-canvas-soft", className)}>
      <div ref={el} className="absolute inset-0" aria-label="Route map" role="region" />
      {state === "loading" && <div className="dash-skeleton absolute inset-0 rounded-none" />}
      {state === "unavailable" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-brand-ink-muted">
          <MapPinOff aria-hidden className="size-5" />
          Map unavailable
        </div>
      )}
    </div>
  );
}
