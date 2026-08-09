"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  Globe,
  Hash,
  Heart,
  Home,
  LockKeyhole,
  Mail,
  Map,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  Store,
  Trash2,
  Truck,
  User,
  type LucideIcon,
} from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { PlaceSelect } from "@/components/place-select";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { GHL_PAGE_SLUG_HOME, OFFER, getPrimaryContact } from "@/lib/site";
import { formatPeso, type CartItem, type SavedLeadInfo } from "@/lib/order";
import type { DeliveryQuote, FulfillmentType } from "@/lib/catalog";
import type { PsgcPlaceOption } from "@/lib/places";

const emptyLeadInfo: SavedLeadInfo = {
  name: "",
  email: "",
  phone: "",
  messenger: "",
  fulfillmentType: "delivery",
  houseStreet: "",
  barangay: "",
  barangayCode: "",
  postalCode: "",
  city: "",
  cityCode: "",
  province: "",
  provinceCode: "",
  region: "",
  regionCode: "",
};

type LeadField = keyof SavedLeadInfo;

type FieldConfig = {
  id: LeadField;
  label: string;
  icon: LucideIcon;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  helper?: string;
};

const contactFields: FieldConfig[] = [
  { id: "name", label: "Full name", icon: User, autoComplete: "name", required: true, placeholder: "Maria Santos" },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    type: "email",
    autoComplete: "email",
    inputMode: "email",
    required: true,
    placeholder: "you@example.com",
  },
  {
    id: "phone",
    label: "Phone number",
    icon: Phone,
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
    required: true,
    placeholder: "0917 123 4567",
    helper: "Philippine mobile - e.g. 0917 123 4567",
  },
  { id: "messenger", label: "Messenger (optional)", icon: MessageCircle, autoComplete: "url", placeholder: "facebook.com/yourprofile" },
];

const PH_MOBILE = /^(\+?63|0)9\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "We confirm every detail before we engrave" },
  { icon: PackageCheck, label: "Pay securely by PayMongo QR Ph" },
  { icon: Heart, label: "Made-right guarantee on every keepsake" },
];

function optionFor(options: PsgcPlaceOption[], label: string) {
  return options.find((option) => option.label === label) ?? null;
}

async function fetchPlaces({
  level,
  region,
  province,
  city,
}: {
  level: "region" | "province" | "city" | "barangay";
  region?: string;
  province?: string;
  city?: string;
}) {
  const params = new URLSearchParams({ level });
  if (region) params.set("region", region);
  if (province) params.set("province", province);
  if (city) params.set("city", city);
  const res = await fetch(`/api/places?${params.toString()}`, { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as { options?: PsgcPlaceOption[] };
  return Array.isArray(data.options) ? data.options : [];
}

function validate(info: SavedLeadInfo): Partial<Record<LeadField, string>> {
  const errs: Partial<Record<LeadField, string>> = {};
  if (!info.name.trim()) errs.name = "Please enter your name.";
  if (!EMAIL.test(info.email.trim())) errs.email = "Enter a valid email address.";
  if (!PH_MOBILE.test(info.phone.replace(/[\s-]/g, ""))) {
    errs.phone = "Enter a valid PH mobile number (e.g. 0917 123 4567).";
  }

  if ((info.fulfillmentType ?? "delivery") === "pickup") return errs;

  if (!info.houseStreet.trim()) errs.houseStreet = "Please enter your house and street.";
  if (!info.region.trim()) errs.region = "Choose your region.";
  if (!info.province.trim()) errs.province = "Choose your province.";
  if (!info.city.trim()) errs.city = "Choose your city or municipality.";
  if (!info.barangay.trim()) errs.barangay = "Choose your barangay.";
  if (!/^\d{4}$/.test(info.postalCode.trim())) {
    errs.postalCode = "Postal code must be 4 digits.";
  }
  return errs;
}

export function CheckoutClient() {
  const router = useRouter();
  const {
    items,
    total,
    ready,
    replaceCart,
    removeItem,
    loadSavedLeadInfo,
    loadSavedCheckoutLead,
    saveLeadInfo,
    clearSavedLeadInfo,
  } = useCart();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [leadInfo, setLeadInfo] = useState<SavedLeadInfo>(emptyLeadInfo);
  const [saveForNextTime, setSaveForNextTime] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<LeadField, string>>>({});
  const [regions, setRegions] = useState<PsgcPlaceOption[]>([]);
  const [provinces, setProvinces] = useState<PsgcPlaceOption[]>([]);
  const [cities, setCities] = useState<PsgcPlaceOption[]>([]);
  const [barangays, setBarangays] = useState<PsgcPlaceOption[]>([]);
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const contact = getPrimaryContact();
  const fulfillmentType = leadInfo.fulfillmentType ?? "delivery";
  const hasQuoteInputs =
    fulfillmentType === "pickup" ||
    Boolean(leadInfo.region && leadInfo.province && leadInfo.city && leadInfo.barangay);
  const effectiveQuote = hasQuoteInputs ? quote : null;
  const orderTotal = total + (effectiveQuote?.fee ?? 0);

  useEffect(() => {
    let cancelled = false;
    fetchPlaces({ level: "region" }).then((options) => {
      if (!cancelled) setRegions(options);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!leadInfo.region) {
      return;
    }
    fetchPlaces({ level: "province", region: leadInfo.region }).then((options) => {
      if (!cancelled) setProvinces(options);
    });
    return () => {
      cancelled = true;
    };
  }, [leadInfo.region]);

  useEffect(() => {
    let cancelled = false;
    if (!leadInfo.region || !leadInfo.province) {
      return;
    }
    fetchPlaces({
      level: "city",
      region: leadInfo.region,
      province: leadInfo.province,
    }).then((options) => {
      if (!cancelled) setCities(options);
    });
    return () => {
      cancelled = true;
    };
  }, [leadInfo.region, leadInfo.province]);

  useEffect(() => {
    let cancelled = false;
    if (!leadInfo.region || !leadInfo.province || !leadInfo.city) {
      return;
    }
    fetchPlaces({
      level: "barangay",
      region: leadInfo.region,
      province: leadInfo.province,
      city: leadInfo.city,
    }).then((options) => {
      if (!cancelled) setBarangays(options);
    });
    return () => {
      cancelled = true;
    };
  }, [leadInfo.region, leadInfo.province, leadInfo.city]);

  useEffect(() => {
    let cancelled = false;
    const canQuote =
      fulfillmentType === "pickup" ||
      Boolean(leadInfo.region && leadInfo.province && leadInfo.city && leadInfo.barangay);
    if (!canQuote) {
      return;
    }

    fetch("/api/delivery-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fulfillmentType,
        region: leadInfo.region,
        regionCode: leadInfo.regionCode,
        province: leadInfo.province,
        provinceCode: leadInfo.provinceCode,
        city: leadInfo.city,
        cityCode: leadInfo.cityCode,
        barangay: leadInfo.barangay,
        barangayCode: leadInfo.barangayCode,
      }),
    })
      .then((res) => res.json())
      .then((data: { quote?: DeliveryQuote }) => {
        if (!cancelled) setQuote(data.quote ?? null);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      });

    return () => {
      cancelled = true;
    };
  }, [
    fulfillmentType,
    leadInfo.region,
    leadInfo.regionCode,
    leadInfo.province,
    leadInfo.provinceCode,
    leadInfo.city,
    leadInfo.cityCode,
    leadInfo.barangay,
    leadInfo.barangayCode,
  ]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const saved = loadSavedLeadInfo();
      if (saved) {
        setLeadInfo({ ...emptyLeadInfo, ...saved });
        setSaveForNextTime(true);
        return;
      }
      const checkoutLead = loadSavedCheckoutLead();
      if (checkoutLead) {
        setLeadInfo((current) => ({
          ...current,
          name: current.name || checkoutLead.name,
          email: current.email || checkoutLead.email,
        }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadSavedLeadInfo, loadSavedCheckoutLead]);

  function updateField(field: LeadField, value: string) {
    setLeadInfo((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function updatePlace(field: LeadField, codeField: LeadField, value: string, option: PsgcPlaceOption | null) {
    setLeadInfo((current) => ({ ...current, [field]: value, [codeField]: option?.code ?? "" }));
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

  function setFulfillment(type: FulfillmentType) {
    setLeadInfo((current) => ({
      ...current,
      fulfillmentType: type,
    }));
    setFieldErrors({});
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty. Add a personalized item before checkout.");
      return;
    }

    const errs = validate(leadInfo);
    if (fulfillmentType === "delivery") {
      if (!optionFor(regions, leadInfo.region)) errs.region = "Choose a valid region.";
      if (!optionFor(provinces, leadInfo.province)) errs.province = "Choose a valid province.";
      if (!optionFor(cities, leadInfo.city)) errs.city = "Choose a valid city or municipality.";
      if (!optionFor(barangays, leadInfo.barangay)) errs.barangay = "Choose a valid barangay.";
    }

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
        formData.append(key, String(value ?? ""));
      });
      formData.append("country", "Philippines");
      formData.append("saveForNextTime", String(saveForNextTime));
      formData.append("pageSlug", GHL_PAGE_SLUG_HOME);
      formData.append("offer", OFFER);
      formData.append("cart", JSON.stringify(items));
      formData.append("total", String(orderTotal));

      const res = await fetch("/api/checkout", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        orderId?: string;
        summary?: {
          cart?: CartItem[];
          delivery?: DeliveryQuote;
          itemSubtotal?: number;
          total?: number;
        };
      };
      if (!res.ok) {
        if (res.status === 409 && data.summary) {
          if (Array.isArray(data.summary.cart)) replaceCart(data.summary.cart);
          if (data.summary.delivery) setQuote(data.summary.delivery);
        }
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      if (!data.orderId) {
        setError("We couldn't prepare your payment QR. Please try again.");
        return;
      }

      if (saveForNextTime) {
        saveLeadInfo(leadInfo);
      } else {
        clearSavedLeadInfo();
      }
      router.push(`/checkout/pay/${data.orderId}`);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (ready && items.length === 0) {
    return (
      <Section className="py-16">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-brand-primary/12 bg-brand-surface p-8 text-center shadow-craft sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-cream text-brand-gold ring-1 ring-brand-gold/20">
            <PackageCheck className="size-7" aria-hidden />
          </div>
          <h1 className="mt-5 font-serif text-3xl font-semibold text-brand-text">
            Your cart is empty
          </h1>
          <p className="mt-3 text-brand-muted">
            Personalize a plaque first and your order summary will appear right here, ready
            to send.
          </p>
          <Button
            className="mt-6 min-h-12 rounded-full bg-brand-primary px-8 text-brand-bg shadow-craft hover:bg-brand-secondary"
            asChild
          >
            <Link href="/#personalize">Start your keepsake</Link>
          </Button>
        </div>
      </Section>
    );
  }

  function renderField(field: FieldConfig) {
    const message = fieldErrors[field.id];
    const errorId = `${field.id}-error`;
    const helperId = `${field.id}-helper`;
    const Icon = field.icon;
    return (
      <div key={field.id}>
        <label htmlFor={field.id} className="block text-sm font-semibold text-brand-text">
          {field.label}
          {field.required ? <span className="ml-0.5 text-destructive" aria-hidden>*</span> : null}
        </label>
        <div className="group relative mt-2">
          <Icon
            className={`pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 transition-colors ${
              message ? "text-red-400" : "text-brand-gold/70 group-focus-within:text-brand-gold"
            }`}
            aria-hidden
          />
          <input
            id={field.id}
            name={field.id}
            type={field.type ?? "text"}
            inputMode={field.inputMode}
            autoComplete={field.autoComplete}
            placeholder={field.placeholder}
            required={field.required}
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? errorId : field.helper ? helperId : undefined}
            value={String(leadInfo[field.id] ?? "")}
            onChange={(e) => updateField(field.id, e.target.value)}
            className={`min-h-[3.25rem] w-full rounded-2xl border bg-brand-cream pl-12 pr-4 text-base text-brand-text placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 ${
              message
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : "border-brand-primary/15 focus:border-brand-gold focus:ring-brand-gold/25"
            }`}
          />
        </div>
        {message ? (
          <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {message}
          </p>
        ) : field.helper ? (
          <p id={helperId} className="mt-1.5 text-xs text-brand-muted">
            {field.helper}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <Section className="py-12">
      <div className="mb-8">
        <Link
          href="/#personalize"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition hover:text-brand-gold"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Continue personalizing
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">
              Almost done - where should we send it?
            </h1>
            <p className="mt-2 max-w-xl text-brand-muted">
              Add your contact details, choose delivery or pickup, then generate your secure QR payment.
            </p>
          </div>
          <p className="rounded-full border border-brand-gold/25 bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-text shadow-craft">
            {items.length} item{items.length === 1 ? "" : "s"} ·{" "}
            <span className="text-brand-gold">{formatPeso(orderTotal)}</span>
          </p>
        </div>
      </div>

      <ul className="mb-8 grid gap-3 rounded-[20px] border border-brand-gold/20 bg-brand-cream p-4 sm:grid-cols-3">
        {TRUST_BADGES.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 text-sm text-brand-text">
            <Icon className="size-5 shrink-0 text-brand-gold" aria-hidden />
            {label}
          </li>
        ))}
      </ul>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          noValidate
          className="order-2 rounded-[28px] border border-brand-gold/15 bg-brand-surface p-5 shadow-craft ring-1 ring-brand-gold/5 sm:p-7 lg:order-1"
        >
          <fieldset className="border-0 p-0">
            <legend className="mb-4 flex items-center gap-3 text-base font-semibold text-brand-text">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cream text-brand-gold ring-1 ring-brand-gold/20" aria-hidden>
                <User className="size-5" strokeWidth={1.75} />
              </span>
              Your contact details
            </legend>
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              {contactFields.map(renderField)}
            </div>
          </fieldset>

          <fieldset className="mt-8 border-0 p-0">
            <legend className="mb-4 flex items-center gap-3 text-base font-semibold text-brand-text">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cream text-brand-gold ring-1 ring-brand-gold/20" aria-hidden>
                <Truck className="size-5" strokeWidth={1.75} />
              </span>
              Fulfillment
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["delivery", "pickup"] as const).map((type) => {
                const selected = fulfillmentType === type;
                const Icon = type === "delivery" ? Truck : Store;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFulfillment(type)}
                    className={`flex min-h-20 items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-brand-gold bg-brand-primary text-white shadow-craft"
                        : "border-brand-primary/15 bg-brand-cream text-brand-text hover:border-brand-gold/50"
                    }`}
                  >
                    <Icon className={`size-5 shrink-0 ${selected ? "text-brand-gold-soft" : "text-brand-gold"}`} aria-hidden />
                    <span>
                      <span className="block font-semibold">
                        {type === "delivery" ? "Delivery" : "Free pickup"}
                      </span>
                      <span className={`mt-1 block text-xs ${selected ? "text-white/75" : "text-brand-muted"}`}>
                        {type === "delivery" ? "Charge based on your location" : "Pick up from Java Crafts"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {fulfillmentType === "delivery" ? (
            <fieldset className="mt-8 border-0 p-0">
              <legend className="mb-4 flex items-center gap-3 text-base font-semibold text-brand-text">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cream text-brand-gold ring-1 ring-brand-gold/20" aria-hidden>
                  <MapPin className="size-5" strokeWidth={1.75} />
                </span>
                Delivery address
              </legend>
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  {renderField({
                    id: "houseStreet",
                    label: "House, street",
                    icon: Home,
                    autoComplete: "address-line1",
                    required: true,
                    placeholder: "123 Rizal St.",
                  })}
                </div>
                <PlaceSelect
                  id="region"
                  label="Region"
                  icon={Map}
                  value={leadInfo.region}
                  options={regions}
                  message={fieldErrors.region}
                  onChange={(value, selected) => {
                    updatePlace("region", "regionCode", value, selected);
                    setLeadInfo((current) => ({
                      ...current,
                      province: "",
                      provinceCode: "",
                      city: "",
                      cityCode: "",
                      barangay: "",
                      barangayCode: "",
                    }));
                  }}
                />
                <PlaceSelect
                  id="province"
                  label="Province"
                  icon={Globe}
                  value={leadInfo.province}
                  options={provinces}
                  disabled={!leadInfo.region}
                  message={fieldErrors.province}
                  onChange={(value, selected) => {
                    updatePlace("province", "provinceCode", value, selected);
                    setLeadInfo((current) => ({
                      ...current,
                      city: "",
                      cityCode: "",
                      barangay: "",
                      barangayCode: "",
                    }));
                  }}
                />
                <PlaceSelect
                  id="city"
                  label="City / Municipality"
                  icon={Building2}
                  value={leadInfo.city}
                  options={cities}
                  disabled={!leadInfo.province}
                  message={fieldErrors.city}
                  onChange={(value, selected) => {
                    updatePlace("city", "cityCode", value, selected);
                    setLeadInfo((current) => ({
                      ...current,
                      barangay: "",
                      barangayCode: "",
                    }));
                  }}
                />
                <PlaceSelect
                  id="barangay"
                  label="Barangay"
                  icon={MapPin}
                  value={leadInfo.barangay}
                  options={barangays}
                  disabled={!leadInfo.city}
                  message={fieldErrors.barangay}
                  onChange={(value, selected) =>
                    updatePlace("barangay", "barangayCode", value, selected)
                  }
                />
                {renderField({
                  id: "postalCode",
                  label: "Postal code",
                  icon: Hash,
                  autoComplete: "postal-code",
                  inputMode: "numeric",
                  required: true,
                  placeholder: "8000",
                  helper: "4 digits",
                })}
                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-brand-text">
                    Country
                  </label>
                  <div className="relative mt-2">
                    <Globe className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-gold/60" aria-hidden />
                    <input
                      id="country"
                      value="Philippines"
                      disabled
                      className="min-h-[3.25rem] w-full rounded-2xl border border-brand-primary/12 bg-brand-primary/5 pl-12 pr-4 text-base text-brand-muted"
                    />
                  </div>
                </div>
              </div>
            </fieldset>
          ) : (
            <div className="mt-8 rounded-2xl border border-brand-gold/20 bg-brand-cream p-4 text-sm text-brand-text">
              <p className="flex items-center gap-2 font-semibold">
                <Check className="size-4 text-brand-gold" aria-hidden />
                Pickup selected
              </p>
              <p className="mt-1 text-brand-muted">
                We&apos;ll coordinate your pickup schedule after confirming your design.
              </p>
            </div>
          )}

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-gold/15 bg-brand-cream p-4 text-sm text-brand-text transition hover:border-brand-gold/35">
            <input
              type="checkbox"
              checked={saveForNextTime}
              onChange={(e) => setSaveForNextTime(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-brand-gold"
            />
            <span>
              <span className="font-semibold">Save my details for next time</span>
              <span className="mt-0.5 block text-brand-muted">
                Stored only in this browser to make your next order faster.
              </span>
            </span>
          </label>

          {error ? (
            <div
              role="alert"
              className="mt-6 rounded-[16px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
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
            className="cta-sheen mt-6 min-h-12 w-full rounded-full bg-brand-primary text-brand-bg shadow-craft transition hover:bg-brand-secondary hover:shadow-craft-lg"
          >
            <LockKeyhole className="mr-2 size-4" aria-hidden />
            {pending ? "Sending your request..." : "Submit order request"}
          </Button>
          <p className="mt-3 text-center text-xs text-brand-muted">
            Your QR includes the item total and the selected fulfillment fee.
          </p>
        </form>

        <aside className="order-1 rounded-[28px] border border-brand-gold/15 bg-brand-surface p-5 shadow-craft ring-1 ring-brand-gold/5 sm:p-7 lg:order-2 lg:sticky lg:top-28">
          <h2 className="font-serif text-2xl font-semibold text-brand-text">Your order</h2>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="rounded-[18px] bg-brand-cream p-4">
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
                          {item.sizeLabel} · {item.dimensions} · {item.styleName}
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
                    </div>
                    <p className="mt-3 text-sm text-brand-text">
                      Text/name: <span className="font-semibold">{item.customText || "No engraving text"}</span>
                    </p>
                    <p className="mt-1 truncate text-xs text-brand-muted">
                      Photo: {item.photo.name}
                    </p>
                    <p className="mt-3 font-bold tabular-nums text-brand-text">
                      {formatPeso(item.price)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3 border-t border-brand-primary/10 pt-5">
            <div className="flex items-center justify-between text-brand-text">
              <span className="font-semibold">Item subtotal</span>
              <span className="font-bold tabular-nums">{formatPeso(total)}</span>
            </div>
            <div className="flex items-center justify-between text-brand-text">
              <span className="font-semibold">
                {fulfillmentType === "pickup" ? "Pickup" : "Delivery"}
              </span>
              <span className="font-bold tabular-nums">
                {effectiveQuote
                    ? formatPeso(effectiveQuote.fee)
                    : fulfillmentType === "pickup"
                      ? formatPeso(0)
                      : "Choose address"}
              </span>
            </div>
            {effectiveQuote?.label ? (
              <p className="text-xs text-brand-muted">{effectiveQuote.label}</p>
            ) : null}
            <div className="flex items-center justify-between border-t border-brand-primary/10 pt-3 text-brand-text">
              <span className="text-lg font-semibold">QR total</span>
              <span className="text-2xl font-bold tabular-nums text-brand-gold">
                {formatPeso(orderTotal)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </Section>
  );
}
