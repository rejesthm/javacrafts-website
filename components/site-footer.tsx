import { BRAND_NAME, LOCATION } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-primary/20 bg-brand-surface/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-brand-muted">
          © {new Date().getFullYear()} {BRAND_NAME}. Handmade with care in{" "}
          {LOCATION}.
        </p>
      </div>
    </footer>
  );
}
