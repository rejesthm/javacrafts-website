import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MapPin, Settings2, Truck } from "lucide-react";

import { saveDeliveryAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { getAdminSession } from "@/lib/admin-session";
import { getDeliverySettings } from "@/lib/firebase/site-content";
import { BRAND_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Delivery — ${BRAND_NAME}`,
};

const inputClass =
  "min-h-9 w-full rounded-lg border border-[#e5ded5] bg-white px-3 py-1.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-colors";

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e5ded5] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#f0ece6] bg-[#faf9f7]">
        <div className="flex items-center gap-2.5">
          <Icon className="size-4 text-brand-gold flex-shrink-0" aria-hidden />
          <h2 className="text-sm font-semibold text-brand-text">{title}</h2>
        </div>
        {description ? (
          <p className="mt-1 text-xs text-brand-muted">{description}</p>
        ) : null}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default async function AdminDeliveryPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const settings = await getDeliverySettings();
  const rows = [
    ...settings.rules,
    {
      id: "",
      scope: "province" as const,
      region: "",
      province: "",
      city: "",
      barangay: "",
      amount: 0,
      active: false,
      sortOrder: 999,
    },
  ];

  return (
    <AdminShell session={session} title="Delivery">
      <form action={saveDeliveryAction} className="space-y-5">
        {/* Global defaults */}
        <SectionCard icon={Settings2} title="Global Defaults">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label
                htmlFor="defaultDeliveryFee"
                className="block text-sm font-medium text-brand-text mb-1.5"
              >
                Nationwide default fee (₱)
              </label>
              <input
                id="defaultDeliveryFee"
                name="defaultDeliveryFee"
                defaultValue={settings.defaultDeliveryFee}
                inputMode="numeric"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="pickupLabel"
                className="block text-sm font-medium text-brand-text mb-1.5"
              >
                Pickup label
              </label>
              <input
                id="pickupLabel"
                name="pickupLabel"
                defaultValue={settings.pickupLabel}
                placeholder="Free pickup"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="pickupAddress"
                className="block text-sm font-medium text-brand-text mb-1.5"
              >
                Pickup address
              </label>
              <input
                id="pickupAddress"
                name="pickupAddress"
                defaultValue={settings.pickupAddress}
                placeholder="Full address"
                className={inputClass}
              />
            </div>
          </div>
        </SectionCard>

        {/* Fee rules table */}
        <SectionCard
          icon={MapPin}
          title="Fee Rules"
          description="Matching order: barangay overrides city, city overrides province, then the nationwide default applies."
        >
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-[#f0ece6]">
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider w-[12%]">
                    Scope
                  </th>
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Region
                  </th>
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Province
                  </th>
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    City
                  </th>
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Barangay
                  </th>
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider w-[10%]">
                    Fee (₱)
                  </th>
                  <th className="pb-3 px-1 text-center text-xs font-semibold text-brand-muted uppercase tracking-wider w-[8%]">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1ec]">
                {rows.map((rule, index) => (
                  <tr key={`${rule.id || "new"}-${index}`}>
                    <td className="py-2 px-1">
                      <input type="hidden" name="ruleId" value={rule.id} />
                      <select
                        name="ruleScope"
                        defaultValue={rule.scope}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="province">Province</option>
                        <option value="city">City</option>
                        <option value="barangay">Barangay</option>
                      </select>
                    </td>
                    <td className="py-2 px-1">
                      <input
                        name="ruleRegion"
                        defaultValue={rule.region}
                        placeholder="XI Davao Region"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        name="ruleProvince"
                        defaultValue={rule.province}
                        placeholder="DAVAO DEL NORTE"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        name="ruleCity"
                        defaultValue={rule.city}
                        placeholder="KAPALONG"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        name="ruleBarangay"
                        defaultValue={rule.barangay}
                        placeholder="Maniki"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        name="ruleAmount"
                        defaultValue={rule.amount || ""}
                        inputMode="numeric"
                        placeholder="0"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1 text-center">
                      <input
                        name="ruleActive"
                        value={index}
                        type="checkbox"
                        defaultChecked={rule.active}
                        className="h-4 w-4 accent-brand-gold"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-gold px-6 text-sm font-semibold text-white shadow-sm hover:bg-brand-gold/90 transition-colors cursor-pointer"
          >
            <Truck className="size-4" aria-hidden />
            Save delivery settings
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
