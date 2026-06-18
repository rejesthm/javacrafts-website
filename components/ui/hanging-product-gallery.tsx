"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type HangingProductItem = {
  id: string;
  title: string;
  imageUrl: string;
  alt: string;
  href?: string;
};

type LayoutConfig = {
  /** horizontal anchor % within gallery */
  leftPct: number;
  /** extra drop below rope for U-curve (px) */
  dropPx: number;
  /** static rotation in degrees */
  rotate: number;
  /** sway phase offset so cards don’t move in lockstep */
  swayDelay: number;
};

const LAYOUT: LayoutConfig[] = [
  { leftPct: 7, dropPx: 10, rotate: -4.5, swayDelay: 0 },
  { leftPct: 26, dropPx: 22, rotate: 2.8, swayDelay: 0.35 },
  { leftPct: 50, dropPx: 44, rotate: -1.8, swayDelay: 0.7 },
  { leftPct: 74, dropPx: 22, rotate: 3.6, swayDelay: 1.05 },
  { leftPct: 93, dropPx: 10, rotate: -3.2, swayDelay: 1.4 },
];

const MOBILE_LAYOUT: LayoutConfig[] = [
  { leftPct: 4, dropPx: 6, rotate: -3.5, swayDelay: 0 },
  { leftPct: 24, dropPx: 16, rotate: 2.2, swayDelay: 0.3 },
  { leftPct: 50, dropPx: 36, rotate: -1.4, swayDelay: 0.6 },
  { leftPct: 76, dropPx: 16, rotate: 2.9, swayDelay: 0.9 },
  { leftPct: 96, dropPx: 6, rotate: -2.6, swayDelay: 1.2 },
];

function RopeSvg({ className }: { className?: string }) {
  const d = "M 8 26 Q 600 78 1192 26";
  return (
    <svg
      className={cn(
        "pointer-events-none absolute left-1/2 top-0 z-10 w-[min(110%,calc(100%+2rem))] -translate-x-1/2",
        className,
      )}
      viewBox="0 0 1200 72"
      fill="none"
      aria-hidden
    >
      {/* twine: soft shadow, warm core, braided highlight */}
      <path d={d} stroke="rgba(43,30,22,0.18)" strokeWidth="3.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d={d} stroke="#a67c45" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path
        d={d}
        stroke="#e2c89c"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1.5 5"
        opacity="0.7"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Small wooden clothespin that clips the polaroid to the twine. */
function Clip() {
  return (
    <svg
      width="13"
      height="17"
      viewBox="0 0 13 17"
      fill="none"
      className="z-20 -mb-0.5 shrink-0 drop-shadow-[0_2px_3px_rgba(43,30,22,0.3)]"
      aria-hidden
    >
      <rect x="2.1" y="1.5" width="3.6" height="14" rx="1.7" fill="#c79553" />
      <rect x="2.1" y="1.5" width="3.6" height="14" rx="1.7" fill="url(#peg-shade)" />
      <rect x="7.3" y="1.5" width="3.6" height="14" rx="1.7" fill="#9c6f33" />
      <circle cx="6.5" cy="6" r="1.7" fill="none" stroke="#8c8c8c" strokeWidth="1" />
      <defs>
        <linearGradient id="peg-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function HangingCard({
  item,
  layout,
  index,
  compact,
}: {
  item: HangingProductItem;
  layout: LayoutConfig;
  index: number;
  compact: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const { leftPct, dropPx, rotate, swayDelay } = layout;
  const stringH = compact ? 10 + dropPx * 0.45 : 14 + dropPx * 0.55;

  const inner = (
    <>
      <div
        className="w-px shrink-0 bg-gradient-to-b from-[#a67c45] to-[#a67c45]/40"
        style={{ height: `${stringH}px` }}
        aria-hidden
      />
      <Clip />
      <div
        className={cn(
          "group relative z-10 w-full cursor-default rounded-lg bg-[#fffdf9] p-2 pb-2.5 shadow-[0_18px_40px_-12px_rgba(43,30,22,0.35),0_4px_12px_-4px_rgba(43,30,22,0.18)] ring-1 ring-brand-gold/15 transition-shadow duration-300 sm:rounded-xl sm:p-2.5 sm:pb-3",
          item.href &&
            "cursor-pointer hover:shadow-[0_24px_52px_-12px_rgba(43,30,22,0.45),0_6px_16px_-4px_rgba(176,122,53,0.28)]",
        )}
      >
        <div className="relative aspect-square overflow-hidden rounded-md bg-muted/30 ring-1 ring-brand-primary/10">
          <Image
            src={item.imageUrl}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 22vw, 148px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-primary/15 via-transparent to-white/10"
            aria-hidden
          />
        </div>
        <p className="mt-1.5 flex items-center justify-center gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-text transition-colors duration-300 group-hover:text-brand-gold sm:text-xs">
          {item.title}
        </p>
      </div>
    </>
  );

  return (
    <motion.div
      className="absolute top-[44px] flex min-w-[90px] w-[29vw] max-w-[118px] flex-col items-center -translate-x-1/2 sm:top-[48px] sm:max-w-[132px] sm:w-[132px] md:max-w-[148px] md:w-[148px]"
      style={{ left: `${leftPct}%` }}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 18,
        delay: 0.12 + index * 0.08,
      }}
    >
      <motion.div
        className="flex w-full flex-col items-center will-change-transform"
        style={{ transformOrigin: "50% 0%" }}
        initial={{ rotate }}
        animate={
          reduceMotion
            ? { rotate }
            : { rotate: [rotate - 1.05, rotate + 1.05, rotate - 1.05] }
        }
        transition={
          reduceMotion
            ? { type: "spring", stiffness: 180, damping: 20 }
            : {
                duration: 4.2 + (index % 3) * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
                delay: swayDelay,
              }
        }
        whileHover={{
          scale: 1.04,
          transition: { type: "spring", stiffness: 400, damping: 22 },
        }}
      >
        {item.href ? (
          <a
            href={item.href}
            className="flex w-full flex-col items-center rounded-lg no-underline outline-none transition-colors focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {inner}
          </a>
        ) : (
          inner
        )}
      </motion.div>
    </motion.div>
  );
}

export function HangingProductGallery({
  items,
  className,
}: {
  items: HangingProductItem[];
  className?: string;
}) {
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const layouts = compact ? MOBILE_LAYOUT : LAYOUT;
  const slice = items.slice(0, 5);

  return (
    <div
      className={cn(
        "relative mx-auto mt-10 w-full max-w-5xl px-1 sm:mt-14 sm:px-2",
        className,
      )}
    >
      <div
        className="relative min-h-[280px] pb-16 sm:min-h-[320px] sm:pb-20 md:min-h-[360px] md:pb-24"
        style={{ marginBottom: "-3.5rem" }}
      >
        <RopeSvg />
        {slice.map((item, index) => {
          const layout = layouts[index];
          if (!layout) return null;
          return (
            <HangingCard
              key={item.id}
              item={item}
              layout={layout}
              index={index}
              compact={compact}
            />
          );
        })}
      </div>
    </div>
  );
}
