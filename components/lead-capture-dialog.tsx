"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Mail, ShieldCheck, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isValidEmail, type SavedCheckoutLead } from "@/lib/order";

type LeadCaptureDialogProps = {
  onClose: () => void;
  /**
   * Performs the async work (save + send to CRM) and, on success, navigates to
   * checkout. Throw an Error to surface its message inline in the dialog.
   */
  onSubmit: (lead: SavedCheckoutLead) => Promise<void>;
  initialName?: string;
  initialEmail?: string;
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Mount this only while the gate is open — it manages its own focus + scroll. */
export function LeadCaptureDialog({
  onClose,
  onSubmit,
  initialName = "",
  initialEmail = "",
}: LeadCaptureDialogProps) {
  const titleId = useId();
  const descId = useId();
  const nameErrorId = useId();
  const emailErrorId = useId();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Focus management: remember the trigger, focus the first field, lock scroll,
  // and restore focus to the trigger when the dialog closes (unmounts).
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => nameRef.current?.focus(), 0);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, []);

  function requestClose() {
    if (pending) return;
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      requestClose();
      return;
    }
    if (e.key !== "Tab") return;

    // Keep Tab focus inside the dialog.
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors: { name?: string; email?: string } = {};
    if (!name.trim()) nextErrors.name = "Please enter your full name.";
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const field = nextErrors.name ? nameRef.current : null;
      (field ?? panelRef.current?.querySelector<HTMLInputElement>("#lead-email"))?.focus();
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await onSubmit({ name: name.trim(), email: email.trim() });
      // On success the caller navigates away; nothing else to do here.
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="animate-success-pop w-full max-w-md rounded-[28px] border border-brand-gold/15 bg-brand-surface p-6 shadow-craft-lg ring-1 ring-brand-gold/5 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-gold ring-1 ring-brand-gold/20"
              aria-hidden
            >
              <ShieldCheck className="size-5" />
            </span>
            <h2
              id={titleId}
              className="font-serif text-xl font-semibold text-brand-text"
            >
              Save your design
            </h2>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={pending}
            className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream hover:text-brand-text disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <p id={descId} className="mt-3 text-sm leading-relaxed text-brand-muted">
          We&apos;ll use this to save your design and follow up about this order.
          Your payment QR comes after you add delivery details.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="lead-name"
              className="block text-sm font-semibold text-brand-text"
            >
              Full name<span className="ml-0.5 text-destructive" aria-hidden>*</span>
            </label>
            <div className="group relative mt-2">
              <User
                className={`pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 transition-colors ${
                  errors.name
                    ? "text-red-400"
                    : "text-brand-gold/70 group-focus-within:text-brand-gold"
                }`}
                aria-hidden
              />
              <input
                ref={nameRef}
                id="lead-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Maria Santos"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((c) => ({ ...c, name: undefined }));
                }}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? nameErrorId : undefined}
                className={`min-h-[3.25rem] w-full rounded-2xl border bg-brand-cream pl-12 pr-4 text-base text-brand-text placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "border-brand-primary/15 focus:border-brand-gold focus:ring-brand-gold/25"
                }`}
              />
            </div>
            {errors.name ? (
              <p
                id={nameErrorId}
                role="alert"
                className="mt-1.5 text-sm font-medium text-red-700"
              >
                {errors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="lead-email"
              className="block text-sm font-semibold text-brand-text"
            >
              Email<span className="ml-0.5 text-destructive" aria-hidden>*</span>
            </label>
            <div className="group relative mt-2">
              <Mail
                className={`pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 transition-colors ${
                  errors.email
                    ? "text-red-400"
                    : "text-brand-gold/70 group-focus-within:text-brand-gold"
                }`}
                aria-hidden
              />
              <input
                id="lead-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((c) => ({ ...c, email: undefined }));
                }}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? emailErrorId : undefined}
                className={`min-h-[3.25rem] w-full rounded-2xl border bg-brand-cream pl-12 pr-4 text-base text-brand-text placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "border-brand-primary/15 focus:border-brand-gold focus:ring-brand-gold/25"
                }`}
              />
            </div>
            {errors.email ? (
              <p
                id={emailErrorId}
                role="alert"
                className="mt-1.5 text-sm font-medium text-red-700"
              >
                {errors.email}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <div
              role="alert"
              className="rounded-[16px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
            >
              {submitError}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={pending}
            className="cta-sheen min-h-12 w-full rounded-full bg-brand-primary text-brand-bg shadow-craft transition hover:bg-brand-secondary hover:shadow-craft-lg"
          >
            {pending ? "Saving..." : "Continue to checkout"}
          </Button>
          <p className="text-center text-xs text-brand-muted">
            We keep your details private and only contact you about this order.
          </p>
        </form>
      </div>
    </div>
  );
}
