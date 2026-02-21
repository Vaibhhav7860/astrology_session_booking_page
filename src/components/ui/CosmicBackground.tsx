"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const CosmicBackground = () => {
    const [particles, setParticles] = useState<{ id: number; top: string; left: string; size: number; duration: number; delay: number }[]>([]);

    useEffect(() => {
        // Generate random cosmic dust particles
        const buildParticles = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 20 + 20, // 20-40s
            delay: Math.random() * 10,
        }));
        setParticles(buildParticles);
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#090A0F] pointer-events-none">
            {/* Deep Amethyst Nebula */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 10, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/30 blur-[130px]"
            />

            {/* Magenta Glow Core */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-900/20 blur-[150px]"
            />

            {/* Deep Blue Abyss */}
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, -15, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                className="absolute top-[30%] left-[50%] w-[70vw] h-[70vw] rounded-full bg-blue-900/20 blur-[140px]"
            />

            {/* Cosmic Dust Particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 50 - 25, 0],
                        opacity: [0.1, 0.8, 0.1],
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}

            {/* Subtle Grain Overlay for texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
        </div>
    );
};
