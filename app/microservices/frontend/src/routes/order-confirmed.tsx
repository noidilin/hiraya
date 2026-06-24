import { Link } from "@tanstack/react-router";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import { useOrderStore } from "@/stores/order-store";

const orderItemsMotion: { container: Variants; item: Variants } = {
  container: {
    hidden: {},
    visible: {},
  },
  item: {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.18,
        ease: "easeOut",
      },
    },
  },
};

const reducedOrderItemsMotion: { container: Variants; item: Variants } = {
  container: {
    hidden: {},
    visible: {},
  },
  item: {
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0,
      },
    },
  },
};

export function OrderConfirmedRoute() {
  const lastOrder = useOrderStore((state) => state.lastOrder);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 pb-24 sm:px-8 lg:py-16">
      <section className="border-b border-border pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Order</p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
              {lastOrder ? "Order confirmed" : "Archive request"}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
              {lastOrder
                ? "Your selected pieces are reserved and the order record is ready."
                : "No recent order is stored in this browser, but the archive remains open."}
            </p>
          </div>
          <div className="grid size-14 place-items-center border border-border text-accent">
            {lastOrder ? <CheckCircle2 className="size-7" aria-hidden="true" /> : <PackageCheck className="size-7" aria-hidden="true" />}
          </div>
        </div>
      </section>

      {lastOrder ? (
        <section className="mt-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border border-border p-5 sm:p-6">
            <h2 className="font-heading text-3xl font-semibold">Confirmation</h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Order number</dt>
                <dd className="mt-1 break-all font-semibold">{lastOrder.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <Badge
                    variant="outline"
                    className="rounded-none bg-background px-2 py-0 text-[0.6875rem] font-semibold capitalize text-muted-foreground"
                  >
                    {lastOrder.status}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Payment</dt>
                <dd className="mt-1">
                  <Badge
                    variant="outline"
                    className="rounded-none bg-background px-2 py-0 text-[0.6875rem] font-semibold capitalize text-muted-foreground"
                  >
                    {lastOrder.paymentStatus}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Total</dt>
                <dd className="mt-1 font-semibold">{formatMoney(lastOrder.totalAmount)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="font-heading text-3xl font-semibold">Pieces</h2>
            <AnimatedGroup variants={shouldReduceMotion ? reducedOrderItemsMotion : orderItemsMotion}>
              <ul className="mt-5 divide-y divide-border border-y border-border">
                {lastOrder.items.map((item) => (
                  <li key={item.id} className="grid gap-4 py-5 sm:grid-cols-[88px_1fr_auto] sm:items-center">
                    <img
                      src={item.product.imageUrl}
                      alt=""
                      className="aspect-[4/5] w-22 border border-border object-cover"
                      loading="lazy"
                    />
                    <div>
                      <Badge
                        variant="outline"
                        className="rounded-none bg-background px-2 py-0 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        {item.product.category}
                      </Badge>
                      <p className="mt-2 font-heading text-2xl font-semibold leading-tight">{item.product.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Quantity {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold sm:text-right">{formatMoney(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
            </AnimatedGroup>
          </div>
        </section>
      ) : (
        <section className="mt-10 border-y border-border py-16 text-center">
          <PackageCheck className="mx-auto size-9 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-5 font-heading text-3xl font-semibold">No confirmation to show</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Return to the cart or continue browsing the archive.
          </p>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild className="h-11 rounded-none px-5">
          <Link to="/products">Shop the archive</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-none px-5">
          <Link to="/orders">View order history</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-none px-5">
          <Link to="/cart">Return to cart</Link>
        </Button>
      </div>
    </div>
  );
}
