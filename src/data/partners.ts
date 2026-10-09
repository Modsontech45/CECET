export interface Partner {
  id: string
  name: string
  category: string
  city: string
  address: string
  phone?: string
  description_fr: string
  description_en: string
}

export const PARTNERS: Partner[] = [
  {
    id: 'p1',
    name: 'Supermarché Lomé Plus',
    category: 'food',
    city: 'Lomé',
    address: 'Avenue de la Libération, Lomé',
    phone: '+228 90 00 00 01',
    description_fr: 'Supermarché partenaire proposant alimentation, épicerie et produits frais.',
    description_en: 'Partner supermarket offering food, groceries and fresh produce.',
  },
  {
    id: 'p2',
    name: 'Pharmacie du Bénin',
    category: 'health',
    city: 'Lomé',
    address: 'Boulevard du Mono, Lomé',
    phone: '+228 90 00 00 02',
    description_fr: 'Pharmacie agréée avec large gamme de médicaments et produits de santé.',
    description_en: 'Approved pharmacy with a wide range of medicines and health products.',
  },
  {
    id: 'p3',
    name: 'Mode Africaine',
    category: 'clothing',
    city: 'Lomé',
    address: 'Marché de Lomé, Lomé',
    description_fr: 'Boutique de mode proposant prêt-à-porter et tenues traditionnelles.',
    description_en: 'Fashion boutique offering ready-to-wear and traditional outfits.',
  },
  {
    id: 'p4',
    name: 'Centre de Formation Pro',
    category: 'education',
    city: 'Lomé',
    address: 'Quartier Tokoin, Lomé',
    phone: '+228 90 00 00 04',
    description_fr: 'Centre de formation professionnelle pour adultes et entrepreneurs.',
    description_en: 'Professional training centre for adults and entrepreneurs.',
  },
  {
    id: 'p5',
    name: 'Salon Beauté Togo',
    category: 'services',
    city: 'Lomé',
    address: 'Quartier Bè, Lomé',
    description_fr: 'Salon de coiffure et de beauté pour hommes et femmes.',
    description_en: 'Hair and beauty salon for men and women.',
  },
  {
    id: 'p6',
    name: 'Transport Express Kara',
    category: 'transport',
    city: 'Kara',
    address: 'Gare routière de Kara',
    phone: '+228 90 00 00 06',
    description_fr: 'Service de transport urbain et interurbain, Kara et environs.',
    description_en: 'Urban and inter-city transport service, Kara and surroundings.',
  },
  {
    id: 'p7',
    name: 'Épicerie du Marché',
    category: 'food',
    city: 'Sokodé',
    address: 'Marché central de Sokodé',
    description_fr: 'Épicerie de proximité avec produits locaux et importés.',
    description_en: 'Neighbourhood grocery store with local and imported products.',
  },
  {
    id: 'p8',
    name: 'Clinique Santé Plus',
    category: 'health',
    city: 'Lomé',
    address: 'Avenue de la Nouvelle Marche, Lomé',
    phone: '+228 90 00 00 08',
    description_fr: 'Clinique privée proposant consultations, analyses et soins.',
    description_en: 'Private clinic offering consultations, tests and care.',
  },
]

export const PARTNER_CATEGORIES = ['food', 'health', 'clothing', 'services', 'education', 'transport'] as const
export const PARTNER_CITIES = ['Lomé', 'Kara', 'Sokodé'] as const
