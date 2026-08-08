import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Boxes, ImagePlus, Layers, Tag, Trash2 } from "lucide-react";

import {
  deleteProductImageAction,
  saveCatalogAction,
  uploadProductImageAction,
} from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { getAdminSession } from "@/lib/admin-session";
import { getPublicProduct } from "@/lib/firebase/site-content";
import { BRAND_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Catalog — ${BRAND_NAME}`,
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

export default async function AdminCatalogPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const product = await getPublicProduct();
  const sizeRows = [
    ...product.sizes,
    { id: "", label: "", dimensions: "", price: 0, active: false, sortOrder: 999 },
  ];
  const styleRows = [
    ...product.styles,
    { id: "", name: "", description: "", priceAdjustment: 0, active: false, sortOrder: 999 },
  ];

  return (
    <AdminShell session={session} title="Catalog">
      <form action={saveCatalogAction} className="space-y-5">
        {/* Product info */}
        <SectionCard icon={Boxes} title="Product">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label
                htmlFor="productName"
                className="block text-sm font-medium text-brand-text mb-1.5"
              >
                Product name
              </label>
              <input
                id="productName"
                name="productName"
                defaultValue={product.name}
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-2.5 rounded-lg border border-[#e5ded5] bg-[#f8f6f3] px-4 py-2.5 text-sm font-medium text-brand-text cursor-pointer select-none h-9">
              <input
                name="productActive"
                type="checkbox"
                defaultChecked={product.active}
                className="h-4 w-4 accent-brand-gold"
              />
              Active
            </label>
          </div>
        </SectionCard>

        {/* Sizes */}
        <SectionCard icon={Tag} title="Sizes">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-[#f0ece6]">
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider w-[18%]">
                    ID
                  </th>
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider w-[20%]">
                    Label
                  </th>
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Dimensions
                  </th>
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider w-[16%]">
                    Price (₱)
                  </th>
                  <th className="pb-3 px-1 text-center text-xs font-semibold text-brand-muted uppercase tracking-wider w-[10%]">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1ec]">
                {sizeRows.map((size, index) => (
                  <tr key={`${size.id || "new"}-${index}`} className="group">
                    <td className="py-2 px-1">
                      <input
                        name="sizeId"
                        defaultValue={size.id}
                        placeholder="small-5x7"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        name="sizeLabel"
                        defaultValue={size.label}
                        placeholder="Small"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        name="sizeDimensions"
                        defaultValue={size.dimensions}
                        placeholder='5" × 7"'
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        name="sizePrice"
                        defaultValue={size.price || ""}
                        inputMode="numeric"
                        placeholder="0"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1 text-center">
                      <input
                        name="sizeActive"
                        value={index}
                        type="checkbox"
                        defaultChecked={size.active}
                        className="h-4 w-4 accent-brand-gold"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Styles */}
        <SectionCard icon={Layers} title="Engraving Styles">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-[#f0ece6]">
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider w-[16%]">
                    ID
                  </th>
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider w-[20%]">
                    Name
                  </th>
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Description
                  </th>
                  <th className="pb-3 px-1 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider w-[16%]">
                    Add-on (₱)
                  </th>
                  <th className="pb-3 px-1 text-center text-xs font-semibold text-brand-muted uppercase tracking-wider w-[10%]">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1ec]">
                {styleRows.map((style, index) => (
                  <tr key={`${style.id || "new"}-${index}`}>
                    <td className="py-2 px-1">
                      <input
                        name="styleId"
                        defaultValue={style.id}
                        placeholder="classic"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        name="styleName"
                        defaultValue={style.name}
                        placeholder="Classic"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        name="styleDescription"
                        defaultValue={style.description}
                        placeholder="Simple and elegant"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        name="stylePriceAdjustment"
                        defaultValue={style.priceAdjustment || ""}
                        inputMode="numeric"
                        placeholder="0"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 px-1 text-center">
                      <input
                        name="styleActive"
                        value={index}
                        type="checkbox"
                        defaultChecked={style.active}
                        className="h-4 w-4 accent-brand-gold"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Sample images (metadata edit) */}
        {product.sampleImages.length > 0 ? (
          <SectionCard icon={ImagePlus} title="Sample Image Details">
            <div className="grid gap-4 md:grid-cols-2">
              {product.sampleImages.map((image) => (
                <div
                  key={image.id}
                  className="flex gap-3 rounded-lg border border-[#e5ded5] bg-[#f8f6f3] p-3"
                >
                  <Image
                    src={image.src}
                    alt=""
                    width={72}
                    height={96}
                    unoptimized
                    className="h-24 w-[72px] rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="imageSrc" value={image.src} />
                    <input
                      type="hidden"
                      name="imageStoragePath"
                      value={image.storagePath ?? ""}
                    />
                    <input
                      name="imageAlt"
                      defaultValue={image.alt}
                      placeholder="Alt text"
                      className={inputClass}
                    />
                    <input
                      name="imageCaption"
                      defaultValue={image.caption}
                      placeholder="Caption"
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {/* Save button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-gold px-6 text-sm font-semibold text-white shadow-sm hover:bg-brand-gold/90 transition-colors cursor-pointer"
          >
            Save catalog
          </button>
        </div>
      </form>

      {/* Image management */}
      <div className="mt-5 space-y-5">
        <SectionCard icon={ImagePlus} title="Upload Image">
          <form
            action={uploadProductImageAction}
            className="grid gap-4 sm:grid-cols-[1fr_1fr] items-end"
          >
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Image file
              </label>
              <input
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={`${inputClass} file:mr-3 file:rounded file:border-0 file:bg-[#f0ece6] file:px-3 file:py-1 file:text-xs file:font-medium file:text-brand-text cursor-pointer`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Caption
              </label>
              <input name="caption" placeholder="e.g. Baby shower gift" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Alt text
              </label>
              <input name="alt" placeholder="Describe the image" className={inputClass} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-secondary transition-colors cursor-pointer"
              >
                <ImagePlus className="size-4" aria-hidden />
                Upload image
              </button>
            </div>
          </form>
        </SectionCard>

        {product.sampleImages.length > 0 ? (
          <SectionCard icon={Trash2} title="Remove Images">
            <div className="flex flex-wrap gap-2">
              {product.sampleImages.map((image) => (
                <form key={image.id} action={deleteProductImageAction}>
                  <input type="hidden" name="imageId" value={image.id} />
                  <button
                    type="submit"
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    {image.caption || image.id}
                  </button>
                </form>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </AdminShell>
  );
}
