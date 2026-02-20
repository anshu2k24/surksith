import { Dashboard } from "@/components/Dashboard";
import { CommandBar } from "@/components/CommandBar";

export default function Home() {
  return (
    <main className="min-h-screen relative p-8 pb-32">
      <Dashboard />
      <CommandBar />
    </main>
  );
}
