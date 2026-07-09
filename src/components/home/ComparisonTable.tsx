const ROWS = [
  {
    label: "ช่างภาพมืออาชีพประจำทริป",
    trip2talk: "มี คอยแนะนำมุมและถ่ายให้ตลอดทาง",
    other: "ไม่มี ต้องถ่ายเอง",
  },
  {
    label: "กลุ่มเดินทาง",
    trip2talk: "Private กลุ่มเล็ก 4-6 คน",
    other: "กรุ๊ปใหญ่ รอคิวถ่ายรูป",
  },
  {
    label: "จุดถ่ายภาพ",
    trip2talk: "คัดสรรมุม Unseen เฉพาะช่างภาพรู้",
    other: "จุดแวะมาตรฐานที่คนไปเยอะ",
  },
  {
    label: "ราคา",
    trip2talk: "เหมาจ่ายชัดเจน ไม่มีค่าใช้จ่ายแฝง",
    other: "มักมีค่าใช้จ่ายเสริมระหว่างทาง",
  },
  {
    label: "Trip Leader",
    trip2talk: "ดูแลทั้งเส้นทางและความปลอดภัย",
    other: "แล้วแต่มาตรฐานแต่ละเจ้า",
  },
  {
    label: "ได้อะไรกลับบ้าน",
    trip2talk: "ภาพถ่ายคุณภาพระดับ Gallery เต็มเมมโมรีการ์ด",
    other: "รูปที่ถ่ายเองด้วยมือถือ",
  },
] as const;

export function ComparisonTable() {
  return (
    <section className="border-y border-white/10 bg-[#0d1a2d] px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h2
          className="text-center font-serif text-3xl"
          style={{ fontFamily: "var(--font-instrument-serif), var(--font-noto-serif-thai), serif" }}
        >
          Trip2Talk vs ทัวร์ทั่วไป
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/60">
          ทริปถ่ายภาพที่ออกแบบมาเพื่อได้รูปสวยกลับบ้าน — ไม่ใช่แค่ไปเที่ยว
        </p>

        <div className="mt-10 space-y-3 md:hidden">
          {ROWS.map((row) => (
            <div key={row.label} className="liquid-glass rounded-2xl p-4">
              <p className="text-sm font-medium text-white/90">{row.label}</p>
              <div className="mt-3 grid gap-2">
                <div className="rounded-xl border border-[#C8A84B]/30 bg-[#C8A84B]/10 p-3">
                  <p className="text-xs text-[#C8A84B]">Trip2Talk</p>
                  <p className="mt-1 text-sm">{row.trip2talk}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/50">ทัวร์ทั่วไป</p>
                  <p className="mt-1 text-sm text-white/70">{row.other}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 font-medium text-white/70" />
                <th className="p-4 font-medium text-[#C8A84B]">Trip2Talk</th>
                <th className="p-4 font-medium text-white/60">ทัวร์ทั่วไป</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? "bg-white/[0.03]" : "bg-transparent"}
                >
                  <td className="p-4 font-medium text-white/80">{row.label}</td>
                  <td className="border-l border-[#C8A84B]/20 bg-[#C8A84B]/5 p-4 text-white">
                    {row.trip2talk}
                  </td>
                  <td className="border-l border-white/10 p-4 text-white/65">
                    {row.other}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
