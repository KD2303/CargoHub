"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Navigation, Package, IndianRupee, CheckCircle2, ArrowRight, Truck, Download } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { useAuthStore } from "@/store/authStore";
import LocationAutocomplete from "@/components/dashboard/LocationAutocomplete";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";
import Link from "next/link";
import Script from "next/script";
import { toast } from "react-hot-toast";
import { useTheme } from "next-themes";
import { CreditCard } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";

// Dynamically import LiveMap with SSR disabled
const LiveMap = dynamic(() => import("@/components/dashboard/LiveMap"), { ssr: false });

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { t } = useLanguageStore();

  const {
    pickup,
    dropoff,
    vehicle,
    setVehicle,
    weight,
    setWeight,
    cargoType,
    setCargoType,
    helpers,
    setHelpers,
    fareData,
    setFareData,
  } = useBookingStore();
  
  const [createdBookingId, setCreatedBookingId] = useState("CH-2024-0900");

  const getLoadTypeEnum = (c: string) => {
    if (c === "Electronics") return "ELECTRONICS";
    if (c === "Furniture") return "FURNITURE";
    if (c === "Fragile Goods") return "FRAGILE_GOODS";
    if (c === "Bulk Goods") return "BULK_GOODS";
    return "BOXES_CARTONS";
  };

  const getVehicleEnum = (v: string) => {
    if (v === "micro") return "MINI_PICKUP";
    if (v === "mini") return "TATA_ACE";
    if (v === "tempo") return "TEMPO_407";
    return "LARGE_TRUCK";
  };

  const calculateFare = async () => {
    if (!pickup || !dropoff) return;
    setEstimating(true);
    try {
      const res = await fetch((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + "/api/fare/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          dropLat: dropoff.lat,
          dropLng: dropoff.lng,
          vehicleType: getVehicleEnum(vehicle),
          loadType: getLoadTypeEnum(cargoType),
          helpersRequested: helpers,
          weight: weight ? Number(weight) : undefined,
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFareData(data.data);
      }
    } catch (err) {
      console.error("Failed to calculate fare", err);
    } finally {
      setEstimating(false);
    }
  };

  // Re-calculate fare if vehicle, weight, or helpers changes while on step 2
  useEffect(() => {
    if (step === 2 || step === 3) {
      calculateFare();
    }
  }, [vehicle, weight, helpers, cargoType, step]);

  const handleNext = () => {
    if (step === 1) {
      if (!pickup || !dropoff) {
        toast.error("Please select both pickup and dropoff locations.");
        return;
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handleConfirmPay = async () => {
    if (!pickup || !dropoff) return;
    
    try {
      const response = await fetch((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + "/api/payments/test-create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(fareData?.total || 100) }),
      });
      
      const resData = await response.json();

      if (!resData.success) {
        toast.error("Server error. Could not create order.");
        return;
      }

      const { data } = resData;

      const options = {
        key: "rzp_test_SzETI5YgX84RSu", 
        amount: data.amount, 
        currency: data.currency,
        name: "CargoHub",
        image: data.logo || "https://dummyimage.com/100x100/2563eb/ffffff&text=CargoHub",
        order_id: data.orderId, 
        handler: async function (response: any) {
          try {
            const { auth } = await import("@/lib/firebase");
            const idToken = await auth.currentUser?.getIdToken();
            
            const payload = {
              pickupLat: pickup.lat,
              pickupLng: pickup.lng,
              pickupAddress: pickup.address || "N/A",
              dropLat: dropoff.lat,
              dropLng: dropoff.lng,
              dropAddress: dropoff.address || "N/A",
              vehicleType: getVehicleEnum(vehicle),
              loadType: getLoadTypeEnum(cargoType),
              helpersRequested: helpers,
              weight: weight ? Number(weight) : undefined,
            };

            const bookRes = await fetch((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + "/api/bookings", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`
              },
              body: JSON.stringify(payload)
            });
            
            const bookData = await bookRes.json();
            console.log('Booking response:', bookData);
            if (bookData.success) {
              setCreatedBookingId(bookData.data?.booking?.id || bookData.data?.id || "CH-" + Date.now());
              setIsSuccess(true);
            } else {
              const errDetail = bookData.details || bookData.message || bookData.error || bookData;
              toast.error("Booking failed: " + (typeof errDetail === 'object' ? JSON.stringify(errDetail) : errDetail));
            }
          } catch (err) {
            console.error(err);
            toast.error("Error confirming booking");
          }
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment was cancelled by the user.");
          }
        },
        prefill: {
          name: user?.name || "CargoHub Customer",
          email: user?.email || "customer@cargohub.com",
          contact: user?.phone || "9999999999",
        },
        theme: {
          color: theme === 'dark' ? "#1e293b" : "#2563eb", 
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      
      razorpay.on("payment.failed", function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment. Ensure your backend is running.");
    }
  };

  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(29, 78, 216); // blue-700
    doc.text("CargoHub", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Official E-Receipt", 20, 28);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(step === 2 ? `Estimation Bill` : `Booking ID: ${createdBookingId}`, 130, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 130, 26);
    
    doc.line(20, 32, 190, 32); // Horizontal line
    
    // Locations
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Pickup Details", 20, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const pickupLines = doc.splitTextToSize(pickup?.address || "N/A", 80);
    doc.text(pickupLines, 20, 48);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Dropoff Details", 110, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const dropoffLines = doc.splitTextToSize(dropoff?.address || "N/A", 80);
    doc.text(dropoffLines, 110, 48);
    
    // Cargo Details
    const cargoY = Math.max(48 + pickupLines.length * 5, 48 + dropoffLines.length * 5) + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Cargo Details", 20, cargoY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Vehicle: ${vehicle.toUpperCase()}`, 20, cargoY + 6);
    doc.text(`Type: ${cargoType}`, 20, cargoY + 12);
    doc.text(`Weight: ${weight || 0} kg`, 20, cargoY + 18);
    doc.text(`Helpers: ${helpers} (₹${helpers * 300})`, 20, cargoY + 24);
    
    // Fare Breakdown
    const fareY = cargoY + 30;
    doc.setFillColor(249, 250, 251); // gray-50
    doc.rect(20, fareY, 170, 50, "F"); // Background box
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Fare Breakdown", 25, fareY + 8);
    doc.line(25, fareY + 10, 185, fareY + 10);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    let currentY = fareY + 16;
    doc.text("Base Fare", 25, currentY); doc.text(`Rs. ${fareData?.base || 0}`, 160, currentY); currentY += 6;
    doc.text(`Distance Charge (${fareData?.distanceKm || 0} km)`, 25, currentY); doc.text(`Rs. ${fareData?.distanceCharge || 0}`, 160, currentY); currentY += 6;
    
    if (fareData?.weightCharge) {
      doc.text("Weight Charge", 25, currentY); doc.text(`Rs. ${fareData.weightCharge}`, 160, currentY); currentY += 6;
    }
    
    if (fareData?.tollCharge) {
      doc.text("Toll Charge", 25, currentY); doc.text(`Rs. ${fareData.tollCharge}`, 160, currentY); currentY += 6;
    }
    
    doc.text("GST (18%)", 25, currentY); doc.text(`Rs. ${fareData?.gst || 0}`, 160, currentY); currentY += 6;
    
    doc.line(25, currentY, 185, currentY); currentY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid", 25, currentY); 
    doc.setTextColor(29, 78, 216);
    doc.text(`Rs. ${fareData?.total || 0}`, 160, currentY);
    
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Thank you for choosing CargoHub.", 105, currentY + 20, { align: "center" });
    
    doc.save("CargoHub_Receipt.pdf");
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-6"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-display font-bold text-gray-900 mb-4"
        >
          Payment Successful!
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-8 max-w-md"
        >
          Your vehicle has been booked successfully. Driver details will be shared shortly.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <button onClick={handleDownloadReceipt} className="btn-secondary">
            <Download className="w-4 h-4 mr-2" /> Download Receipt
          </button>
          <Link href={`/dashboard/track?id=${createdBookingId}`} className="btn-primary">
            Track Shipment <Navigation className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">{t('newBooking')}</h1>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0" />
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full z-0" 
            style={{ background: "var(--brand-primary)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${(step - 1) * 50}%` }}
            transition={{ duration: 0.5 }}
          />
          
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= s ? 'bg-white border-blue-600 text-blue-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                style={{ 
                  borderColor: step >= s ? "var(--brand-primary)" : "",
                  color: step >= s ? "var(--brand-primary)" : ""
                }}
                animate={{ scale: step === s ? 1.1 : 1 }}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </motion.div>
              <span className="text-xs font-semibold text-gray-500 absolute top-10 whitespace-nowrap">
                {s === 1 ? 'Locations' : s === 2 ? 'Cargo Details' : 'Review & Pay'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 card overflow-hidden bg-white min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div>
                <h2 className="text-lg font-bold mb-4 text-gray-900">{t('pickupDetails')}</h2>
                <div className="space-y-4 relative">
                  <div className="relative z-20">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Pickup Location</label>
                    <LocationAutocomplete 
                      type="pickup"
                      placeholder="Search pickup address..."
                      icon={
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-blue-500 bg-white z-20" />
                      }
                    />
                  </div>
                  <div className="relative z-10">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Drop Location</label>
                    <LocationAutocomplete 
                      type="dropoff"
                      placeholder="Search drop address..."
                      icon={
                        <Navigation className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 bg-white z-20" style={{ color: "var(--brand-secondary)" }} />
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-xl h-[350px] border border-gray-200 relative overflow-hidden">
                <LiveMap />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-lg font-bold mb-4 text-gray-900">{t('cargoDetails')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { key: "micro", label: "Small", capacity: "Up to 350kg" },
                  { key: "mini", label: "Mini", capacity: "Up to 750kg" },
                  { key: "tempo", label: "Tempo", capacity: "Up to 2.5 Ton" },
                  { key: "truck", label: "Truck", capacity: "Up to 7 Ton" },
                ].map((v) => (
                  <button 
                    key={v.key} 
                    onClick={() => setVehicle(v.key)}
                    className={`border-2 rounded-xl p-4 text-left transition-all`}
                    style={{
                      borderColor: vehicle === v.key ? "var(--brand-primary)" : "var(--border-subtle)",
                      background: vehicle === v.key ? "rgba(37, 99, 235, 0.08)" : "var(--bg-card)",
                      boxShadow: vehicle === v.key ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
                    }}
                  >
                    <Truck className="w-6 h-6 mb-2" style={{ color: vehicle === v.key ? "var(--brand-primary)" : "var(--text-muted)" }} />
                    <h3 className="font-bold capitalize" style={{ color: vehicle === v.key ? "var(--brand-primary)" : "var(--text-primary)" }}>{v.label}</h3>
                    <p className="text-xs" style={{ color: vehicle === v.key ? "var(--text-secondary)" : "var(--text-muted)" }}>{v.capacity}</p>
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Cargo Type</label>
                  <select 
                    className="input-field bg-white w-full"
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                  >
                    <option>Boxes & Cartons</option>
                    <option>Electronics</option>
                    <option>Furniture</option>
                    <option>Fragile Goods</option>
                    <option>Bulk Goods</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Estimated Weight (kg)</label>
                  <input 
                    type="number" 
                    className="input-field w-full" 
                    placeholder="e.g. 50" 
                    min="0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">₹1 surcharge per kg above 50kg</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Helpers Needed</label>
                  <input 
                    type="number"
                    className="input-field bg-white w-full"
                    value={helpers}
                    min={0}
                    onChange={(e) => setHelpers(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">₹300 per helper</p>
                </div>
              </div>
              
              {estimating && <p className="text-sm text-blue-500 mt-4 animate-pulse">Calculating fare...</p>}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-lg font-bold mb-4 text-gray-900">{t('reviewPay')}</h2>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-500" />
                    <span className="font-bold text-gray-700 capitalize">{vehicle}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-500">{cargoType}, ~{weight || 0}kg{helpers > 0 ? `, ${helpers} helper${helpers > 1 ? 's' : ''}` : ''}</span>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Base Fare</span>
                    <span className="font-mono">₹{fareData?.base || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance Charge ({fareData?.distanceKm || 0} km)</span>
                    <span className="font-mono">₹{fareData?.distanceCharge || 0}</span>
                  </div>
                  {fareData?.weightCharge ? (
                    <div className="flex justify-between text-orange-600">
                      <span>Weight Charge</span>
                      <span className="font-mono">₹{fareData.weightCharge}</span>
                    </div>
                  ) : null}
                  {fareData?.tollCharge ? (
                    <div className="flex justify-between">
                      <span>Toll Charge</span>
                      <span className="font-mono">₹{fareData.tollCharge}</span>
                    </div>
                  ) : null}
                  {helpers > 0 && (
                    <div className="flex justify-between text-blue-600 bg-blue-50 -mx-2 px-2 py-1 rounded-lg">
                      <span className="font-medium">👷 Helpers ({helpers} × ₹300)</span>
                      <span className="font-mono font-semibold">₹{helpers * 300}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span className="font-mono">₹{fareData?.gst || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl text-gray-900 pt-3 border-t border-gray-200 mt-3">
                    <span>Total Amount</span>
                    <span className="font-mono" style={{ color: "var(--brand-primary)" }}>
                      ₹{fareData?.total || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => handleConfirmPay()} className="btn-primary w-full py-4 text-base flex justify-center items-center gap-3">
                  <CreditCard className="w-5 h-5 opacity-80" /> Pay Here
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-end gap-4 border-t border-gray-100 pt-6">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary">
              Back
            </button>
          )}
          {step < 3 && (
            <button onClick={handleNext} disabled={estimating} className="btn-primary">
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
