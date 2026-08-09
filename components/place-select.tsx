"use client";

import type { LucideIcon } from "lucide-react";

import type { PsgcPlaceOption } from "@/lib/places";

type PlaceField = "region" | "province" | "city" | "barangay";

export function PlaceSelect({
  id,
  label,
  icon: Icon,
  value,
  options,
  disabled,
  message,
  onChange,
}: {
  id: PlaceField;
  label: string;
  icon: LucideIcon;
  value: string;
  options: PsgcPlaceOption[];
  disabled?: boolean;
  message?: string;
  onChange: (value: string, option: PsgcPlaceOption | null) => void;
}) {
  const errorId = `${id}-error`;
  const selectedCode =
    options.find((option) => option.label === value)?.code ?? "";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-brand-text">
        {label}<span className="ml-0.5 text-destructive" aria-hidden>*</span>
      </label>
      <div className="group relative mt-2">
        <Icon
          className={`pointer-events-none absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 transition-colors ${
            message ? "text-red-400" : "text-brand-gold/70 group-focus-within:text-brand-gold"
          }`}
          aria-hidden
        />
        <select
          id={id}
          name={id}
          value={selectedCode}
          disabled={disabled}
          required
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          onChange={(event) => {
            const selected =
              options.find((option) => option.code === event.target.value) ?? null;
            onChange(selected?.label ?? "", selected);
          }}
          className={`min-h-[3.25rem] w-full cursor-pointer rounded-2xl border bg-brand-cream pl-12 pr-10 text-base text-brand-text disabled:cursor-not-allowed disabled:bg-brand-primary/5 disabled:text-brand-muted focus:outline-none focus:ring-2 ${
            message
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-brand-primary/15 focus:border-brand-gold focus:ring-brand-gold/25"
          }`}
        >
          <option value="" disabled>
            Choose {label.toLowerCase()}
          </option>
          {options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {message ? (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
