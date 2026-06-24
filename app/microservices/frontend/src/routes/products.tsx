import { Search, SlidersHorizontal, X } from "lucide-react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";

import { ProductGrid } from "@/components/commerce/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { filterProducts, productSortOptions, type ProductSort } from "@/lib/product-filters";
import { useProductsQuery } from "@/hooks/use-products";

const sortValues = productSortOptions.map((option) => option.value) as [ProductSort, ...ProductSort[]];

export function ProductsRoute() {
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [category, setCategory] = useQueryState("category", parseAsString.withDefault(""));
  const [sort, setSort] = useQueryState("sort", parseAsStringLiteral(sortValues).withDefault("newest"));
  const productsQuery = useProductsQuery();

  const filteredProducts = useMemo(
    () => filterProducts(productsQuery.products, { search, category, sort }),
    [category, productsQuery.products, search, sort],
  );

  const hasActiveFilters = Boolean(search || category || sort !== "newest");

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 pb-24 sm:px-8 lg:py-16">
      <header className="grid gap-8 border-b border-border pb-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">The archive</p>
          <h1 className="mt-4 font-heading text-5xl font-semibold leading-none tracking-normal sm:text-7xl">Shop all</h1>
        </div>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:pt-10">
          Browse the full edit of dresses, outerwear, shirting, denim, and rare found pieces selected for material presence.
        </p>
      </header>

      <section className="grid gap-4 border-b border-border py-5 lg:grid-cols-[minmax(16rem,1fr)_auto_auto_auto]" aria-label="Product filters">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Search archive"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search archive"
            className="h-11 rounded-none bg-background pl-10 pr-10 text-sm"
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
              onClick={() => void setSearch("")}
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </div>

        <Select value={category || "all"} onValueChange={(value) => void setCategory(value === "all" ? "" : value)}>
          <SelectTrigger aria-label="Filter by category" className="h-11 w-full min-w-44 rounded-none bg-background lg:w-44">
            <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            <SelectItem value="all">All categories</SelectItem>
            {productsQuery.categories.map((categoryName) => (
              <SelectItem key={categoryName} value={categoryName}>
                {categoryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => void setSort(value as ProductSort)}>
          <SelectTrigger aria-label="Sort products" className="h-11 w-full min-w-44 rounded-none bg-background lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            {productSortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={!hasActiveFilters}
          aria-label="Clear product filters"
          onClick={() => {
            void setSearch("");
            void setCategory("");
            void setSort("newest");
          }}
        >
          <X aria-hidden="true" />
          Clear
        </Button>
      </section>

      <div className="mt-5 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>
          {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}
        </p>
        {productsQuery.isFallback ? <p>Showing the house archive edit.</p> : null}
      </div>

      <section className="mt-8" aria-live="polite">
        {productsQuery.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-96 rounded-none border border-border bg-secondary" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <div className="border-y border-border py-16 text-center">
            <h2 className="font-heading text-3xl font-semibold">No pieces found</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Adjust the search or category to uncover more of the archive.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
