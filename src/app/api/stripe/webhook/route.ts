import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { releaseBookingSeats } from "@/lib/bookSeat";
import { mapBooking } from "@/lib/db/mappers";
import { fulfillPaidBooking } from "@/lib/fulfill-booking";
import { updateBooking } from "@/lib/db/queries";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("stripe_payment_intent_id", pi.id)
      .limit(1)
      .maybeSingle();

    if (data) {
      const booking = mapBooking(data);
      if (booking.paymentStatus !== "paid") {
        await updateBooking(booking.id, { payment_status: "paid" });
        await fulfillPaidBooking(booking.id);
      }
    }
  }

  if (
    event.type === "payment_intent.payment_failed" ||
    event.type === "payment_intent.canceled"
  ) {
    const pi = event.data.object as Stripe.PaymentIntent;
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("stripe_payment_intent_id", pi.id)
      .limit(1)
      .maybeSingle();

    if (data) {
      const booking = mapBooking(data);
      if (booking.paymentStatus === "pending") {
        await releaseBookingSeats({
          departureId: booking.departureId,
          seatsToRelease: booking.seatsBooked,
        });
        await updateBooking(booking.id, { payment_status: "failed" });
      }
    }
  }

  return NextResponse.json({ received: true });
}
