import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { parseTripSeedData } from "../src/lib/seed/parse-trip-data";
import type { TripCatalog } from "../src/lib/types/trip-catalog";

config({ path: resolve(process.cwd(), ".env.local") });

function initFirebase() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY",
      );
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  return getFirestore();
}

async function main() {
  const seedPath = resolve(process.cwd(), "seed-data/trip2talk-v6-trip-data.json");
  const catalog = JSON.parse(readFileSync(seedPath, "utf8")) as TripCatalog;

  console.log("Trip2Talk V6 — seed tripTemplates + tripDepartures\n");
  console.log(`Source: ${seedPath}`);
  console.log(`Company: ${catalog.company.email} | ABN ${catalog.company.abn}\n`);

  const { templates, departures, flags } = parseTripSeedData(
    catalog.tripTemplates,
  );

  if (flags.length > 0) {
    console.log("══════════════════════════════════════════");
    console.log("DATA QUALITY FLAGS (review before go-live)");
    console.log("══════════════════════════════════════════");
    for (const flag of flags) {
      console.log(`  [${flag.severity.toUpperCase()}] ${flag.tripCode}`);
      console.log(`    ${flag.message}\n`);
    }
  }

  console.log(
    `Templates: ${templates.length} | Departures: ${departures.length}\n`,
  );

  const db = initFirebase();

  for (const template of templates) {
    await db.collection("tripTemplates").doc(template.tripCode).set(template, {
      merge: true,
    });
    console.log(`  ✓ tripTemplates/${template.tripCode}`);
  }

  for (const departure of departures) {
    const { docId, ...data } = departure;
    await db.collection("tripDepartures").doc(docId).set(data, { merge: true });
    console.log(
      `  ✓ tripDepartures/${docId} (${departure.startDate}, ${departure.maxSeats} seats)`,
    );
  }

  await db.collection("config").doc("company").set(
    {
      email: catalog.company.email,
      abn: catalog.company.abn,
      brandRules: catalog.company.brandRules,
    },
    { merge: true },
  );

  if (catalog.privateOneDayCustom) {
    await db
      .collection("config")
      .doc("privateOneDayCustom")
      .set(catalog.privateOneDayCustom, { merge: true });
    console.log("  ✓ config/privateOneDayCustom");
  }

  const seasonalCount = templates.filter(
    (t) =>
      t.departureType === "seasonal_on_request" ||
      t.departureType === "custom_private",
  ).length;
  const zeroDepartureTemplates = templates.filter(
    (t) => !departures.some((d) => d.tripCode === t.tripCode),
  );

  console.log("\nSummary:");
  console.log(`  tripTemplates written: ${templates.length}`);
  console.log(`  tripDepartures written: ${departures.length}`);
  console.log(
    `  templates with zero departures (admin creates manually): ${zeroDepartureTemplates.length}`,
  );
  console.log(
    `    → ${zeroDepartureTemplates.map((t) => t.tripCode).join(", ")}`,
  );
  console.log(`  seasonal/custom templates: ${seasonalCount}`);
  console.log(`  data quality flags: ${flags.length}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
