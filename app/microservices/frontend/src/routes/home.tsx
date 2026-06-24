import { Link } from "@tanstack/react-router";

import { ProductGrid } from "@/components/commerce/product-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { productImageAssets } from "@/data/asset-manifest";
import { homeContent, manifestoContent } from "@/data/furugi-content";
import { useFeaturedProductsQuery } from "@/hooks/use-products";

export function HomeRoute() {
  const featuredQuery = useFeaturedProductsQuery(4);

  return (
    <div className="pb-20">
      <section className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{homeContent.eyebrow}</p>
          <h1 className="mt-5 font-heading text-5xl font-semibold leading-[0.98] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            {homeContent.title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">{homeContent.dek}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/products">{homeContent.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/manifesto">{homeContent.secondaryCta}</Link>
            </Button>
          </div>
        </div>

        <div className="min-w-0">
          <img
            src={homeContent.heroImage.url}
            alt={homeContent.heroImage.alt}
            className="aspect-[3/2] w-full border border-border object-cover"
          />
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span>Natural texture</span>
            <span className="text-right">Rare daily wear</span>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-2">
          {homeContent.collectionBands.map((band) => (
            <article key={band.title} className="grid gap-5">
              <div>
                <h2 className="font-heading text-3xl font-semibold leading-tight">{band.title}</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{band.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {band.productImageKeys.map((imageKey) => {
                  const image = productImageAssets[imageKey];

                  return (
                    <img
                      key={imageKey}
                      src={image.url}
                      alt={image.alt}
                      className="aspect-[4/5] w-full border border-border object-cover"
                      loading="lazy"
                    />
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Featured pieces</p>
            <h2 className="mt-3 font-heading text-4xl font-semibold leading-tight">Freshly cataloged</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/products">Shop all</Link>
          </Button>
        </div>

        {featuredQuery.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading featured products">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-80 rounded-none border border-border bg-secondary" />
            ))}
          </div>
        ) : (
          <ProductGrid products={featuredQuery.products} />
        )}
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <img
          src={manifestoContent.image.url}
          alt={manifestoContent.image.alt}
          className="aspect-[3/2] w-full border border-border object-cover"
          loading="lazy"
        />
        <div className="border-t border-border py-8 lg:border-l lg:border-t-0 lg:py-0 lg:pl-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{manifestoContent.eyebrow}</p>
          <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight">{manifestoContent.title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{manifestoContent.intro}</p>
          <Button asChild className="mt-7" variant="outline">
            <Link to="/manifesto">Read more</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
