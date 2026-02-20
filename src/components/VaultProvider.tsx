"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { deriveKeyFromPassword } from "@/lib/crypto";

interface VaultContextType {
    masterKey: CryptoKey | null;
    setMasterPassword: (password: string) => Promise<void>;
    isLocked: boolean;
    lockVault: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

    // We only store the derived key in state/memory, NOT the password itself.
    // When the window is closed, this state is lost.
    const setMasterPassword = async (password: string) => {
        try {
            // In a real app we'd fetch a user-specific salt from the DB based on their email.
            // For this demo, we'll derive a key and keep it.
            const { key } = await deriveKeyFromPassword(password);
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
