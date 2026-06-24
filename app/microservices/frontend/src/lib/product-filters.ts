import type { Product } from "@/api";

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name";

export const productSortOptions: Array<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price low to high" },
  { value: "price-desc", label: "Price high to low" },
  { value: "name", label: "Name" },
];

export type ProductFilters = {
  search?: string;
  category?: string;
  sort?: ProductSort;
};

function normalizeSearch(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export function getProductCategories(products: Product[]): string[] {
  return Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const search = normalizeSearch(filters.search);
  const category = filters.category?.trim();
  const sort = filters.sort ?? "newest";

  return products
    .filter((product) => {
      const matchesCategory = !category || product.category === category;
      const searchable = `${product.name} ${product.description} ${product.category} ${product.brand ?? ""}`.toLowerCase();
      const matchesSearch = !search || searchable.includes(search);

      return matchesCategory && matchesSearch;
    })
    .toSorted((first, second) => {
      if (sort === "price-asc") {
        return first.price - second.price;
      }

      if (sort === "price-desc") {
        return second.price - first.price;
      }

      if (sort === "name") {
        return first.name.localeCompare(second.name);
      }

      return Date.parse(second.createdAt) - Date.parse(first.createdAt);
    });
}
