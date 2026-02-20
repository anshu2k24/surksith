"use client";

import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { CommandBar } from "@/components/CommandBar";
import { AuthScreen } from "@/components/AuthScreen";
import { useVault } from "@/components/VaultProvider";
import { supabase } from "@/utils/supabase/client";
import { Shield } from "lucide-react";

export default function Home() {
  const { isLocked } = useVault();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <Shield className="w-12 h-12 text-primary/30 animate-pulse" />
      </div>
    );
  }

  // If there's no Supabase session OR they haven't entered their Master Password
  if (!session || isLocked) {
    return (
      <main className="min-h-screen relative p-8 pb-32 flex flex-col items-center">
        <div className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 font-medium">
          <Shield className="w-5 h-5 text-indigo-400" /> सुरक्षितः
        </div>
        <AuthScreen onAuthSuccess={() => console.log("Unlocked")} />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative p-8 pb-32">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 text-slate-800 font-semibold tracking-tight text-xl">
          <Shield className="w-6 h-6 text-indigo-500" /> सुरक्षितः
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <Dashboard />
      <CommandBar />
    </main>
  );
}
