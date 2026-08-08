"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Check, ImagePlus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { LeadCaptureDialog } from "@/components/lead-capture-dialog";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ui/ornament";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import {
  calculateLinePrice,
  getDefaultSize,
  getDefaultStyle,
  sortedActiveImages,
  sortedActiveSizes,
  sortedActiveStyles,
  type EngravingProduct,
} from "@/lib/catalog";
import { submitCheckoutLead } from "@/lib/checkout-lead-submit";
import { GHL_PAGE_SLUG_HOME, OFFER } from "@/lib/site";
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  formatPeso,
  type CartPhoto,
  type SavedCheckoutLead,
} from "@/lib/order";

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
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const compressed = canvas.toDataURL("image/jpeg", PHOTO_OUTPUT_QUALITY);
    if (compressed.length < original.length) {
      return {
        dataUrl: compressed,
        name: file.name,
        type: "image/jpeg",
        size: approxBytes(compressed),
      };
    }
  } catch {
    // Keep the original if the browser cannot resize it.
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

export function ProductPersonalization({ product }: { product: EngravingProduct }) {
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
  const sizes = useMemo(() => sortedActiveSizes(product), [product]);
  const styles = useMemo(() => sortedActiveStyles(product), [product]);
  const sampleImages = useMemo(() => sortedActiveImages(product), [product]);
  const [sizeId, setSizeId] = useState(() => getDefaultSize(product).id);
  const [styleId, setStyleId] = useState(() => getDefaultStyle(product).id);
  const [customText, setCustomText] = useState("");
  const [photo, setPhoto] = useState<CartPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  const selectedSize = sizes.find((size) => size.id === sizeId) ?? sizes[0];
  const selectedStyle = styles.find((style) => style.id === styleId) ?? styles[0];
  const linePrice =
    product.active && selectedSize && selectedStyle
      ? calculateLinePrice({ product, sizeId: selectedSize.id, styleId: selectedStyle.id }).price
      : 0;
  const canAdd = Boolean(photo && selectedSize && selectedStyle && product.active);

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

    if (!photo || !selectedSize || !selectedStyle) {
      setError("Choose a size, upload a photo, and choose an engraving style.");
      return;
    }

    addItem({
      id: createId(),
      productId: product.id,
      productName: product.name,
      sizeId: selectedSize.id,
      sizeLabel: selectedSize.label,
      dimensions: selectedSize.dimensions,
      sizePrice: selectedSize.price,
      styleId: selectedStyle.id,
      styleName: selectedStyle.name,
      stylePriceAdjustment: selectedStyle.priceAdjustment,
      price: linePrice,
      customText: customText.trim(),
      photo,
      createdAt: new Date().toISOString(),
    });

    setCustomText("");
    setPhoto(null);
    setAdded(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onProceedToCheckout() {
    if (loadSavedCheckoutLead()) {
      router.push("/checkout");
      return;
    }
    setLeadOpen(true);
  }

  async function handleLeadSubmit(lead: SavedCheckoutLead) {
    await submitCheckoutLead({
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
          style: item.styleName,
          customText: item.customText,
          price: item.price,
        })),
      },
    });
    saveCheckoutLead(lead);
    router.push("/checkout");
  }

  if (!product.active || sizes.length === 0 || styles.length === 0) {
    return (
      <Section id="personalize" aria-labelledby="personalize-heading" className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl rounded-[8px] border border-brand-primary/12 bg-brand-surface p-8 text-center shadow-craft">
          <h2 className="font-serif text-3xl font-semibold text-brand-text">
            Personalization is temporarily paused
          </h2>
          <p className="mt-3 text-brand-muted">
            Please message us and we&apos;ll help you place your order.
          </p>
        </div>
      </Section>
    );
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
          Pick a size, upload your photo, add optional words, then choose a style.
        </p>
      </Reveal>

      <Reveal className="mx-auto mt-12 max-w-4xl">
        <form
          onSubmit={onAddToCart}
          className="space-y-6 rounded-[28px] border border-brand-gold/15 bg-brand-surface p-5 shadow-craft ring-1 ring-brand-gold/5 sm:p-7"
        >
          <div>
            <p className="flex items-center gap-3 text-sm font-semibold text-brand-text">
              <StepBadge n={1} /> Choose a size
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {sizes.map((size) => {
                const selected = size.id === selectedSize?.id;
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
                    <span className={`mt-2 block text-sm ${selected ? "text-white/80" : "text-brand-muted"}`}>
                      {size.dimensions}
                    </span>
                    <span className={`mt-3 block font-semibold tabular-nums ${selected ? "text-brand-gold-soft" : "text-brand-text"}`}>
                      {formatPeso(size.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-brand-primary/10 pt-6">
            <label
              htmlFor="personalization-photo"
              className="flex items-center gap-3 text-sm font-semibold text-brand-text"
            >
              <StepBadge n={2} /> Upload your photo
            </label>
            <label
              htmlFor="personalization-photo"
              className="mt-4 grid min-h-36 cursor-pointer gap-4 rounded-[18px] border-2 border-dashed border-brand-gold/35 bg-brand-cream p-4 transition hover:border-brand-gold hover:bg-brand-bg sm:grid-cols-[96px_1fr]"
            >
              <span className="wood-grain-frame flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl p-1.5 shadow-craft">
                <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-brand-surface text-brand-gold/70 ring-1 ring-black/10">
                  {photo ? (
                    <Image
                      src={photo.dataUrl}
                      alt="Your uploaded photo"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <ImagePlus className="size-7" aria-hidden />
                  )}
                </span>
              </span>
              <span className="min-w-0 self-center text-sm text-brand-muted">
                <span className="block font-semibold text-brand-text">
                  {photo ? photo.name : "Tap to select a JPG, PNG, or WebP image"}
                </span>
                <span className="mt-1 block">Maximum file size: 5MB</span>
                <span className="mt-3 block">Tip: a clear, well-lit photo engraves sharpest.</span>
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
          </div>

          <div className="border-t border-brand-primary/10 pt-6">
            <label
              htmlFor="custom-text"
              className="flex items-center gap-3 text-sm font-semibold text-brand-text"
            >
              <StepBadge n={3} /> Add your text <span className="font-normal text-brand-muted">(optional)</span>
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

          <div className="border-t border-brand-primary/10 pt-6">
            <p className="flex items-center gap-3 text-sm font-semibold text-brand-text">
              <StepBadge n={4} /> Choose a style
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {styles.map((style) => {
                const selected = style.id === selectedStyle?.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setStyleId(style.id);
                      setAdded(false);
                    }}
                    className={`min-h-32 rounded-[18px] border p-4 text-left transition-all duration-200 ${
                      selected
                        ? "border-brand-gold bg-brand-primary text-white shadow-craft-lg"
                        : "border-brand-primary/15 bg-brand-cream text-brand-text hover:-translate-y-0.5 hover:border-brand-gold/50 hover:shadow-craft"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-2 text-sm font-bold">
                      {style.name}
                      {selected ? (
                        <Check className="mt-0.5 size-4 shrink-0 text-brand-gold-soft" aria-hidden />
                      ) : null}
                    </span>
                    {style.description ? (
                      <span className={`mt-2 block text-xs leading-relaxed ${selected ? "text-white/80" : "text-brand-muted"}`}>
                        {style.description}
                      </span>
                    ) : null}
                    <span className={`mt-3 block text-sm font-semibold tabular-nums ${selected ? "text-brand-gold-soft" : "text-brand-text"}`}>
                      {style.priceAdjustment > 0
                        ? `+${formatPeso(style.priceAdjustment)}`
                        : "Included"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-[16px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
            >
              {error}
            </p>
          ) : null}

          <div className="border-t border-brand-primary/10 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-text">Current item</p>
                <p className="mt-1 text-sm text-brand-muted">
                  {selectedSize?.label} · {selectedSize?.dimensions} · {selectedStyle?.name}
                </p>
              </div>
              <p className="text-2xl font-bold tabular-nums text-brand-gold">
                {formatPeso(linePrice)}
              </p>
            </div>

            {added ? (
              <p className="mt-4 flex animate-success-pop items-center gap-2 rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-900">
                <Check className="size-5 shrink-0 rounded-full bg-green-600 p-0.5 text-white" aria-hidden />
                Added to cart!
              </p>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button
                type="submit"
                disabled={!canAdd}
                className="cta-sheen min-h-12 rounded-full bg-brand-primary text-brand-bg shadow-craft transition hover:bg-brand-secondary hover:shadow-craft-lg"
              >
                <ShoppingBag className="mr-2 size-4" aria-hidden />
                Add to cart
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={items.length === 0}
                onClick={onProceedToCheckout}
                className="min-h-12 rounded-full border-brand-gold/40 bg-brand-surface text-brand-text hover:bg-brand-cream hover:text-brand-gold"
              >
                Proceed to checkout
              </Button>
            </div>
            {!canAdd ? (
              <p className="mt-3 text-center text-sm text-brand-muted">
                Upload a photo to enable “Add to cart”.
              </p>
            ) : null}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-brand-muted">
              <ShieldCheck className="size-3.5 text-brand-gold" aria-hidden />
              We confirm details before engraving.
            </p>
          </div>
        </form>

        {items.length > 0 ? (
          <div className="mt-6 rounded-[24px] border border-brand-gold/15 bg-brand-surface p-5 shadow-craft ring-1 ring-brand-gold/5 sm:p-6">
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
                      {item.customText || "No engraving text"}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {item.sizeLabel} · {item.dimensions} · {item.styleName} · {formatPeso(item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-surface hover:text-destructive"
                    aria-label={`Remove ${item.customText || item.productName}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Reveal>

      {sampleImages.length > 0 ? (
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
            {sampleImages.slice(0, 5).map((sample, i) => (
              <Reveal
                as="div"
                index={i}
                key={sample.id}
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
      ) : null}

      {leadOpen ? (
        <LeadCaptureDialog
          onClose={() => setLeadOpen(false)}
          onSubmit={handleLeadSubmit}
        />
      ) : null}
    </Section>
  );
}
