import type { Firestore } from "firebase-admin/firestore";

import type { TripDeparture } from "@/lib/types/firestore";

export interface SettlementLine {
  label: string;
  amountAud: number;
}

export interface SettlementResult {
  departureId: string;
  tripCode: string;
  grossRevenueAud: number;
  totalExpensesAud: number;
  commissionAud: number;
  netPayoutAud: number;
  lines: SettlementLine[];
}

const DEFAULT_COMMISSION_RATE = 0.15;

/**
 * Calculate settlement for a completed departure — gross bookings minus expenses & commission.
 */
export async function calculateSettlement(
  db: Firestore,
  departureId: string,
  commissionRatePct = DEFAULT_COMMISSION_RATE * 100,
): Promise<SettlementResult> {
  const depSnap = await db.collection("tripDepartures").doc(departureId).get();
  if (!depSnap.exists) throw new Error("Departure not found");
  const departure = depSnap.data() as TripDeparture;

  const bookingsSnap = await db
    .collection("bookings")
    .where("departureId", "==", departureId)
    .where("paymentStatus", "==", "paid")
    .get();

  let grossRevenueAud = 0;
  for (const doc of bookingsSnap.docs) {
    const b = doc.data();
    grossRevenueAud += Number(b.totalPriceAud ?? 0);
  }

  const expensesSnap = await db
    .collection("expenses")
    .where("tripCode", "==", departure.tripCode)
    .get();

  let totalExpensesAud = 0;
  for (const doc of expensesSnap.docs) {
    const e = doc.data();
    const expenseDate = String(e.date ?? "");
    if (
      departure.startDate &&
      expenseDate >= departure.startDate &&
      (!departure.endDate || expenseDate <= departure.endDate)
    ) {
      totalExpensesAud += Number(e.amountAud ?? 0);
    }
  }

  const commissionAud = grossRevenueAud * (commissionRatePct / 100);
  const netPayoutAud = grossRevenueAud - totalExpensesAud - commissionAud;

  const lines: SettlementLine[] = [
    { label: "Gross revenue (paid bookings)", amountAud: grossRevenueAud },
    { label: "Expenses", amountAud: -totalExpensesAud },
    { label: `Commission (${commissionRatePct}%)`, amountAud: -commissionAud },
    { label: "Net payout", amountAud: netPayoutAud },
  ];

  return {
    departureId,
    tripCode: departure.tripCode,
    grossRevenueAud,
    totalExpensesAud,
    commissionAud,
    netPayoutAud,
    lines,
  };
}
