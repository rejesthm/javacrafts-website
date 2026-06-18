"use client";

import React from "react";
import { motion } from "motion/react";

export type Testimonial = {
  text: string;
  name: string;
  role: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialsColumn(props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration ?? 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, name, role }, i) => (
              <div
                className="p-8 rounded-3xl border border-brand-gold/15 shadow-craft max-w-xs w-full bg-brand-surface"
                key={`${index}-${i}`}
              >
                <p className="leading-relaxed text-brand-text">{text}</p>
                <div className="flex items-center gap-3 mt-5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold to-[#8a5e29] text-sm font-bold text-white shadow-craft"
                    aria-hidden
                  >
                    {getInitials(name)}
                  </div>
                  <div className="flex flex-col">
                    <div className="font-semibold tracking-tight leading-5 text-brand-text">
                      {name}
                    </div>
                    <div className="leading-5 tracking-tight text-brand-muted">
                      {role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
