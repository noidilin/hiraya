const DEFAULT_CURRENCY = "USD";
const DEFAULT_LOCALE = "en-US";

export function parseMoney(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (!value) {
    return 0;
  }

  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function formatMoney(
  amount: number,
  options: Intl.NumberFormatOptions & { locale?: string } = {},
): string {
  const { locale = DEFAULT_LOCALE, currency = DEFAULT_CURRENCY, ...formatOptions } = options;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...formatOptions,
  }).format(amount);
}

export function toMoneyString(amount: number): string {
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}
