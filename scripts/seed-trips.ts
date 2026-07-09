import { config } from "dotenv";
import { resolve } from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { tripCatalog } from "../src/data/load-catalog";
import {
  auditTemplateBrandLanguage,
  expandCatalogToTripDocs,
} from "../src/lib/trip-catalog/expand";

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
  const catalog = tripCatalog;

  console.log("Trip2Talk V6 — seed trips from catalog\n");
  console.log(`Company: ${catalog.company.email} | ABN ${catalog.company.abn}\n`);

  const brandAudits = catalog.tripTemplates.map((t) =>
    auditTemplateBrandLanguage(t, catalog.company.brandRules.neverUse),
  );
  const withViolations = brandAudits.filter((a) => a.violations.length > 0);
  if (withViolations.length > 0) {
    console.warn("Brand language warnings (review source copy):");
    for (const audit of withViolations) {
      console.warn(`  ${audit.tripCode}: contains ${audit.violations.join(", ")}`);
    }
    console.warn("");
  }

  const tripDocs = expandCatalogToTripDocs(catalog.tripTemplates);
  console.log(
    `Expanding ${catalog.tripTemplates.length} templates → ${tripDocs.length} trip doc(s)\n`,
  );

  const db = initFirebase();
  let written = 0;

  for (const doc of tripDocs) {
    const { docId, ...data } = doc;
    await db.collection("trips").doc(docId).set(data, { merge: true });
    written += 1;
    const dateLabel = doc.fixedDate ?? "Date TBA";
    console.log(
      `  ✓ ${docId} (${doc.tripCode}, ${dateLabel}, ${doc.maxSeats} seats)`,
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
  }

  console.log(`\nDone. ${written} trip document(s) written (idempotent).`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
