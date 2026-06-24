import { Link } from "@tanstack/react-router";
import { ChevronDown, PackageCheck, ReceiptText } from "lucide-react";

import type { Order, OrderStatus } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderHistoryQuery } from "@/hooks/use-orders";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const statusCopy: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "In Process",
  shipped: "In Transit",
  delivered: "Archived",
  cancelled: "Cancelled",
};

const activeStatuses = new Set<OrderStatus>(["pending", "processing", "shipped"]);

function formatOrderDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Order history could not be loaded.";
}

export function OrdersRoute() {
  const { orders, isAuthenticated, isAuthLoading, isPending, isError, error } = useOrderHistoryQuery();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 pb-24 sm:px-8 lg:py-16">
      <header className="border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Your account</p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-heading text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
              Your Archive Record
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
              A record of acquired pieces, parcel status, and the garments reserved under your account.
            </p>
          </div>
          <Button asChild variant="outline" className="h-11 rounded-none px-5 lg:mb-1">
            <Link to="/products">Continue browsing</Link>
          </Button>
        </div>
      </header>

      {isAuthLoading || (isAuthenticated && isPending) ? <OrderHistorySkeleton /> : null}

      {!isAuthLoading && !isAuthenticated ? (
        <Alert className="mt-10 rounded-none border-accent bg-accent/10 p-5">
          <ReceiptText className="size-5" aria-hidden="true" />
          <AlertTitle>Sign in to view your archive record.</AlertTitle>
          <AlertDescription>Your order history is attached to the account used at checkout.</AlertDescription>
          <Button asChild className="mt-5 h-11 rounded-none px-5">
            <Link to="/auth">Go to account</Link>
          </Button>
        </Alert>
      ) : null}

      {isAuthenticated && isError ? (
        <Alert variant="destructive" className="mt-10 rounded-none border-destructive/40 bg-destructive/10 p-5">
          <AlertTitle>Order history unavailable.</AlertTitle>
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      ) : null}

      {isAuthenticated && !isPending && !isError && orders.length === 0 ? <EmptyOrderHistory /> : null}

      {isAuthenticated && !isPending && !isError && orders.length > 0 ? (
        <>
          <div className="mt-10 flex flex-col gap-10">
            {orders.map((order) => (
              <OrderRecord key={order.id} order={order} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button type="button" variant="outline" className="h-11 rounded-none px-5" disabled>
              Load earlier records
              <ChevronDown className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function OrderRecord({ order }: { order: Order }) {
  const isActive = activeStatuses.has(order.status);

  return (
    <section className="group grid gap-6 border-b border-border pb-8 transition-colors hover:border-foreground/25 lg:grid-cols-[0.42fr_0.58fr]">
      <div className="flex flex-col justify-between gap-6">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span
              className={cn(
                "inline-block size-2 bg-muted-foreground",
                isActive ? "animate-pulse bg-foreground" : "bg-muted-foreground",
              )}
              aria-hidden="true"
            />
            <Badge
              variant="outline"
              className="h-6 rounded-none bg-background px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              {statusCopy[order.status]}
            </Badge>
          </div>
          <h2 className="break-all font-heading text-3xl font-semibold leading-tight">{order.id}</h2>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">Acquired:</dt>
              <dd>{formatOrderDate(order.createdAt)}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">Total investment:</dt>
              <dd className="font-semibold">{formatMoney(order.totalAmount)}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">Payment:</dt>
              <dd className="capitalize">{order.paymentStatus}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" className="h-11 rounded-none" disabled>
            <ReceiptText aria-hidden="true" />
            Details
          </Button>
          <Button type="button" variant="outline" className="h-11 rounded-none" disabled>
            Invoice
          </Button>
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Acquisition items ({order.items.length})
        </p>
        <ul className="flex gap-4 overflow-x-auto pb-3">
          {order.items.map((item) => (
            <li key={item.id} className="min-w-[160px] max-w-[180px] sm:min-w-[200px] sm:max-w-[220px]">
              <Link to="/products/$productId" params={{ productId: item.productId }} className="block">
                <img
                  src={item.product.imageUrl}
                  alt=""
                  className="aspect-[3/4] w-full border border-border object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <p className="mt-3 line-clamp-2 font-heading text-xl font-semibold leading-tight">{item.product.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Qty {item.quantity} / {formatMoney(item.price)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function OrderHistorySkeleton() {
  return (
    <div className="mt-10 flex flex-col gap-10" aria-label="Loading order history">
      {[0, 1].map((item) => (
        <section key={item} className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[0.42fr_0.58fr]">
          <div>
            <Skeleton className="h-5 w-28 rounded-none" />
            <Skeleton className="mt-4 h-9 w-4/5 rounded-none" />
            <Skeleton className="mt-4 h-4 w-48 rounded-none" />
            <Skeleton className="mt-2 h-4 w-36 rounded-none" />
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-11 rounded-none" />
              <Skeleton className="h-11 rounded-none" />
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            <Skeleton className="aspect-[3/4] w-40 shrink-0 rounded-none sm:w-48" />
            <Skeleton className="aspect-[3/4] w-40 shrink-0 rounded-none sm:w-48" />
            <Skeleton className="hidden aspect-[3/4] w-40 shrink-0 rounded-none sm:block sm:w-48" />
          </div>
        </section>
      ))}
    </div>
  );
}

function EmptyOrderHistory() {
  return (
    <section className="mt-10 border-y border-border py-16 text-center">
      <PackageCheck className="mx-auto size-9 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-5 font-heading text-3xl font-semibold">No archive records yet</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        Once checkout is complete, acquired pieces will appear here with their order status.
      </p>
      <Button asChild className="mt-6 h-11 rounded-none px-5">
        <Link to="/products">Shop the archive</Link>
      </Button>
    </section>
  );
}
