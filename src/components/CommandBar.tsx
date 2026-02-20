"use client";

import React, { useState, useEffect } from "react";
import { Mic, Search, Key, LogIn, ChevronRight, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CommandBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [parseResult, setParseResult] = useState<{
        site?: string;
        user?: string;
        pass?: string;
    } | null>(null);

    // Web Speech API fallback
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const handleListen = () => {
        if (!SpeechRecognition) {
            alert("Web Speech API is not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
            parseQuery(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // Zero-cost Natural Language Parsing using Regex
    // Matches things like: "Save Netflix user is bob@me.com and pass is 1234"
    const parseQuery = (text: string) => {
        const siteMatch = text.match(/(?:save|add|for)\s+([a-zA-Z0-9]+)/i);
        const userMatch = text.match(/(?:user|username|email)\s+(?:is\s+)?([^\s]+)/i);
        const passMatch = text.match(/(?:pass|password|key)\s+(?:is\s+)?([^\s]+)/i);

        if (siteMatch || userMatch || passMatch) {
            setParseResult({
                site: siteMatch ? siteMatch[1] : undefined,
                user: userMatch ? userMatch[1] : undefined,
                pass: passMatch ? passMatch[1] : undefined,
            });
        } else {
            setParseResult(null);
        }
    };

    useEffect(() => {
        parseQuery(query);
    }, [query]);

    // Keyboard shortcut (Cmd+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-card px-6 py-3 flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-all hover:scale-105 active:scale-95 z-50 shadow-2xl group"
            >
                <Search size={18} className="text-primary/70 group-hover:text-primary transition-colors" />
                <span className="font-medium text-sm">Cmd + K to Command</span>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <Mic size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-slate-900/20 backdrop-blur-sm p-4">
            {/* Backdrop to close */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white relative overflow-hidden"
            >
                <div className="flex items-center px-4 py-4 border-b border-indigo-100/50">
                    <Search className="text-slate-400 mr-3" size={20} />
                    <input
                        autoFocus
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 placeholder-slate-400"
                        placeholder="e.g. Save my Netflix login: user is email@me.com pass is 123"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        onClick={handleListen}
                        className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-primary'}`}
                    >
                        <Mic size={18} />
                    </button>
                </div>

                <AnimatePresence>
                    {parseResult && (parseResult.site || parseResult.user || parseResult.pass) && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 py-3 bg-indigo-50/50 border-b border-indigo-100/50 overflow-hidden"
                        >
                            <div className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wide">Parsed Intent</div>
                            <div className="grid grid-cols-3 gap-2">
                                {parseResult.site && (
                                    <div className="bg-white px-3 py-2 rounded-lg border border-indigo-100 shadow-sm flex items-center gap-2">
                                        <LogOut className="text-indigo-400" size={14} />
                                        <span className="text-sm font-medium text-slate-700 truncate">{parseResult.site}</span>
                                    </div>
                                )}
                                {parseResult.user && (
                                    <div className="bg-white px-3 py-2 rounded-lg border border-indigo-100 shadow-sm flex items-center gap-2">
                                        <LogIn className="text-emerald-400" size={14} />
                                        <span className="text-sm font-medium text-slate-700 truncate">{parseResult.user}</span>
                                    </div>
                                )}
                                {parseResult.pass && (
                                    <div className="bg-white px-3 py-2 rounded-lg border border-indigo-100 shadow-sm flex items-center gap-2">
                                        <Key className="text-rose-400" size={14} />
                                        <span className="text-sm font-medium text-slate-700 truncate">••••••••</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                    Save to Vault <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 flex justify-between">
                    <span>Natural Language Parser Active</span>
                    <span>esc to close</span>
                </div>
            </motion.div>
        </div>
    );
}


