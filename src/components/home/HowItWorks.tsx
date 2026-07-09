import { MIcon } from "@/components/ui/MIcon";

const STEPS = [
  {
    icon: "groups",
    title: "ทีมครบในคันเดียว",
    text: "คนขับ Trip Leader และช่างภาพมืออาชีพ — ไม่ต้องจัดหลายคน ไม่ต้องกังวลเรื่องแสง",
  },
  {
    icon: "calendar_month",
    title: "เลือกทริปและวัน",
    text: "ดูตารางทริป จองที่นั่งออนไลน์ หรือสอบถามทริปส่วนตัวได้ตามสะดวก",
  },
  {
    icon: "photo_camera",
    title: "ได้ภาพกลับบ้าน",
    text: "เก็บโมเมนต์สำคัญระหว่างทริป พร้อมคำแนะนำการถ่ายภาพจากทีมงานตลอดทาง",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-y border-white/10 bg-[#0d1a2d] px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2
          className="text-center font-serif text-3xl"
          style={{ fontFamily: "var(--font-instrument-serif), var(--font-noto-serif-thai), serif" }}
        >
          จองทริปอย่างไร
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/60">
          สามขั้นตอนง่ายๆ — ไม่ต้องหาช่างภาพเอง ไม่ต้องกังวลเรื่องมุมกล้อง แค่เดินไปกับเรา
          รูปสวยตะโกนกลับบ้านทุกทริป
        </p>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="liquid-glass rounded-2xl p-6 text-center"
            >
              <span className="text-xs font-medium text-white/40">ขั้นที่ {i + 1}</span>
              <div className="mt-4 flex justify-center text-white/90">
                <MIcon name={step.icon} size={36} />
              </div>
              <h3 className="mt-4 font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
