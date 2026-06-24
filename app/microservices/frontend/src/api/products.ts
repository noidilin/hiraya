import { z } from "zod";

import { apiGet } from "./client";
import {
  categoryWireSchema,
  normalizeCategory,
  normalizeProduct,
  normalizeProductList,
  productListWireSchema,
  productWireSchema,
  type Category,
  type Product,
  type ProductList,
} from "./schemas";

export type ListProductsParams = {
  page?: number;
  limit?: number;
  sortBy?: "created_at" | "updated_at" | "name" | "price";
  category?: string;
  search?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
};

export async function listProducts(params: ListProductsParams = {}): Promise<ProductList> {
  const productList = await apiGet("/products", productListWireSchema, params);
  return normalizeProductList(productList);
}

export async function getProduct(productId: string): Promise<Product> {
  const product = await apiGet(`/products/${encodeURIComponent(productId)}`, productWireSchema);
  return normalizeProduct(product);
}

export async function listCategories(): Promise<Category[]> {
  const categories = await apiGet("/products/categories", z.array(categoryWireSchema));
  return categories.map(normalizeCategory);
}
