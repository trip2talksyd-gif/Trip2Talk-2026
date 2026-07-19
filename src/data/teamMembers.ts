/** Team portraits on About page — drop files into /public/team/ */

export type TeamMember = {
  id: 'saen' | 'ploy'
  nameEn: string
  nameTh: string
  roleEn: string
  roleTh: string
  /** Preferred paths tried in order (first that loads wins). */
  photoSrcs: string[]
  initial: string
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'saen',
    nameEn: 'Saen',
    nameTh: 'Saen',
    roleEn: 'Trip Leader & Photographer',
    roleTh: 'หัวหน้าทริป & ช่างภาพ',
    photoSrcs: ['/team/saen.webp', '/team/saen.jpg', '/team/saen.png'],
    initial: 'S',
  },
  {
    id: 'ploy',
    nameEn: 'Monsicha Chayakorn (Ploy)',
    nameTh: 'Monsicha Chayakorn (Ploy)',
    roleEn: 'Admin & Trip Staff',
    roleTh: 'แอดมิน & ทีมทริป',
    photoSrcs: ['/team/ploy.webp', '/team/ploy.jpg', '/team/ploy.png'],
    initial: 'P',
  },
]
