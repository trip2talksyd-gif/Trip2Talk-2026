import { publicMediaUrl } from '../lib/storageImage'

/**
 * Focus Awards 2016 bronzes + press credits.
 * Photos live in the public-media bucket (800px WebP, already processed).
 */
export type FocusAwardCategory = 'seascape' | 'bw' | 'creative'

export type FocusAwardPhoto = {
  id: string
  src: string
  category: FocusAwardCategory
  altEn: string
  altTh: string
}

export type PressCredit = {
  id: string
  nameKey: 'about.awards.press.1.name' | 'about.awards.press.2.name' | 'about.awards.press.3.name'
  contextKey:
    | 'about.awards.press.1.context'
    | 'about.awards.press.2.context'
    | 'about.awards.press.3.context'
  /** public-media. Photos/press-*.webp is not public (400); files are Photos/award/press-*.webp. */
  src: string
  altEn: string
  altTh: string
}

export const FOCUS_AWARD_PHOTOS: FocusAwardPhoto[] = [
  {
    id: 'seascape-1',
    src: publicMediaUrl('Photos/award/focus-2016-seascape-1.webp'),
    category: 'seascape',
    altEn: 'Focus Awards 2016 Bronze — Seascape',
    altTh: 'รางวัลบรอนซ์ Focus Awards 2016 — ทิวทัศน์ทะเล',
  },
  {
    id: 'seascape-2',
    src: publicMediaUrl('Photos/award/focus-2016-seascape-2.webp'),
    category: 'seascape',
    altEn: 'Focus Awards 2016 Bronze — Seascape',
    altTh: 'รางวัลบรอนซ์ Focus Awards 2016 — ทิวทัศน์ทะเล',
  },
  {
    id: 'black-and-white',
    src: publicMediaUrl('Photos/award/focus-2016-blackwhite.webp'),
    category: 'bw',
    altEn: 'Focus Awards 2016 Bronze — Black & White',
    altTh: 'รางวัลบรอนซ์ Focus Awards 2016 — ขาวดำ',
  },
  {
    id: 'creative-1',
    src: publicMediaUrl('Photos/award/focus-2016-creative-1.webp'),
    category: 'creative',
    altEn: 'Focus Awards 2016 Bronze — Creative',
    altTh: 'รางวัลบรอนซ์ Focus Awards 2016 — Creative',
  },
  {
    id: 'creative-2',
    src: publicMediaUrl('Photos/award/focus-2016-creative-2.webp'),
    category: 'creative',
    altEn: 'Focus Awards 2016 Bronze — Creative',
    altTh: 'รางวัลบรอนซ์ Focus Awards 2016 — Creative',
  },
]

export const PRESS_CREDITS: PressCredit[] = [
  {
    id: 'fotoinfo-2014',
    nameKey: 'about.awards.press.1.name',
    contextKey: 'about.awards.press.1.context',
    src: publicMediaUrl('Photos/award/press-fotoinfo.webp'),
    altEn: 'FOTOINFO Magazine October 2014 feature',
    altTh: 'ฟีเจอร์นิตยสาร FOTOINFO ตุลาคม 2014',
  },
  {
    id: 'photo-news-china',
    nameKey: 'about.awards.press.2.name',
    contextKey: 'about.awards.press.2.context',
    src: publicMediaUrl('Photos/award/press-photonews-china.webp'),
    altEn: 'Photo News China night-sky and star-trail photography feature',
    altTh: 'ฟีเจอร์ Photo News จีน ภาพท้องฟ้ายามค่ำคืนและ star trail',
  },
  {
    id: 'thai-sawasdee-2023',
    nameKey: 'about.awards.press.3.name',
    contextKey: 'about.awards.press.3.context',
    src: publicMediaUrl('Photos/award/press-thai-sawasdee.webp'),
    altEn: 'Thai Sawasdee Sydney Opera House Vivid Festival feature, January 2023',
    altTh: 'ฟีเจอร์ไทยสวัสดี เทศกาล Vivid ซิดนีย์โอเปร่าเฮาส์ มกราคม 2023',
  },
]
