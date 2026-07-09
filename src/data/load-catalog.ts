import { readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";

import type { TripCatalog, TripTemplate } from "@/lib/types/trip-catalog";

const catalogDir = resolve(process.cwd(), "src/data/trip-catalog");

function loadCatalog(): TripCatalog {
  const company = JSON.parse(
    readFileSync(join(catalogDir, "company.json"), "utf8"),
  );

  const templatesDir = join(catalogDir, "templates");
  const files = readdirSync(templatesDir).filter((f) => f.endsWith(".json"));
  const tripTemplates = files
    .map((file) =>
      JSON.parse(readFileSync(join(templatesDir, file), "utf8")) as TripTemplate,
    )
    .sort((a, b) => a.tripCode.localeCompare(b.tripCode));

  let privateOneDayCustom: TripCatalog["privateOneDayCustom"];
  try {
    privateOneDayCustom = JSON.parse(
      readFileSync(join(catalogDir, "private-one-day-custom.json"), "utf8"),
    );
  } catch {
    privateOneDayCustom = undefined;
  }

  return { company, tripTemplates, privateOneDayCustom };
}

export const tripCatalog = loadCatalog();

export const TRIP_CODES = tripCatalog.tripTemplates.map((t) => t.tripCode);

export const COMPANY = tripCatalog.company;
