import { Link } from 'react-router-dom'
import { Check, CreditCard } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import type { TranslationKey } from '../../i18n/translations'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import BiText from '../../components/ui/BiText'
import SplitFlapPrice from '../../components/ui/SplitFlapPrice'
import { AcceptedPaymentIcons } from '../../components/booking/SquareAcceptedPaymentIcons'
import { BUSINESS_ENTITY, PAYID_OPTIONS } from '../../data/paymentDetails'
import { preferSquareCardCheckout } from '../../lib/preferredPayment'

const TIERS = [
  {
    id: 'day',
    popular: false,
    prefix: 'pricing.tier.day',
    priceAud: 150,
  },
  {
    id: 'multi',
    popular: true,
    prefix: 'pricing.tier.multi',
    priceAud: 990,
  },
  {
    id: 'flagship',
    popular: false,
    prefix: 'pricing.tier.flagship',
    priceAud: 2450,
  },
] as const

const CHECK_SUFFIXES = ['check.1', 'check.2', 'check.3', 'check.4'] as const

const CANCEL_RULES = [1, 2, 3, 4, 5] as const

export default function PricingPage() {
  const { tt } = useLang()

  const pageTitle = tt('nav.pricing')
  const subtitle = tt('pricing.page.subtitle')
  const mostPopular = tt('pricing.mostPopular')
  const audPerPerson = tt('pricing.audPerPerson')
  const cancelTitle = tt('pricing.cancel.title')
  const cancelIntro = tt('pricing.cancel.intro')
  const colCondition = tt('pricing.cancel.col.condition')
  const colOutcome = tt('pricing.cancel.col.outcome')

  return (
    <div className="space-y-8 pb-4">
      <header>
        <BiText
          as="h1"
          en={pageTitle.en}
          th={pageTitle.th}
          serif
          className="text-2xl text-ink sm:text-3xl"
          thClassName="mt-0.5 block font-thai text-[0.75em] font-medium text-ink-soft"
        />
        <BiText
          as="p"
          en={subtitle.en}
          th={subtitle.th}
          className="mt-1 text-sm text-ink-soft"
          thClassName="mt-0.5 block font-thai text-[12px] text-ink-soft/90"
        />
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const title = tt(`${tier.prefix}.title` as TranslationKey)
          const desc = tt(`${tier.prefix}.desc` as TranslationKey)
          const cta = tt(`${tier.prefix}.cta` as TranslationKey)
          const checks = CHECK_SUFFIXES.map((suffix) =>
            tt(`${tier.prefix}.${suffix}` as TranslationKey),
          )

          return (
            <article
              key={tier.id}
              className={`relative flex flex-col rounded-[18px] border bg-card p-6 shadow-mockup ${
                tier.popular ? 'border-2 border-teal-600' : 'border-line'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-coral px-3 py-1 text-[10px] font-extrabold uppercase text-cream">
                  {mostPopular.en}
                  <span className="mt-px block font-thai text-[8px] font-bold normal-case">
                    {mostPopular.th}
                  </span>
                </span>
              )}
              <BiText
                as="h2"
                en={title.en}
                th={title.th}
                serif
                className="text-[15px] text-ink"
                thClassName="mt-0.5 block font-thai text-[12px] font-medium text-teal-700"
              />
              <div className="group mt-2.5 flex flex-wrap items-baseline gap-1.5">
                <SplitFlapPrice
                  amountAud={tier.priceAud}
                  board
                  className="text-[26px] font-extrabold leading-none text-ink"
                />
                <BiText
                  as="span"
                  en={audPerPerson.en}
                  th={audPerPerson.th}
                  className="text-[11px] font-semibold text-ink-soft"
                  thClassName="mt-px block font-thai text-[9px] font-medium text-ink-soft/90"
                />
              </div>
              <BiText
                as="p"
                en={desc.en}
                th={desc.th}
                className="mb-3.5 mt-0.5 text-[11.5px] text-ink-soft"
                thClassName="mt-0.5 block font-thai text-[10.5px] text-ink-soft/90"
              />
              <ul className="mb-[18px] flex flex-1 flex-col gap-2">
                {checks.map((item) => (
                  <li key={item.en} className="flex items-start gap-[7px] text-[12px] text-ink-soft">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={2.5} />
                    <BiText
                      en={item.en}
                      th={item.th}
                      thClassName="mt-0.5 block font-thai text-[10.5px] text-ink-soft/90"
                    />
                  </li>
                ))}
              </ul>
              <Link
                to="/trips"
                className={`block text-center ${
                  tier.popular ? 'book-btn flip-cta cta-shine' : 'jc-join'
                }`}
              >
                {cta.en}
                <span className="mt-0.5 block font-thai text-[10px] font-medium opacity-90">
                  {cta.th}
                </span>
              </Link>
            </article>
          )
        })}
      </div>

      <section
        id="payid"
        className="scroll-mt-24 rounded-xl border border-line bg-card p-5 shadow-mockup sm:p-6"
      >
        <BiDisplayHeading
          en={tt('pricing.payid.title').en}
          th={tt('pricing.payid.title').th}
          as="h2"
          thAs="p"
          enClassName="text-lg font-semibold text-ink"
          thClassName="mt-0.5 text-[14px] font-medium text-ink-soft"
        />
        <BiText
          as="p"
          en={tt('pricing.payid.body').en}
          th={tt('pricing.payid.body').th}
          className="mt-3 text-sm leading-relaxed text-ink-soft"
          thClassName="mt-1 block font-thai text-[13px] leading-relaxed text-ink-soft/90"
        />
        <ul className="mt-4 space-y-2">
          {PAYID_OPTIONS.map((opt) => (
            <li
              key={opt.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-editorial border border-line bg-mint-100/60 px-3 py-2.5"
            >
              <span className="text-[12px] font-semibold text-ink">
                {opt.bankEn}
                <span className="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft">
                  {opt.bankTh}
                </span>
              </span>
              <span className="font-mono text-[13px] font-bold tracking-wide text-teal-800">
                {opt.payIdDisplay}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] text-ink-soft">
          {tt('pricing.payid.account').en}:{' '}
          <span className="font-semibold text-ink">{BUSINESS_ENTITY.accountName}</span>
          <span className="mt-0.5 block font-thai text-[11px] text-ink-soft/90">
            {tt('pricing.payid.account').th}: {BUSINESS_ENTITY.accountName}
          </span>
        </p>

        <div className="mt-5 border-t border-dashed border-line pt-4">
          <BiText
            as="p"
            en={tt('pricing.card.intro').en}
            th={tt('pricing.card.intro').th}
            className="text-[13px] leading-relaxed text-ink"
            thClassName="mt-1 block font-thai text-[12px] leading-relaxed text-ink-soft"
          />
          <AcceptedPaymentIcons
            brands={['visa', 'mastercard']}
            className="mt-2"
            label="Visa, Mastercard"
          />
          <Link
            to="/trips?pay=square"
            onClick={preferSquareCardCheckout}
            className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-teal-600/40"
          >
            <CreditCard className="h-4 w-4 text-teal-800" aria-hidden />
            <span>
              {tt('pricing.card.cta').en}
              <span className="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft">
                {tt('pricing.card.cta').th}
              </span>
            </span>
          </Link>
          <BiText
            as="p"
            en={tt('pricing.card.fee').en}
            th={tt('pricing.card.fee').th}
            className="mt-2 text-[11px] leading-relaxed text-ink-soft"
            thClassName="mt-0.5 block font-thai text-[10.5px] leading-relaxed text-ink-soft/90"
          />
        </div>
      </section>

      <section>
        <BiText
          as="h2"
          en={cancelTitle.en}
          th={cancelTitle.th}
          serif
          className="text-lg text-ink"
          thClassName="mt-0.5 block font-thai text-[14px] font-medium text-ink-soft"
        />
        <p className="mt-2 text-sm text-ink-soft">{cancelIntro.en}</p>
        <p className="mt-1 font-thai text-[13px] text-ink-soft/90">{cancelIntro.th}</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead className="bg-mint-100 text-ink-soft">
              <tr>
                <th className="px-3 py-2">
                  {colCondition.en}
                  <span className="mt-0.5 block font-thai text-[11px] font-medium">
                    {colCondition.th}
                  </span>
                </th>
                <th className="px-3 py-2">
                  {colOutcome.en}
                  <span className="mt-0.5 block font-thai text-[11px] font-medium">
                    {colOutcome.th}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {CANCEL_RULES.map((n) => {
                const condition = tt(`pricing.cancel.rule.${n}.condition` as TranslationKey)
                const outcome = tt(`pricing.cancel.rule.${n}.outcome` as TranslationKey)
                return (
                  <tr key={n} className="border-t border-line">
                    <td className="px-3 py-2 font-medium text-ink">
                      {condition.en}
                      <span className="mt-0.5 block font-thai text-[12px] font-normal text-ink-soft">
                        {condition.th}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-ink-soft">
                      {outcome.en}
                      <span className="mt-0.5 block font-thai text-[12px] text-ink-soft/90">
                        {outcome.th}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
