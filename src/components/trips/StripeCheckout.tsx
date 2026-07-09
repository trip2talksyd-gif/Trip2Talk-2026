"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function PayForm({ bookingId, onSuccess }: { bookingId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/${bookingId}/upload-documents?paid=1`,
      },
    });
    if (submitError) setError(submitError.message ?? "Payment failed");
    else onSuccess();
    setLoading(false);
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-full bg-white/90 py-3 text-sm font-medium text-black disabled:opacity-50"
      >
        {loading ? "กำลังชำระ..." : "ชำระด้วยบัตร"}
      </button>
    </form>
  );
}

export function StripeCheckout({
  clientSecret,
  bookingId,
}: {
  clientSecret: string;
  bookingId: string;
}) {
  if (!stripePromise) {
    return (
      <p className="text-sm text-amber-300">
        การชำระด้วยบัตรยังไม่พร้อม (ตั้งค่า NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PayForm bookingId={bookingId} onSuccess={() => {}} />
    </Elements>
  );
}
