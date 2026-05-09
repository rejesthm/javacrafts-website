"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { GHL_PAGE_SLUG_HOME, OFFER } from "@/lib/site";

type OrderModalContextValue = {
  openOrderModal: () => void;
  closeOrderModal: () => void;
};

const OrderModalContext = createContext<OrderModalContextValue | null>(null);

export function useOrderModal() {
  const ctx = useContext(OrderModalContext);
  if (!ctx) {
    throw new Error("useOrderModal must be used within OrderModalProvider");
  }
  return ctx;
}

export const OrderModalTrigger = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button">
>(function OrderModalTrigger({ className, children, onClick, ...props }, ref) {
  const { openOrderModal } = useOrderModal();
  return (
    <button
      ref={ref}
      type="button"
      className={className}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) openOrderModal();
      }}
      {...props}
    >
      {children}
    </button>
  );
});

function OrderModalDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const titleId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/ghl-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          pageSlug: GHL_PAGE_SLUG_HOME,
          offer: OFFER,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      onClose();
      router.push("/thank-you");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[101] mx-auto w-full max-w-xl max-h-[min(90vh,720px)] overflow-y-auto rounded-[30px] border border-brand-primary/20 bg-brand-surface p-6 shadow-2xl sm:p-10"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-bg hover:text-brand-text"
          aria-label="Close"
        >
          <span aria-hidden className="text-2xl leading-none">
            ×
          </span>
        </button>
        <h2
          id={titleId}
          className="pr-10 text-center font-serif text-3xl font-semibold tracking-tight text-brand-text"
        >
          Ready to make it personal?
        </h2>
        <p className="mt-3 text-center text-lg text-brand-muted">
          Drop your details—we’ll follow up to confirm engraving and next steps.
        </p>
        <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="order-modal-name" className="block text-sm font-semibold text-brand-text">
              Full name
            </label>
            <input
              id="order-modal-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full min-h-11 rounded-[20px] border border-brand-primary/25 bg-brand-bg px-4 py-2 text-brand-text placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="order-modal-email" className="block text-sm font-semibold text-brand-text">
              Email
            </label>
            <input
              id="order-modal-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full min-h-11 rounded-[20px] border border-brand-primary/25 bg-brand-bg px-4 py-2 text-brand-text placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="order-modal-phone" className="block text-sm font-semibold text-brand-text">
              Phone
            </label>
            <input
              id="order-modal-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full min-h-11 rounded-[20px] border border-brand-primary/25 bg-brand-bg px-4 py-2 text-brand-text placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              placeholder="09xx xxx xxxx"
            />
          </div>
          {error ? (
            <p
              role="alert"
              className="rounded-[20px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="flex w-full min-h-12 items-center justify-center rounded-full bg-brand-primary text-base font-semibold text-white shadow-md transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            {pending ? "Sending…" : "Order Now"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function OrderModalProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const syncHashOpen = useCallback(() => {
    if (pathname === "/" && typeof window !== "undefined" && window.location.hash === "#order") {
      setOpen(true);
    }
  }, [pathname]);

  const openOrderModal = useCallback(() => {
    setOpen(true);
    if (pathname === "/" && typeof window !== "undefined") {
      window.history.replaceState(null, "", "/#order");
    }
  }, [pathname]);

  const closeOrderModal = useCallback(() => {
    setOpen(false);
    if (pathname === "/" && typeof window !== "undefined" && window.location.hash === "#order") {
      window.history.replaceState(null, "", "/");
    }
  }, [pathname]);

  useEffect(() => {
    syncHashOpen();
  }, [syncHashOpen]);

  useEffect(() => {
    function onHashChange() {
      if (pathname === "/" && window.location.hash === "#order") {
        setOpen(true);
      }
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeOrderModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOrderModal]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <OrderModalContext.Provider value={{ openOrderModal, closeOrderModal }}>
      {children}
      {open ? <OrderModalDialog onClose={closeOrderModal} /> : null}
    </OrderModalContext.Provider>
  );
}