"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps, useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface GlassCardProps extends HTMLMotionProps<"div"> {
    className?: string;
    children: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, children, ...props }, ref) => {

        // 3D Tilt Effect Logic
        const x = useMotionValue(0);
        const y = useMotionValue(0);

        const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
        const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

        const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
        const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const xPct = mouseX / width - 0.5;
            const yPct = mouseY / height - 0.5;
            x.set(xPct);
            y.set(yPct);
        };

        const handleMouseLeave = () => {
            x.set(0);
            y.set(0);
        };

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className={cn(
                    "relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden",
                    "hover:border-purple-400/30 transition-colors duration-500",
                    "before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-br before:from-purple-500/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
                    className
                )}
                {...props}
            >
                <div style={{ transform: "translateZ(30px)" }}>
                    {children}
                </div>
            </motion.div>
        );
    }
);
GlassCard.displayName = "GlassCard";
