"use client";

// Google Maps is loaded once per page. The root layout already includes the
// script tag; this waits for it, or injects one if a page is reached without it.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Google = any;

let loader: Promise<Google | null> | null = null;

export function loadGoogleMaps(): Promise<Google | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const w = window as any;
  if (w.google?.maps?.places && w.google?.maps?.Map) return Promise.resolve(w.google);
  if (loader) return loader;

  loader = new Promise((resolve) => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (!existing && key) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    const started = Date.now();
    const check = () => {
      if (w.google?.maps?.places && w.google?.maps?.Map) return resolve(w.google);
      if (Date.now() - started > 15000) {
        loader = null;
        return resolve(null);
      }
      window.setTimeout(check, 120);
    };
    check();
  });
  return loader;
}

export interface Coords {
  lat: number;
  lng: number;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export class LocationError extends Error {}

export function getCurrentPosition(timeout = 15000): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new LocationError("This browser can't share your location."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
        }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new LocationError("Location access is blocked. Allow it in your browser settings and try again."));
        } else if (err.code === err.TIMEOUT) {
          reject(new LocationError("Finding your location took too long. Try again."));
        } else {
          reject(new LocationError("We couldn't find your location."));
        }
      },
      { enableHighAccuracy: true, timeout, maximumAge: 30000 },
    );
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; area: string } | null> {
  const google = await loadGoogleMaps();
  if (!google) return null;
  return new Promise((resolve) => {
    new google.maps.Geocoder().geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status !== "OK" || !results?.length) return resolve(null);
      const first = results[0];
      const component = (type: string) =>
        first.address_components?.find((c: any) => c.types.includes(type))?.long_name;
      const area =
        component("sublocality") ||
        component("neighborhood") ||
        component("locality") ||
        component("administrative_area_level_2") ||
        first.formatted_address;
      resolve({ address: first.formatted_address, area });
    });
  });
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}
