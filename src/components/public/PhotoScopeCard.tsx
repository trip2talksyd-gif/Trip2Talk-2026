import { PHOTO_SCOPE_CARD_CLASS, PHOTO_SCOPE_POLICY, photoDeliveryLine } from '../../data/photoScopePolicy'

export default function PhotoScopeCard() {
  return (
    <section className={PHOTO_SCOPE_CARD_CLASS}>
      <div>
        <h2 className="font-serif text-lg text-ink">{PHOTO_SCOPE_POLICY.en.title}</h2>
        {PHOTO_SCOPE_POLICY.en.paragraphs.map((paragraph) => (
          <p key={paragraph} className="mt-2 text-sm text-ink">
            {paragraph}
          </p>
        ))}
        <p className="mt-2 text-sm text-ink">{photoDeliveryLine('en')}</p>
      </div>
      <div>
        <h2 className="font-thai text-lg text-ink">{PHOTO_SCOPE_POLICY.th.title}</h2>
        {PHOTO_SCOPE_POLICY.th.paragraphs.map((paragraph) => (
          <p key={paragraph} className="mt-2 font-thai text-sm text-ink">
            {paragraph}
          </p>
        ))}
        <p className="mt-2 font-thai text-sm text-ink">{photoDeliveryLine('th')}</p>
      </div>
    </section>
  )
}
