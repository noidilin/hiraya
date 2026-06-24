const PRODUCT_IMAGE_BASE_URL = "/product-images";

export type AssetUse = "product-card" | "product-detail" | "home" | "manifesto" | "editorial";

export type AssetManifestEntry = {
  filename: string;
  url: string;
  alt: string;
  use: AssetUse[];
  aspectRatio: "1 / 1" | "4 / 5" | "3 / 4" | "3 / 2" | "16 / 9";
  notes: string;
};

function productImage(filename: string): string {
  return `${PRODUCT_IMAGE_BASE_URL}/${filename}`;
}

export const productImageAssets = {
  "prairie-midi-dress": {
    filename: "prairie-midi-dress.jpg",
    url: productImage("prairie-midi-dress.jpg"),
    alt: "Faded cotton prairie midi dress on a neutral studio backdrop",
    use: ["product-card", "product-detail"],
    aspectRatio: "4 / 5",
    notes: "Full garment view, soft daylight, no visible labels or logos.",
  },
  "washed-linen-work-jacket": {
    filename: "washed-linen-work-jacket.jpg",
    url: productImage("washed-linen-work-jacket.jpg"),
    alt: "Washed linen work jacket photographed flat on parchment",
    use: ["product-card", "product-detail"],
    aspectRatio: "4 / 5",
    notes: "Boxy outerwear silhouette with visible weave and mended edges.",
  },
  "indigo-straight-denim": {
    filename: "indigo-straight-denim.jpg",
    url: productImage("indigo-straight-denim.jpg"),
    alt: "Straight leg indigo denim with softened fading",
    use: ["product-card", "product-detail"],
    aspectRatio: "4 / 5",
    notes: "Clean denim study, cropped to show rise, leg, and hem condition.",
  },
  "cotton-lace-night-blouse": {
    filename: "cotton-lace-night-blouse.jpg",
    url: productImage("cotton-lace-night-blouse.jpg"),
    alt: "Ivory cotton lace blouse with shell buttons",
    use: ["product-card", "product-detail"],
    aspectRatio: "4 / 5",
    notes: "Delicate texture focus with button and lace detail visible.",
  },
  "sumi-silk-scarf": {
    filename: "sumi-silk-scarf.jpg",
    url: productImage("sumi-silk-scarf.jpg"),
    alt: "Charcoal silk scarf arranged in a loose fold",
    use: ["product-card", "product-detail"],
    aspectRatio: "4 / 5",
    notes: "Accessory image with tonal folds and natural fiber sheen.",
  },
  "wool-twill-evening-coat": {
    filename: "wool-twill-evening-coat.jpg",
    url: productImage("wool-twill-evening-coat.jpg"),
    alt: "Black wool twill evening coat on a simple hanger",
    use: ["product-card", "product-detail"],
    aspectRatio: "4 / 5",
    notes: "Long coat silhouette, restrained styling, no branded hardware.",
  },
  "patchwork-market-tote": {
    filename: "patchwork-market-tote.jpg",
    url: productImage("patchwork-market-tote.jpg"),
    alt: "Patchwork market tote made from mixed cotton remnants",
    use: ["product-card", "product-detail"],
    aspectRatio: "4 / 5",
    notes: "Soft utility bag with visible remnant panels and plain hardware.",
  },
  "linen-tab-collar-shirt": {
    filename: "linen-tab-collar-shirt.jpg",
    url: productImage("linen-tab-collar-shirt.jpg"),
    alt: "Bone linen tab collar shirt with a relaxed drape",
    use: ["product-card", "product-detail"],
    aspectRatio: "4 / 5",
    notes: "Shirting study with collar, placket, and cuff details visible.",
  },
} as const satisfies Record<string, AssetManifestEntry>;

export const editorialImageAssets = {
  "home-hero-archive-rack": {
    filename: "home-hero-archive-rack.jpg",
    url: productImage("home-hero-archive-rack.jpg"),
    alt: "Curated vintage garments on a quiet studio archive rack",
    use: ["home"],
    aspectRatio: "3 / 2",
    notes: "First-viewport editorial image for the home page.",
  },
  "manifesto-mending-table": {
    filename: "manifesto-mending-table.jpg",
    url: productImage("manifesto-mending-table.jpg"),
    alt: "Mending table with folded natural fabrics and hand tools",
    use: ["manifesto"],
    aspectRatio: "3 / 2",
    notes: "Quiet craft image for manifesto and process sections.",
  },
  "editorial-layering-study": {
    filename: "editorial-layering-study.jpg",
    url: productImage("editorial-layering-study.jpg"),
    alt: "Layered vintage textures arranged for an editorial styling study",
    use: ["editorial"],
    aspectRatio: "4 / 5",
    notes: "Collection story image for seasonal or journal sections.",
  },
} as const satisfies Record<string, AssetManifestEntry>;

export const assetManifest = {
  productImageBaseUrl: PRODUCT_IMAGE_BASE_URL,
  productImages: productImageAssets,
  editorialImages: editorialImageAssets,
};

export type ProductImageAssetKey = keyof typeof productImageAssets;
export type EditorialImageAssetKey = keyof typeof editorialImageAssets;
