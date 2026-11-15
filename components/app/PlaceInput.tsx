"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useId, useRef, useState } from "react";
import { Clock, LocateFixed, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { distanceKm, getCurrentPosition, loadGoogleMaps, reverseGeocode } from "@/lib/app/maps";
import type { Place } from "@/lib/app/types";
import { Spinner } from "./ui";

interface Prediction {
  placeId: string;
  main: string;
  secondary: string;
  description: string;
}

type Option =
  | { kind: "current" }
  | { kind: "recent"; place: Place }
  | { kind: "prediction"; prediction: Prediction };

export function PlaceInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  marker = "pickup",
  bias,
  recent = [],
  allowCurrentLocation = true,
  optional = false,
}: {
  id?: string;
  label: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  placeholder?: string;
  marker?: "pickup" | "dropoff";
  bias?: { lat: number; lng: number } | null;
  recent?: Place[];
  allowCurrentLocation?: boolean;
  optional?: boolean;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const listId = `${inputId}-list`;
  const [text, setText] = useState(value?.address ?? "");
  const [open, setOpen] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapsReady, setMapsReady] = useState<boolean | null>(null);
  const services = useRef<{ auto: any; places: any; token: any; google: any } | null>(null);
  const debounce = useRef<number | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keep the visible text in sync when the parent sets or clears the value.
  useEffect(() => {
    setText(value?.address ?? "");
  }, [value?.address]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((google) => {
      if (cancelled) return;
      if (!google) {
        setMapsReady(false);
        return;
      }
      services.current = {
        google,
        auto: new google.maps.places.AutocompleteService(),
        places: new google.maps.places.PlacesService(document.createElement("div")),
        token: new google.maps.places.AutocompleteSessionToken(),
      };
      setMapsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const search = (query: string) => {
    window.clearTimeout(debounce.current);
    if (!query.trim() || !services.current) {
      setPredictions([]);
      return;
    }
    debounce.current = window.setTimeout(() => {
      const s = services.current!;
      const request: any = {
        input: query,
        componentRestrictions: { country: "ng" },
        sessionToken: s.token,
      };
      if (bias) {
        request.location = new s.google.maps.LatLng(bias.lat, bias.lng);
        request.radius = 50000;
      }
      s.auto.getPlacePredictions(request, (results: any[] | null, status: string) => {
        if (status !== "OK" || !results) {
          setPredictions([]);
          return;
        }
        setPredictions(
          results.slice(0, 6).map((r) => ({
            placeId: r.place_id,
            main: r.structured_formatting?.main_text ?? r.description,
            secondary: r.structured_formatting?.secondary_text ?? "",
            description: r.description,
          })),
        );
        setActive(0);
      });
    }, 280);
  };

  const pickPrediction = (p: Prediction) => {
    const s = services.current;
    if (!s) return;
    setBusy(true);
    setError(null);
    s.places.getDetails(
      { placeId: p.placeId, fields: ["geometry"], sessionToken: s.token },
      (place: any, status: string) => {
        setBusy(false);
        s.token = new s.google.maps.places.AutocompleteSessionToken();
        const loc = place?.geometry?.location;
        if (status !== "OK" || !loc) {
          setError("We couldn't pin that address. Try a nearby landmark.");
          return;
        }
        const chosen = { address: p.description, lat: loc.lat(), lng: loc.lng() };
        setText(chosen.address);
        setOpen(false);
        onChange(chosen);
      },
    );
  };

  const pickCurrentLocation = async () => {
    setBusy(true);
    setError(null);
    try {
      const pos = await getCurrentPosition();
      const geo = await reverseGeocode(pos.lat, pos.lng);
      const chosen = {
        address: geo?.address ?? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`,
        lat: pos.lat,
        lng: pos.lng,
      };
      setText(chosen.address);
      setOpen(false);
      onChange(chosen);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't find your location.");
    } finally {
      setBusy(false);
    }
  };

  const showRecent = !text.trim() || (value && text === value.address);
  const options: Option[] = [
    ...(allowCurrentLocation ? [{ kind: "current" } as Option] : []),
    ...(showRecent ? recent.slice(0, 5).map((place) => ({ kind: "recent", place }) as Option) : []),
    ...(!showRecent ? predictions.map((prediction) => ({ kind: "prediction", prediction }) as Option) : []),
  ];

  const choose = (o: Option) => {
    if (o.kind === "current") pickCurrentLocation();
    else if (o.kind === "recent") {
      setText(o.place.address);
      setOpen(false);
      onChange(o.place);
    } else pickPrediction(o.prediction);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open && options[active]) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={inputId} className="dash-label">
        {label}
        {optional && <span className="font-normal text-brand-ink-faint"> (optional)</span>}
      </label>
      <div className="relative">
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 size-2 -translate-y-1/2 rounded-full",
            marker === "pickup" ? "border-[1.5px] border-brand-ink-muted bg-white" : "bg-brand-primary",
          )}
        />
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open && options.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          className="dash-input h-11 pr-9 pl-8"
          placeholder={mapsReady === false ? "Address search is unavailable right now" : placeholder}
          value={text}
          disabled={mapsReady === false}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setError(null);
            if (value) onChange(null);
            search(e.target.value);
          }}
        />
        {busy && <Spinner className="absolute top-1/2 right-3 -translate-y-1/2 text-brand-ink-faint" />}
      </div>

      {open && options.length > 0 && mapsReady !== false && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-brand-hairline bg-white py-1 shadow-elevated"
        >
          {options.map((o, i) => {
            const base = cn(
              "flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left text-sm",
              i === active ? "bg-brand-canvas-soft" : "hover:bg-brand-canvas-soft",
            );
            return (
              <li
                key={o.kind === "prediction" ? o.prediction.placeId : o.kind === "recent" ? `r-${o.place.address}` : "current"}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={base}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(o);
                }}
              >
                {o.kind === "current" && (
                  <>
                    <LocateFixed aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-primary" />
                    <span className="font-medium text-brand-primary">Use my current location</span>
                  </>
                )}
                {o.kind === "recent" && (
                  <>
                    <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-ink-faint" />
                    <span className="min-w-0 truncate text-brand-ink-secondary">{o.place.address}</span>
                  </>
                )}
                {o.kind === "prediction" && (
                  <>
                    <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-ink-faint" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-brand-ink">{o.prediction.main}</span>
                      {o.prediction.secondary && (
                        <span className="block truncate text-xs text-brand-ink-muted">{o.prediction.secondary}</span>
                      )}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {value && bias && (
        <p className="mt-1 text-xs text-brand-ink-faint">{distanceKm(bias, value).toFixed(1)} km from you</p>
      )}
    </div>
  );
}
