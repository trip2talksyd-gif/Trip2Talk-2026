import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { CANCELLATION_POLICY } from '../../data/risks'

const TIERS = [
  {
    id: 'day',
    popular: false,
    titleEn: 'Day Trip',
    titleTh: 'ทริปวันเดียว',
    price: '$150',
    descEn: 'A few hours, one professional photographer, minimal logistics.',
    descTh: 'ไม่กี่ชั่วโมง ช่างภาพมืออาชีพหนึ่งคน โลจิสติกส์น้อย',
    checksEn: [
      '3-hour photo session',
      'Local pro photographer',
      'Unlimited edited photos',
      'Online album delivery',
    ],
    checksTh: ['เซสชันถ่ายภาพ 3 ชม.', 'ช่างภาพมืออาชีพท้องถิ่น', 'รูปแก้ไม่จำกัด', 'ส่งอัลบั้มออนไลน์'],
    ctaEn: 'Book Day Trip',
    ctaTh: 'จองทริปวันเดียว',
  },
  {
    id: 'multi',
    popular: true,
    titleEn: 'Multi-day Adventure',
    titleTh: 'ทริปหลายวัน',
    price: '$990',
    descEn: '3–4 days, vehicle & driver, accommodation coordination.',
    descTh: '3–4 วัน รวมรถและคนขับ ช่วยจัดการที่พัก',
    checksEn: [
      'Everything in Day Trip',
      'SUV & driver included',
      'Accommodation booking help',
      'Park entries & permits',
    ],
    checksTh: [
      'ทุกอย่างในทริปวันเดียว',
      'รวมรถ SUV และคนขับ',
      'ช่วยจองที่พัก',
      'ค่าเข้าอุทยานและใบอนุญาต',
    ],
    ctaEn: 'Book Multi-day',
    ctaTh: 'จองทริปหลายวัน',
  },
  {
    id: 'flagship',
    popular: false,
    titleEn: 'Flagship Experience',
    titleTh: 'ทริปเรือธง',
    price: '$2,450',
    descEn: '6 days, flights coordinated, our most immersive trip.',
    descTh: '6 วัน ช่วยประสานตั๋วบิน ทริปเข้มข้นที่สุด',
    checksEn: [
      'Everything in Multi-day',
      'Flight booking assistance',
      '5+ nights accommodation',
      'Priority photographer team',
    ],
    checksTh: [
      'ทุกอย่างในทริปหลายวัน',
      'ช่วยจองตั๋วเครื่องบิน',
      'ที่พัก 5+ คืน',
      'ทีมช่างภาพลำดับแรก',
    ],
    ctaEn: 'Book Flagship',
    ctaTh: 'จองทริปเรือธง',
  },
] as const

export default function PricingPage() {
  const { lang, t } = useLang()
  const policy = CANCELLATION_POLICY[lang]

  return (
    <div className="space-y-8 pb-4">
      <header>
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('nav.pricing')}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {lang === 'th'
            ? 'ตัวเลขเป็นตัวอย่าง — ราคาจริงดูได้ในแต่ละทริป'
            : 'Illustrative tiers — live prices are per trip in Supabase.'}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <article
            key={tier.id}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              tier.popular
                ? 'border-teal-600/50 bg-cream shadow-[0_16px_40px_rgba(22,38,43,0.12)]'
                : 'border-line bg-mint-100/60'
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-cream">
                Most Popular
              </span>
            )}
            <h2 className="font-serif text-xl text-ink">
              {lang === 'th' ? tier.titleTh : tier.titleEn}
            </h2>
            <p className="mt-3 font-serif text-3xl font-semibold text-ink">
              {tier.price}
              <small className="ml-1 text-sm font-medium text-ink-soft">+ / person</small>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {lang === 'th' ? tier.descTh : tier.descEn}
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {(lang === 'th' ? tier.checksTh : tier.checksEn).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/trips"
              className={`mt-6 block rounded-[13px] px-4 py-3 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                tier.popular
                  ? 'btn-embossed !w-full !rounded-[13px]'
                  : 'border border-line bg-cream text-ink shadow-sm'
              }`}
            >
              {lang === 'th' ? tier.ctaTh : tier.ctaEn}
            </Link>
          </article>
        ))}
      </div>

      <section>
        <h2 className="font-serif text-lg text-ink">{policy.title}</h2>
        <p className="mt-2 text-sm text-ink-soft">{policy.intro}</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead className="bg-mint-100 text-ink-soft">
              <tr>
                <th className="px-3 py-2">{lang === 'th' ? 'เงื่อนไข' : 'Condition'}</th>
                <th className="px-3 py-2">{lang === 'th' ? 'ผลลัพธ์' : 'Outcome'}</th>
              </tr>
            </thead>
            <tbody>
              {policy.rules.map((rule) => (
                <tr key={rule.condition} className="border-t border-line">
                  <td className="px-3 py-2 font-medium text-ink">{rule.condition}</td>
                  <td className="px-3 py-2 text-ink-soft">{rule.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
