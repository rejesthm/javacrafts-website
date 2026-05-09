"use client";

import * as React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FADE_UP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.8 } },
};

const STAGGER_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface Feature {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
}

interface EthicalHeroBase {
  /**
   * The main title. Can be a string or ReactNode for complex formatting (e.g., line breaks, bolding).
   */
  title: React.ReactNode;
  /**
   * The subtitle text displayed below the main title.
   */
  subtitle: string;
  /**
   * Optional feature cards below the hero. Omit to hide the grid.
   */
  features?: Feature[];
  className?: string;
}

export type EthicalHeroProps = EthicalHeroBase &
  (
    | {
        /**
         * Custom call-to-action node.
         */
        cta: React.ReactNode;
        ctaLabel?: string;
        ctaHref?: string;
      }
    | {
        cta?: undefined;
        /**
         * The text label for the call-to-action button.
         */
        ctaLabel: string;
        /**
         * The URL the call-to-action button links to.
         */
        ctaHref: string;
      }
  );

export function EthicalHero(props: EthicalHeroProps) {
  const { title, subtitle, features = [], className } = props;
  const ctaNode =
    "cta" in props && props.cta != null ? (
      props.cta
    ) : (
      <Button size="lg" asChild>
        <a href={props.ctaHref}>{props.ctaLabel}</a>
      </Button>
    );

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={STAGGER_CONTAINER_VARIANTS}
      className={cn(
        "container mx-auto max-w-6xl px-4 py-16 sm:py-24",
        className,
      )}
    >
      <div className="mx-auto max-w-3xl text-center">
        <motion.h1
          variants={FADE_UP_VARIANTS}
          className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl"
        >
          {title}
        </motion.h1>

        <motion.p
          variants={FADE_UP_VARIANTS}
          className="mt-6 text-lg leading-8 text-muted-foreground"
        >
          {subtitle}
        </motion.p>

        <motion.div variants={FADE_UP_VARIANTS} className="mt-10">
          {ctaNode}
        </motion.div>
      </div>

      {features.length > 0 ? (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANTS}
          className="mt-16 grid grid-cols-1 gap-6 sm:mt-24 md:grid-cols-2 xl:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.a
              key={feature.id}
              href={feature.href}
              aria-label={feature.title}
              variants={FADE_UP_VARIANTS}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="block"
            >
              <Card className="group h-full overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-md">
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image
                    src={feature.imageUrl}
                    alt={feature.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 transition-colors duration-300 group-hover:bg-muted">
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.a>
          ))}
        </motion.div>
      ) : null}
    </motion.section>
  );
}
