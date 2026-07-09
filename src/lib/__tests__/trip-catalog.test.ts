import { describe, expect, it } from "vitest";

import { tripCatalog } from "@/data/load-catalog";
import {
  expandCatalogToTripDocs,
  expandTemplateToTripDocs,
  extractEnglishTitle,
} from "@/lib/trip-catalog/expand";

describe("trip catalog expansion", () => {
  it("loads all 13 trip templates", () => {
    expect(tripCatalog.tripTemplates).toHaveLength(13);
    expect(tripCatalog.company.email).toBe("trip2talksyd@gmail.com");
  });

  it("extracts English title from Thai name parentheses", () => {
    expect(
      extractEnglishTitle(
        "ทริปถ่ายภาพ 4 วัน 3 คืน: จากซิดนีย์สู่เมลเบิร์น (Victoria Photo Trip)",
      ),
    ).toBe("Victoria Photo Trip");
  });

  it("expands fixed departures into separate bookable trip docs", () => {
    const mel = tripCatalog.tripTemplates.find((t) => t.tripCode === "MEL-4D3N")!;
    const docs = expandTemplateToTripDocs(mel);

    expect(docs).toHaveLength(1);
    expect(docs[0]!.docId).toBe("MEL-4D3N__2026-02-22");
    expect(docs[0]!.fixedDate).toBe("2026-02-22");
    expect(docs[0]!.maxSeats).toBe(5);
  });

  it("creates Date TBA doc for seasonal on-request trips", () => {
    const kia = tripCatalog.tripTemplates.find((t) => t.tripCode === "KIA-1DAY")!;
    const docs = expandTemplateToTripDocs(kia);

    expect(docs).toHaveLength(1);
    expect(docs[0]!.docId).toBe("KIA-1DAY__tba");
    expect(docs[0]!.fixedDate).toBeNull();
  });

  it("expands CAN-2D1N into two departure docs", () => {
    const can = tripCatalog.tripTemplates.find((t) => t.tripCode === "CAN-2D1N")!;
    const docs = expandTemplateToTripDocs(can);

    expect(docs).toHaveLength(2);
    expect(docs.map((d) => d.docId)).toEqual([
      "CAN-2D1N__2026-10-05",
      "CAN-2D1N__2026-10-14",
    ]);
  });

  it("corrects TAS-3D2N end date to 3D2N range", () => {
    const tas = tripCatalog.tripTemplates.find((t) => t.tripCode === "TAS-3D2N")!;
    const docs = expandTemplateToTripDocs(tas);

    expect(docs[0]!.endDate).toBe("2026-03-18");
  });

  it("expands full catalog to 14 bookable trip docs (8 dated + 6 Date TBA)", () => {
    const docs = expandCatalogToTripDocs(tripCatalog.tripTemplates);
    expect(docs).toHaveLength(14);
    expect(docs.filter((d) => d.fixedDate !== null)).toHaveLength(8);
    expect(docs.filter((d) => d.fixedDate === null)).toHaveLength(6);
  });
});
