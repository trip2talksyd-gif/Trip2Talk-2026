import { mapExpense } from "@/lib/db/mappers";
import { getDepartureById } from "@/lib/db/queries";
import { getSupabaseAdmin } from "@/lib/supabase";

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

export async function calculateSettlement(
  departureId: string,
  commissionRatePct = DEFAULT_COMMISSION_RATE * 100,
): Promise<SettlementResult> {
  const departure = await getDepartureById(departureId);
  if (!departure) throw new Error("Departure not found");

  const supabase = getSupabaseAdmin();

  const { data: bookings, error: bErr } = await supabase
    .from("bookings")
    .select("total_price_aud")
    .eq("departure_id", departureId)
    .eq("payment_status", "paid");

  if (bErr) throw new Error(bErr.message);

  let grossRevenueAud = 0;
  for (const b of bookings ?? []) {
    grossRevenueAud += Number(b.total_price_aud ?? 0);
  }

  const { data: expenseRows, error: eErr } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_code", departure.tripCode);

  if (eErr) throw new Error(eErr.message);

  let totalExpensesAud = 0;
  for (const row of expenseRows ?? []) {
    const e = mapExpense(row);
    if (
      departure.startDate &&
      e.date >= departure.startDate &&
      (!departure.endDate || e.date <= departure.endDate)
    ) {
      totalExpensesAud += e.amountAud;
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
