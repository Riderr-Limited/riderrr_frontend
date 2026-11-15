"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { errorMessage } from "./api";
import { useInterval } from "./hooks";
import type { Coords } from "./maps";
import { rider } from "./services";
import type { Delivery, DriverRequest } from "./types";

const ONLINE_KEY = "riderr_app_rider_online";
const LOCATION_PUSH_MS = 15000;
const REQUEST_POLL_MS = 10000;
const ACTIVE_POLL_MS = 30000;

interface RiderRuntime {
  isOnline: boolean;
  toggling: boolean;
  setOnline: (next: boolean) => Promise<void>;
  location: Coords | null;
  locationError: string | null;
  request: DriverRequest | null;
  dismissRequest: (id: string) => void;
  activeDeliveries: Delivery[];
  allDeliveries: Delivery[];
  deliveriesLoaded: boolean;
  refreshDeliveries: () => Promise<void>;
}

const Ctx = createContext<RiderRuntime | null>(null);

export function useRider() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRider must be used inside RiderRuntimeProvider");
  return ctx;
}

const ACTIVE = ["created", "assigned", "picked_up", "rescue_requested"];

export function RiderRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [location, setLocation] = useState<Coords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [request, setRequest] = useState<DriverRequest | null>(null);
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [deliveriesLoaded, setDeliveriesLoaded] = useState(false);
  const dismissed = useRef<Set<string>>(new Set());
  const lastPush = useRef(0);
  const latest = useRef<Coords | null>(null);

  const activeDeliveries = allDeliveries.filter((d) => ACTIVE.includes(d.status));
  const hasActive = activeDeliveries.length > 0;

  const refreshDeliveries = useCallback(async () => {
    try {
      setAllDeliveries(await rider.myDeliveries());
    } catch {
      // keep last list
    } finally {
      setDeliveriesLoaded(true);
    }
  }, []);

  // Restore the rider's last online choice and re-announce it, as the mobile app does on launch.
  useEffect(() => {
    let stored = false;
    try {
      stored = window.localStorage.getItem(ONLINE_KEY) === "1";
    } catch {
      stored = false;
    }
    if (stored) {
      setIsOnline(true);
      rider.setOnline(true).catch(() => {});
    }
    refreshDeliveries();
  }, [refreshDeliveries]);

  useInterval(refreshDeliveries, ACTIVE_POLL_MS);

  const setOnline = useCallback(async (next: boolean) => {
    setToggling(true);
    try {
      await rider.setOnline(next);
      setIsOnline(next);
      try {
        window.localStorage.setItem(ONLINE_KEY, next ? "1" : "0");
      } catch {}
      if (!next) setRequest(null);
      if (next && typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    } catch (e) {
      throw new Error(errorMessage(e, "We couldn't update your status. Please try again."));
    } finally {
      setToggling(false);
    }
  }, []);

  // GPS while online: keep the latest fix and push it to the server every ~15s.
  useEffect(() => {
    if (!isOnline) return;
    if (!navigator.geolocation) {
      setLocationError("This browser can't share your location, so you won't receive requests.");
      return;
    }
    const push = (c: Coords) => {
      const now = Date.now();
      if (now - lastPush.current < LOCATION_PUSH_MS) return;
      lastPush.current = now;
      rider.updateLocation(c).catch(() => {});
    };
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const c: Coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
        };
        latest.current = c;
        setLocation(c);
        setLocationError(null);
        push(c);
      },
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location access is blocked. Allow it in your browser settings to receive requests."
            : "We can't get a GPS fix right now. Requests resume once your location is found.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 },
    );
    // watchPosition only fires on movement; re-send the last fix so the server sees we're alive.
    const keepAlive = window.setInterval(() => {
      if (latest.current) {
        lastPush.current = 0;
        push(latest.current);
      }
    }, LOCATION_PUSH_MS * 2);
    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.clearInterval(keepAlive);
    };
  }, [isOnline]);

  const pollRequests = useCallback(async () => {
    const loc = latest.current;
    if (!loc) return;
    try {
      const res = await rider.requests(loc.lat, loc.lng);
      const valid = (res.data ?? [])
        .filter((r) => r && (r.status === "created" || r.status === "assigned"))
        .filter((r) => r.pickup?.lat && r.dropoff?.lat && !dismissed.current.has(r._id))
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
      const next = valid[0] ?? null;
      setRequest((current) => {
        if (next && current?._id !== next._id) notify(next);
        return next ? (current?._id === next._id ? current : next) : null;
      });
    } catch {
      // Network blips keep the current card on screen.
    }
  }, []);

  useInterval(pollRequests, isOnline && !hasActive ? REQUEST_POLL_MS : null);

  useEffect(() => {
    if (isOnline && !hasActive && location) pollRequests();
    // Only on the first fix after going online.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, hasActive, !!location]);

  useEffect(() => {
    if (hasActive) setRequest(null);
  }, [hasActive]);

  const dismissRequest = useCallback((id: string) => {
    dismissed.current.add(id);
    setRequest((r) => (r?._id === id ? null : r));
  }, []);

  return (
    <Ctx.Provider
      value={{
        isOnline,
        toggling,
        setOnline,
        location,
        locationError,
        request,
        dismissRequest,
        activeDeliveries,
        allDeliveries,
        deliveriesLoaded,
        refreshDeliveries,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

function notify(req: DriverRequest) {
  if (typeof document === "undefined" || document.visibilityState === "visible") return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    const n = new Notification("New delivery request", {
      body: `${req.pickup?.address ?? "Pickup"} → ${req.dropoff?.address ?? "Drop-off"}`,
      icon: "/icons/icon-192.png",
      tag: `request-${req._id}`,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // Some browsers only allow notifications from a service worker.
  }
}
