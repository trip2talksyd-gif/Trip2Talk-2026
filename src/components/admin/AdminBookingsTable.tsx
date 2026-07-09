"use client";

import { useEffect, useState } from "react";

interface BookingRow {
  id: string;
  tripCode: string;
  customerName: string;
  paymentStatus: string;
  paymentMethod: string;
  complianceDocsUploaded?: boolean;
}

export function AdminBookingsTable({
  role,
}: {
  role: "owner" | "cashier" | "trip_leader";
}) {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function verifySlip(id: string) {
    await fetch(`/api/admin/bookings/${id}/verify-slip`, { method: "POST" });
    window.location.reload();
  }

  async function rejectSlip(id: string) {
    await fetch(`/api/admin/bookings/${id}/reject-slip`, { method: "POST" });
    window.location.reload();
  }

  async function viewDoc(id: string, type: "slip" | "passport") {
    const res = await fetch(`/api/admin/documents/signed-url?bookingId=${id}&type=${type}`);
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  }

  if (loading) return <p className="text-white/60">Loading bookings…</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-left text-sm text-white/90">
        <thead className="bg-white/5 text-xs uppercase text-white/50">
          <tr>
            <th className="p-3">Trip</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Payment</th>
            {role !== "trip_leader" && <th className="p-3">Method</th>}
            <th className="p-3">Compliance</th>
            {(role === "owner" || role === "cashier") && <th className="p-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t border-white/5">
              <td className="p-3">{b.tripCode}</td>
              <td className="p-3">{b.customerName}</td>
              <td className="p-3">{b.paymentStatus}</td>
              {role !== "trip_leader" && <td className="p-3">{b.paymentMethod}</td>}
              <td className="p-3">{b.complianceDocsUploaded ? "✓" : "—"}</td>
              {(role === "owner" || role === "cashier") && (
                <td className="p-3 space-x-2">
                  {b.paymentStatus === "pending_verification" && (
                    <>
                      <button
                        type="button"
                        className="text-xs text-green-400"
                        onClick={() => verifySlip(b.id)}
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-400"
                        onClick={() => rejectSlip(b.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="text-xs text-white/60"
                    onClick={() => viewDoc(b.id, "passport")}
                  >
                    Docs
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
