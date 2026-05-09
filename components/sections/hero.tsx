"use client";

import { Gift } from "lucide-react";

import { EthicalHero } from "@/components/ui/hero-5";
import { Button } from "@/components/ui/button";
import { OrderModalTrigger } from "@/components/order-modal-provider";
import {
  AUDIENCE,
  BRAND_NAME,
  LOCATION,
  OFFER,
} from "@/lib/site";

export function Hero() {
  return (
    <div className="w-full bg-background">
      <EthicalHero
        title={
          <>
            Personalized engraved gifts
            <br />
            from <span className="font-serif">{BRAND_NAME}</span>,{" "}
            <span className="text-primary">made for your story.</span>
          </>
        }
        subtitle={`${OFFER} Built for ${AUDIENCE}. Serving ${LOCATION}.`}
        cta={
          <Button
            size="lg"
            className="min-h-14 gap-2 rounded-full px-12 text-base font-bold uppercase tracking-[0.12em] shadow-[0_8px_30px_-4px_rgba(43,30,22,0.45)] ring-2 ring-primary/25 ring-offset-2 ring-offset-background transition duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_12px_40px_-6px_rgba(43,30,22,0.55)] active:translate-y-0"
            asChild
          >
            <OrderModalTrigger>
              <Gift className="size-5 shrink-0" aria-hidden />
              Order now
            </OrderModalTrigger>
          </Button>
        }
      />
    </div>
  );
}