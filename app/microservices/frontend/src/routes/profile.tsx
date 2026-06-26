import { Link } from "@tanstack/react-router";
import { LogOut, ReceiptText, ShoppingBag, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

function fullName(user: NonNullable<ReturnType<typeof useAuth>["user"]>): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

export function ProfileRoute() {
  const { user, status, logout } = useAuth();
  const isLoading = status === "idle" || status === "loading";

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 pb-24 sm:px-8 lg:py-16">
      <header className="border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Your account</p>
        <h1 className="mt-4 font-heading text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
          Account Summary
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
          A read-only account record backed by the active Storefront identity service.
        </p>
      </header>

      {isLoading ? (
        <section className="mt-10 grid gap-5 border-y border-border py-8 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-none" />
          <Skeleton className="h-20 rounded-none" />
        </section>
      ) : null}

      {!isLoading && user ? (
        <section className="mt-10 grid gap-8 lg:grid-cols-[0.72fr_0.28fr]">
          <div className="border border-border p-6">
            <UserRound className="size-7 text-muted-foreground" aria-hidden="true" />
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Name</dt>
                <dd className="mt-2 font-heading text-3xl font-semibold">{fullName(user)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Email</dt>
                <dd className="mt-2 break-all text-base font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Role</dt>
                <dd className="mt-2 capitalize text-base font-medium">{user.role}</dd>
              </div>
            </dl>
          </div>

          <aside className="grid gap-3 self-start">
            <Button asChild className="h-11 rounded-none px-5">
              <Link to="/orders">
                <ReceiptText aria-hidden="true" />
                View orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-none px-5">
              <Link to="/cart">
                <ShoppingBag aria-hidden="true" />
                View cart
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-none px-5"
              onClick={() => void logout()}
            >
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          </aside>
        </section>
      ) : null}
    </div>
  );
}
