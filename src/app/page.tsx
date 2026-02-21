import { motion } from "framer-motion";
import { BookingForm } from "@/components/BookingForm";

// Force dynamic rendering since base price is updated in admin portal
export const dynamic = "force-dynamic";

async function getBasePrice() {
  try {
    // Determine base URL dynamically depending on environment
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:8000";

    const res = await fetch(`${baseUrl}/api/admin/settings`, {
      cache: 'no-store'
    });

    if (!res.ok) return 500;
    const data = await res.json();
    return data.base_price_aed || 500;
  } catch (err) {
    console.error("Failed to fetch base price directly from backend", err);
    return 500;
  }
}

export default async function BookingPage() {
  const initialBasePrice = await getBasePrice();

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col items-center">
      {/* Brand Header */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 ease-out">
        <h1 className="text-4xl md:text-6xl font-serif tracking-widest text-[#E8E8E8] drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
          INTO THE STAR
        </h1>
        <p className="text-fuchsia-300 mt-4 tracking-[0.3em] font-light text-xs md:text-sm uppercase font-sans">
          Priya Shree Mandal
        </p>
      </div>

      <BookingForm initialBasePrice={initialBasePrice} />
    </div>
  );
}
