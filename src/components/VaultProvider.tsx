"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { deriveKeyFromPassword } from "@/lib/crypto";

interface VaultContextType {
    masterKey: CryptoKey | null;
    setMasterPassword: (password: string, email: string) => Promise<void>;
    isLocked: boolean;
    lockVault: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

    // We only store the derived key in state/memory, NOT the password itself.
    // When the window is closed, this state is lost.
    const setMasterPassword = async (password: string, email: string) => {
        try {
            // Derive a deterministic salt from the user's email
            // This ensures the derived key is consistent across page reloads
            const enc = new TextEncoder();
            const emailBuffer = enc.encode(email);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', emailBuffer);

            // PBKDF2 salt expects a BufferSource. We use the first 16 bytes of the email hash.
            const deterministicSalt = new Uint8Array(hashBuffer, 0, 16);

            const { key } = await deriveKeyFromPassword(password, deterministicSalt);
            setMasterKey(key);
        } catch (error) {
            console.error("Failed to derive master key", error);
        }
    };

    const lockVault = () => {
        setMasterKey(null);
    };

    const isLocked = masterKey === null;

    return (
        <VaultContext.Provider
            value={{ masterKey, setMasterPassword, lockVault, isLocked }}
        >
            {children}
        </VaultContext.Provider>
    );
}

export function useVault() {
    const context = useContext(VaultContext);
    if (context === undefined) {
        throw new Error("useVault must be used within a VaultProvider");
    }
    return context;
}
