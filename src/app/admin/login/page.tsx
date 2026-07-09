import { Suspense } from "react";

import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0a1628]" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
