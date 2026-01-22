import { BrainCircuit } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        <BrainCircuit className="h-6 w-6 text-primary" />
        <h1 className="text-lg md:text-xl font-semibold">Sentiment Analyzer Pro</h1>
      </div>
    </header>
  );
}
