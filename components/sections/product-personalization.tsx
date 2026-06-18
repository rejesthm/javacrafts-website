"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Check, ImagePlus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { LeadCaptureDialog } from "@/components/lead-capture-dialog";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ui/ornament";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { GHL_PAGE_SLUG_HOME, OFFER } from "@/lib/site";
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  PRODUCT_NAME,
  PRODUCT_SIZES,
  formatPeso,
  type CartPhoto,
  type ProductSizeId,
  type SavedCheckoutLead,
} from "@/lib/order";

const WORK_SAMPLE_IMAGES: { src: string; alt: string; caption: string }[] = [
  {
    src: "/products/plaque-custom.png",
    alt: "Laser-engraved wooden plaque with portrait and personalized name",
    caption: "Custom portrait · 8×6 in · P650",
  },
  {
    src: "/products/plaque-portrait.png",
    alt: "Wooden plaque with detailed engraved portrait on a stand",
    caption: "Engraved portrait · 5×7 in · P400",
  },
  {
    src: "/products/plaque-family.png",
    alt: "Family portrait engraved on a light wood plaque",
    caption: "Family keepsake · 10×8 in · P850",
  },
  {
    src: "/products/plaque-appreciation.png",
    alt: "Custom appreciation plaque with photo and ceremony details",
    caption: "Appreciation plaque · 8×6 in · P650",
  },
  {
    src: "/products/plaque-commemorative.png",
    alt: "Commemorative wooden plaque with engraved portrait and dedication",
    caption: "Commemorative piece · 10×8 in · P850",
  },
];

/** Longest edge (px) we keep when storing the engraving photo. */
const MAX_PHOTO_EDGE = 1400;
const PHOTO_OUTPUT_QUALITY = 0.82;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Could not read photo."));
    reader.onerror = () => reject(new Error("Could not read photo."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image."));
    img.src = src;
  });
}

function approxBytes(dataUrl: string) {
  const commaIndex = dataUrl.indexOf(",");
  return Math.round((dataUrl.length - commaIndex - 1) * 0.75);
}

/**
 * Read + downscale the photo so it fits comfortably in localStorage. We accept
 * uploads up to {@link MAX_PHOTO_BYTES}, but a full-size base64 photo can exceed
 * the browser's ~5MB storage budget, so we re-encode a smaller copy for the cart.
 * Falls back to the original if anything about the resize fails.
 */
async function fileToPhoto(file: File): Promise<CartPhoto> {
  const original = await readFileAsDataUrl(file);
  try {
    const img = await loadImage(original);
    const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported.");
    // White backdrop keeps transparent PNGs from turning black once flattened.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const compressed = canvas.toDataURL("image/jpeg", PHOTO_OUTPUT_QUALITY);
    // Only keep the re-encoded copy when it actually saves space.
    if (compressed.length < original.length) {
      return {
        dataUrl: compressed,
        name: file.name,
        type: "image/jpeg",
        size: approxBytes(compressed),
      };
    }
  } catch {
    // Ignore and fall back to the original below.
  }

  return { dataUrl: original, name: file.name, type: file.type, size: file.size };
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function StepBadge({ n }: { n: number }) {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-white shadow-craft ring-4 ring-brand-gold/15"
      aria-hidden
    >
      {n}
    </span>
  );
}

export function ProductPersonalization() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const {
    addItem,
    items,
    removeItem,
    total,
    loadSavedCheckoutLead,
    saveCheckoutLead,
  } = useCart();
  const [sizeId, setSizeId] = useState<ProductSizeId>("s");
  const [customText, setCustomText] = useState("");
  const [photo, setPhoto] = useState<CartPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  const selectedSize = PRODUCT_SIZES.find((size) => size.id === sizeId)!;
  const canAdd = Boolean(customText.trim() && photo);

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setAdded(false);
    const file = e.target.files?.[0];
    if (!file) {
      setPhoto(null);
      return;
    }

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type as (typeof ACCEPTED_PHOTO_TYPES)[number])) {
      setError("That file type isn't supported. Please upload a JPG, PNG, or WebP image.");
      e.target.value = "";
      setPhoto(null);
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setError("That image is over 5MB. Please upload a photo up to 5MB.");
      e.target.value = "";
      setPhoto(null);
      return;
    }

    try {
      setPhoto(await fileToPhoto(file));
    } catch {
      setError("We couldn't read that photo. Please try another image.");
      setPhoto(null);
    }
  }

  function onAddToCart(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAdded(false);

    if (!photo || !customText.trim()) {
      setError("Choose a size, upload a photo, and enter the custom text/name.");
      return;
    }

    addItem({
      id: createId(),
      productName: PRODUCT_NAME,
      sizeId: selectedSize.id,
      sizeLabel: selectedSize.label,
      dimensions: selectedSize.dimensions,
      price: selectedSize.price,
      customText: customText.trim(),
      photo,
      createdAt: new Date().toISOString(),
    });

    setCustomText("");
    setPhoto(null);
    setAdded(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Gate checkout behind a quick name/email capture — unless we already have a
  // valid lead saved, in which case we go straight through.
  function onProceedToCheckout() {
    if (loadSavedCheckoutLead()) {
      router.push("/checkout");
      return;
    }
    setLeadOpen(true);
  }

  async function handleLeadSubmit(lead: SavedCheckoutLead) {
    // Save locally first so we keep the contact for follow-up even if the
    // network/CRM is unavailable; the send below is best-effort.
    saveCheckoutLead(lead);
    try {
      await fetch("/api/checkout-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          pageSlug: GHL_PAGE_SLUG_HOME,
          offer: OFFER,
          cart: {
            itemCount: items.length,
            total,
            items: items.map((item) => ({
              productName: item.productName,
              size: item.sizeLabel,
            })),
          },
        }),
      });
    } catch {
      // Best-effort: the lead is already saved locally for follow-up.
    }
    router.push("/checkout");
  }

  return (
    <Section id="personalize" aria-labelledby="personalize-heading" className="py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Ornament className="mb-5" />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
          Design yours in minutes
        </p>
        <h2
          id="personalize-heading"
          className="mt-4 font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl"
        >
          Personalize your keepsake
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-brand-muted">
          Pick a size, upload your photo, and add your words.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.85fr] lg:items-start">
        {/* ---- Compact verify + actions (sticky rail on desktop) ---- */}
        <Reveal className="order-2 lg:sticky lg:top-28">
          <div className="rounded-[28px] border border-brand-gold/15 bg-brand-surface p-5 shadow-craft ring-1 ring-brand-gold/5 sm:p-6">
            <p className="text-sm font-semibold text-brand-text">Your design</p>

            {/* Small verification preview */}
            <div className="mt-3 flex items-center gap-4 rounded-2xl border border-brand-gold/15 bg-brand-cream p-3">
              <div className="wood-grain-frame shrink-0 rounded-2xl p-1.5 shadow-craft">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-brand-surface ring-1 ring-black/10">
                  {photo ? (
                    <Image
                      src={photo.dataUrl}
                      alt="Your uploaded photo"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-brand-gold/70">
                      <ImagePlus className="size-6" aria-hidden />
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate font-serif text-base italic text-brand-text"
                  aria-live="polite"
                >
                  {customText.trim() || "Your engraving text"}
                </p>
                <p className="mt-1 text-xs text-brand-muted">
                  {selectedSize.label} · {selectedSize.dimensions}
                </p>
                <p className="mt-1.5 text-lg font-bold tabular-nums text-brand-gold">
                  {formatPeso(selectedSize.price)}
                </p>
              </div>
            </div>

            <form onSubmit={onAddToCart} className="mt-4 space-y-3">
              {added ? (
                <p className="flex animate-success-pop items-center gap-2 rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-900">
                  <Check className="size-5 shrink-0 rounded-full bg-green-600 p-0.5 text-white" aria-hidden />
                  Added to cart!
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={!canAdd}
                aria-describedby={!canAdd ? "add-to-cart-hint" : undefined}
                className="cta-sheen min-h-12 w-full rounded-full bg-brand-primary text-brand-bg shadow-craft transition hover:bg-brand-secondary hover:shadow-craft-lg"
              >
                <ShoppingBag className="mr-2 size-4" aria-hidden />
                Add to cart
              </Button>

              {items.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onProceedToCheckout}
                  className="min-h-12 w-full rounded-full border-brand-gold/40 bg-brand-surface text-brand-text hover:bg-brand-cream hover:text-brand-gold"
                >
                  Proceed to checkout
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className="min-h-12 w-full rounded-full border-brand-primary/20 bg-brand-surface text-brand-muted"
                >
                  Proceed to checkout
                </Button>
              )}

              {!canAdd ? (
                <p id="add-to-cart-hint" className="text-center text-sm text-brand-muted">
                  {!photo && !customText.trim()
                    ? "Upload a photo and add your text to enable “Add to cart”."
                    : !photo
                      ? "Upload a photo to enable “Add to cart”."
                      : "Add your text/name to enable “Add to cart”."}
                </p>
              ) : null}
            </form>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-brand-muted">
              <ShieldCheck className="size-3.5 text-brand-gold" aria-hidden />
              We confirm details before engraving.
            </p>

            {/* Cart summary */}
            {items.length > 0 ? (
              <div className="mt-5 border-t border-brand-primary/10 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-brand-text">
                    In your cart ({items.length})
                  </p>
                  <p className="text-sm font-bold tabular-nums text-brand-text">
                    {formatPeso(total)}
                  </p>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl bg-brand-cream p-2.5 transition hover:bg-brand-bg"
                    >
                      <Image
                        src={item.photo.dataUrl}
                        alt=""
                        width={48}
                        height={48}
                        unoptimized
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-text">
                          {item.customText}
                        </p>
                        <p className="text-xs text-brand-muted">
                          {item.sizeLabel} · {item.dimensions} · {formatPeso(item.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-surface hover:text-destructive"
                        aria-label={`Remove ${item.customText}`}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Reveal>

        {/* ---- Builder steps (primary) ---- */}
        <Reveal className="order-1">
          <div className="space-y-6 rounded-[28px] border border-brand-gold/15 bg-brand-surface p-5 shadow-craft ring-1 ring-brand-gold/5 sm:p-7">
            {/* Step 1: size */}
            <div>
              <p className="flex items-center gap-3 text-sm font-semibold text-brand-text">
                <StepBadge n={1} /> Choose a size
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {PRODUCT_SIZES.map((size) => {
                  const selected = size.id === sizeId;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setSizeId(size.id);
                        setAdded(false);
                      }}
                      className={`min-h-28 rounded-[18px] border p-4 text-left transition-all duration-200 ${
                        selected
                          ? "border-brand-gold bg-brand-primary text-white shadow-craft-lg"
                          : "border-brand-primary/15 bg-brand-cream text-brand-text hover:-translate-y-0.5 hover:border-brand-gold/50 hover:shadow-craft"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2 text-lg font-bold">
                        {size.label}
                        {selected ? (
                          <Check className="size-4 text-brand-gold-soft" aria-hidden />
                        ) : null}
                      </span>
                      <span
                        className={`mt-2 block text-sm ${
                          selected ? "text-white/80" : "text-brand-muted"
                        }`}
                      >
                        {size.dimensions}
                      </span>
                      <span
                        className={`mt-3 block font-semibold tabular-nums ${
                          selected ? "text-brand-gold-soft" : "text-brand-text"
                        }`}
                      >
                        {formatPeso(size.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: photo */}
            <div className="border-t border-brand-primary/10 pt-6">
              <label
                htmlFor="personalization-photo"
                className="flex items-center gap-3 text-sm font-semibold text-brand-text"
              >
                <StepBadge n={2} /> Upload your photo
              </label>
              <label
                htmlFor="personalization-photo"
                className="mt-4 flex min-h-32 cursor-pointer items-center gap-4 rounded-[18px] border-2 border-dashed border-brand-gold/35 bg-brand-cream p-4 transition hover:border-brand-gold hover:bg-brand-bg"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-gold text-white shadow-craft">
                  <ImagePlus className="size-6" aria-hidden />
                </span>
                <span className="min-w-0 text-sm text-brand-muted">
                  <span className="block font-semibold text-brand-text">
                    {photo ? photo.name : "Tap to select a JPG, PNG, or WebP image"}
                  </span>
                  <span className="mt-1 block">Maximum file size: 5MB</span>
                </span>
              </label>
              <input
                ref={fileInputRef}
                id="personalization-photo"
                type="file"
                accept={ACCEPTED_PHOTO_TYPES.join(",")}
                onChange={onPhotoChange}
                className="sr-only"
              />
              <p className="mt-2 text-sm text-brand-muted">
                Tip: a clear, well-lit photo engraves sharpest.
              </p>
            </div>

            {/* Step 3: text */}
            <div className="border-t border-brand-primary/10 pt-6">
              <label
                htmlFor="custom-text"
                className="flex items-center gap-3 text-sm font-semibold text-brand-text"
              >
                <StepBadge n={3} /> Add your text
              </label>
              <input
                id="custom-text"
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setAdded(false);
                }}
                maxLength={120}
                placeholder="Example: Maria, Batch 2026, Love always"
                className="mt-4 min-h-12 w-full rounded-[16px] border border-brand-primary/20 bg-brand-cream px-4 text-brand-text placeholder:text-brand-muted/70 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/25"
              />
              <p className="mt-2 text-right text-xs text-brand-muted tabular-nums">
                {customText.length}/120
              </p>
            </div>

            {error ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-[16px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
              >
                {error}
              </p>
            ) : null}
          </div>
        </Reveal>
      </div>

      {/* ---- Sample work ---- */}
      <Reveal className="mt-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
          Recent work
        </p>
        <p className="mt-2 text-center font-serif text-2xl font-semibold text-brand-text">
          A few keepsakes we&apos;ve made lately
        </p>
        <div
          className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:pb-0"
          role="list"
          aria-label="Examples of engraved plaques"
        >
          {WORK_SAMPLE_IMAGES.map((sample, i) => (
            <Reveal
              as="div"
              index={i}
              key={sample.src}
              role="listitem"
              className="group w-[42vw] max-w-[200px] shrink-0 snap-center sm:w-auto sm:max-w-none"
            >
              <figure>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] border border-brand-primary/12 bg-brand-bg shadow-craft transition-shadow duration-300 group-hover:shadow-craft-lg">
                  <Image
                    src={sample.src}
                    alt={sample.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 42vw, (max-width: 1024px) 20vw, 18vw"
                  />
                </div>
                <figcaption className="mt-2 text-center text-xs font-medium text-brand-muted">
                  {sample.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {leadOpen ? (
        <LeadCaptureDialog
          onClose={() => setLeadOpen(false)}
          onSubmit={handleLeadSubmit}
        />
      ) : null}
    </Section>
  );
}
