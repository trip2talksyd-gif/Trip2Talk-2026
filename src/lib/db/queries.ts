import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapBooking,
  mapTripDeparture,
  mapTripTemplate,
} from "@/lib/db/mappers";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Booking, TripDeparture, TripTemplate } from "@/lib/types/database";

export async function getTripTemplateByCode(
  tripCode: string,
  client: SupabaseClient = getSupabaseAdmin(),
): Promise<TripTemplate | null> {
  const { data, error } = await client
    .from("trip_templates")
    .select("*")
    .eq("trip_code", tripCode)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapTripTemplate(data) : null;
}

export async function getDepartureById(
  departureId: string,
  client: SupabaseClient = getSupabaseAdmin(),
): Promise<(TripDeparture & { id: string }) | null> {
  const { data, error } = await client
    .from("trip_departures")
    .select("*")
    .eq("id", departureId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return { id: data.id, ...mapTripDeparture(data) };
}

export async function getBookingById(
  bookingId: string,
  client: SupabaseClient = getSupabaseAdmin(),
): Promise<(Booking & { id: string }) | null> {
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapBooking(data) : null;
}

export async function updateBooking(
  bookingId: string,
  patch: Record<string, unknown>,
  client: SupabaseClient = getSupabaseAdmin(),
): Promise<void> {
  const { error } = await client
    .from("bookings")
    .update(patch)
    .eq("id", bookingId);

  if (error) throw new Error(error.message);
}
