import psgcSnapshot from "@/data/psgc-q1-2026.json";

export type PsgcPlaceLevel = "region" | "province" | "city" | "barangay";

export type PsgcPlaceOption = {
  code: string;
  label: string;
};

export type PsgcAddress = {
  region: string;
  regionCode: string;
  province: string;
  provinceCode: string;
  city: string;
  cityCode: string;
  barangay: string;
  barangayCode: string;
};

type PsgcSnapshotLevel = "Reg" | "Prov" | "City" | "Mun" | "SubMun" | "Bgy";

type PsgcSnapshotPlace = {
  code: string;
  label: string;
  level: PsgcSnapshotLevel;
  parentCode: string | null;
  cityClass?: string;
  oldName?: string;
};

const places = psgcSnapshot.places as PsgcSnapshotPlace[];

function sameLabel(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function option(place: PsgcSnapshotPlace): PsgcPlaceOption {
  return {
    code: place.code,
    label: place.label,
  };
}

function byLabelOrCode<T extends PsgcSnapshotPlace>(
  values: T[],
  value: string,
) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return (
    values.find((place) => place.code === trimmed) ??
    values.find((place) => sameLabel(place.label, trimmed)) ??
    null
  );
}

function sortOptions(values: PsgcPlaceOption[]) {
  return values.toSorted((a, b) => a.label.localeCompare(b.label));
}

function regionPlaces() {
  return places.filter((place) => place.level === "Reg");
}

function resolveRegion(value: string) {
  return byLabelOrCode(regionPlaces(), value);
}

function provinceLikePlaces(region: PsgcSnapshotPlace) {
  return places.filter((place) => {
    if (place.parentCode !== region.code) return false;
    return place.level === "Prov" || place.level === "City" || place.level === "Mun";
  });
}

function resolveProvince(region: PsgcSnapshotPlace, value: string) {
  return byLabelOrCode(provinceLikePlaces(region), value);
}

function cityPlaces(province: PsgcSnapshotPlace) {
  if (province.level === "City" || province.level === "Mun") return [province];
  return places.filter((place) => {
    if (place.parentCode !== province.code) return false;
    return place.level === "City" || place.level === "Mun";
  });
}

function resolveCity(province: PsgcSnapshotPlace, value: string) {
  return byLabelOrCode(cityPlaces(province), value);
}

function barangayPlaces(city: PsgcSnapshotPlace) {
  const subMunicipalities = places.filter(
    (place) => place.level === "SubMun" && place.parentCode === city.code,
  );
  const subMunicipalityCodes = new Set(subMunicipalities.map((place) => place.code));
  return places.filter((place) => {
    if (place.level !== "Bgy") return false;
    return place.parentCode === city.code || subMunicipalityCodes.has(place.parentCode ?? "");
  });
}

function resolveBarangay(city: PsgcSnapshotPlace, value: string) {
  return byLabelOrCode(barangayPlaces(city), value);
}

export function listRegions(): PsgcPlaceOption[] {
  return sortOptions(regionPlaces().map(option));
}

export function listProvinces(region: string): PsgcPlaceOption[] {
  const resolvedRegion = resolveRegion(region);
  if (!resolvedRegion) return [];
  return sortOptions(provinceLikePlaces(resolvedRegion).map(option));
}

export function listCities(region: string, province: string): PsgcPlaceOption[] {
  const resolvedRegion = resolveRegion(region);
  if (!resolvedRegion) return [];
  const resolvedProvince = resolveProvince(resolvedRegion, province);
  if (!resolvedProvince) return [];
  return sortOptions(cityPlaces(resolvedProvince).map(option));
}

export function listBarangays(
  region: string,
  province: string,
  city: string,
): PsgcPlaceOption[] {
  const resolvedRegion = resolveRegion(region);
  if (!resolvedRegion) return [];
  const resolvedProvince = resolveProvince(resolvedRegion, province);
  if (!resolvedProvince) return [];
  const resolvedCity = resolveCity(resolvedProvince, city);
  if (!resolvedCity) return [];
  return sortOptions(barangayPlaces(resolvedCity).map(option));
}

export function validatePsgcAddress(input: {
  region: string;
  regionCode?: string;
  province: string;
  provinceCode?: string;
  city: string;
  cityCode?: string;
  barangay: string;
  barangayCode?: string;
}): PsgcAddress | null {
  const region = resolveRegion(input.regionCode || input.region);
  if (!region) return null;
  const province = resolveProvince(region, input.provinceCode || input.province);
  if (!province) return null;
  const city = resolveCity(province, input.cityCode || input.city);
  if (!city) return null;
  const barangay = resolveBarangay(city, input.barangayCode || input.barangay);
  if (!barangay) return null;

  return {
    region: region.label,
    regionCode: region.code,
    province: province.label,
    provinceCode: province.code,
    city: city.label,
    cityCode: city.code,
    barangay: barangay.label,
    barangayCode: barangay.code,
  };
}
