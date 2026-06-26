import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Minus, Plus, Ruler } from "lucide-react";

import { AddToCartButton } from "@/components/commerce/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { hirayaFurugiCatalogProducts } from "@/data/hiraya-furugi-catalog";
import { useProductQuery } from "@/hooks/use-products";
import { formatMoney } from "@/lib/money";

function getRelatedGalleryImages(productId: string | undefined, mainImage: string | undefined) {
  const relatedProducts = hirayaFurugiCatalogProducts.filter((product) => product.id !== productId).slice(0, 2);
  return [mainImage, ...relatedProducts.map((product) => product.imageUrl)].filter(Boolean) as string[];
}

function clampDetailQuantity(quantity: number, inventory: number): number {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.min(Math.max(1, Math.floor(quantity)), Math.max(1, inventory));
}

export function ProductDetailRoute() {
  const { productId } = useParams({ strict: false }) as { productId?: string };
  const productQuery = useProductQuery(productId);
  const product = productQuery.product;
  const [quantitySelection, setQuantitySelection] = useState<{ productId?: string; quantity: number }>({ quantity: 1 });

  if (productQuery.isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <Skeleton className="aspect-[4/5] rounded-none border border-border bg-secondary" />
        <div className="space-y-5">
          <Skeleton className="h-4 w-32 rounded-none bg-secondary" />
          <Skeleton className="h-20 w-full rounded-none bg-secondary" />
          <Skeleton className="h-32 w-full rounded-none bg-secondary" />
        </div>
      </div>
    );
  }

  if (productQuery.isError) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8" role="alert">
        <h1 className="font-heading text-5xl font-semibold leading-tight">Product unavailable</h1>
        <p className="mt-4 text-muted-foreground">The Storefront API did not return this archive entry. Please try again soon.</p>
        <Button asChild className="mt-8">
          <Link to="/products">Return to archive</Link>
        </Button>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <h1 className="font-heading text-5xl font-semibold leading-tight">Piece not found</h1>
        <p className="mt-4 text-muted-foreground">This archive entry may have already moved on.</p>
        <Button asChild className="mt-8">
          <Link to="/products">Return to archive</Link>
        </Button>
      </section>
    );
  }

  const quantity = quantitySelection.productId === product.id ? quantitySelection.quantity : 1;
  const setSelectedQuantity = (nextQuantity: number) => {
    setQuantitySelection({ productId: product.id, quantity: nextQuantity });
  };
  const inventoryLimit = Math.max(0, product.inventory);
  const selectedQuantity = inventoryLimit > 0 ? clampDetailQuantity(quantity, inventoryLimit) : 1;
  const isMinimumQuantity = selectedQuantity <= 1;
  const isMaximumQuantity = inventoryLimit <= 0 || selectedQuantity >= inventoryLimit;
  const galleryImages = getRelatedGalleryImages(product.id, product.imageUrl);
  const conditionNotes = [
    `${product.inventory} available in the archive`,
    product.originalPrice ? "Price revised after condition review" : "Condition reviewed and ready to wear",
    "Measured flat before dispatch",
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 pb-24 sm:px-8 lg:py-14">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/products">
          <ArrowLeft aria-hidden="true" />
          Archive
        </Link>
      </Button>

      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-4 lg:grid-cols-[5rem_1fr]">
          <div className="order-2 grid grid-cols-3 gap-3 lg:order-1 lg:grid-cols-1">
            {galleryImages.map((imageUrl, index) => (
              <img
                key={`${imageUrl}-${index}`}
                src={imageUrl}
                alt={index === 0 ? product.name : `${product.name} archive texture ${index}`}
                className="aspect-[4/5] w-full border border-border object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            ))}
          </div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="order-1 aspect-[4/5] w-full border border-border object-cover lg:order-2"
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Badge
            variant="outline"
            className="rounded-none bg-background px-2 py-0 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            {product.category}
          </Badge>
          <h1 className="mt-4 font-heading text-5xl font-semibold leading-none tracking-normal sm:text-6xl">{product.name}</h1>
          <div className="mt-5 flex items-baseline gap-3">
            <p className="text-xl font-semibold">{formatMoney(product.price)}</p>
            {product.originalPrice ? (
              <p className="text-sm text-muted-foreground line-through">{formatMoney(product.originalPrice)}</p>
            ) : null}
          </div>

          <p className="mt-7 border-y border-border py-6 text-base leading-7 text-muted-foreground">{product.description}</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Ruler className="size-4" aria-hidden="true" />
                Size notes
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Relaxed vintage fit. Compare against a favorite garment for the cleanest read.
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Check className="size-4" aria-hidden="true" />
                Condition
              </div>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
                {conditionNotes.map((note, index) => (
                  <li key={note}>
                    {index === 0 ? (
                      <Badge
                        variant="secondary"
                        className="rounded-none bg-secondary px-2 py-0 text-[0.6875rem] font-medium text-muted-foreground"
                      >
                        {note}
                      </Badge>
                    ) : (
                      note
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-[11rem_1fr]">
            <div className="flex h-11 items-center border border-border">
              <button
                type="button"
                className="grid size-11 place-items-center text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                aria-label={`Decrease ${product.name} quantity`}
                disabled={isMinimumQuantity || inventoryLimit <= 0}
                onClick={() => setSelectedQuantity(clampDetailQuantity(selectedQuantity - 1, inventoryLimit))}
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <label className="sr-only" htmlFor={`detail-quantity-${product.id}`}>
                {product.name} quantity
              </label>
              <input
                id={`detail-quantity-${product.id}`}
                type="number"
                min="1"
                max={inventoryLimit || 1}
                value={selectedQuantity}
                disabled={inventoryLimit <= 0}
                className="h-full min-w-0 flex-1 border-x border-border bg-transparent text-center text-sm outline-none disabled:opacity-50"
                onChange={(event) => {
                  const nextValue = event.target.value;

                  if (nextValue === "") {
                    return;
                  }

                  setSelectedQuantity(clampDetailQuantity(Number(nextValue), inventoryLimit));
                }}
              />
              <button
                type="button"
                className="grid size-11 place-items-center text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                aria-label={`Increase ${product.name} quantity`}
                disabled={isMaximumQuantity}
                onClick={() => setSelectedQuantity(clampDetailQuantity(selectedQuantity + 1, inventoryLimit))}
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
            <AddToCartButton product={product} quantity={selectedQuantity} size="lg" className="h-11" />
            <Button asChild variant="outline" size="lg" className="h-11 sm:col-span-2">
              <Link to="/products">Keep browsing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
