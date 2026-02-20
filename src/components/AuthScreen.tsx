"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useVault } from "./VaultProvider";
import { Shield, LockOpen } from "lucide-react";
import { motion } from "framer-motion";

export function AuthScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [masterPassword, setMasterPasswordInput] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { setMasterPassword } = useVault();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                // 1. Supabase Auth
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
            } else {
                // 1. Supabase Signup
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;
            }

            // 2. Derive Client-Side Crypto Key from Master Password
            // This is NEVER sent to Supabase.
            await setMasterPassword(masterPassword, email);

            onAuthSuccess();
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-[70vh] w-full max-w-sm mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 w-full flex flex-col items-center relative overflow-hidden"
            >
                <div className="bg-primary/5 p-4 rounded-full mb-6">
                    <Shield className="text-primary w-10 h-10" />
                </div>

                <h1 className="text-2xl font-semibold text-slate-800 mb-2">
                    {isLogin ? "Welcome Back" : "Create Vault"}
                </h1>
                <p className="text-sm text-slate-500 mb-8 text-center leading-relaxed">
                    {isLogin
                        ? "Enter your credentials and Master Password to unlock your vault."
                        : "Sign up and create a strong Master Password. If you lose it, your data is gone forever."}
                </p>

                {error && (
                    <div className="w-full bg-red-50 text-red-500 text-sm p-3 rounded-xl mb-4 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="w-full space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            className="w-full glass-input px-4 py-3 text-slate-800 placeholder:text-slate-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Account Password"
                            required
                            className="w-full glass-input px-4 py-3 text-slate-800 placeholder:text-slate-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="relative pt-4 mt-4 border-t border-slate-200/50">
                        <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 block">
                            Zero-Knowledge Key
                        </label>
                        <input
                            type="password"
                            placeholder="Master Password"
                            required
                            className="w-full glass-input px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500/30"
                            value={masterPassword}
                            onChange={(e) => setMasterPasswordInput(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-400 mt-2">
                            This password never leaves your device. It is used to encrypt/decrypt your data natively in the browser.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {loading ? "Authenticating..." : (isLogin ? <><LockOpen size={18} /> Unlock Vault</> : "Initialize Vault")}
                    </button>
                </form>

                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="mt-6 text-sm text-slate-500 hover:text-primary transition-colors"
                >
                    {isLogin ? "Don't have a vault? Create one" : "Already have a vault? Log in"}
                </button>
            </motion.div>
        </div>
    );
}
