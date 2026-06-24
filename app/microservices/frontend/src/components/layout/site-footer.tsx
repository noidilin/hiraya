import { Link } from '@tanstack/react-router';

import { primaryNavigation, utilityNavigation } from '@/lib/navigation';

const footerNavigation = [...primaryNavigation, ...utilityNavigation] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background pb-20 md:pb-0">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto]">
        <div>
          <Link to="/" className="font-heading text-2xl font-semibold">
            Hiraya Furugi
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            A quiet archive for worn-in silhouettes, careful textures, and vintage pieces with another life ahead.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap items-start gap-x-5 gap-y-3 text-sm font-medium">
          {footerNavigation.map((item) => (
            <Link key={item.to} to={item.to} className="text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
