"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";

type SlotInput = { hour: string; minute: string; period: "AM" | "PM" };

interface Booking {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    session_date: string;
    session_time: string;
    time_zone: string;
    amount_paid: number;
    currency_paid: string;
    status: string;
    created_at: string;
}

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Availability state
    const [availDate, setAvailDate] = useState("");
    const [slotsIstInputs, setSlotsIstInputs] = useState<SlotInput[]>([]);
    const [slotsGstInputs, setSlotsGstInputs] = useState<SlotInput[]>([]);
    const [availStatus, setAvailStatus] = useState("");

    // Pricing state
    const [basePrice, setBasePrice] = useState<number | string>("");
    const [priceStatus, setPriceStatus] = useState("");

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin/login");
            return;
        }

        const fetchBookings = async () => {
            try {
                const res = await fetch("/api/admin/bookings", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (res.status === 401) {
                    localStorage.removeItem("admin_token");
                    router.push("/admin/login");
                    return;
                }
                const data = await res.json();
                setBookings(data);
            } catch (err) {
                console.error("Failed to fetch bookings");
            } finally {
                setLoading(false);
            }
        };

        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/admin/settings");
                const data = await res.json();
                setBasePrice(data.base_price_aed);
            } catch (err) {
                console.error("Failed to fetch settings");
            }
        };

        fetchBookings();
        fetchSettings();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
    };

    const handleUpdateAvailability = async (e: React.FormEvent) => {
        e.preventDefault();
        setAvailStatus("Updating...");
        try {
            const token = localStorage.getItem("admin_token");
            const formatSlots = (slotsInputs: SlotInput[]) =>
                slotsInputs.map(s => {
                    let h = parseInt(s.hour, 10);
                    if (s.period === "AM" && h === 12) h = 0;
                    if (s.period === "PM" && h !== 12) h += 12;
                    return { time: `${h.toString().padStart(2, '0')}:${s.minute.padStart(2, '0')}`, is_booked: false };
                });

            const payload = {
                date: availDate,
                slots_ist: formatSlots(slotsIstInputs),
                slots_gst: formatSlots(slotsGstInputs)
            };

            const res = await fetch("/api/admin/availability", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) setAvailStatus("Success!");
            else setAvailStatus("Failed.");
        } catch {
            setAvailStatus("Error.");
        }
    };

    const handleUpdatePrice = async (e: React.FormEvent) => {
        e.preventDefault();
        setPriceStatus("Updating...");
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ base_price_aed: Number(basePrice) })
            });
            if (res.ok) setPriceStatus("Success!");
            else setPriceStatus("Failed.");
        } catch {
            setPriceStatus("Error.");
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white/50">Loading dashboard...</div>;
    }

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-white mb-2">Workspace Dashboard</h1>
                    <p className="text-purple-300/80 tracking-widest uppercase text-sm">INTO THE STAR</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    Logout
                </button>
            </div>

            {/* Tabular View */}
            <GlassCard className="p-6 overflow-hidden">
                <h2 className="text-xl font-medium text-white mb-6">Recent Bookings</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/70">
                        <thead className="text-xs text-white uppercase bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Session Date/Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((b) => (
                                    <tr key={b._id} className="border-b border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">
                                            {b.first_name} {b.last_name}
                                            <div className="text-xs text-white/50 mt-1">{b.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {b.session_date}
                                            <div className="text-xs text-purple-300/80 mt-1">
                                                {(() => {
                                                    if (!b.session_time) return "";
                                                    const [hStr, mStr] = b.session_time.split(':');
                                                    let h = parseInt(hStr, 10);
                                                    const ampm = h >= 12 ? 'PM' : 'AM';
                                                    h = h % 12 || 12;
                                                    return `${h}:${mStr} ${ampm}`;
                                                })()} ({b.time_zone})
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs border ${b.status === 'confirmed' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.3)]' :
                                                'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                                }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {b.currency_paid} {b.amount_paid}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-400 hover:text-blue-300 text-xs">View Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Availability Manager */}
            <GlassCard className="p-6 mt-8">
                <h2 className="text-xl font-medium text-white mb-6">Manage Availability</h2>
                <form onSubmit={handleUpdateAvailability} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                    <div className="md:col-span-4 border-b border-white/10 pb-4">
                        <label className="block text-sm text-fuchsia-300 mb-2 font-medium">Select Date for Configuration</label>
                        <input
                            required type="date" value={availDate} onChange={(e) => setAvailDate(e.target.value)}
                            className="w-full max-w-sm bg-black/40 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-fuchsia-400"
                        />
                    </div>
                    {/* IST Section */}
                    <div className="md:col-span-2 bg-white/5 p-5 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-medium text-sm tracking-widest uppercase">IST Slots</h3>
                            <button type="button" onClick={() => setSlotsIstInputs([...slotsIstInputs, { hour: "12", minute: "00", period: "PM" }])} className="text-xs bg-fuchsia-500/20 text-fuchsia-300 px-4 py-1.5 rounded-full hover:bg-fuchsia-500/40 transition-colors">
                                + Add Slot
                            </button>
                        </div>
                        <div className="space-y-3">
                            {slotsIstInputs.length === 0 && <p className="text-xs text-white/30 italic">No IST slots present.</p>}
                            {slotsIstInputs.map((s, i) => (
                                <div key={i} className="flex gap-2 items-center bg-black/30 p-2 rounded-xl border border-white/5">
                                    <select value={s.hour} onChange={(e) => { const n = [...slotsIstInputs]; n[i].hour = e.target.value; setSlotsIstInputs(n); }} className="bg-transparent text-white outline-none cursor-pointer appearance-none px-2 py-1 text-center font-bold">
                                        {Array.from({ length: 12 }, (_, k) => String(k + 1).padStart(2, '0')).map(h => <option key={h} className="bg-gray-900" value={h}>{h}</option>)}
                                    </select>
                                    <span className="text-white/30">:</span>
                                    <select value={s.minute} onChange={(e) => { const n = [...slotsIstInputs]; n[i].minute = e.target.value; setSlotsIstInputs(n); }} className="bg-transparent text-white outline-none cursor-pointer appearance-none px-2 py-1 text-center font-bold">
                                        {Array.from({ length: 12 }, (_, k) => String(k * 5).padStart(2, '0')).map(m => <option key={m} className="bg-gray-900" value={m}>{m}</option>)}
                                    </select>
                                    <div className="h-6 w-px bg-white/10 mx-1"></div>
                                    <select value={s.period} onChange={(e) => { const n = [...slotsIstInputs]; n[i].period = e.target.value as "AM" | "PM"; setSlotsIstInputs(n); }} className="bg-transparent text-fuchsia-300 outline-none cursor-pointer appearance-none px-2 py-1 font-bold">
                                        <option value="AM" className="bg-gray-900">AM</option>
                                        <option value="PM" className="bg-gray-900">PM</option>
                                    </select>
                                    <div className="flex-1 text-right">
                                        <button type="button" onClick={() => { const n = [...slotsIstInputs]; n.splice(i, 1); setSlotsIstInputs(n); }} className="text-rose-400/70 hover:text-rose-400 p-2">✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* GST Section */}
                    <div className="md:col-span-2 bg-white/5 p-5 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-medium text-sm tracking-widest uppercase">GST Slots</h3>
                            <button type="button" onClick={() => setSlotsGstInputs([...slotsGstInputs, { hour: "12", minute: "00", period: "PM" }])} className="text-xs bg-fuchsia-500/20 text-fuchsia-300 px-4 py-1.5 rounded-full hover:bg-fuchsia-500/40 transition-colors">
                                + Add Slot
                            </button>
                        </div>
                        <div className="space-y-3">
                            {slotsGstInputs.length === 0 && <p className="text-xs text-white/30 italic">No GST slots present.</p>}
                            {slotsGstInputs.map((s, i) => (
                                <div key={i} className="flex gap-2 items-center bg-black/30 p-2 rounded-xl border border-white/5">
                                    <select value={s.hour} onChange={(e) => { const n = [...slotsGstInputs]; n[i].hour = e.target.value; setSlotsGstInputs(n); }} className="bg-transparent text-white outline-none cursor-pointer appearance-none px-2 py-1 text-center font-bold">
                                        {Array.from({ length: 12 }, (_, k) => String(k + 1).padStart(2, '0')).map(h => <option key={h} className="bg-gray-900" value={h}>{h}</option>)}
                                    </select>
                                    <span className="text-white/30">:</span>
                                    <select value={s.minute} onChange={(e) => { const n = [...slotsGstInputs]; n[i].minute = e.target.value; setSlotsGstInputs(n); }} className="bg-transparent text-white outline-none cursor-pointer appearance-none px-2 py-1 text-center font-bold">
                                        {Array.from({ length: 12 }, (_, k) => String(k * 5).padStart(2, '0')).map(m => <option key={m} className="bg-gray-900" value={m}>{m}</option>)}
                                    </select>
                                    <div className="h-6 w-px bg-white/10 mx-1"></div>
                                    <select value={s.period} onChange={(e) => { const n = [...slotsGstInputs]; n[i].period = e.target.value as "AM" | "PM"; setSlotsGstInputs(n); }} className="bg-transparent text-fuchsia-300 outline-none cursor-pointer appearance-none px-2 py-1 font-bold">
                                        <option value="AM" className="bg-gray-900">AM</option>
                                        <option value="PM" className="bg-gray-900">PM</option>
                                    </select>
                                    <div className="flex-1 text-right">
                                        <button type="button" onClick={() => { const n = [...slotsGstInputs]; n.splice(i, 1); setSlotsGstInputs(n); }} className="text-rose-400/70 hover:text-rose-400 p-2">✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-4 pt-4">
                        <button type="submit" className="w-full bg-gradient-to-r from-fuchsia-700 to-purple-600 hover:from-fuchsia-600 hover:to-purple-500 text-white rounded-xl px-4 py-4 transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] tracking-[0.2em] font-bold uppercase">
                            Publish Array To Stars
                        </button>
                        {availStatus && <p className="text-center text-sm font-medium text-fuchsia-400 mt-4">{availStatus}</p>}
                    </div>
                </form>
            </GlassCard>

            {/* Pricing Manager */}
            <GlassCard className="p-6 mt-8">
                <h2 className="text-xl font-medium text-white mb-6">Global Settings</h2>
                <form onSubmit={handleUpdatePrice} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end max-w-2xl">
                    <div className="md:col-span-2">
                        <label className="block text-xs text-white/50 mb-1">Base Session Price (AED)</label>
                        <input
                            required type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)}
                            className="w-full bg-black/40 border border-white/20 text-white rounded-xl px-4 py-2 outline-none focus:border-fuchsia-400"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="w-full bg-fuchsia-600/80 hover:bg-fuchsia-500 text-white rounded-xl px-4 py-2 transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_20px_rgba(217,70,239,0.5)]">
                            Update Price
                        </button>
                        {priceStatus && <p className="text-xs text-fuchsia-400 mt-2">{priceStatus}</p>}
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
