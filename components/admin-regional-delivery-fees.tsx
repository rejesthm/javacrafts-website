"use client";

import { useState } from "react";

import type { RegionalDeliveryFees } from "@/lib/catalog";
import { formatPeso } from "@/lib/order";
import type { IslandGroup } from "@/lib/places";

type EditableRegionalFee = {
  baseFee: string;
  markup: string;
};

type EditableRegionalFees = Record<IslandGroup, EditableRegionalFee>;

const groups: ReadonlyArray<{
  id: IslandGroup;
  label: string;
  description: string;
}> = [
  {
    id: "mindanao",
    label: "Mindanao",
    description: "Regions IX–XIII and BARMM",
  },
  {
    id: "visayas",
    label: "Visayas",
    description: "Regions VI–VIII and NIR",
  },
  {
    id: "luzon",
    label: "Luzon",
    description: "NCR, CAR, Regions I–V and MIMAROPA",
  },
];

const inputClass =
  "min-h-11 w-full rounded-lg border border-[#e5ded5] bg-white px-3 py-2 text-sm tabular-nums text-brand-text transition-colors focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20";

function initialEditableFees(initialFees: RegionalDeliveryFees): EditableRegionalFees {
  return {
    mindanao: {
      baseFee: String(initialFees.mindanao.baseFee),
      markup: String(initialFees.mindanao.markup),
    },
    visayas: {
      baseFee: String(initialFees.visayas.baseFee),
      markup: String(initialFees.visayas.markup),
    },
    luzon: {
      baseFee: String(initialFees.luzon.baseFee),
      markup: String(initialFees.luzon.markup),
    },
  };
}

function pesoValue(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function AdminRegionalDeliveryFees({
  initialFees,
}: {
  initialFees: RegionalDeliveryFees;
}) {
  const [fees, setFees] = useState<EditableRegionalFees>(() =>
    initialEditableFees(initialFees),
  );

  function updateFee(
    group: IslandGroup,
    field: keyof EditableRegionalFee,
    value: string,
  ) {
    if (value && !/^\d+$/.test(value)) return;
    setFees((current) => ({
      ...current,
      [group]: { ...current[group], [field]: value },
    }));
  }

  return (
    <div className="divide-y divide-[#eee8df]">
      {groups.map((group) => {
        const fee = fees[group.id];
        const effectiveFee = pesoValue(fee.baseFee) + pesoValue(fee.markup);
        const descriptionId = `${group.id}FeeDescription`;

        return (
          <div
            key={group.id}
            className="grid gap-4 py-5 first:pt-0 last:pb-0 md:grid-cols-[minmax(11rem,1.25fr)_minmax(8rem,0.8fr)_minmax(8rem,0.8fr)_minmax(9rem,0.75fr)] md:items-end md:gap-5"
          >
            <div>
              <p className="text-sm font-semibold text-brand-text">{group.label}</p>
              <p id={descriptionId} className="mt-1 text-xs leading-5 text-brand-muted">
                {group.description}. Specific rules override this fee.
              </p>
            </div>

            <div>
              <label
                htmlFor={`${group.id}BaseFee`}
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted"
              >
                Base fee (₱)
              </label>
              <input
                id={`${group.id}BaseFee`}
                name={`${group.id}BaseFee`}
                value={fee.baseFee}
                type="number"
                min={0}
                max={500000}
                step={1}
                required
                aria-describedby={descriptionId}
                className={inputClass}
                onChange={(event) =>
                  updateFee(group.id, "baseFee", event.currentTarget.value)
                }
              />
            </div>

            <div>
              <label
                htmlFor={`${group.id}Markup`}
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted"
              >
                Markup (₱)
              </label>
              <input
                id={`${group.id}Markup`}
                name={`${group.id}Markup`}
                value={fee.markup}
                type="number"
                min={0}
                max={500000}
                step={1}
                required
                aria-describedby={descriptionId}
                className={inputClass}
                onChange={(event) =>
                  updateFee(group.id, "markup", event.currentTarget.value)
                }
              />
            </div>

            <div className="rounded-lg bg-brand-cream px-4 py-2.5 ring-1 ring-inset ring-brand-gold/15">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand-muted">
                Effective fee
              </p>
              <output
                htmlFor={`${group.id}BaseFee ${group.id}Markup`}
                aria-live="polite"
                className="mt-0.5 block text-lg font-bold tabular-nums text-brand-gold"
              >
                {formatPeso(effectiveFee)}
              </output>
            </div>
          </div>
        );
      })}
    </div>
  );
}
