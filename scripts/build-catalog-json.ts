import { writeFileSync } from "fs";
import { resolve } from "path";

import { tripCatalog } from "../src/data/load-catalog";

const outPath = resolve(process.cwd(), "src/data/trip-catalog.full.json");
writeFileSync(outPath, JSON.stringify(tripCatalog, null, 2), "utf8");
console.log(`Wrote ${outPath} (${tripCatalog.tripTemplates.length} templates)`);
