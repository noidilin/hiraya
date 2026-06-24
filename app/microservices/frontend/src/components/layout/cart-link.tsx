import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartItemCount } from "@/hooks/use-cart";

export function CartLink() {
  const itemCount = useCartItemCount();

  return (
    <Button asChild variant="outline" size="icon-lg" className="relative" aria-label={`View cart, ${itemCount} items`}>
      <Link to="/cart">
        <ShoppingBag aria-hidden="true" />
        <span className="absolute -right-1 -top-1 grid size-4 place-items-center border border-background bg-accent text-[10px] font-semibold leading-none text-accent-foreground">
          {itemCount}
        </span>
      </Link>
    </Button>
  );
}
