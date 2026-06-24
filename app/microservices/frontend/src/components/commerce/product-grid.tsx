import { useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";

import type { Product } from "@/api";
import { ProductCard } from "@/components/commerce/product-card";
import { AnimatedGroup } from "@/components/ui/animated-group";

type ProductGridProps = {
  products: Product[];
};

const productGridMotion: { container: Variants; item: Variants } = {
  container: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.035,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.18,
        ease: "easeOut",
      },
    },
  },
};

const reducedProductGridMotion: { container: Variants; item: Variants } = {
  container: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0,
      },
    },
  },
  item: {
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0,
      },
    },
  },
};

export function ProductGrid({ products }: ProductGridProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatedGroup
      className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
      variants={shouldReduceMotion ? reducedProductGridMotion : productGridMotion}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </AnimatedGroup>
  );
}
