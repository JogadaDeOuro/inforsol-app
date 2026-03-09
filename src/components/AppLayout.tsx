import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Bell } from 'lucide-react';

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card/50 backdrop-blur-sm px-4 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground md:hidden" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <div className="hidden md:flex items-center gap-2 ml-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  CO
                </div>
                <span className="text-sm font-medium">Carlos Oliveira</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
