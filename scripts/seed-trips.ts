import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";

import { departureToRow, tripTemplateToRow } from "../src/lib/db/mappers";
import { parseTripSeedData } from "../src/lib/seed/parse-trip-data";
import { getSupabaseAdmin } from "../src/lib/supabase";
import type { MatchTags } from "../src/lib/types/database";
import type { TripCatalog } from "../src/lib/types/trip-catalog";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const seedPath = resolve(process.cwd(), "seed-data/trip2talk-v6-trip-data.json");
  const matchTagsPath = resolve(
    process.cwd(),
    "src/data/trip-catalog/match-tags.json",
  );
  const catalog = JSON.parse(readFileSync(seedPath, "utf8")) as TripCatalog;
  const matchTagsByCode = JSON.parse(
    readFileSync(matchTagsPath, "utf8"),
  ) as Record<string, MatchTags>;

  console.log("Trip2Talk v7 — seed Postgres trip_templates + trip_departures\n");
  console.log(`Source: ${seedPath}`);
  console.log(`Company: ${catalog.company.email} | ABN ${catalog.company.abn}\n`);

  const { templates, departures, flags } = parseTripSeedData(
    catalog.tripTemplates,
    matchTagsByCode,
  );

  if (flags.length > 0) {
    console.log("DATA QUALITY FLAGS:");
    for (const flag of flags) {
      console.log(`  [${flag.severity.toUpperCase()}] ${flag.tripCode}: ${flag.message}`);
    }
    console.log("");
  }

  const supabase = getSupabaseAdmin();

  for (const template of templates) {
    const { error } = await supabase
      .from("trip_templates")
      .upsert(tripTemplateToRow(template, template.matchTags), {
        onConflict: "trip_code",
      });
    if (error) throw new Error(`trip_templates/${template.tripCode}: ${error.message}`);
    console.log(`  ✓ trip_templates/${template.tripCode}`);
  }

  for (const departure of departures) {
    const { error } = await supabase
      .from("trip_departures")
      .upsert(departureToRow(departure, departure.id), { onConflict: "id" });
    if (error) throw new Error(`trip_departures/${departure.id}: ${error.message}`);
    console.log(
      `  ✓ trip_departures/${departure.id} (${departure.startDate}, ${departure.maxSeats} seats)`,
    );
  }

  await supabase.from("site_config").upsert([
    {
      key: "company",
      value: {
        email: catalog.company.email,
        abn: catalog.company.abn,
        brandRules: catalog.company.brandRules,
      },
    },
    ...(catalog.privateOneDayCustom
      ? [{ key: "privateOneDayCustom", value: catalog.privateOneDayCustom }]
      : []),
  ]);

  console.log("\nSummary:");
  console.log(`  trip_templates: ${templates.length}`);
  console.log(`  trip_departures: ${departures.length}`);
  console.log(`  match_tags loaded: ${Object.keys(matchTagsByCode).length}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
