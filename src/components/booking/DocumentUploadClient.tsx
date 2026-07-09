"use client";

import { useState } from "react";

export function DocumentUploadClient({ bookingId }: { bookingId: string }) {
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const path = `${bookingId}/passport.jpg`;
    const res = await fetch("/api/storage/signed-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket: "passport-documents",
        path,
        bookingId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "ไม่สามารถอัปโหลดได้");
      setUploading(false);
      return;
    }

    await fetch(data.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    await fetch("/api/storage/confirm-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket: "passport-documents",
        path,
        bookingId,
      }),
    });

    setDone(true);
    setUploading(false);
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <label className="block text-sm text-white/80">
        อัปโหลดพาสปอร์ตหรือบัตรประชาชน
        <input
          type="file"
          accept="image/*,.pdf"
          className="mt-3 block w-full text-xs"
          disabled={uploading || done}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {done && (
        <p className="mt-3 text-sm text-green-300">อัปโหลดสำเร็จ — ขอบคุณค่ะ</p>
      )}
    </div>
  );
}
