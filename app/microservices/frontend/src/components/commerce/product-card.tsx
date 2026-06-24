import { Link } from "@tanstack/react-router";

import type { Product } from "@/api";
import { AddToCartButton } from "@/components/commerce/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="group min-w-0">
      <Link to="/products/$productId" params={{ productId: product.id }} aria-label={`View ${product.name}`}>
        <div className="overflow-hidden border border-border bg-secondary">
          <img
            src={product.imageUrl}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="mt-4 grid gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Badge
              variant="outline"
              className="rounded-none bg-background px-2 py-0 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              {product.category}
            </Badge>
            <h3 className="mt-1 font-heading text-xl font-semibold leading-tight text-foreground">
              <Link to="/products/$productId" params={{ productId: product.id }} className="hover:text-muted-foreground">
                {product.name}
              </Link>
            </h3>
          </div>
          <p className="shrink-0 text-sm font-semibold">{formatMoney(product.price)}</p>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <Badge
            variant="secondary"
            className="rounded-none bg-secondary px-2 py-0 text-[0.6875rem] font-medium text-muted-foreground"
          >
            {product.inventory > 0 ? `${product.inventory} available` : "Sold"}
          </Badge>
          <AddToCartButton product={product} size="sm" />
        </div>
      </div>
    </article>
  );
}
