import { NextResponse } from "next/server";

import {
  listBarangays,
  listCities,
  listProvinces,
  listRegions,
  type PsgcPlaceLevel,
} from "@/lib/places";

export const runtime = "nodejs";

function isLevel(value: string | null): value is PsgcPlaceLevel {
  return (
    value === "region" ||
    value === "province" ||
    value === "city" ||
    value === "barangay"
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const level = url.searchParams.get("level");
  if (!isLevel(level)) {
    return NextResponse.json({ error: "Invalid place level." }, { status: 400 });
  }

  const region = url.searchParams.get("region") ?? "";
  const province = url.searchParams.get("province") ?? "";
  const city = url.searchParams.get("city") ?? "";

  const options =
    level === "region"
      ? listRegions()
      : level === "province"
        ? listProvinces(region)
        : level === "city"
          ? listCities(region, province)
          : listBarangays(region, province, city);

  return NextResponse.json({ options });
}
