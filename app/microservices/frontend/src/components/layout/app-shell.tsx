import { Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';

import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { useAuthStore } from '@/hooks/use-auth';

export function AppShell() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);

  useEffect(() => {
    if (!hasBootstrapped) {
      void bootstrap();
    }
  }, [bootstrap, hasBootstrapped]);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <MobileNavigation />
    </div>
  );
}
