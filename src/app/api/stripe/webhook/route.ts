import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { releaseBookingSeats } from "@/lib/bookSeat";
import { fulfillPaidBooking } from "@/lib/fulfill-booking";
import { getAdminDb } from "@/lib/firebase-admin";
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

  const db = getAdminDb();

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const snap = await db
      .collection("bookings")
      .where("stripePaymentIntentId", "==", pi.id)
      .limit(1)
      .get();

    if (!snap.empty) {
      const bookingRef = snap.docs[0].ref;
      const booking = snap.docs[0].data();
      if (booking.paymentStatus !== "paid") {
        await bookingRef.update({ paymentStatus: "paid", paidAt: new Date().toISOString() });
        await fulfillPaidBooking(bookingRef.id, db);
      }
    }
  }

  if (
    event.type === "payment_intent.payment_failed" ||
    event.type === "payment_intent.canceled"
  ) {
    const pi = event.data.object as Stripe.PaymentIntent;
    const snap = await db
      .collection("bookings")
      .where("stripePaymentIntentId", "==", pi.id)
      .limit(1)
      .get();

    if (!snap.empty) {
      const bookingRef = snap.docs[0].ref;
      const booking = snap.docs[0].data();
      if (booking.paymentStatus === "pending") {
        await releaseBookingSeats(db, {
          departureId: booking.departureId as string,
          seatsToRelease: Number(booking.seatsBooked ?? 1),
        });
        await bookingRef.update({
          paymentStatus: "failed",
          failedAt: new Date().toISOString(),
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
