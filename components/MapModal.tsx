"use client";

import { IconX, IconMapPin } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: unknown) => unknown;
        Marker: new (options: unknown) => unknown;
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
          fillColor: "#4F46E5",
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <IconMapPin className="h-6 w-6 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-xl font-bold mb-1">{title}</h3>
                {address && (
                  <p className="text-sm text-white/90 mb-1">{address}</p>
                )}
                {updatedAt && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-xs text-white/80">
                      Updated{" "}
                      {new Date(updatedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
            >
              <IconX className="h-5 w-5 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="h-[500px] relative">
          {window.google ? (
            <div ref={mapRef} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="relative">
                  <IconMapPin className="h-16 w-16 mx-auto text-indigo-400 mb-3 animate-bounce" />
                  <div className="absolute inset-0 h-16 w-16 mx-auto bg-indigo-400/20 rounded-full blur-xl animate-pulse"></div>
                </div>
                <p className="text-gray-700 font-medium mb-2">Loading map...</p>
                <p className="text-sm text-gray-500">
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
