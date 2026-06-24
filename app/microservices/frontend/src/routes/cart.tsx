import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { z } from "zod";

import type { Address } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-checkout";
import { formatMoney } from "@/lib/money";
import { useOrderStore } from "@/stores/order-store";

type ShippingField = keyof Address;
type ShippingErrors = Partial<Record<ShippingField, string>>;

const shippingSchema = z.object({
  street: z.string().trim().min(1, "Enter a street address."),
  city: z.string().trim().min(1, "Enter a city."),
  state: z.string().trim().min(1, "Enter a state or province."),
  zipCode: z.string().trim().min(1, "Enter a postal code."),
  country: z.string().trim().min(2, "Enter a country."),
});

const shippingFields: Array<{
  id: ShippingField;
  label: string;
  autoComplete: string;
}> = [
  { id: "street", label: "Street address", autoComplete: "shipping street-address" },
  { id: "city", label: "City", autoComplete: "shipping address-level2" },
  { id: "state", label: "State or province", autoComplete: "shipping address-level1" },
  { id: "zipCode", label: "Postal code", autoComplete: "shipping postal-code" },
  { id: "country", label: "Country", autoComplete: "shipping country-name" },
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Checkout could not be completed.";
}

export function CartRoute() {
  const navigate = useNavigate();
  const { items, updateQuantity, incrementItem, decrementItem, removeItem, clearCart } = useCart();
  const { user, status: authStatus } = useAuth();
  const checkout = useCheckout();
  const setLastOrder = useOrderStore((state) => state.setLastOrder);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);
  const shipping = items.length > 0 ? 12 : 0;
  const total = subtotal + shipping;
  const isLoggedOut = authStatus !== "authenticated" || !user;
  const isCheckingOut = checkout.isPending;

  function updateShippingField(field: ShippingField, value: string) {
    setShippingAddress((current) => ({ ...current, [field]: value }));
    setShippingErrors((current) => ({ ...current, [field]: undefined }));
    setCheckoutError(null);
    checkout.reset();
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutError(null);

    if (items.length === 0) {
      return;
    }

    if (isLoggedOut) {
      setCheckoutError("Sign in to place the order. Your cart will stay here.");
      return;
    }

    const parsedAddress = shippingSchema.safeParse(shippingAddress);

    if (!parsedAddress.success) {
      const flattened = parsedAddress.error.flatten().fieldErrors;
      setShippingErrors({
        street: flattened.street?.[0],
        city: flattened.city?.[0],
        state: flattened.state?.[0],
        zipCode: flattened.zipCode?.[0],
        country: flattened.country?.[0],
      });
      return;
    }

    try {
      const order = await checkout.mutateAsync({
        userId: user.id,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: parsedAddress.data,
      });
      setLastOrder(order);
      clearCart();
      await navigate({ to: "/order-confirmed" });
    } catch (error) {
      setCheckoutError(getErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 pb-24 sm:px-8 lg:py-16">
      <header className="grid gap-8 border-b border-border pb-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Your archive</p>
          <h1 className="mt-4 font-heading text-5xl font-semibold leading-none tracking-normal sm:text-7xl">Cart</h1>
        </div>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:pt-10">
          Review the pieces you have gathered, then add a shipping address to place the order.
        </p>
      </header>

      {items.length === 0 ? (
        <section className="mt-10 border-y border-border py-16 text-center">
          <ShoppingBag className="mx-auto size-9 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-5 font-heading text-3xl font-semibold">Your cart is empty</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Browse the archive and add a piece when something feels right.
          </p>
          <Button asChild className="mt-6 h-11 rounded-none px-5">
            <Link to="/products">Shop the archive</Link>
          </Button>
        </section>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <section aria-labelledby="cart-items-title">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <h2 id="cart-items-title" className="font-heading text-3xl font-semibold">
                Selected pieces
              </h2>
              <Button
                type="button"
                variant="ghost"
                className="h-9 rounded-none text-muted-foreground"
                onClick={clearCart}
              >
                <X aria-hidden="true" />
                Clear
              </Button>
            </div>

            <ul className="divide-y divide-border">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity;
                const hasMaxQuantity = item.inventory !== undefined && item.quantity >= item.inventory;

                return (
                  <li key={item.productId} className="grid gap-4 py-5 sm:grid-cols-[104px_1fr]">
                    <Link to="/products/$productId" params={{ productId: item.productId }} className="block">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="aspect-[4/5] w-full border border-border object-cover sm:w-26"
                        loading="lazy"
                      />
                    </Link>
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          {item.category || "Archive piece"}
                        </p>
                        <Link
                          to="/products/$productId"
                          params={{ productId: item.productId }}
                          className="mt-2 block font-heading text-2xl font-semibold leading-tight"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-2 text-sm text-muted-foreground">{formatMoney(item.price)} each</p>
                      </div>

                      <div className="flex flex-col gap-3 sm:items-end">
                        <p className="text-base font-semibold">{formatMoney(lineTotal)}</p>
                        <div className="flex h-10 w-36 items-center border border-border" aria-label={`${item.name} quantity`}>
                          <button
                            type="button"
                            className="grid size-10 place-items-center text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => decrementItem(item.productId)}
                          >
                            <Minus className="size-4" aria-hidden="true" />
                          </button>
                          <label className="sr-only" htmlFor={`quantity-${item.productId}`}>
                            {item.name} quantity
                          </label>
                          <input
                            id={`quantity-${item.productId}`}
                            type="number"
                            min="1"
                            max={item.inventory}
                            value={item.quantity}
                            className="h-full min-w-0 flex-1 border-x border-border bg-transparent text-center text-sm outline-none"
                            onChange={(event) => {
                              const nextValue = event.target.value;

                              if (nextValue === "") {
                                return;
                              }

                              const nextQuantity = Number(nextValue);

                              if (Number.isFinite(nextQuantity)) {
                                updateQuantity(item.productId, nextQuantity);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="grid size-10 place-items-center text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                            aria-label={`Increase ${item.name} quantity`}
                            disabled={hasMaxQuantity}
                            onClick={() => incrementItem(item.productId)}
                          >
                            <Plus className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-none text-muted-foreground"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 aria-hidden="true" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="checkout-title">
            <form className="border border-border p-5 sm:p-6" onSubmit={handleCheckout} noValidate>
              <h2 id="checkout-title" className="font-heading text-3xl font-semibold">
                Checkout
              </h2>

              {isLoggedOut ? (
                <Alert
                  role="status"
                  className="mt-5 rounded-none border-accent bg-accent/10 p-4 text-sm leading-6"
                >
                  <AlertTitle>Sign in to place your order.</AlertTitle>
                  <AlertDescription>Your cart will remain intact while you log in.</AlertDescription>
                  <Button asChild variant="outline" className="mt-4 h-10 rounded-none">
                    <Link to="/auth">Go to account</Link>
                  </Button>
                </Alert>
              ) : null}

              <div className="mt-6 space-y-4">
                {shippingFields.map((field) => (
                  <ShippingInput
                    key={field.id}
                    field={field.id}
                    label={field.label}
                    value={shippingAddress[field.id]}
                    error={shippingErrors[field.id]}
                    autoComplete={field.autoComplete}
                    onChange={updateShippingField}
                  />
                ))}
              </div>

              <dl className="mt-6 space-y-3 border-y border-border py-5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatMoney(subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium">{formatMoney(shipping)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-semibold">{formatMoney(total)}</dd>
                </div>
              </dl>

              {checkoutError || checkout.error ? (
                <Alert
                  variant="destructive"
                  className="mt-5 rounded-none border-destructive/40 bg-destructive/10 px-3 py-2"
                >
                  <AlertDescription>{checkoutError || getErrorMessage(checkout.error)}</AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="submit"
                className="mt-5 h-11 w-full rounded-none"
                disabled={isCheckingOut || isLoggedOut}
              >
                {isCheckingOut ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                Place order
              </Button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}

type ShippingInputProps = {
  field: ShippingField;
  label: string;
  value: string;
  error?: string;
  autoComplete: string;
  onChange: (field: ShippingField, value: string) => void;
};

function ShippingInput({ field, label, value, error, autoComplete, onChange }: ShippingInputProps) {
  const errorId = `${field}-error`;

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel className="text-sm font-semibold text-foreground" htmlFor={field}>
        {label}
      </FieldLabel>
      <Input
        id={field}
        name={field}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="h-11 rounded-none bg-background px-3 text-sm"
        onChange={(event) => onChange(field, event.target.value)}
      />
      {error ? (
        <FieldError id={errorId}>
          {error}
        </FieldError>
      ) : null}
    </Field>
  );
}
