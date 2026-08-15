import BiText from '../ui/BiText'

/** The Neck, Tasmania — direct public object (Free plan has no /render/image/). */
const CALENDAR_HERO_SRC =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/Photos/Tasmania/Hobat/the%20neckweb.jpg'

type Props = {
  titleEn: string
  titleTh: string
}

/** Full-bleed cover with dark gradient so the page title stays readable. */
export default function CalendarHero({ titleEn, titleTh }: Props) {
  return (
    <section className="-mx-4 -mt-4 sm:-mx-6 md:mx-0 md:mt-0">
      <div className="relative isolate aspect-[4/3] max-h-[52svh] overflow-hidden sm:aspect-[16/9] sm:max-h-[46svh] md:rounded-2xl lg:aspect-auto lg:h-[25rem] lg:max-h-none">
        <img
          src={CALENDAR_HERO_SRC}
          alt="The Neck, Tasmania"
          className="absolute inset-0 h-full w-full object-cover object-center lg:object-[center_58%]"
          width={2048}
          height={996}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20"
          aria-hidden
        />
        <div className="relative flex h-full items-end px-4 pb-5 pt-10 sm:px-5 sm:pb-6">
          <BiText
            as="h1"
            en={titleEn}
            th={titleTh}
            serif
            className="text-[22px] text-cream sm:text-3xl"
            thClassName="mt-0.5 block text-[12px] font-medium text-cream/80 sm:text-[14px]"
          />
        </div>
      </div>
    </section>
  )
}
