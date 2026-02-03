"use client";

import { IconX, IconMapPin } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  title: string;
  address?: string;
}

export default function MapModal({ isOpen, onClose, lat, lng, title, address }: MapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && mapRef.current && window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title,
      });
    }
  }, [isOpen, lat, lng, title]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              {address && <p className="text-sm text-gray-500">{address}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IconX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Map Container */}
        <div className="h-96">
          {window.google ? (
            <div ref={mapRef} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <IconMapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Loading map...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Coordinates: {lat}, {lng}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Open in Google Maps
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}