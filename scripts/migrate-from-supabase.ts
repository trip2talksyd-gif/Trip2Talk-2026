import { config } from "dotenv";
import { resolve } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { appendFileSync, writeFileSync } from "fs";

config({ path: resolve(process.cwd(), ".env.local") });

const ERROR_LOG = resolve(process.cwd(), "migration-errors.log");
const MIGRATION_COLLECTIONS = [
  "trips",
  "bookings",
  "staff_profiles",
  "staff_commission_ledger",
  "expenses",
  "insurance_alerts",
] as const;

type MigrationCollection = (typeof MIGRATION_COLLECTIONS)[number];

const counts: Record<MigrationCollection, number> = {
  trips: 0,
  bookings: 0,
  staff_profiles: 0,
  staff_commission_ledger: 0,
  expenses: 0,
  insurance_alerts: 0,
};

interface SupabaseTourRow {
  id: string;
  trip_code: string;
  name_en: string;
  name_th: string;
  destination: string;
  duration_label: string;
  price_standard: number;
  price_private: number | null;
  max_pax: number;
  current_pax: number;
  next_date: string | null;
  status: string;
}

interface SupabaseBookingRow {
  id: string;
  tour_id: string;
  trip_code: string;
  first_name_en: string;
  last_name_en: string;
  email: string;
  phone: string;
  waiver_signed: boolean;
  booking_status: string;
  payment_method: string;
  slip_url: string | null;
  booked_at: string;
}

interface SupabaseStaffRow {
  id: string;
  pin_code: string | null;
  pin_hash: string | null;
  full_name: string;
  role: string;
  phone: string | null;
  email: string | null;
}

interface SupabaseCommissionRow {
  id: string;
  staff_id: string | null;
  tour_id: string | null;
  amount_aud: number;
  note: string | null;
  created_at: string;
}

interface SupabaseExpenseRow {
  id: string;
  amount_aud: number;
  ato_category: string;
  vendor_name: string;
  has_gst: boolean;
  gst_amount_aud: number;
  created_at: string;
}

interface SupabaseInsuranceRow {
  id: string;
  item_name: string;
  item_type: string;
  expiry_date: string;
  is_active: boolean;
}

function logError(collection: string, rowId: string, message: string): void {
  const line = `[${new Date().toISOString()}] ${collection}/${rowId}: ${message}\n`;
  appendFileSync(ERROR_LOG, line, "utf8");
}

function initFirebase(): Firestore {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in .env.local",
      );
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  return getFirestore();
}

function initSupabase(): SupabaseClient {
  const url = process.env.OLD_SUPABASE_URL;
  const key = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing OLD_SUPABASE_URL or OLD_SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapPaymentStatus(
  bookingStatus: string,
  paymentMethod: string,
): "pending" | "paid" | "pending_verification" | "failed" | "refunded" {
  if (bookingStatus === "CANCELLED") return "refunded";
  if (bookingStatus === "FULLY_PAID" || bookingStatus === "DEPOSIT_PAID") {
    return "paid";
  }
  if (paymentMethod.toLowerCase().includes("stripe")) return "pending";
  return "pending_verification";
}

function mapPaymentMethod(method: string): "stripe" | "bank_slip" {
  return method.toLowerCase().includes("stripe") ? "stripe" : "bank_slip";
}

function mapStaffRole(role: string): "OWNER" | "MANAGER" | "TRIP_LEADER" | "CASHIER" {
  if (role === "GUIDE") return "TRIP_LEADER";
  if (role === "OWNER" || role === "MANAGER" || role === "CASHIER") {
    return role;
  }
  return "TRIP_LEADER";
}

async function migrateTrips(
  supabase: SupabaseClient,
  db: Firestore,
): Promise<void> {
  const { data, error } = await supabase.from("tours").select("*");

  if (error) {
    throw new Error(`Failed to read tours: ${error.message}`);
  }

  for (const row of (data ?? []) as SupabaseTourRow[]) {
    try {
      await db
        .collection("trips")
        .doc(row.id)
        .set(
          {
            tripCode: row.trip_code,
            title: row.name_en,
            description: `${row.destination} · ${row.duration_label}\n${row.name_th}`,
            itinerary: "",
            priceAdult: Number(row.price_standard),
            priceChild: Number(row.price_private ?? row.price_standard),
            maxSeats: row.max_pax,
            seatsBooked: row.current_pax,
            fixedDate: row.next_date,
            heroImageUrl: "",
            galleryUrl: "",
            active: row.status !== "CANCELLED",
          },
          { merge: true },
        );
      counts.trips += 1;
    } catch (err) {
      logError("trips", row.id, String(err));
    }
  }
}

async function migrateBookings(
  supabase: SupabaseClient,
  db: Firestore,
): Promise<void> {
  const { data, error } = await supabase.from("tour_bookings").select("*");

  if (error) {
    throw new Error(`Failed to read tour_bookings: ${error.message}`);
  }

  for (const row of (data ?? []) as SupabaseBookingRow[]) {
    try {
      const paymentMethod = mapPaymentMethod(row.payment_method);

      await db
        .collection("bookings")
        .doc(row.id)
        .set(
          {
            tripCode: row.trip_code,
            customerName: `${row.first_name_en} ${row.last_name_en}`.trim(),
            phone: row.phone,
            email: row.email,
            seatsBooked: 1,
            paymentMethod,
            paymentStatus: mapPaymentStatus(row.booking_status, row.payment_method),
            stripePaymentIntentId: null,
            slipUrl: row.slip_url,
            waiverAccepted: row.waiver_signed,
            complianceDocsUploaded: false,
            docsDeletedAt: null,
            createdAt: row.booked_at,
            legacyTourId: row.tour_id,
          },
          { merge: true },
        );
      counts.bookings += 1;
    } catch (err) {
      logError("bookings", row.id, String(err));
    }
  }
}

async function migrateStaffProfiles(
  supabase: SupabaseClient,
  db: Firestore,
): Promise<void> {
  const { data, error } = await supabase.from("staff_profiles").select("*");

  if (error) {
    throw new Error(`Failed to read staff_profiles: ${error.message}`);
  }

  for (const row of (data ?? []) as SupabaseStaffRow[]) {
    try {
      await db
        .collection("staff_profiles")
        .doc(row.id)
        .set(
          {
            pinCode: row.pin_code,
            pinHash: row.pin_hash,
            fullName: row.full_name,
            role: mapStaffRole(row.role),
            phone: row.phone,
            email: row.email,
          },
          { merge: true },
        );
      counts.staff_profiles += 1;
    } catch (err) {
      logError("staff_profiles", row.id, String(err));
    }
  }
}

async function migrateCommissionLedger(
  supabase: SupabaseClient,
  db: Firestore,
): Promise<void> {
  const { data, error } = await supabase
    .from("staff_commission_ledger")
    .select("*");

  if (error) {
    throw new Error(`Failed to read staff_commission_ledger: ${error.message}`);
  }

  for (const row of (data ?? []) as SupabaseCommissionRow[]) {
    try {
      await db
        .collection("staff_commission_ledger")
        .doc(row.id)
        .set(
          {
            staffId: row.staff_id,
            tripId: row.tour_id,
            amountAud: Number(row.amount_aud),
            note: row.note,
            createdAt: row.created_at,
          },
          { merge: true },
        );
      counts.staff_commission_ledger += 1;
    } catch (err) {
      logError("staff_commission_ledger", row.id, String(err));
    }
  }
}

async function migrateExpenses(
  supabase: SupabaseClient,
  db: Firestore,
): Promise<void> {
  const { data, error } = await supabase.from("expenses").select("*");

  if (error) {
    throw new Error(`Failed to read expenses: ${error.message}`);
  }

  for (const row of (data ?? []) as SupabaseExpenseRow[]) {
    try {
      await db
        .collection("expenses")
        .doc(row.id)
        .set(
          {
            amountAud: Number(row.amount_aud),
            atoCategory: row.ato_category,
            vendorName: row.vendor_name,
            hasGst: row.has_gst,
            gstAmountAud: Number(row.gst_amount_aud),
            createdAt: row.created_at,
          },
          { merge: true },
        );
      counts.expenses += 1;
    } catch (err) {
      logError("expenses", row.id, String(err));
    }
  }
}

async function migrateInsuranceAlerts(
  supabase: SupabaseClient,
  db: Firestore,
): Promise<void> {
  const { data, error } = await supabase.from("insurance_alerts").select("*");

  if (error) {
    throw new Error(`Failed to read insurance_alerts: ${error.message}`);
  }

  for (const row of (data ?? []) as SupabaseInsuranceRow[]) {
    try {
      await db
        .collection("insurance_alerts")
        .doc(row.id)
        .set(
          {
            itemName: row.item_name,
            itemType: row.item_type,
            expiryDate: row.expiry_date,
            isActive: row.is_active,
          },
          { merge: true },
        );
      counts.insurance_alerts += 1;
    } catch (err) {
      logError("insurance_alerts", row.id, String(err));
    }
  }
}

async function main(): Promise<void> {
  writeFileSync(ERROR_LOG, "", "utf8");

  const supabase = initSupabase();
  const db = initFirebase();

  console.log("Trip2Talk V6 — Supabase → Firestore migration");
  console.log("Reading from OLD Supabase project (read-only)...\n");

  await migrateTrips(supabase, db);
  await migrateBookings(supabase, db);
  await migrateStaffProfiles(supabase, db);
  await migrateCommissionLedger(supabase, db);
  await migrateExpenses(supabase, db);
  await migrateInsuranceAlerts(supabase, db);

  console.log("Migration complete.\n");
  for (const collection of MIGRATION_COLLECTIONS) {
    console.log(`  ${collection}: ${counts[collection]} records`);
  }
  console.log(`\nErrors (if any): ${ERROR_LOG}`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
