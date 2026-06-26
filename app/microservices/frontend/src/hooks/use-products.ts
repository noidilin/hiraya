import { useQuery } from "@tanstack/react-query";

import { listCategories, listProducts, getProduct, PLACEHOLDER_PRODUCT_IMAGE, type Product } from "@/api";
import {
  getHirayaFurugiCatalogProduct,
  hirayaFurugiCatalogProducts,
} from "@/data/hiraya-furugi-catalog";

type ProductsQueryResult = {
  products: Product[];
  categories: string[];
};

function normalizeProductName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findCatalogMatch(product: Product): Product | undefined {
  return (
    getHirayaFurugiCatalogProduct(product.id) ??
    hirayaFurugiCatalogProducts.find((catalogProduct) => normalizeProductName(catalogProduct.name) === normalizeProductName(product.name))
  );
}

export function withCatalogPresentation(product: Product): Product {
  const catalogProduct = findCatalogMatch(product);
  const hasSparseImage = !product.imageUrl || product.imageUrl === PLACEHOLDER_PRODUCT_IMAGE;

  return {
    ...(catalogProduct ?? product),
    ...product,
    imageUrl: hasSparseImage && catalogProduct ? catalogProduct.imageUrl : product.imageUrl,
    description: product.description || catalogProduct?.description || "",
    inventory: Number.isFinite(product.inventory) ? product.inventory : (catalogProduct?.inventory ?? 0),
  };
}

export function useProductsQuery() {
  const query = useQuery({
    queryKey: ["products", "archive"],
    queryFn: async (): Promise<ProductsQueryResult> => {
      const [productList, categories] = await Promise.all([listProducts({ limit: 100 }), listCategories()]);

      return {
        products: productList.products.map(withCatalogPresentation),
        categories: categories.map((category) => category.name).sort(),
      };
    },
    retry: false,
  });

  return {
    ...query,
    products: query.data?.products ?? [],
    categories: query.data?.categories ?? [],
  };
}

export function useFeaturedProductsQuery(limit = 4) {
  const query = useProductsQuery();
  const featuredProducts = query.products.filter((product) => product.isNew).slice(0, limit);

  return {
    ...query,
    products: (featuredProducts.length > 0 ? featuredProducts : []).slice(0, limit),
  };
}

export function useProductQuery(productId: string | undefined) {
  const query = useQuery({
    enabled: Boolean(productId),
    queryKey: ["products", "detail", productId],
    queryFn: async () => withCatalogPresentation(await getProduct(productId ?? "")),
    retry: false,
  });

  return {
    ...query,
    product: query.data,
  };
}

