"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger index — multiplies a small per-item delay for grids/lists. */
  index?: number;
  /** Base delay in seconds. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "span";
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * Subtle scroll-triggered fade + slide-up. Animates once, respects
 * prefers-reduced-motion (renders static, fully visible content).
 */
export function Reveal({
  children,
  index = 0,
  delay = 0,
  className,
  as = "div",
  ...rest
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduceMotion) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: 0.55,
        delay: delay + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
