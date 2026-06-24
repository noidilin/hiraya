import { Link } from '@tanstack/react-router';

import { useCartItemCount } from '@/hooks/use-cart';
import { primaryNavigation, utilityNavigation } from '@/lib/navigation';

const mobileItems = [...primaryNavigation, ...utilityNavigation] as const;

export function MobileNavigation() {
  const itemCount = useCartItemCount();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-6">
        {mobileItems.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-label={item.to === '/cart' ? `Cart, ${itemCount} items` : item.label}
                className="flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="relative">
                  <Icon className="size-5" aria-hidden="true" />
                  {item.to === '/cart' ? (
                    <span className="absolute -right-2 -top-2 grid size-4 place-items-center border border-background bg-accent text-[10px] font-semibold leading-none text-accent-foreground">
                      {itemCount}
                    </span>
                  ) : null}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
