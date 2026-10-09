export interface Article {
  id: string
  slug: string
  title_fr: string
  title_en: string
  excerpt_fr: string
  excerpt_en: string
  content_fr: string
  content_en: string
  date: string
  category: string
}

export const ARTICLES: Article[] = [
  {
    id: 'a1',
    slug: 'lancement-site-refonte',
    title_fr: 'Lancement du nouveau site CECT',
    title_en: 'Launch of the new CECT website',
    excerpt_fr: 'La CECT est heureuse d\'annoncer le lancement de son site internet entièrement repensé.',
    excerpt_en: 'CECT is pleased to announce the launch of its completely redesigned website.',
    content_fr: 'La CECT est heureuse d\'annoncer le lancement de son site internet entièrement repensé, plus moderne, plus lisible et désormais disponible en français et en anglais. Ce nouveau site reflète notre engagement pour la transparence et l\'accessibilité.',
    content_en: 'CECT is pleased to announce the launch of its completely redesigned website, more modern, more readable and now available in French and English. This new website reflects our commitment to transparency and accessibility.',
    date: '2026-10-04',
    category: 'announcement',
  },
  {
    id: 'a2',
    slug: 'nouveaux-partenaires-octobre-2026',
    title_fr: 'Nouveaux partenaires — Octobre 2026',
    title_en: 'New partners — October 2026',
    excerpt_fr: 'Trois nouveaux commerçants rejoignent le réseau CECT ce mois-ci.',
    excerpt_en: 'Three new merchants join the CECT network this month.',
    content_fr: 'Nous sommes ravis d\'accueillir trois nouveaux commerçants dans notre réseau. Ils accepteront désormais le YEM et proposeront 15 % de réduction à tous les membres CECT.',
    content_en: 'We are delighted to welcome three new merchants to our network. They will now accept the YEM and offer a 15% discount to all CECT members.',
    date: '2026-10-01',
    category: 'partners',
  },
  {
    id: 'a3',
    slug: 'assemblee-generale-2026',
    title_fr: 'Assemblée générale 2026 — Compte rendu',
    title_en: '2026 General Assembly — Minutes',
    excerpt_fr: 'La première assemblée générale de la CECT s\'est tenue à Lomé le 15 septembre 2026.',
    excerpt_en: 'CECT\'s first general assembly was held in Lomé on 15 September 2026.',
    content_fr: 'La première assemblée générale de la CECT s\'est tenue à Lomé le 15 septembre 2026 en présence de 87 membres. Le bilan de la première année d\'activité a été présenté et le conseil d\'administration renouvelé.',
    content_en: 'CECT\'s first general assembly was held in Lomé on 15 September 2026 in the presence of 87 members. The first year\'s activity report was presented and the board of directors renewed.',
    date: '2026-09-20',
    category: 'governance',
  },
]
