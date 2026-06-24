import { ShoppingBag } from "lucide-react";

import type { Product } from "@/api";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/use-cart";

type AddToCartButtonProps = {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "lg";
};

export function AddToCartButton({ product, className, size = "default" }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isSoldOut = product.inventory <= 0;

  return (
    <Button
      type="button"
      size={size}
      className={className}
      disabled={isSoldOut}
      aria-label={isSoldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
      onClick={() => addItem(product, 1)}
    >
      <ShoppingBag aria-hidden="true" />
      {isSoldOut ? "Sold out" : "Add to cart"}
    </Button>
  );
}
