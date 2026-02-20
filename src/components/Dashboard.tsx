"use client";

import React, { useState, useEffect } from "react";
import { Copy, Trash2, KeyRound, ExternalLink, ShieldCheck } from "lucide-react";
import { encryptData, decryptData } from "@/lib/crypto";
import { toast } from "sonner";
import { useVault } from "./VaultProvider";
import { supabase } from "@/utils/supabase/client";

// Types mapping our DB structure
interface Credential {
    id: string;
    site_name: string;
    username: string;
    encrypted_password: { ciphertext: string; iv: string };
    category?: string;
}

export function Dashboard() {
    const { masterKey } = useVault();
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [decryptedPasswords, setDecryptedPasswords] = useState<Record<string, string>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Load credentials logic would go here
    useEffect(() => {
        const fetchVault = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('vault')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching vault items", error);
            } else if (data) {
                setCredentials(data as Credential[]);
            }
        };

        fetchVault();

        window.addEventListener("vault-updated", fetchVault);
        return () => window.removeEventListener("vault-updated", fetchVault);
    }, []);

    const handleCopy = async (id: string, ciphertext: string, iv: string, siteName: string) => {
        if (!masterKey) return;
        try {
            const plaintext = await decryptData(ciphertext, iv, masterKey);

            // Clipboard API fallback support
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(plaintext);
            } else {
                // Legacy fallback just in case
                const textArea = document.createElement("textarea");
                textArea.value = plaintext;
                textArea.style.position = "absolute";
                textArea.style.left = "-999999px";
                document.body.prepend(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (error) {
                    console.error(error);
                } finally {
                    textArea.remove();
                }
            }

            setCopiedId(id);
            toast.success(`Password for ${siteName} copied!`, {
                description: "It will self-destruct from your clipboard in 10s."
            });

            // Self-destruct clipboard
            setTimeout(async () => {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText("");
                }
                setCopiedId(null);
                toast.info("Clipboard securely cleared.");
            }, 10000);

        } catch (e) {
            console.error("Failed to decrypt or copy", e);
            toast.error("Decryption failed. Invalid Master Key?");
        }
    };

    const getCategoryColor = (cat?: string) => {
        switch (cat) {
            case "Finance": return "bg-green-100 text-green-700 border-green-200";
            case "Entertainment": return "bg-purple-100 text-purple-700 border-purple-200";
            default: return "bg-blue-100 text-blue-700 border-blue-200";
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto mt-12 mb-20 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
                <div>
                    <h2 className="text-4xl font-semibold text-slate-800 tracking-tight mb-2">My Vault</h2>
                    <p className="text-slate-500 text-sm max-w-sm leading-relaxed">Your data is encrypted locally. Only you hold the keys.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/40 shadow-sm">
                    <ShieldCheck className="text-emerald-500 w-5 h-5" />
                    <span className="font-semibold text-slate-700 text-sm">{credentials.length}</span>
                    <span className="text-slate-500 text-sm font-medium">Items Secured</span>
                </div>
            </div>

            {credentials.length === 0 && (
                <div className="flex flex-col items-center justify-center p-16 text-center glass-card border-dashed bg-white/20">
                    <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-4">
                        <KeyRound className="text-indigo-400 w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-700 mb-2">Vault is empty</h3>
                    <p className="text-slate-500 text-sm max-w-xs">Press <kbd className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-600 font-mono mx-1">Cmd + K</kbd> to add your first secure password via natural language.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {credentials.map((cred) => (
                    <div key={cred.id} className="glass-card p-6 flex flex-col relative group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:bg-white/60">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getCategoryColor(cred.category)} shadow-sm`}>
                                {cred.category || "General"}
                            </div>
                            <button
                                onClick={async () => {
                                    if (confirm("Are you sure you want to delete this credential?")) {
                                        await supabase.from('vault').delete().eq('id', cred.id);
                                        setCredentials(prev => prev.filter(c => c.id !== cred.id));
                                        toast.success("Credential deleted");
                                    }
                                }}
                                className="text-slate-400 bg-white hover:bg-red-50 hover:text-red-500 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-red-100">
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold text-slate-800 mb-1 tracking-tight flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                {cred.site_name}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 truncate bg-slate-100/50 inline-block px-2 py-0.5 rounded-md mt-1">{cred.username}</p>
                        </div>

                        <div className="mt-auto z-10">
                            <button
                                onClick={() => handleCopy(cred.id, cred.encrypted_password.ciphertext, cred.encrypted_password.iv, cred.site_name)}
                                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${copiedId === cred.id
                                    ? "bg-green-500 text-white shadow-xl shadow-green-500/30 scale-[0.98]"
                                    : "bg-white/80 hover:bg-indigo-600 hover:text-white text-slate-700 shadow-sm border border-slate-100 hover:border-indigo-500"
                                    }`}
                            >
                                {copiedId === cred.id ? (
                                    <>Copied!</>
                                ) : (
                                    <>
                                        <Copy size={16} className={copiedId === cred.id ? "" : "opacity-70"} /> Copy Password
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Progress Bar Animation */}
                        {copiedId === cred.id && (
                            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-green-400 rounded-b-2xl overflow-hidden shadow-[0_-5px_20px_rgba(74,222,128,0.4)]">
                                <div className="h-full bg-green-300 w-full animate-[shrink_10s_linear_forwards]" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
