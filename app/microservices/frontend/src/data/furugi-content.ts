import { editorialImageAssets, productImageAssets } from "./asset-manifest";

export const homeContent = {
  eyebrow: "Modern Furugi Boutique",
  title: "Vintage pieces, edited with restraint.",
  dek: "A considered archive of natural textures, softened tailoring, and rare garments selected for a slower rhythm of dressing.",
  primaryCta: "Enter archive",
  secondaryCta: "Read manifesto",
  heroImage: editorialImageAssets["home-hero-archive-rack"],
  collectionBands: [
    {
      title: "New in the archive",
      description: "Freshly cataloged garments with strong material presence and everyday wearability.",
      productImageKeys: ["prairie-midi-dress", "washed-linen-work-jacket", "cotton-lace-night-blouse"],
    },
    {
      title: "Texture studies",
      description: "Linen, lace, wool, denim, and silk chosen for surface, drape, and quiet age.",
      productImageKeys: ["linen-tab-collar-shirt", "indigo-straight-denim", "sumi-silk-scarf"],
    },
  ],
} as const;

export const manifestoContent = {
  eyebrow: "The Manifesto",
  title: "Keep what carries a life.",
  intro:
    "Hiraya treats old garments as usable records: repaired, remeasured, and placed back into daily rotation with care.",
  image: editorialImageAssets["manifesto-mending-table"],
  principles: [
    {
      title: "Material first",
      body: "We choose pieces for fiber, construction, drape, and the way age has softened their edges.",
    },
    {
      title: "No costume nostalgia",
      body: "The edit favors garments that sit naturally in a modern wardrobe, not replicas of another decade.",
    },
    {
      title: "Honest condition",
      body: "Wear is described plainly so patina feels informed, not hidden.",
    },
  ],
} as const;

export const editorialContent = {
  title: "Archive notes",
  image: editorialImageAssets["editorial-layering-study"],
  entries: [
    {
      title: "How we read patina",
      excerpt: "Fading, mends, and softened seams are treated as part of the garment's record.",
      image: productImageAssets["washed-linen-work-jacket"],
    },
    {
      title: "A calmer evening layer",
      excerpt: "A long black coat can make vintage feel precise without announcing itself.",
      image: productImageAssets["wool-twill-evening-coat"],
    },
    {
      title: "Small accessories, large texture",
      excerpt: "Scarves and totes carry the archive into daily use with less ceremony.",
      image: productImageAssets["sumi-silk-scarf"],
    },
  ],
} as const;

export const furugiContent = {
  home: homeContent,
  manifesto: manifestoContent,
  editorial: editorialContent,
};
