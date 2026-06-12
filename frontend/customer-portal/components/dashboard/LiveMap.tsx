"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Navigation } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

export default function LiveMap({ readonly = false }: { readonly?: boolean }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const pickupMarker = useRef<maplibregl.Marker | null>(null);
  const dropoffMarker = useRef<maplibregl.Marker | null>(null);
  const driverMarker = useRef<maplibregl.Marker | null>(null);

  // Fetch the setters only, so the map doesn't re-render while dragging and cause the pins to fluctuate
  const setPickup = useBookingStore(state => state.setPickup);
  const setDropoff = useBookingStore(state => state.setDropoff);

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

  const updateRouteLineAndBounds = async (pickup: any, dropoff: any) => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const source = map.current.getSource('route') as maplibregl.GeoJSONSource;
    
    if (pickup && dropoff) {
      const geometry = await getOSRMRoute(pickup, dropoff);
      
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry
      };
      
      const currentSource = map.current.getSource('route') as maplibregl.GeoJSONSource;
      
      if (currentSource) {
        currentSource.setData(geojson as any);
      } else {
        map.current.addSource('route', {
          type: 'geojson',
          data: geojson as any
        });
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#2563EB',
            'line-width': 4
          }
        });
      }

      // Zoom out to fit both
      const bounds = new maplibregl.LngLatBounds()
        .extend([pickup.lng, pickup.lat])
        .extend([dropoff.lng, dropoff.lat]);
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 14 });
      
    } else if (pickup) {
      if (source) source.setData({ type: 'FeatureCollection', features: [] });
      map.current.flyTo({ center: [pickup.lng, pickup.lat], zoom: 14 });
    }
  };

  // Helper to create a marker dynamically
  const createMarker = (type: 'pickup' | 'dropoff' | 'driver', location: any) => {
    if (!map.current) return null;
    
    const el = document.createElement('div');
    if (type === 'driver') {
      el.className = 'w-8 h-8 bg-white rounded-full border-2 border-blue-500 shadow-lg flex items-center justify-center relative overflow-hidden transition-all duration-500';
      el.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-blue-50"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></div>`;
      el.title = `Driver Location`;
      
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current);
      return marker;
    }

    el.className = `w-5 h-5 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 ${readonly ? '' : 'cursor-pointer'}`;
    el.style.backgroundColor = type === 'pickup' ? 'var(--brand-success)' : 'var(--brand-secondary)';
    if (!readonly) {
      el.title = `Drag to change ${type}`;
    }

    const marker = new maplibregl.Marker({ element: el, draggable: !readonly })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current!);

    if (!readonly) {
      marker.on('dragend', async () => {
        const lngLat = marker.getLngLat();
        const address = await reverseGeocode(lngLat.lng, lngLat.lat);
        if (type === 'pickup') {
          setPickup({ lng: lngLat.lng, lat: lngLat.lat, address });
        } else {
          setDropoff({ lng: lngLat.lng, lat: lngLat.lat, address });
        }
      });
    }

    return marker;
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Read the initial state ONCE
    const { pickup, dropoff, driverLocation } = useBookingStore.getState();

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
            layers: [
              {
                id: 'osm',
                type: 'raster',
                source: 'osm',
                minzoom: 0,
                maxzoom: 19
              }
            ]
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
          center: pickup ? [pickup.lng, pickup.lat] : [79.0882, 21.1458], // Nagpur center of India default
          zoom: pickup ? 14 : 4,
          transformRequest: (url, resourceType) => {
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

          if (pickup) pickupMarker.current = createMarker('pickup', pickup);
          if (dropoff) dropoffMarker.current = createMarker('dropoff', dropoff);
          if (driverLocation) driverMarker.current = createMarker('driver', driverLocation);

          updateRouteLineAndBounds(pickup, dropoff);
        });

      } catch (error) {
        console.error("Error loading map style:", error);
      }
    };

    initMap();

    return () => {
      if (pickupMarker.current) {
        pickupMarker.current.remove();
        pickupMarker.current = null;
      }
      if (dropoffMarker.current) {
        dropoffMarker.current.remove();
        dropoffMarker.current = null;
      }
      if (driverMarker.current) {
        driverMarker.current.remove();
        driverMarker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Initialize once

  // Subscribe to store changes imperatively to update markers WITHOUT re-rendering LiveMap
  useEffect(() => {
    let prevPickup = useBookingStore.getState().pickup;
    let prevDropoff = useBookingStore.getState().dropoff;

    const unsub = useBookingStore.subscribe((state) => {
      // Handle Pickup Marker
      if (state.pickup) {
        if (pickupMarker.current) {
          const currentPos = pickupMarker.current.getLngLat();
          if (Math.abs(currentPos.lng - state.pickup.lng) > 0.0001 || Math.abs(currentPos.lat - state.pickup.lat) > 0.0001) {
            pickupMarker.current.setLngLat([state.pickup.lng, state.pickup.lat]);
          }
        } else if (map.current?.isStyleLoaded()) {
          // Create marker if it didn't exist
          pickupMarker.current = createMarker('pickup', state.pickup);
        }
      } else if (pickupMarker.current) {
        pickupMarker.current.remove();
        pickupMarker.current = null;
      }

      // Handle Dropoff Marker
      if (state.dropoff) {
        if (dropoffMarker.current) {
          const currentPos = dropoffMarker.current.getLngLat();
          if (Math.abs(currentPos.lng - state.dropoff.lng) > 0.0001 || Math.abs(currentPos.lat - state.dropoff.lat) > 0.0001) {
            dropoffMarker.current.setLngLat([state.dropoff.lng, state.dropoff.lat]);
          }
        } else if (map.current?.isStyleLoaded()) {
          // Create marker if it didn't exist
          dropoffMarker.current = createMarker('dropoff', state.dropoff);
        }
      } else if (dropoffMarker.current) {
        dropoffMarker.current.remove();
        dropoffMarker.current = null;
      }

      // Handle Driver Marker
      if (state.driverLocation) {
        if (driverMarker.current) {
          driverMarker.current.setLngLat([state.driverLocation.lng, state.driverLocation.lat]);
        } else if (map.current?.isStyleLoaded()) {
          driverMarker.current = createMarker('driver', state.driverLocation);
        }
      } else if (driverMarker.current) {
        driverMarker.current.remove();
        driverMarker.current = null;
      }

      const pickupChanged = state.pickup?.lng !== prevPickup?.lng || state.pickup?.lat !== prevPickup?.lat;
      const dropoffChanged = state.dropoff?.lng !== prevDropoff?.lng || state.dropoff?.lat !== prevDropoff?.lat;

      if (pickupChanged || dropoffChanged) {
        updateRouteLineAndBounds(state.pickup, state.dropoff);
        prevPickup = state.pickup;
        prevDropoff = state.dropoff;
      }
    });
    return unsub;
  }, []);

  return (
    <div className="card col-span-1 lg:col-span-2 relative overflow-hidden h-[400px] p-0 flex flex-col group">
      {/* Map Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-md border border-gray-100">
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Interactive Map</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-ring" style={{ background: "var(--brand-primary)" }} />
            <span className="text-xs font-semibold text-gray-600">{readonly ? 'Live Tracking' : 'Drag markers to select points'}</span>
          </div>
        </div>
        
        <button 
          onClick={() => {
            const { pickup, dropoff } = useBookingStore.getState();
            if (map.current && pickup && dropoff) {
              const bounds = new maplibregl.LngLatBounds()
                .extend([pickup.lng, pickup.lat])
                .extend([dropoff.lng, dropoff.lat]);
              map.current.fitBounds(bounds, { padding: 60, maxZoom: 14 });
            }
          }}
          title="Recenter"
          className="bg-white/90 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center pointer-events-auto hover:bg-gray-50 transition-colors shadow-md border border-gray-100"
        >
          <Navigation className="w-4 h-4" style={{ color: "var(--brand-primary)" }} />
        </button>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 z-0 w-full h-full" />
    </div>
  );
}
