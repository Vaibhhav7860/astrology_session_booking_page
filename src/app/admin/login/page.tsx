"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { FluidInput } from "@/components/ui/FluidInput";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Create x-www-form-urlencoded payload for OAuth2
            const formData = new URLSearchParams();
            formData.append("username", "admin");
            formData.append("password", password);

            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await res.json();
            localStorage.setItem("admin_token", data.access_token);
            router.push("/admin/dashboard");
        } catch (err) {
            setError("Incorrect password or server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <GlassCard className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Admin Access</h1>
                    <p className="text-white/60 text-sm">INTO THE STAR Dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <FluidInput
                        type="password"
                        label="Environment Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={error}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-800 to-fuchsia-800 hover:from-purple-700 hover:to-fuchsia-700 text-white rounded-xl transition-all duration-300 backdrop-blur-md border border-fuchsia-400/30 shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] font-medium tracking-wide disabled:opacity-50"
                    >
                        {loading ? "Authenticating..." : "Enter Workspace"}
                    </button>
                </form>
            </GlassCard>
        </div>
    );
}
