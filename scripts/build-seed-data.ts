import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";

/** Assembles seed-data/trip2talk-v6-trip-data.json from src/data/trip-catalog/ */
function main() {
  const root = process.cwd();
  const catalogDir = join(root, "src/data/trip-catalog");

  const company = JSON.parse(
    readFileSync(join(catalogDir, "company.json"), "utf8"),
  );
  const templatesDir = join(catalogDir, "templates");
  const tripTemplates = readdirSync(templatesDir)
    .filter((f: string) => f.endsWith(".json"))
    .map((file: string) =>
      JSON.parse(readFileSync(join(templatesDir, file), "utf8")),
    )
    .sort((a: { tripCode: string }, b: { tripCode: string }) =>
      a.tripCode.localeCompare(b.tripCode),
    );

  let privateOneDayCustom;
  try {
    privateOneDayCustom = JSON.parse(
      readFileSync(join(catalogDir, "private-one-day-custom.json"), "utf8"),
    );
  } catch {
    privateOneDayCustom = undefined;
  }

  const payload = { company, tripTemplates, privateOneDayCustom };
  const outDir = resolve(root, "seed-data");
  mkdirSync(outDir, { recursive: true });
  const out = resolve(outDir, "trip2talk-v6-trip-data.json");
  writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${out} (${tripTemplates.length} templates)`);
}

main();
