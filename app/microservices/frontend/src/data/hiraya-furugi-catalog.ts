import type { Product } from "@/api";

import { productImageAssets } from "./asset-manifest";

const CATALOG_TIMESTAMP = "2026-06-23T00:00:00.000Z";

export const hirayaFurugiCatalogProducts: Product[] = [
  {
    id: "67be2d5e-ecfb-4bf9-b751-8474f9d7bcac",
    name: "Prairie Midi Dress",
    description:
      "Faded cotton midi dress with a gathered waist, lace-trim neckline, and an easy drape for warm days.",
    price: 128,
    originalPrice: 168,
    imageUrl: productImageAssets["prairie-midi-dress"].url,
    category: "Dresses",
    brand: "Hiraya Furugi",
    inventory: 4,
    isNew: true,
    createdAt: CATALOG_TIMESTAMP,
    updatedAt: CATALOG_TIMESTAMP,
  },
  {
    id: "e858df02-4a5b-4f8e-a1f4-2b6c28150d0b",
    name: "Washed Linen Work Jacket",
    description:
      "Unlined work jacket in softened linen canvas with utility pockets and a clean, boxy fall.",
    price: 154,
    imageUrl: productImageAssets["washed-linen-work-jacket"].url,
    category: "Outerwear",
    brand: "Hiraya Furugi",
    inventory: 3,
    isNew: true,
    createdAt: CATALOG_TIMESTAMP,
    updatedAt: CATALOG_TIMESTAMP,
  },
  {
    id: "760f89d0-c80f-4798-8c75-f26070eb35d8",
    name: "Indigo Straight Denim",
    description:
      "Straight-leg denim with softened fading, sturdy seams, and a worn-in hand without heavy distressing.",
    price: 116,
    imageUrl: productImageAssets["indigo-straight-denim"].url,
    category: "Denim",
    brand: "Hiraya Furugi",
    inventory: 6,
    createdAt: CATALOG_TIMESTAMP,
    updatedAt: CATALOG_TIMESTAMP,
  },
  {
    id: "99026f04-ced9-42a5-b9e3-9440c4e38902",
    name: "Cotton Lace Night Blouse",
    description:
      "Ivory cotton blouse with fine lace panels, shell buttons, and a relaxed shape for layered dressing.",
    price: 92,
    originalPrice: 118,
    imageUrl: productImageAssets["cotton-lace-night-blouse"].url,
    category: "Tops",
    brand: "Hiraya Furugi",
    inventory: 5,
    isNew: true,
    createdAt: CATALOG_TIMESTAMP,
    updatedAt: CATALOG_TIMESTAMP,
  },
  {
    id: "d68c49dd-ccfb-4965-8b70-c98d32f77d71",
    name: "Sumi Silk Scarf",
    description:
      "Light silk scarf in a charcoal wash, finished with narrow hems and a subtle natural sheen.",
    price: 64,
    imageUrl: productImageAssets["sumi-silk-scarf"].url,
    category: "Accessories",
    brand: "Hiraya Furugi",
    inventory: 8,
    createdAt: CATALOG_TIMESTAMP,
    updatedAt: CATALOG_TIMESTAMP,
  },
  {
    id: "b87e70bb-13e1-4200-87ab-d1c7698e43c6",
    name: "Wool Twill Evening Coat",
    description:
      "Long black wool coat with a narrow lapel, satin-like lining, and a quiet formal line.",
    price: 248,
    imageUrl: productImageAssets["wool-twill-evening-coat"].url,
    category: "Outerwear",
    brand: "Hiraya Furugi",
    inventory: 2,
    isNew: true,
    createdAt: CATALOG_TIMESTAMP,
    updatedAt: CATALOG_TIMESTAMP,
  },
  {
    id: "4db3c0fe-b753-42d2-a102-e26c5a9f71f5",
    name: "Patchwork Market Tote",
    description:
      "Daily tote assembled from mixed cotton remnants with reinforced handles and a soft, slouching body.",
    price: 78,
    imageUrl: productImageAssets["patchwork-market-tote"].url,
    category: "Accessories",
    brand: "Hiraya Furugi",
    inventory: 7,
    createdAt: CATALOG_TIMESTAMP,
    updatedAt: CATALOG_TIMESTAMP,
  },
  {
    id: "f7b0b8b5-7e1d-4562-9cd4-10ac3f12fe35",
    name: "Linen Tab Collar Shirt",
    description:
      "Bone linen shirt with a small tab collar, generous cuffs, and a dry hand that softens with wear.",
    price: 104,
    imageUrl: productImageAssets["linen-tab-collar-shirt"].url,
    category: "Tops",
    brand: "Hiraya Furugi",
    inventory: 5,
    createdAt: CATALOG_TIMESTAMP,
    updatedAt: CATALOG_TIMESTAMP,
  },
] satisfies Product[];

export const featuredHirayaFurugiCatalogProducts = hirayaFurugiCatalogProducts.filter((product) => product.isNew);

export const hirayaFurugiCatalogCategories = Array.from(
  new Set(hirayaFurugiCatalogProducts.map((product) => product.category)),
).sort();

export function getHirayaFurugiCatalogProduct(productId: string): Product | undefined {
  return hirayaFurugiCatalogProducts.find((product) => product.id === productId);
}
