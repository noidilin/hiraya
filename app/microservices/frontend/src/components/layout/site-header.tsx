import { Link } from '@tanstack/react-router';

import { CartLink } from '@/components/layout/cart-link';
import { Button } from '@/components/ui/button';
import { primaryNavigation, utilityNavigation } from '@/lib/navigation';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="shrink-0 font-heading text-2xl font-semibold leading-none tracking-normal">
          Hiraya Furugi
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm font-medium md:flex">
          {primaryNavigation.map((item) => (
            <Link key={item.to} to={item.to} className="text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {utilityNavigation
            .filter((item) => item.to !== '/cart')
            .map((item) => {
              const Icon = item.icon;

              return (
                <Button key={item.to} asChild variant="ghost" size="lg">
                  <Link to={item.to}>
                    <Icon aria-hidden="true" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          <CartLink />
        </div>
      </div>
    </header>
  );
}
