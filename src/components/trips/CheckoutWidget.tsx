"use client";

import { useState } from "react";

import { StripeCheckout } from "@/components/trips/StripeCheckout";
import { FacebookContactButton } from "@/components/trips/FacebookContactButton";

interface CheckoutWidgetProps {
  departureId: string;
  tripCode: string;
  maxSeats: number;
  subPackage?: string;
}

export function CheckoutWidget({
  departureId,
  tripCode,
  maxSeats,
  subPackage,
}: CheckoutWidgetProps) {
  const [seats, setSeats] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [waiver, setWaiver] = useState(false);
  const [method, setMethod] = useState<"card" | "slip">("card");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slipUpload, setSlipUpload] = useState<{
    signedUrl: string;
    path: string;
    bucket: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  async function startCheckout() {
    setError(null);
    if (!waiver) {
      setError("กรุณายอมรับ Travel & Trip Consent");
      return;
    }

    const payload = {
      departureId,
      seats,
      customerName: name,
      phone,
      email,
      waiverAccepted: true,
      subPackage,
    };

    if (method === "card") {
      const res = await fetch("/api/bookings/create-card-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ไม่สามารถจองได้");
        return;
      }
      setClientSecret(data.clientSecret);
      setBookingId(data.bookingId);
    } else {
      const res = await fetch("/api/bookings/create-slip-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ไม่สามารถจองได้");
        return;
      }
      setBookingId(data.bookingId);
      setSlipUpload(data.upload);
    }
  }

  async function uploadSlip(file: File) {
    if (!slipUpload || !bookingId) return;
    setUploading(true);
    await fetch(slipUpload.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    await fetch("/api/storage/confirm-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket: slipUpload.bucket,
        path: slipUpload.path,
        bookingId,
      }),
    });
    setUploading(false);
    alert("อัปโหลดสลิปสำเร็จ — รอการตรวจสอบจากทีมงาน");
  }

  if (clientSecret && bookingId) {
    return <StripeCheckout clientSecret={clientSecret} bookingId={bookingId} />;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h3 className="font-serif text-xl text-white">จองทริป {tripCode}</h3>

      <label className="block text-sm text-white/80">
        จำนวนที่นั่ง
        <div className="mt-1 flex items-center gap-3">
          <button
            type="button"
            className="h-8 w-8 rounded-full bg-white/10"
            onClick={() => setSeats((s) => Math.max(1, s - 1))}
          >
            −
          </button>
          <span className="text-white">{seats}</span>
          <button
            type="button"
            className="h-8 w-8 rounded-full bg-white/10"
            onClick={() => setSeats((s) => Math.min(maxSeats, s + 1))}
          >
            +
          </button>
          <span className="text-xs text-white/50">เหลือ {maxSeats} ที่นั่ง</span>
        </div>
      </label>

      <input
        className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm text-white"
        placeholder="ชื่อ-นามสกุล"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm text-white"
        placeholder="เบอร์โทร"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm text-white"
        placeholder="อีเมล"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="flex items-start gap-2 text-sm text-white/80">
        <input type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} />
        <span>
          ข้าพเจ้ายอมรับ Travel & Trip Consent รวมถึงนโยบายมัดจำไม่คืนเงิน
        </span>
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMethod("card")}
          className={`rounded-full px-4 py-2 text-xs ${method === "card" ? "bg-white text-black" : "bg-white/10 text-white"}`}
        >
          บัตรเครดิต
        </button>
        <button
          type="button"
          onClick={() => setMethod("slip")}
          className={`rounded-full px-4 py-2 text-xs ${method === "slip" ? "bg-white text-black" : "bg-white/10 text-white"}`}
        >
          โอนเงิน / สลิป
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!slipUpload ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={startCheckout}
            className="flex-1 rounded-full bg-white/90 py-3 text-sm font-medium text-black"
          >
            ดำเนินการต่อ
          </button>
          <FacebookContactButton className="flex-1" />
        </div>
      ) : (
        <label className="block text-sm text-white/80">
          อัปโหลดสลิปการโอน
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-xs"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadSlip(f);
            }}
          />
        </label>
      )}
    </div>
  );
}
