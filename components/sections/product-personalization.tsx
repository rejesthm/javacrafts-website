"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Check, ImagePlus, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  PRODUCT_NAME,
  PRODUCT_SIZES,
  formatPeso,
  type CartPhoto,
  type ProductSizeId,
} from "@/lib/order";

const WORK_SAMPLE_IMAGES: { src: string; alt: string }[] = [
  {
    src: "/products/plaque-custom.png",
    alt: "Laser-engraved wooden plaque with portrait and personalized name",
  },
  {
    src: "/products/plaque-portrait.png",
    alt: "Wooden plaque with detailed engraved portrait on a stand",
  },
  {
    src: "/products/plaque-family.png",
    alt: "Family portrait engraved on a light wood plaque",
  },
  {
    src: "/products/plaque-appreciation.png",
    alt: "Custom appreciation plaque with photo and ceremony details",
  },
  {
    src: "/products/plaque-commemorative.png",
    alt: "Commemorative wooden plaque with engraved portrait and dedication",
  },
];

function fileToPhoto(file: File): Promise<CartPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read photo."));
        return;
      }
      resolve({
        dataUrl: reader.result,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    };
    reader.onerror = () => reject(new Error("Could not read photo."));
    reader.readAsDataURL(file);
  });
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ProductPersonalization() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { addItem, items, removeItem, total } = useCart();
  const [sizeId, setSizeId] = useState<ProductSizeId>("s");
  const [customText, setCustomText] = useState("");
  const [photo, setPhoto] = useState<CartPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

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
      setError("Please upload a JPG, PNG, or WebP image.");
      e.target.value = "";
      setPhoto(null);
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setError("Please upload an image up to 5MB.");
      e.target.value = "";
      setPhoto(null);
      return;
    }

    try {
      setPhoto(await fileToPhoto(file));
    } catch {
      setError("Could not read that photo. Please try another image.");
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

  return (
    <Section id="personalize" aria-labelledby="personalize-heading" className="py-14">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="relative min-h-[360px] overflow-hidden rounded-[24px] border border-brand-primary/15 bg-brand-primary shadow-sm">
          <Image
            src="/products/plaque-custom.png"
            alt="Personalized wooden plaque with portrait and name on display"
            fill
            className="object-cover opacity-90"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 via-brand-primary/15 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
            <h2
              id="personalize-heading"
              className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Product Personalization
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
              Choose a plaque size, upload the photo to engrave, then add the text or name
              you want included.
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-brand-primary/15 bg-brand-surface p-5 shadow-sm sm:p-6">
          <form onSubmit={onAddToCart} className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-brand-text">Choose size</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {PRODUCT_SIZES.map((size) => {
                  const selected = size.id === sizeId;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => {
                        setSizeId(size.id);
                        setAdded(false);
                      }}
                      className={`min-h-28 rounded-[16px] border p-4 text-left transition ${
                        selected
                          ? "border-brand-primary bg-brand-primary text-white shadow-md"
                          : "border-brand-primary/20 bg-brand-bg text-brand-text hover:border-brand-primary/50"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2 text-lg font-bold">
                        {size.label}
                        {selected ? <Check className="size-4" aria-hidden /> : null}
                      </span>
                      <span className={selected ? "mt-2 block text-sm text-white/80" : "mt-2 block text-sm text-brand-muted"}>
                        {size.dimensions}
                      </span>
                      <span className="mt-3 block font-semibold">{formatPeso(size.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="personalization-photo" className="block text-sm font-semibold text-brand-text">
                Upload photo
              </label>
              <label
                htmlFor="personalization-photo"
                className="mt-2 flex min-h-32 cursor-pointer items-center gap-4 rounded-[16px] border border-dashed border-brand-primary/30 bg-brand-bg p-4 transition hover:border-brand-primary/60"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white">
                  <ImagePlus className="size-6" aria-hidden />
                </span>
                <span className="min-w-0 text-sm text-brand-muted">
                  <span className="block font-semibold text-brand-text">
                    {photo ? photo.name : "Select a JPG, PNG, or WebP image"}
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
              {photo ? (
                <div className="mt-3 overflow-hidden rounded-[16px] border border-brand-primary/15">
                  <Image
                    src={photo.dataUrl}
                    alt="Uploaded personalization preview"
                    width={720}
                    height={320}
                    unoptimized
                    className="h-48 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div>
              <label htmlFor="custom-text" className="block text-sm font-semibold text-brand-text">
                Enter custom text/name
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
                className="mt-2 w-full min-h-12 rounded-[16px] border border-brand-primary/25 bg-brand-bg px-4 text-brand-text placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/25"
              />
            </div>

            {error ? (
              <p role="alert" className="rounded-[16px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
                {error}
              </p>
            ) : null}

            {added ? (
              <p className="rounded-[16px] border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-900">
                Item added. You can add another personalized plaque or proceed to checkout.
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                disabled={!canAdd}
                className="min-h-12 flex-1 rounded-full bg-brand-primary text-white hover:bg-brand-secondary"
              >
                <ShoppingBag className="mr-2 size-4" aria-hidden />
                Add to cart
              </Button>
              {items.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-12 flex-1 rounded-full border-brand-primary/25 bg-brand-surface text-brand-text hover:bg-brand-bg"
                  asChild
                >
                  <Link href="/checkout">Proceed to checkout</Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className="min-h-12 flex-1 rounded-full border-brand-primary/25 bg-brand-surface text-brand-text hover:bg-brand-bg"
                >
                  Proceed to checkout
                </Button>
              )}
            </div>
          </form>

          {items.length > 0 ? (
            <div className="mt-6 border-t border-brand-primary/10 pt-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-brand-text">
                  Cart summary ({items.length})
                </p>
                <p className="text-sm font-bold text-brand-text">{formatPeso(total)}</p>
              </div>
              <ul className="mt-3 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-[16px] bg-brand-bg p-3"
                  >
                    <Image
                      src={item.photo.dataUrl}
                      alt=""
                      width={56}
                      height={56}
                      unoptimized
                      className="h-14 w-14 rounded-[12px] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-text">
                        {item.customText}
                      </p>
                      <p className="text-xs text-brand-muted">
                        {item.sizeLabel} - {item.dimensions} - {formatPeso(item.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-surface hover:text-brand-text"
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
      </div>

      <div className="mt-12">
        <p className="text-center text-sm font-semibold text-brand-text">
          Sample work
        </p>
        <div
          className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:pb-0"
          role="list"
          aria-label="Examples of engraved plaques"
        >
          {WORK_SAMPLE_IMAGES.map((sample) => (
            <div
              key={sample.src}
              role="listitem"
              className="relative aspect-[3/4] w-[42vw] max-w-[200px] shrink-0 snap-center overflow-hidden rounded-[16px] border border-brand-primary/15 bg-brand-bg shadow-sm sm:w-auto sm:max-w-none"
            >
              <Image
                src={sample.src}
                alt={sample.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 42vw, (max-width: 1024px) 20vw, 18vw"
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
