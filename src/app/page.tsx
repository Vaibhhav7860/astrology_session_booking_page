"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FluidInput } from "@/components/ui/FluidInput";
import { motion } from "framer-motion";

interface Slot {
  time: string;
  is_booked: boolean;
}

const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BookingPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    dob: "",
    tob_time: "", // We'll split this to hour/min on submit
    country_code: "AED",
    mobile_number: "",
    session_date: "",
    session_time: "",
    time_zone: "IST",
  });

  const [basePrice, setBasePrice] = useState<number>(500);
  const [priceData, setPriceData] = useState({ amount: 500, currency: "AED", loading: true });
  const [availableSlots, setAvailableSlots] = useState<{ ist: Slot[], gst: Slot[] }>({ ist: [], gst: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const popularCurrencies = ["AED", "USD", "INR", "GBP", "EUR", "AUD"];

  const format12Hour = (time24: string) => {
    if (!time24) return "";
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mStr} ${ampm}`;
  };

  // Fetch base price and initial conversion on mount
  useEffect(() => {
    const fetchBasePriceAndConvert = async () => {
      try {
        const settingsRes = await fetch("/api/admin/settings");
        const settingsData = await settingsRes.json();
        const currentBasePrice = settingsData.base_price_aed;
        setBasePrice(currentBasePrice);

        // Convert the fetched base price to current country_code
        const res = await fetch("/api/currency/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount_aed: currentBasePrice, target_currency: formData.country_code })
        });
        const data = await res.json();
        setPriceData({ amount: data.converted_amount, currency: data.target_currency, loading: false });
      } catch (err) {
        setPriceData(prev => ({ ...prev, loading: false })); // Keep whatever was there (default 500)
      }
    };
    fetchBasePriceAndConvert();
  }, [formData.country_code]);

  // Fetch slots when session_date changes
  useEffect(() => {
    if (!formData.session_date) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/bookings/availability/${formData.session_date}`);
        const data = await res.json();
        setAvailableSlots({ ist: data.slots_ist || [], gst: data.slots_gst || [] });
      } catch (err) {
        setAvailableSlots({ ist: [], gst: [] });
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [formData.session_date]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSlotSelect = (time: string) => {
    setFormData({ ...formData, session_time: time });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.session_time) {
      setErrorMsg("Please select a session time slot.");
      return;
    }

    setSubmitting(true);
    try {
      // Split tob_time "14:30"
      const [hourStr, minStr] = formData.tob_time.split(":");

      const payload = {
        ...formData,
        tob_hour: parseInt(hourStr || "0"),
        tob_minute: parseInt(minStr || "0"),
        amount_paid: priceData.amount,
        currency_paid: priceData.currency
      };

      const res = await fetch("/api/bookings/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Booking failed");

      const scriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your connection.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: data.amount,
        currency: data.currency,
        name: "Into The Star",
        description: "Energy Exchange Session",
        order_id: data.razorpay_order_id,
        handler: async function (response: any) {
          // Send verification request to backend
          try {
            const verifyRes = await fetch(`/api/bookings/verify/${data.booking_id}`, {
              method: "POST"
            });
            if (verifyRes.ok) {
              window.location.href = `/thank-you?booking_id=${data.booking_id}`;
            } else {
              setErrorMsg("Payment verification failed. Contact support.");
              setSubmitting(false);
            }
          } catch (e) {
            setErrorMsg("Error verifying payment.");
            setSubmitting(false);
          }
        },
        prefill: {
          name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
        },
        theme: {
          color: "#D946EF", // Fuchsia
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (response: any) {
        setErrorMsg(`Payment Failed: ${response.error.description}`);
        setSubmitting(false);
      });
      rzpInstance.open();

    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during booking.");
      setSubmitting(false);
    }
  };

  const currentSlots = formData.time_zone === "IST" ? availableSlots.ist : availableSlots.gst;

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col items-center">
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-serif tracking-widest text-[#E8E8E8] drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
          INTO THE STAR
        </h1>
        <p className="text-fuchsia-300 mt-4 tracking-[0.3em] font-light text-xs md:text-sm uppercase font-sans">
          Priya Shree Mandal
        </p>
      </motion.div>

      <div className="w-full max-w-3xl perspective-1000">
        <GlassCard className="p-8 md:p-12 mb-12">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Section: Personal Details */}
            <div>
              <h2 className="text-2xl font-serif text-fuchsia-400 mb-6 border-b border-fuchsia-400/20 pb-3 drop-shadow-[0_0_8px_rgba(232,121,249,0.3)]">
                Personal Identity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FluidInput name="first_name" label="First Name" required onChange={handleChange} value={formData.first_name} />
                <FluidInput name="last_name" label="Last Name" required onChange={handleChange} value={formData.last_name} />
              </div>
              <FluidInput name="email" type="email" label="Email Address" required onChange={handleChange} value={formData.email} />
            </div>

            {/* Section: Contact & Currency */}
            <div>
              <h2 className="text-2xl font-serif text-fuchsia-400 mb-6 border-b border-fuchsia-400/20 pb-3 drop-shadow-[0_0_8px_rgba(232,121,249,0.3)]">
                Energy Exchange
              </h2>
              <div className="flex flex-col md:flex-row gap-4 mb-2">
                <div className="relative w-full md:w-1/3 mt-2">
                  <label className="absolute -top-7 left-4 text-xs text-purple-300 font-medium tracking-wider uppercase">Region</label>
                  <select
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 backdrop-blur-md outline-none focus:border-fuchsia-400 focus:shadow-[0_0_15px_rgba(232,121,249,0.2)] appearance-none transition-all"
                  >
                    {popularCurrencies.map(c => <option key={c} value={c} className="bg-gray-950">{c}</option>)}
                  </select>
                </div>
                <div className="w-full md:w-2/3">
                  <FluidInput name="mobile_number" type="tel" label="Mobile Number" required onChange={handleChange} value={formData.mobile_number} />
                </div>
              </div>

              <div className="text-left md:text-right text-sm text-white/50 mt-4 font-sans">
                Energy Exchange Value: <span className="text-2xl font-serif font-bold text-fuchsia-200 ml-2 drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]">
                  {priceData.loading ? "Synchronizing..." : `${priceData.currency} ${priceData.amount}`}
                </span>
              </div>
            </div>

            {/* Section: Birth Details */}
            <div>
              <h2 className="text-2xl font-serif text-fuchsia-400 mb-6 border-b border-fuchsia-400/20 pb-3 drop-shadow-[0_0_8px_rgba(232,121,249,0.3)]">
                Cosmic Origins
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative w-full mt-2">
                  <label className="absolute -top-7 left-4 text-xs text-purple-300 font-medium tracking-wider uppercase">Date of Birth</label>
                  <input type="date" name="dob" required onChange={handleChange} value={formData.dob} className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 backdrop-blur-md outline-none focus:border-fuchsia-400 focus:shadow-[0_0_15px_rgba(232,121,249,0.2)] font-sans" />
                </div>
                <div className="relative w-full mt-2">
                  <label className="absolute -top-7 left-4 text-xs text-purple-300 font-medium tracking-wider uppercase">Time of Birth</label>
                  <input type="time" name="tob_time" required onChange={handleChange} value={formData.tob_time} className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 backdrop-blur-md outline-none focus:border-fuchsia-400 focus:shadow-[0_0_15px_rgba(232,121,249,0.2)] font-sans" />
                </div>
              </div>
            </div>

            {/* Section: Session Selection */}
            <div>
              <h2 className="text-2xl font-serif text-fuchsia-400 mb-6 border-b border-fuchsia-400/20 pb-3 drop-shadow-[0_0_8px_rgba(232,121,249,0.3)]">
                Align Your Session
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative w-full mt-2">
                  <label className="absolute -top-7 left-4 text-xs text-purple-300 font-medium tracking-wider uppercase">Session Date</label>
                  <input type="date" name="session_date" required onChange={handleChange} value={formData.session_date} min={new Date().toISOString().split('T')[0]} className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 backdrop-blur-md outline-none focus:border-fuchsia-400 focus:shadow-[0_0_15px_rgba(232,121,249,0.2)] font-sans" />
                </div>

                <div className="relative w-full mt-2">
                  <label className="absolute -top-7 left-4 text-xs text-purple-300 font-medium tracking-wider uppercase">Time Zone Overlay</label>
                  <select
                    name="time_zone"
                    value={formData.time_zone}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 backdrop-blur-md outline-none focus:border-fuchsia-400 focus:shadow-[0_0_15px_rgba(232,121,249,0.2)] appearance-none font-sans transition-all"
                  >
                    <option value="IST" className="bg-gray-950">IST (India Standard Time)</option>
                    <option value="GST" className="bg-gray-950">GST (Gulf Standard Time)</option>
                  </select>
                </div>
              </div>

              {/* Slots Grid */}
              <div className="bg-black/20 rounded-2xl p-6 border border-white/5 min-h-[120px] backdrop-blur-lg">
                {loadingSlots ? (
                  <div className="flex justify-center items-center py-6">
                    <p className="text-purple-300/60 font-serif tracking-widest animate-pulse">Reading Stellar Alignments...</p>
                  </div>
                ) : !formData.session_date ? (
                  <p className="text-center text-white/30 py-6 font-serif">Select a date to reveal open cosmic portals</p>
                ) : currentSlots.length === 0 ? (
                  <p className="text-center text-rose-400/80 py-6 font-sans text-sm">No alignments available on this date. Await another cycle.</p>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {currentSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => handleSlotSelect(slot.time)}
                        className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium tracking-wider font-sans ${formData.session_time === slot.time
                          ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_20px_rgba(217,70,239,0.6)] border-transparent scale-105"
                          : "bg-white/5 text-white/70 border border-white/10 hover:bg-fuchsia-900/40 hover:text-white hover:border-fuchsia-500/50 hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                          }`}
                      >
                        {format12Hour(slot.time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-white text-center text-sm font-sans bg-rose-500/20 border border-rose-500/50 py-3 rounded-xl drop-shadow-md"
              >
                {errorMsg}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={submitting || !formData.session_time}
              className="group relative w-full mt-12 py-5 px-6 bg-gradient-to-r from-purple-800 to-fuchsia-700 overflow-hidden rounded-2xl transition-all duration-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_40px_rgba(168,85,247,0.7)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              <span className="relative z-10 text-white font-serif font-bold tracking-[0.2em] text-lg uppercase drop-shadow-md">
                {submitting ? "Initiating Portal..." : "Secure Your Reading"}
              </span>
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
