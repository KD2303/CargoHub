"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, Building, X, Navigation, CheckCircle2 } from "lucide-react";
import { useAddressStore } from "@/store/addressStore";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";

const AddressMap = dynamic(() => import("@/components/dashboard/AddressMap"), { ssr: false });

const getIcon = (type: string) => {
  if (type === "Home") return Home;
  if (type === "Office") return Briefcase;
  return Building;
};

export default function AddressesPage() {
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAddressStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "Home",
    address: "",
    city: "",
    state: "",
    pin: "",
    isDefault: false
  });
  
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({ title: "", type: "Home", address: "", city: "", state: "", pin: "", isDefault: false });
    setIsModalOpen(true);
  };

  const handleEdit = (addr: any) => {
    setEditingId(addr.id);
    setFormData({
      title: addr.title,
      type: addr.type,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pin: addr.pin,
      isDefault: addr.isDefault
    });
    setIsModalOpen(true);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
        const res = await fetch(`https://api.olamaps.io/places/v1/reverse-geocode?latlng=${latitude},${longitude}&api_key=${apiKey}`);
        const data = await res.json();
        
        if (data.status === 'ok' && data.results && data.results.length > 0) {
          const result = data.results[0];
          
          let city = "";
          let state = "";
          let pin = "";
          
          if (result.address_components) {
            result.address_components.forEach((comp: any) => {
               if (comp.types.includes("locality")) city = comp.short_name;
               if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
               if (comp.types.includes("postal_code")) pin = comp.short_name;
            });
          }

          setFormData(prev => ({
            ...prev,
            address: result.formatted_address || prev.address,
            city: city || prev.city,
            state: state || prev.state,
            pin: pin || prev.pin,
          }));
          setMapCenter({ lat: latitude, lng: longitude });
          toast.success("Location fetched successfully!");
        } else {
          toast.error("Could not fetch address for this location.");
        }
      } catch (err) {
        console.error("Failed to reverse geocode:", err);
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      console.error(error);
      toast.error("Unable to retrieve your location. Please check browser permissions.");
      setIsLocating(false);
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title || formData.type,
      type: formData.type,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pin: formData.pin,
      isDefault: formData.isDefault
    };

    if (editingId) {
      updateAddress(editingId, payload);
    } else {
      addAddress(payload);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Saved Addresses</h1>
          <p className="text-sm text-gray-500">Manage your pickup and drop-off locations.</p>
        </div>
        <button onClick={handleOpenModal} className="btn-primary">
          <Plus className="w-4 h-4 mr-1" /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {addresses.map((addr) => {
            const Icon = getIcon(addr.type);
            return (
              <motion.div 
                key={addr.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card card-hover relative group border border-gray-100 shadow-sm"
              >
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-md bg-green-50 text-green-600 border border-green-200">
                    Default
                  </span>
                )}
                {!addr.isDefault && (
                  <button 
                    onClick={() => setDefaultAddress(addr.id)}
                    className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-md bg-gray-50 text-gray-500 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                  >
                    Set Default
                  </button>
                )}

                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">{addr.title}</h3>
                </div>
                
                <div className="space-y-1 mb-6 text-sm text-gray-600 min-h-[60px]">
                  <p className="line-clamp-2">{addr.address}</p>
                  <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.pin}</p>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleEdit(addr)}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs py-2 flex items-center justify-center gap-1 font-semibold text-gray-700 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button 
                    onClick={() => removeAddress(addr.id)}
                    className="flex-1 text-xs py-2 flex items-center justify-center gap-1 rounded-xl transition-colors hover:bg-red-50 text-red-600 border border-red-200 font-semibold"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleOpenModal}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50/50 min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-medium text-blue-600">Add New Address</span>
        </motion.div>
      </div>

      {/* Add New Address Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Address" : "Add New Address"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Map */}
                <div className="flex flex-col gap-4">
                  <button 
                    type="button" 
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="w-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50"
                  >
                    <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                    {isLocating ? 'Locating...' : 'Use Current Location'}
                  </button>

                  <div className="flex-1 min-h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
                    <AddressMap 
                      center={mapCenter}
                      marker={mapCenter}
                      onMarkerDragEnd={(lat, lng, address) => {
                        setMapCenter({ lat, lng });
                        setFormData(prev => ({ ...prev, address }));
                      }}
                    />
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex flex-col">
                  <div className="relative mb-6 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                    <span className="relative bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">ENTER DETAILS</span>
                  </div>

                  <form onSubmit={handleSave} className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Save As</label>
                          <select 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className="input-field bg-white w-full"
                          >
                            <option>Home</option>
                            <option>Office</option>
                            <option>Warehouse</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Title (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Dad's House" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="input-field w-full" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Full Address</label>
                        <textarea 
                          required
                          placeholder="Flat/Building, Street, Area" 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="input-field w-full min-h-[80px] resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                          <input 
                            required
                            type="text" 
                            placeholder="City" 
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="input-field w-full" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Pincode</label>
                          <input 
                            required
                            type="text" 
                            placeholder="Pincode" 
                            value={formData.pin}
                            onChange={(e) => setFormData({...formData, pin: e.target.value})}
                            className="input-field w-full" 
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 mt-4 cursor-pointer group w-max">
                        <input 
                          type="checkbox" 
                          checked={formData.isDefault}
                          onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Set as default address</span>
                      </label>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary px-6">
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary px-8">
                        {editingId ? "Save Changes" : "Save Address"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
