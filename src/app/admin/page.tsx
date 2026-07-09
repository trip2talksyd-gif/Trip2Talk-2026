import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminBookingsTable } from "@/components/admin/AdminBookingsTable";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { OwnerExtras } from "@/components/admin/OwnerExtras";
import { ADMIN_COOKIE_NAME, verifySessionToken, type AdminRole } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const jar = await cookies();
  const session = verifySessionToken(jar.get(ADMIN_COOKIE_NAME)?.value);
  if (!session) redirect("/admin/login");

  const role = session.role as AdminRole;
  const roleLabel =
    role === "owner" ? "Owner" : role === "cashier" ? "Cashier" : "Trip Leader";

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl">Admin — {roleLabel}</h1>
            <p className="mt-1 text-sm text-white/60">Trip2Talk operations dashboard</p>
          </div>
          <AdminLogoutButton />
        </div>

        <section className="mt-10">
          <h2 className="font-serif text-xl">
            {role === "trip_leader" ? "Passengers & compliance" : "Bookings"}
          </h2>
          <div className="mt-4">
            <AdminBookingsTable role={role} />
          </div>
        </section>

        {role === "owner" && <OwnerExtras />}

        {role === "cashier" && (
          <section className="mt-10">
            <h2 className="font-serif text-xl">Quick expense drop</h2>
            <p className="mt-2 text-sm text-white/60">
              Upload receipts via signed-upload API (expense-receipts bucket).
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
