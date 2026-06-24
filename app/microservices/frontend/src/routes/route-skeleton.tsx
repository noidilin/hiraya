import type { LucideIcon } from 'lucide-react';

type RouteSkeletonProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export function RouteSkeleton({ eyebrow, title, description, icon: Icon }: RouteSkeletonProps) {
  return (
    <section className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="max-w-3xl border-l border-border pl-6">
        <div className="mb-8 inline-flex size-11 items-center justify-center border border-border text-muted-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
