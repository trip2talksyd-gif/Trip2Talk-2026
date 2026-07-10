import { useLang } from '../../hooks/useLang'
import { CANCELLATION_POLICY } from '../../data/risks'
import PricingTiers from '../../components/pricing/PricingTiers'

export default function PricingPage() {
  const { lang, t } = useLang()
  const policy = CANCELLATION_POLICY[lang]

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl text-brand-dark">{t('nav.pricing')}</h1>

      <PricingTiers />

      <section>
        <h2 className="text-lg font-semibold text-brand-dark">{policy.title}</h2>
        <p className="mt-2 text-sm text-gray-600">{policy.intro}</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-3 py-2">{lang === 'th' ? 'เงื่อนไข' : 'Condition'}</th>
                <th className="px-3 py-2">{lang === 'th' ? 'ผลลัพธ์' : 'Outcome'}</th>
              </tr>
            </thead>
            <tbody>
              {policy.rules.map((rule) => (
                <tr key={rule.condition} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium text-brand-dark">{rule.condition}</td>
                  <td className="px-3 py-2 text-gray-600">{rule.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
