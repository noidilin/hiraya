import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { editorialContent, manifestoContent } from "@/data/furugi-content";

export function ManifestoRoute() {
  return (
    <div className="pb-20">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{manifestoContent.eyebrow}</p>
          <h1 className="mt-5 font-heading text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
            {manifestoContent.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{manifestoContent.intro}</p>
        </div>
        <img
          src={manifestoContent.image.url}
          alt={manifestoContent.image.alt}
          className="aspect-[3/2] w-full border border-border object-cover"
        />
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-3">
          {manifestoContent.principles.map((principle, index) => (
            <article key={principle.title} className="border-t border-border pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-5 font-heading text-3xl font-semibold leading-tight">{principle.title}</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{editorialContent.title}</p>
          <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight">Every mark is cataloged plainly.</h2>
          <div className="mt-8 grid gap-6">
            {editorialContent.entries.map((entry) => (
              <article key={entry.title} className="grid gap-4 border-t border-border pt-5 sm:grid-cols-[8rem_1fr]">
                <img src={entry.image.url} alt={entry.image.alt} className="aspect-[4/5] w-full border border-border object-cover" />
                <div>
                  <h3 className="font-heading text-2xl font-semibold leading-tight">{entry.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="border-l border-border pl-6">
          <p className="font-heading text-3xl font-semibold leading-tight">
            We prefer garments that make age useful: softer cloth, better drape, quieter presence.
          </p>
          <Button asChild className="mt-8">
            <Link to="/products">Enter archive</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
