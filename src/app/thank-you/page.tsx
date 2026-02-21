"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";

function ThankYouContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get("booking_id");
    const [status, setStatus] = useState("Verifying payment...");
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        if (!bookingId) {
            setStatus("No booking reference found.");
            return;
        }

        const verifyBooking = async () => {
            try {
                const res = await fetch(`/api/bookings/verify/${bookingId}`, {
                    method: "POST"
                });
                if (res.ok) {
                    setStatus("Payment Confirmed! Your session is booked successfully.");
                    setVerified(true);
                } else {
                    setStatus("Payment verification failed. Please contact support.");
                }
            } catch (err) {
                setStatus("Error verifying payment.");
            }
        };

        verifyBooking();
    }, [bookingId]);
    return (
        <div className="text-center font-sans tracking-wide">
            <h1 className="text-4xl font-bold font-serif text-fuchsia-400 mb-6 drop-shadow-[0_0_10px_rgba(232,121,249,0.4)]">Cosmic Portal Status</h1>
            <p className={`text-lg mb-8 ${verified ? "text-white" : "text-white/60"}`}>{status}</p>

            {verified && (
                <div className="bg-black/30 border border-fuchsia-500/20 rounded-2xl p-8 mb-8 text-left backdrop-blur-md shadow-[0_0_25px_rgba(168,85,247,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
                    <h3 className="text-xl font-serif text-purple-300 mb-4 text-center">Important Instructions</h3>
                    <p className="text-white/80 italic text-center mb-6 font-serif">"Hoping for an amazing experience during your session."</p>
                    <ul className="list-disc list-inside text-white/70 space-y-3 text-sm leading-relaxed">
                        <li>Please be on time for your reading as the stellar alignments wait for no one.</li>
                        <li>A confirmation email has been dispatched to your provided frequency (email address).</li>
                        <li>Ensure you have a stable connection and a quiet meditative space for the reading.</li>
                        <li>If you need to reschedule, please contact us at least 24 hours prior.</li>
                    </ul>
                </div>
            )}

            <button onClick={() => window.location.href = "/"} className="px-8 py-3 bg-white/5 hover:bg-fuchsia-900/40 text-white rounded-xl transition-all duration-300 border border-white/10 hover:border-fuchsia-500/50 hover:shadow-[0_0_20px_rgba(232,121,249,0.3)] font-medium tracking-widest uppercase text-sm">
                Return Home
            </button>
        </div>
    );
}

export default function ThankYouPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut" }}>
                <GlassCard className="max-w-xl w-full p-10 shadow-[0_0_40px_rgba(168,85,247,0.2)] border-purple-500/20">
                    <Suspense fallback={<p className="text-purple-300/60 font-serif tracking-widest animate-pulse text-center">Validating alignment...</p>}>
                        <ThankYouContent />
                    </Suspense>
                </GlassCard>
            </motion.div>
        </div>
    );
}
