import { useQuery } from "@tanstack/react-query";

import { listProducts, getProduct, PLACEHOLDER_PRODUCT_IMAGE, type Product } from "@/api";
import {
  fallbackProductCategories,
  fallbackProducts,
  featuredFallbackProducts,
  getFallbackProduct,
} from "@/data/product-fallbacks";

type ProductsQueryResult = {
  products: Product[];
  isFallback: boolean;
};

function normalizeProductName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findFallbackMatch(product: Product): Product | undefined {
  return (
    getFallbackProduct(product.id) ??
    fallbackProducts.find((fallbackProduct) => normalizeProductName(fallbackProduct.name) === normalizeProductName(product.name))
  );
}

export function withProductFallbacks(product: Product): Product {
  const fallback = findFallbackMatch(product);
  const hasSparseImage = !product.imageUrl || product.imageUrl === PLACEHOLDER_PRODUCT_IMAGE;

  return {
    ...(fallback ?? product),
    ...product,
    imageUrl: hasSparseImage && fallback ? fallback.imageUrl : product.imageUrl,
    description: product.description || fallback?.description || "",
    inventory: Number.isFinite(product.inventory) ? product.inventory : (fallback?.inventory ?? 0),
  };
}

export function useProductsQuery() {
  const query = useQuery({
    queryKey: ["products", "archive"],
    placeholderData: {
      products: fallbackProducts,
      isFallback: true,
    },
    queryFn: async (): Promise<ProductsQueryResult> => {
      try {
        const productList = await listProducts({ limit: 100 });
        const products = productList.products.map(withProductFallbacks);

        return {
          products: products.length > 0 ? products : fallbackProducts,
          isFallback: products.length === 0,
        };
      } catch {
        return {
          products: fallbackProducts,
          isFallback: true,
        };
      }
    },
    retry: false,
  });

  return {
    ...query,
    products: query.data?.products ?? fallbackProducts,
    categories: query.data?.products ? Array.from(new Set(query.data.products.map((product) => product.category))).sort() : fallbackProductCategories,
    isFallback: query.isError || query.isPlaceholderData || query.data?.isFallback === true,
  };
}

export function useFeaturedProductsQuery(limit = 4) {
  const query = useProductsQuery();
  const featuredProducts = query.products.filter((product) => product.isNew).slice(0, limit);

  return {
    ...query,
    products: (featuredProducts.length > 0 ? featuredProducts : featuredFallbackProducts).slice(0, limit),
  };
}

export function useProductQuery(productId: string | undefined) {
  const query = useQuery({
    enabled: Boolean(productId),
    queryKey: ["products", "detail", productId],
    placeholderData: productId ? getFallbackProduct(productId) : undefined,
    queryFn: async () => {
      try {
        return withProductFallbacks(await getProduct(productId ?? ""));
      } catch {
        return productId ? getFallbackProduct(productId) : undefined;
      }
    },
    retry: false,
  });
  const fallbackProduct = productId ? getFallbackProduct(productId) : undefined;

  return {
    ...query,
    product: query.data ?? fallbackProduct,
    isFallback: (query.isError || query.isPlaceholderData) && Boolean(fallbackProduct),
  };
}
