"use client";

import React, { useState, useEffect } from "react";
import { Copy, Trash2, KeyRound } from "lucide-react";
import { encryptData, decryptData } from "@/lib/crypto";
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
        // In a full implementation, fetch from Supabase here
        // const fetchVault = async () => { ... }

        // Mocking for now to demonstrate layout
        const mockData: Credential[] = [
            {
                id: "mock1",
                site_name: "Netflix",
                username: "user@email.com",
                encrypted_password: { ciphertext: "mock", iv: "mock" },
                category: "Entertainment",
            },
            {
                id: "mock2",
                site_name: "Bank of America",
                username: "bhavshank99",
                encrypted_password: { ciphertext: "mock", iv: "mock" },
                category: "Finance",
            },
        ];
        setCredentials(mockData);
    }, []);

    const handleCopy = async (id: string, ciphertext: string, iv: string) => {
        if (!masterKey) return;
        try {
            // In a real flow, we would decrypt the real ciphertext here
            // const plaintext = await decryptData(ciphertext, iv, masterKey);

            const plaintext = "MockDecryptedPassword123!"; // mock
            await navigator.clipboard.writeText(plaintext);

            setCopiedId(id);
            console.log("Password copied to clipboard!");

            // Self-destruct clipboard
            setTimeout(async () => {
                await navigator.clipboard.writeText("");
                setCopiedId(null);
                console.log("Clipboard cleared.");
            }, 10000); // 10 seconds

        } catch (e) {
            console.error("Failed to decrypt or copy", e);
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
        <div className="w-full max-w-4xl mx-auto mt-12 mb-20 space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-light text-slate-800 tracking-tight">Your Vault</h2>
                <div className="text-sm text-slate-500 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/40">
                    <span className="font-medium text-slate-700">{credentials.length}</span> Items Secured
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {credentials.map((cred) => (
                    <div key={cred.id} className="glass-card p-6 flex flex-col relative group transition-all hover:scale-[1.02] hover:shadow-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getCategoryColor(cred.category)}`}>
                                {cred.category || "General"}
                            </div>
                            <button className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <h3 className="text-xl font-medium text-slate-800 mb-1">{cred.site_name}</h3>
                        <p className="text-sm text-slate-500 mb-6 truncate">{cred.username}</p>

                        <div className="mt-auto">
                            <button
                                onClick={() => handleCopy(cred.id, cred.encrypted_password.ciphertext, cred.encrypted_password.iv)}
                                className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${copiedId === cred.id
                                        ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                                        : "bg-white/60 hover:bg-white text-slate-700 border border-white isolate"
                                    }`}
                            >
                                {copiedId === cred.id ? (
                                    <>Copied! Clearing in 10s</>
                                ) : (
                                    <>
                                        <Copy size={16} /> Copy Password
                                    </>
                                )}
                            </button>
                        </div>

                        {copiedId === cred.id && (
                            <div className="absolute bottom-0 left-0 h-1 bg-green-400 rounded-b-2xl animate-[shrink_10s_linear_forwards]" style={{ width: '100%' }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
