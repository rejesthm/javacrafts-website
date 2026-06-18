"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, LockKeyhole, MessageCircle, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { GHL_PAGE_SLUG_HOME, OFFER, getPrimaryContact } from "@/lib/site";
import { formatPeso, type SavedLeadInfo } from "@/lib/order";

const emptyLeadInfo: SavedLeadInfo = {
  name: "",
  email: "",
  phone: "",
  messenger: "",
  houseStreet: "",
  barangay: "",
  postalCode: "",
  city: "",
  region: "",
};

type LeadField = keyof SavedLeadInfo;

type FieldConfig = {
  id: LeadField;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
};

const fields: FieldConfig[] = [
  { id: "name", label: "Name", autoComplete: "name", required: true, placeholder: "Maria Santos" },
  {
    id: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    inputMode: "email",
    required: true,
    placeholder: "you@example.com",
  },
  {
    id: "phone",
    label: "Phone number",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
    required: true,
    placeholder: "0917 123 4567",
  },
  { id: "messenger", label: "Messenger (optional)", autoComplete: "url", placeholder: "facebook.com/yourprofile" },
  { id: "houseStreet", label: "House, street", autoComplete: "address-line1", required: true, placeholder: "123 Rizal St." },
  { id: "barangay", label: "Barangay", autoComplete: "address-line2", required: true },
  {
    id: "postalCode",
    label: "Postal code",
    autoComplete: "postal-code",
    inputMode: "numeric",
    required: true,
    placeholder: "8000",
  },
  { id: "city", label: "City / Municipality", autoComplete: "address-level2", required: true, placeholder: "Kapalong" },
  { id: "region", label: "Region / Province", autoComplete: "address-level1", required: true, placeholder: "Davao del Norte" },
];

/** PH mobile, ignoring spaces/dashes. */
const PH_MOBILE = /^(\+?63|0)9\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(info: SavedLeadInfo): Partial<Record<LeadField, string>> {
  const errs: Partial<Record<LeadField, string>> = {};
  if (!info.name.trim()) errs.name = "Please enter your name.";
  if (!EMAIL.test(info.email.trim())) errs.email = "Enter a valid email address.";
  if (!PH_MOBILE.test(info.phone.replace(/[\s-]/g, "")))
    errs.phone = "Enter a valid PH mobile number (e.g. 0917 123 4567).";
  if (!info.houseStreet.trim()) errs.houseStreet = "Please enter your house and street.";
  if (!info.barangay.trim()) errs.barangay = "Please enter your barangay.";
  if (!/^\d{4}$/.test(info.postalCode.trim())) errs.postalCode = "Postal code must be 4 digits.";
  if (!info.city.trim()) errs.city = "Please enter your city or municipality.";
  if (!info.region.trim()) errs.region = "Please enter your region or province.";
  return errs;
}

export function CheckoutClient() {
  const router = useRouter();
  const {
    items,
    total,
    ready,
    removeItem,
    clearCart,
    loadSavedLeadInfo,
    saveLeadInfo,
    clearSavedLeadInfo,
  } = useCart();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [leadInfo, setLeadInfo] = useState<SavedLeadInfo>(emptyLeadInfo);
  const [saveForNextTime, setSaveForNextTime] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<LeadField, string>>>({});
  const contact = getPrimaryContact();

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      const saved = loadSavedLeadInfo();
      if (!saved || cancelled) return;
      setLeadInfo({ ...emptyLeadInfo, ...saved });
      setSaveForNextTime(true);
    });
    return () => {
      cancelled = true;
    };
  }, [loadSavedLeadInfo]);

  function updateField(field: LeadField, value: string) {
    setLeadInfo((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function focusField(field: LeadField) {
    formRef.current
      ?.querySelector<HTMLInputElement>(`[name="${field}"]`)
      ?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty. Add a personalized item before checkout.");
      return;
    }

    const errs = validate(leadInfo);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Please fix the highlighted fields and try again.");
      focusField(Object.keys(errs)[0] as LeadField);
      return;
    }

    setPending(true);
    try {
      const formData = new FormData();
      Object.entries(leadInfo).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("country", "Philippines");
      formData.append("saveForNextTime", String(saveForNextTime));
      formData.append("pageSlug", GHL_PAGE_SLUG_HOME);
      formData.append("offer", OFFER);
      formData.append("cart", JSON.stringify(items));
      formData.append("total", String(total));

      const res = await fetch("/api/ghl-lead", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (saveForNextTime) {
        saveLeadInfo(leadInfo);
      } else {
        clearSavedLeadInfo();
      }
      clearCart();
      router.push("/thank-you");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (ready && items.length === 0) {
    return (
      <Section className="py-16">
        <div className="mx-auto max-w-2xl rounded-[24px] border border-brand-primary/15 bg-brand-surface p-8 text-center shadow-sm">
          <h1 className="font-serif text-3xl font-semibold text-brand-text">
            Your cart is empty
          </h1>
          <p className="mt-3 text-brand-muted">
            Add a personalized plaque first, then your checkout summary will appear here.
          </p>
          <Button className="mt-6 rounded-full bg-brand-primary text-white hover:bg-brand-secondary" asChild>
            <Link href="/#personalize">Add a personalized item</Link>
          </Button>
        </div>
      </Section>
    );
  }

  function renderField(field: FieldConfig) {
    const message = fieldErrors[field.id];
    const errorId = `${field.id}-error`;
    return (
      <div key={field.id}>
        <label htmlFor={field.id} className="block text-sm font-semibold text-brand-text">
          {field.label}
        </label>
        <input
          id={field.id}
          name={field.id}
          type={field.type ?? "text"}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
          required={field.required}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          value={leadInfo[field.id]}
          onChange={(e) => updateField(field.id, e.target.value)}
          className={`mt-2 w-full min-h-12 rounded-[16px] border bg-brand-bg px-4 font-normal text-brand-text placeholder:text-brand-muted/80 focus:outline-none focus:ring-2 ${
            message
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-brand-primary/25 focus:border-brand-primary focus:ring-brand-primary/25"
          }`}
        />
        {message ? (
          <p id={errorId} className="mt-1.5 text-sm text-red-700">
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <Section className="py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/#personalize"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition hover:text-brand-text"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Continue personalizing
          </Link>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">
            Almost done — where should we send it?
          </h1>
          <p className="mt-2 max-w-xl text-brand-muted">
            Add your contact and delivery details and we&apos;ll confirm the rest with you
            personally.
          </p>
        </div>
        <p className="rounded-full bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-text">
          {items.length} item{items.length === 1 ? "" : "s"} · {formatPeso(total)}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          noValidate
          className="rounded-[24px] border border-brand-primary/15 bg-brand-surface p-5 shadow-sm sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">{fields.slice(0, 4).map(renderField)}</div>

          <div className="mt-5">
            <label htmlFor="country" className="block text-sm font-semibold text-brand-text">
              Address country
            </label>
            <input
              id="country"
              value="Philippines"
              disabled
              className="mt-2 w-full min-h-12 rounded-[16px] border border-brand-primary/20 bg-brand-primary/5 px-4 font-normal text-brand-muted"
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.slice(4).map(renderField)}</div>

          <label className="mt-5 flex items-start gap-3 rounded-[16px] bg-brand-bg p-4 text-sm text-brand-text">
            <input
              type="checkbox"
              checked={saveForNextTime}
              onChange={(e) => setSaveForNextTime(e.target.checked)}
              className="mt-1 h-4 w-4 accent-brand-primary"
            />
            <span>
              <span className="font-semibold">Save this information for next time</span>
              <span className="block text-brand-muted">
                This saves your contact and address details in this browser only.
              </span>
            </span>
          </label>

          {error ? (
            <div
              role="alert"
              className="mt-5 rounded-[16px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
            >
              <p>{error}</p>
              {contact ? (
                <a
                  href={contact.href}
                  className="mt-2 inline-flex items-center gap-1.5 font-semibold text-red-900 underline underline-offset-2"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  {contact.label}
                </a>
              ) : null}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={pending || items.length === 0}
            className="mt-6 min-h-12 w-full rounded-full bg-brand-primary text-white hover:bg-brand-secondary"
          >
            <LockKeyhole className="mr-2 size-4" aria-hidden />
            {pending ? "Sending order..." : "Submit order"}
          </Button>
        </form>

        <aside className="rounded-[24px] border border-brand-primary/15 bg-brand-surface p-5 shadow-sm sm:p-6">
          <h2 className="font-serif text-2xl font-semibold text-brand-text">
            Item summary
          </h2>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="rounded-[18px] bg-brand-bg p-4">
                <div className="flex gap-4">
                  <Image
                    src={item.photo.dataUrl}
                    alt=""
                    width={96}
                    height={96}
                    unoptimized
                    className="h-24 w-24 shrink-0 rounded-[14px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-brand-text">{item.productName}</p>
                        <p className="mt-1 text-sm text-brand-muted">
                          {item.sizeLabel} · {item.dimensions}
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
                    </div>
                    <p className="mt-3 text-sm text-brand-text">
                      Text/name: <span className="font-semibold">{item.customText}</span>
                    </p>
                    <p className="mt-1 truncate text-xs text-brand-muted">
                      Photo: {item.photo.name}
                    </p>
                    <p className="mt-3 font-bold text-brand-text">{formatPeso(item.price)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-brand-primary/10 pt-5">
            <div className="flex items-center justify-between text-brand-text">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">{formatPeso(total)}</span>
            </div>
            <p className="mt-2 text-sm text-brand-muted">
              We&apos;ll confirm delivery and payment (GCash or bank transfer) with you
              personally after you submit.
            </p>
          </div>
        </aside>
      </div>
    </Section>
  );
}
