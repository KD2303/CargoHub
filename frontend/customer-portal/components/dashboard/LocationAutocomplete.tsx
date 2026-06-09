import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

interface AutocompleteResult {
  description: string;
  geometry: {
    location: {
      lng: number;
      lat: number;
    }
  };
  place_id: string;
}

interface LocationAutocompleteProps {
  type: "pickup" | "dropoff";
  placeholder: string;
  icon: React.ReactNode;
}

export default function LocationAutocomplete({ type, placeholder, icon }: LocationAutocompleteProps) {
  const { pickup, dropoff, setPickup, setDropoff } = useBookingStore();
  const currentValue = type === "pickup" ? pickup : dropoff;
  
  const [query, setQuery] = useState(currentValue?.address || "");
  const [results, setResults] = useState<AutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync with store when pins are dragged on the map
  useEffect(() => {
    if (currentValue?.address && currentValue.address !== query) {
      setQuery(currentValue.address);
    }
  }, [currentValue]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Debounce the API call
    const delayDebounceFn = setTimeout(async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }

      // If the query perfectly matches the current address, don't search again
      if (currentValue && query === currentValue.address) {
        return;
      }

      setIsLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
        const res = await fetch(`https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query)}&api_key=${apiKey}`);
        const data = await res.json();
        
        if (data.status === "ok" && data.predictions) {
          setResults(data.predictions);
          setShowDropdown(true);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, currentValue]);

  const handleSelect = (place: AutocompleteResult) => {
    setQuery(place.description);
    setShowDropdown(false);
    
    const location = {
      lng: place.geometry.location.lng,
      lat: place.geometry.location.lat,
      address: place.description
    };

    if (type === "pickup") {
      setPickup(location);
    } else {
      setDropoff(location);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        {icon}
        <input 
          type="text" 
          placeholder={placeholder}
          className="input-field pl-10 bg-white w-full"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-50 w-full bg-white mt-1 rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
          {results.map((place) => (
            <li 
              key={place.place_id}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
              onClick={() => handleSelect(place)}
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {place.description.split(",")[0]}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {place.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
