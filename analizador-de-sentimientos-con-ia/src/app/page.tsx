import { Header } from '@/components/header';
import { ConfigPanel } from '@/components/config-panel';
import { MainContent } from '@/components/main-content';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <ConfigPanel />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col max-h-screen">
          <Header />
          <MainContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
