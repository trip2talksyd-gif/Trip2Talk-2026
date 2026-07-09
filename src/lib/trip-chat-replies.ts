import seedData from "../../seed-data/trip2talk-v6-trip-data.json";

interface TripTemplateSeed {
  tripCode: string;
  nameTH: string;
  pricing: Record<string, { amountAUD: number; note: string }>;
  knownDepartures: Array<{
    startDate: string | null;
    endDate?: string | null;
    maxSeats?: number;
    seatsBooked?: number;
  }>;
}

const templates = seedData.tripTemplates as unknown as TripTemplateSeed[];

function formatThaiDateRange(start: string, end?: string | null): string {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = end ? new Date(`${end}T00:00:00`) : null;
  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  const startLabel = `${startDate.getDate()} ${months[startDate.getMonth()]}`;
  if (!endDate) return startLabel;
  const endLabel = `${endDate.getDate()} ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
  return `${startLabel}-${endLabel.split(" ")[0]} ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
}

function findTrip(query: string): TripTemplateSeed | undefined {
  const q = query.toLowerCase();
  return templates.find(
    (t) =>
      t.tripCode.toLowerCase().includes(q) ||
      t.nameTH.toLowerCase().includes(q) ||
      q.includes(t.tripCode.toLowerCase()) ||
      (q.includes("uluru") && t.tripCode === "ULU-4D3N") ||
      (q.includes("อุลูรู") && t.tripCode === "ULU-4D3N") ||
      (q.includes("ทางช้างเผือก") && t.tripCode === "SYD-MW-WIN") ||
      (q.includes("milky") && t.tripCode === "SYD-MW-WIN") ||
      (q.includes("tasmania") && t.tripCode.startsWith("TAS")) ||
      (q.includes("แทสเมเนีย") && t.tripCode.startsWith("TAS")),
  );
}

export function buildTripLeaderReply(userMessage: string): string {
  const trip = findTrip(userMessage);

  if (!trip) {
    return "เดี๋ยวให้ Trip Leader ตัวจริงตอบต่อครับ หรือลองพิมพ์รหัสทริป เช่น ULU-4D3N หรือ TAS-3D2N นะครับ";
  }

  const departure = trip.knownDepartures.find((d) => d.startDate);
  const price =
    trip.pricing.standard?.amountAUD ??
    trip.pricing.weekday?.amountAUD ??
    Object.values(trip.pricing)[0]?.amountAUD ??
    0;

  if (!departure?.startDate) {
    return `ทริป ${trip.tripCode} เปิดจองแบบเลือกวันได้ครับ ราคาเริ่มต้น $${price.toLocaleString()} ต่อท่าน — ส่งข้อความมาได้เลย เดี๋ยว Trip Leader ช่วยเช็กคิวให้ครับ`;
  }

  const seatsLeft =
    (departure.maxSeats ?? 0) - (departure.seatsBooked ?? 0);
  const dateLabel = formatThaiDateRange(
    departure.startDate,
    departure.endDate,
  );

  return `ทริป ${trip.nameTH.split("(")[0]?.trim()} รอบหน้าคือ ${dateLabel} ครับ ${seatsLeft > 0 ? `ยังมีที่ว่างอยู่` : `ตอนนี้เต็มแล้วครับ`} ราคาเริ่มต้น $${price.toLocaleString()} ต่อท่าน พร้อมช่างภาพมืออาชีพดูแลตลอดทริปครับ อยากให้ช่วยจองที่นั่งเลยไหมครับ?`;
}
