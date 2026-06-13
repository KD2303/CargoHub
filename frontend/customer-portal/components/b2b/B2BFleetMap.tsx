"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Navigation } from "lucide-react";

interface Truck {
  id: string;
  status: string;
  driver: string;
  from: string;
  to: string;
  eta: string;
  lat: number;
  lng: number;
  pickup: { lat: number, lng: number };
  dropoff: { lat: number, lng: number };
  progress: number;
  type: string;
}

interface B2BFleetMapProps {
  fleet: Truck[];
  selectedTruckId: string | null;
  onMarkerClick: (id: string) => void;
}

export default function B2BFleetMap({ fleet, selectedTruckId, onMarkerClick }: B2BFleetMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<{ [key: string]: maplibregl.Marker }>({});

  const getOSRMRoute = async (p1: any, p2: any) => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${p1.lng},${p1.lat};${p2.lng},${p2.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        return data.routes[0].geometry;
      }
    } catch (e) {
      console.error("OSRM Route failed", e);
    }
    return {
      type: 'LineString',
      coordinates: [[p1.lng, p1.lat], [p2.lng, p2.lat]]
    };
  };

  // Helper to create a custom marker element
  const createMarkerElement = (truck: Truck, isSelected: boolean) => {
    const el = document.createElement('div');
    const colorClass = truck.status === 'Delayed' ? 'border-orange-500 text-orange-500' : truck.status === 'Delivered' ? 'border-emerald-500 text-emerald-500' : 'border-blue-600 text-blue-600';
    const bgClass = isSelected ? (truck.status === 'Delayed' ? 'bg-orange-50' : truck.status === 'Delivered' ? 'bg-emerald-50' : 'bg-blue-50') : 'bg-white';
    const scaleClass = isSelected ? 'scale-125 z-50 shadow-xl' : 'scale-100 shadow-md hover:scale-110';
    
    // Truck SVG inside marker
    el.className = `w-10 h-10 ${bgClass} rounded-full border-[3px] ${colorClass} flex items-center justify-center relative cursor-pointer transition-all duration-300 ${scaleClass}`;
    
    // SVG Inner HTML
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck">
        <path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
      </svg>
      ${isSelected ? `<div class="absolute -top-1 -right-1 w-3 h-3 ${colorClass.replace('border-', 'bg-').replace('text-', '')} rounded-full animate-ping"></div>` : ''}
    `;

    // Tooltip popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'p-2 min-w-[150px]';
    popupContent.innerHTML = `
      <div class="font-bold text-gray-900 text-sm mb-1">${truck.id}</div>
      <div class="text-xs text-gray-600 mb-2">${truck.from} &rarr; ${truck.to}</div>
      <div class="text-xs font-semibold ${truck.status === 'Delayed' ? 'text-orange-500' : truck.status === 'Delivered' ? 'text-emerald-500' : 'text-blue-600'}">${truck.status}</div>
    `;

    // Create the Popup
    const popup = new maplibregl.Popup({ offset: 25, closeButton: false, className: 'rounded-xl overflow-hidden shadow-xl border border-gray-100' }).setDOMContent(popupContent);

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onMarkerClick(truck.id);
    });

    return { el, popup };
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
      if (!apiKey) {
        console.error("Ola Maps API Key is missing");
        return;
      }

      try {
        const styleUrl = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${apiKey}`;
        const res = await fetch(styleUrl);
        let styleData = await res.json();

        if (!styleData || !styleData.version) {
           console.warn("Invalid Ola Maps style. Falling back to OpenStreetMap.");
           styleData = {
            version: 8,
            sources: {
              'osm': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap contributors'
              }
            },
            layers: [{ id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 }]
          };
        } else if (styleData.layers) {
          styleData.layers = styleData.layers.filter(
            (layer: any) => layer.id !== "3d_model_data" && layer.id !== "ola-mbo" && layer.id !== "pedestrian_polygon"
          );
        }

        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: styleData,
          center: [79.0882, 21.1458], // Center of India default
          zoom: 4.5,
          transformRequest: (url, resourceType) => {
            if (url.includes('olamaps.io')) {
              const urlObj = new URL(url);
              urlObj.searchParams.set('api_key', apiKey);
              return { url: urlObj.toString() };
            }
            return { url };
          }
        });

        map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

        map.current.on('load', async () => {
          if (!map.current) return;

          // Fetch all routes
          const routeFeatures = await Promise.all(fleet.map(async (truck) => {
            const geometry = await getOSRMRoute(truck.pickup, truck.dropoff);
            return {
              type: 'Feature',
              properties: { 
                id: truck.id, 
                color: truck.status === 'Delayed' ? '#f97316' : truck.status === 'Delivered' ? '#10b981' : '#3b82f6' 
              },
              geometry
            };
          }));

          // Add Routes Source and Layer
          if (!map.current.getSource('routes')) {
            map.current.addSource('routes', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: routeFeatures as any
              }
            });

            // Draw the background lines (slightly wider, transparent)
            map.current.addLayer({
              id: 'routes-bg',
              type: 'line',
              source: 'routes',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: {
                'line-color': ['get', 'color'],
                'line-width': 6,
                'line-opacity': 0.2
              }
            });

            // Draw the main route lines (dashed or thin solid)
            map.current.addLayer({
              id: 'routes-line',
              type: 'line',
              source: 'routes',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: {
                'line-color': ['get', 'color'],
                'line-width': 3,
                'line-dasharray': [2, 2]
              }
            });
          }

          // Render all fleet markers
          fleet.forEach(truck => {
            const { el, popup } = createMarkerElement(truck, selectedTruckId === truck.id);
            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([truck.lng, truck.lat])
              .setPopup(popup)
              .addTo(map.current!);
              
            markers.current[truck.id] = marker;
            
            // Auto open popup if selected
            if (selectedTruckId === truck.id) {
               marker.togglePopup();
            }
          });

          // Fit bounds to all trucks
          if (fleet.length > 0) {
            const bounds = new maplibregl.LngLatBounds();
            fleet.forEach(t => bounds.extend([t.lng, t.lat]));
            map.current.fitBounds(bounds, { padding: 80, maxZoom: 10 });
          }
        });

      } catch (error) {
        console.error("Error loading map style:", error);
      }
    };

    initMap();

    return () => {
      Object.values(markers.current).forEach(marker => marker.remove());
      markers.current = {};
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Run once to initialize

  // Update selection/markers when state changes WITHOUT completely destroying the map
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    fleet.forEach(truck => {
      const existingMarker = markers.current[truck.id];
      const isSelected = selectedTruckId === truck.id;

      if (existingMarker) {
        // We can't cleanly update the DOM element of an existing MapLibre marker without removing and re-adding
        // So we remove the old one and replace it with the new styled one
        existingMarker.remove();
      }

      const { el, popup } = createMarkerElement(truck, isSelected);
      const newMarker = new maplibregl.Marker({ element: el })
        .setLngLat([truck.lng, truck.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current[truck.id] = newMarker;

      if (isSelected) {
        newMarker.togglePopup();
        // Fly to the selected truck
        map.current!.flyTo({
          center: [truck.lng, truck.lat],
          zoom: 12,
          duration: 1500,
          essential: true
        });
      }
    });
  }, [selectedTruckId, fleet]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div className="absolute top-4 right-4 z-20 pointer-events-auto">
        <button 
          onClick={() => {
            if (map.current && fleet.length > 0) {
              const bounds = new maplibregl.LngLatBounds();
              fleet.forEach(t => bounds.extend([t.lng, t.lat]));
              map.current.fitBounds(bounds, { padding: 80, maxZoom: 10 });
            }
          }}
          className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-md border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
        >
          <Navigation className="w-4 h-4 text-blue-600" /> View All Fleet
        </button>
      </div>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
