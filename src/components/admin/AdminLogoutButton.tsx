"use client";

export function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80"
    >
      Log out
    </button>
  );
}
