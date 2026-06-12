"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Navigation } from "lucide-react";

interface AddressMapProps {
  center: { lat: number; lng: number };
  marker: { lat: number; lng: number } | null;
  onMarkerDragEnd: (lat: number, lng: number, address: string) => void;
}

export default function AddressMap({ center, marker, onMarkerDragEnd }: AddressMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const pinMarker = useRef<maplibregl.Marker | null>(null);

  const reverseGeocode = async (lng: number, lat: number) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
      const res = await fetch(`https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${apiKey}`);
      const data = await res.json();
      if (data.status === 'ok' && data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
    }
    return "Selected Location";
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
      if (!apiKey) return;

      try {
        const styleUrl = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${apiKey}`;
        const res = await fetch(styleUrl);
        let styleData = await res.json();

        if (styleData && styleData.layers) {
          styleData.layers = styleData.layers.filter(
            (layer: any) => layer.id !== "3d_model_data" && layer.id !== "ola-mbo" && layer.id !== "pedestrian_polygon"
          );
        }

        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: styleData,
          center: [center.lng, center.lat],
          zoom: 14,
          transformRequest: (url) => {
            if (url.includes('olamaps.io')) {
              const urlObj = new URL(url);
              urlObj.searchParams.set('api_key', apiKey);
              return { url: urlObj.toString() };
            }
            return { url };
          }
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

        map.current.on('load', () => {
          if (!map.current) return;
          if (marker) {
            createMarker(marker);
          }
        });

      } catch (error) {
        console.error("Error loading map style:", error);
      }
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); 

  const createMarker = (location: { lat: number; lng: number }) => {
    if (!map.current) return;
    
    if (pinMarker.current) {
      pinMarker.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'w-5 h-5 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-110';
    el.style.backgroundColor = 'var(--brand-success)';
    el.title = `Drag to change location`;

    const m = new maplibregl.Marker({ element: el, draggable: true })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current!);

    m.on('dragend', async () => {
      const lngLat = m.getLngLat();
      const address = await reverseGeocode(lngLat.lng, lngLat.lat);
      onMarkerDragEnd(lngLat.lat, lngLat.lng, address);
    });

    pinMarker.current = m;
  };

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      if (marker) {
        if (!pinMarker.current) {
          createMarker(marker);
        } else {
          pinMarker.current.setLngLat([marker.lng, marker.lat]);
        }
        map.current.flyTo({ center: [marker.lng, marker.lat], zoom: 14 });
      }
    }
  }, [marker]);

  return (
    <div className="card col-span-1 relative overflow-hidden h-full min-h-[300px] p-0 flex flex-col group">
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-md border border-gray-100">
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Address Map</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-ring" style={{ background: "var(--brand-primary)" }} />
            <span className="text-xs font-semibold text-gray-600">Drag marker</span>
          </div>
        </div>
        
        <button 
          onClick={() => {
            if (map.current && marker) {
              map.current.flyTo({ center: [marker.lng, marker.lat], zoom: 14 });
            }
          }}
          title="Recenter"
          className="bg-white/90 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center pointer-events-auto hover:bg-gray-50 transition-colors shadow-md border border-gray-100"
        >
          <Navigation className="w-4 h-4" style={{ color: "var(--brand-primary)" }} />
        </button>
      </div>

      <div ref={mapContainer} className="absolute inset-0 z-0 w-full h-full" />
    </div>
  );
}
