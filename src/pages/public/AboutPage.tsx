import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { GALLERY_PHOTOS, photoSrc } from '../../data/galleryPhotos'
import { TEAM_MEMBERS } from '../../data/teamMembers'
import BiText from '../../components/ui/BiText'
import CountUpStat from '../../components/ui/CountUpStat'
import TeamAvatar from '../../components/about/TeamAvatar'

export default function AboutPage() {
  const { tt } = useLang()
  const heroPhoto =
    GALLERY_PHOTOS.find((p) => p.id === 'nz-013') ??
    GALLERY_PHOTOS.find((p) => p.id === 'syd-009') ??
    GALLERY_PHOTOS[0]

  const eyebrow = tt('about.page.eyebrow')
  const pageTitle = tt('about.page.title')
  const heroHeading = tt('about.hero.heading')
  const heroStory = tt('about.hero.story')
  const statTrips = tt('about.hero.stat.trips')
  const statPhotographers = tt('about.hero.stat.photographers')
  const statTravelers = tt('about.hero.stat.travelers')
  const saenBio = tt('about.saen.bio')
  const ployBio = tt('about.ploy.bio')
  const whatToKnowTitle = tt('about.whatToKnow.title')
  const whatToKnowBody = tt('about.whatToKnow.body')
  const contactTitle = tt('about.contact')
  const contactStudio = tt('about.contact.studio')
  const contactHours = tt('about.contact.hours')
  const contactFooter = tt('about.contact.footer')

  const [saen, ploy] = TEAM_MEMBERS

  return (
    <div className="space-y-8 pb-4">
      <header>
        <BiText
          as="p"
          en={eyebrow.en}
          th={eyebrow.th}
          className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-600"
          thClassName="mt-0.5 block font-thai text-[9px] font-bold normal-case tracking-normal"
        />
        <BiText
          as="h1"
          en={pageTitle.en}
          th={pageTitle.th}
          serif
          className="mt-1 text-2xl text-ink sm:text-3xl"
          thClassName="mt-0.5 block font-thai text-[0.75em] font-medium text-ink-soft"
        />
      </header>

      <div className="grid gap-9 lg:grid-cols-2 lg:items-center">
        {heroPhoto && (
          <img
            src={photoSrc(heroPhoto)}
            alt="Trip2Talk team on location"
            className="aspect-[700/520] w-full rounded-[18px] object-cover shadow-mockup"
          />
        )}
        <div>
          <BiText
            as="h2"
            en={heroHeading.en}
            th={heroHeading.th}
            serif
            className="m-0 text-[22px] text-ink"
            thClassName="mt-1 block font-thai text-[16px] font-medium text-teal-700"
          />
          <p className="mb-3 mt-3 text-[13.5px] leading-[1.75] text-ink-soft">{heroStory.en}</p>
          <p className="mb-3 font-thai text-[13.5px] leading-[1.75] text-ink-soft/90">
            {heroStory.th}
          </p>
          <div className="mt-4 flex gap-[26px]">
            <div>
              <p className="m-0 text-[20px] font-extrabold text-ink">
                <CountUpStat end={13} />
              </p>
              <BiText
                as="p"
                en={statTrips.en}
                th={statTrips.th}
                className="mt-0.5 text-[10px] uppercase tracking-[0.04em] text-ink-soft"
                thClassName="mt-px block font-thai text-[9px] normal-case text-ink-soft/90"
              />
            </div>
            <div>
              <p className="m-0 text-[20px] font-extrabold text-ink">
                <CountUpStat end={10} suffix="+" />
              </p>
              <BiText
                as="p"
                en={statPhotographers.en}
                th={statPhotographers.th}
                className="mt-0.5 text-[10px] uppercase tracking-[0.04em] text-ink-soft"
                thClassName="mt-px block font-thai text-[9px] normal-case text-ink-soft/90"
              />
            </div>
            <div>
              <p className="m-0 text-[20px] font-extrabold text-ink">
                <CountUpStat end={500} suffix="+" />
              </p>
              <BiText
                as="p"
                en={statTravelers.en}
                th={statTravelers.th}
                className="mt-0.5 text-[10px] uppercase tracking-[0.04em] text-ink-soft"
                thClassName="mt-px block font-thai text-[9px] normal-case text-ink-soft/90"
              />
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-cream p-5">
        <div className="flex gap-4">
          <TeamAvatar srcs={saen.photoSrcs} alt={saen.nameEn} initial={saen.initial} />
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg font-semibold text-ink">{saen.nameEn}</p>
            <BiText
              en={saen.roleEn}
              th={saen.roleTh}
              className="text-sm text-teal-700"
              thClassName="mt-0.5 block font-thai text-[12px] font-medium text-teal-700/90"
            />
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">
              {saenBio.en}
            </p>
            <p className="mt-2 whitespace-pre-line font-thai text-[13px] leading-relaxed text-ink/70">
              {saenBio.th}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-cream p-5">
        <div className="flex gap-4">
          <TeamAvatar srcs={ploy.photoSrcs} alt={ploy.nameEn} initial={ploy.initial} />
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg font-semibold text-ink">{ploy.nameEn}</p>
            <BiText
              en={ploy.roleEn}
              th={ploy.roleTh}
              className="text-sm text-teal-700"
              thClassName="mt-0.5 block font-thai text-[12px] font-medium text-teal-700/90"
            />
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{ployBio.en}</p>
            <p className="mt-2 font-thai text-[13px] leading-relaxed text-ink/70">{ployBio.th}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-teal-600/30 bg-teal-500/10 p-5">
        <BiText
          as="h2"
          en={whatToKnowTitle.en}
          th={whatToKnowTitle.th}
          serif
          className="text-lg text-ink"
          thClassName="mt-0.5 block font-thai text-[14px] font-medium text-ink-soft"
        />
        <p className="mt-3 text-sm leading-relaxed text-ink/80">{whatToKnowBody.en}</p>
        <p className="mt-2 font-thai text-[13px] leading-relaxed text-ink/70">
          {whatToKnowBody.th}
        </p>
      </section>

      <section className="rounded-2xl border border-line bg-cream p-5">
        <BiText
          as="h2"
          en={contactTitle.en}
          th={contactTitle.th}
          serif
          className="text-lg text-ink"
          thClassName="mt-0.5 block font-thai text-[14px] font-medium text-ink-soft"
        />
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-start gap-3 text-ink/80">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span>
              <BiText
                en={contactStudio.en}
                th={contactStudio.th}
                className="font-medium"
                thClassName="mt-px block font-thai text-[12px] font-normal text-ink-soft"
              />
              <br />
              33/14 Jubilee Ave, Warriewood NSW 2102
            </span>
          </li>
          <li className="flex items-center gap-3 text-ink/80">
            <Clock className="h-4 w-4 shrink-0 text-teal-600" />
            <BiText
              en={contactHours.en}
              th={contactHours.th}
              thClassName="mt-0.5 block font-thai text-[12px] text-ink-soft/90"
            />
          </li>
          <li>
            <a
              href="mailto:trip2talksyd@gmail.com"
              className="flex items-center gap-3 text-teal-700 hover:underline"
            >
              <Mail className="h-4 w-4 shrink-0 text-teal-600" />
              trip2talksyd@gmail.com
            </a>
          </li>
          <li>
            <a href="tel:+61452044382" className="flex items-center gap-3 text-teal-700 hover:underline">
              <Phone className="h-4 w-4 shrink-0 text-teal-600" />
              +61 0452 044 382
            </a>
          </li>
        </ul>
        <p className="mt-4 text-xs text-ink-soft">{contactFooter.en}</p>
      </section>
    </div>
  )
}
