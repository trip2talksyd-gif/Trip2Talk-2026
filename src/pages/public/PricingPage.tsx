import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { CANCELLATION_POLICY } from '../../data/risks'
import SplitFlapPrice from '../../components/ui/SplitFlapPrice'

const TIERS = [
  {
    id: 'day',
    popular: true,
    titleEn: 'Day Trip',
    titleTh: 'ทริปวันเดียว',
    priceAud: 260,
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
    popular: false,
    titleEn: 'Multi-day Adventure',
    titleTh: 'ทริปหลายวัน',
    priceAud: 990,
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
    priceAud: 2450,
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
            className={`relative flex flex-col rounded-[18px] border bg-card p-6 shadow-mockup ${
              tier.popular ? 'border-2 border-teal-600' : 'border-line'
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-6 rounded-full bg-coral px-3 py-1 text-[10px] font-extrabold uppercase text-cream">
                Most Popular
              </span>
            )}
            <h2 className="font-serif text-[15px] text-ink">
              {lang === 'th' ? tier.titleTh : tier.titleEn}
              <span className="mt-0.5 block text-[12px] font-medium text-teal-700">
                {lang === 'th' ? tier.titleEn : tier.titleTh}
              </span>
            </h2>
            <div className="group mt-2.5 flex flex-wrap items-baseline gap-1.5">
              <SplitFlapPrice
                amountAud={tier.priceAud}
                board
                className="text-[26px] font-extrabold leading-none text-ink"
              />
              <small className="text-[11px] font-semibold text-ink-soft">AUD / person</small>
            </div>
            <p className="mt-1 text-[10px] text-ink-soft">
              {lang === 'th' ? 'จิ้มหรือโฮเวอร์ตัวเลขดูแอนิเมชัน' : 'Tap or hover the price to flip'}
            </p>
            <p className="mb-3.5 mt-0.5 text-[11.5px] text-ink-soft">
              {lang === 'th' ? tier.descTh : tier.descEn}
            </p>
            <ul className="mb-[18px] flex flex-1 flex-col gap-2">
              {(lang === 'th' ? tier.checksTh : tier.checksEn).map((item) => (
                <li key={item} className="flex items-start gap-[7px] text-[12px] text-ink-soft">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/trips"
              className={`block text-center ${
                tier.popular ? 'book-btn flip-cta cta-shine' : 'book-btn'
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
