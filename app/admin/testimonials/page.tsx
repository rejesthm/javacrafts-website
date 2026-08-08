import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessageSquareHeart, Star } from "lucide-react";

import { saveTestimonialsAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { getAdminSession } from "@/lib/admin-session";
import { getPublicTestimonials } from "@/lib/firebase/site-content";
import { BRAND_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Testimonials — ${BRAND_NAME}`,
};

const inputClass =
  "min-h-9 w-full rounded-lg border border-[#e5ded5] bg-white px-3 py-1.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-colors";

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e5ded5] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#f0ece6] bg-[#faf9f7] flex items-center gap-2.5">
        <Icon className="size-4 text-brand-gold flex-shrink-0" aria-hidden />
        <h2 className="text-sm font-semibold text-brand-text">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default async function AdminTestimonialsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const content = await getPublicTestimonials();
  const rows = [
    ...content.testimonials,
    { id: "", text: "", name: "", role: "", active: false, sortOrder: 999 },
  ];

  return (
    <AdminShell session={session} title="Testimonials">
      <form action={saveTestimonialsAction} className="space-y-5">
        {/* Summary */}
        <SectionCard icon={Star} title="Summary Stats">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ratingText"
                className="block text-sm font-medium text-brand-text mb-1.5"
              >
                Rating text
              </label>
              <input
                id="ratingText"
                name="ratingText"
                defaultValue={content.summary.ratingText}
                placeholder="4.8 out of 5 stars"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="happyOrdersText"
                className="block text-sm font-medium text-brand-text mb-1.5"
              >
                Happy orders text
              </label>
              <input
                id="happyOrdersText"
                name="happyOrdersText"
                defaultValue={content.summary.happyOrdersText}
                placeholder="1,200+ happy orders"
                className={inputClass}
              />
            </div>
          </div>
        </SectionCard>

        {/* Testimonials */}
        <SectionCard icon={MessageSquareHeart} title="Testimonials">
          <div className="space-y-4">
            {rows.map((testimonial, index) => (
              <div
                key={`${testimonial.id || "new"}-${index}`}
                className="rounded-xl border border-[#e5ded5] p-4 bg-[#faf9f7]"
              >
                <input type="hidden" name="testimonialId" value={testimonial.id} />
                <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] items-end">
                  <div>
                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                      Customer name
                    </label>
                    <input
                      name="testimonialName"
                      defaultValue={testimonial.name}
                      placeholder="Maria Santos"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                      Role / location
                    </label>
                    <input
                      name="testimonialRole"
                      defaultValue={testimonial.role}
                      placeholder="Davao City"
                      className={inputClass}
                    />
                  </div>
                  <label className="flex items-center gap-2 rounded-lg border border-[#e5ded5] bg-white px-3 py-2 text-sm font-medium text-brand-text cursor-pointer select-none h-9">
                    <input
                      name="testimonialActive"
                      value={index}
                      type="checkbox"
                      defaultChecked={testimonial.active}
                      className="h-4 w-4 accent-brand-gold"
                    />
                    Active
                  </label>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                    Review
                  </label>
                  <textarea
                    name="testimonialText"
                    defaultValue={testimonial.text}
                    rows={3}
                    placeholder="Share their kind words…"
                    className={`${inputClass} min-h-[80px] py-2.5 resize-y`}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-gold px-6 text-sm font-semibold text-white shadow-sm hover:bg-brand-gold/90 transition-colors cursor-pointer"
          >
            Save testimonials
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
