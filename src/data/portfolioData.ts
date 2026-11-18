import { ArtistProfile, Artwork, ArtworkCategory } from '../types/artwork';

/**
 * CUSTOMIZATION GUIDE
 * Replace `name`, `subtitle`, `heroImageUrl`, and `ARTWORKS` below with your own
 * artist profile, monochrome welcome portrait, and gallery pieces.
 */
export const ARTIST_PROFILE: ArtistProfile = {
  name: 'ANVAR CHORIQULOV',
  subtitle: 'PAINTER',
  monogram: 'AC',
  heroImageUrl:
    'https://res.cloudinary.com/laoaegao/image/upload/v1794898824/Gemini_Generated_Image_dfi140dfi140dfi1_wfyuif.jpg',
  heroImageAlt: 'High-contrast monochrome studio portrait of the artist working at an easel',
  aboutImageUrl:
    'https://res.cloudinary.com/ntpikwj6/image/upload/v1794986105/Picsart_26-11-18_12-08-08-149.png',
  studioLocation: 'Bukhara',
  aboutHeadline: 'ANVAR CHORIQULOV',
  aboutByline: 'Contemporary Oil Painter | Bukhara, Uzbekistan',
  statementLead:
    'Anvar Choriqulov is a contemporary oil painter based in Bukhara, Uzbekistan. His artistic practice is centered on figurative painting, with a particular interest in historical subjects and the visual character of the twentieth century.',
  statementParagraphs: [
    'Having developed his artistic abilities through formal schooling and independent study, Choriqulov has cultivated an individual approach to painting that embraces a diverse range of subjects and compositions.',
    'Working primarily in oil, his work frequently explores historical human figures, often bringing together small groups of individuals within carefully constructed compositions. His artistic interests extend across different themes and visual narratives, reflecting an ongoing exploration of figurative expression and painterly technique.',
    'His practice is driven by a commitment to developing his own artistic language through continuous exploration, observation, and the discipline of painting.',
  ],
  exhibitions: [],
  contactEmail: 'artistchoriqulov@gmail.com',
  instagramHandle: '@anvar_choriqulov571',
  representation: 'Choriqulov Atelier · Private Viewing by Appointment',
};

export const GALLERY_CATEGORIES: ArtworkCategory[] = ['ALL'];

export const ARTWORKS: Artwork[] = [
  {
    id: 'artwork-1',
    accessionNumber: 'AC-2026-01',
    title: 'Darvesh',
    category: 'ALL',
    dimensions: '50 × 40 cm',
    medium: 'Oil on Canvas',
    year: '2026',
    price: '300 USD',
    imageUrl: 'https://res.cloudinary.com/ntpikwj6/image/upload/v1794981809/35.png',
    aspectRatio: 'square',
    description: 'Original oil painting study from the Bukhara studio capturing classical figurative presence.',
  },
  {
    id: 'artwork-2',
    accessionNumber: 'AC-2026-02',
    title: 'Chol',
    category: 'ALL',
    dimensions: '30 × 40 cm',
    medium: 'Oil on Canvas',
    year: '2026',
    price: '300 USD',
    imageUrl: 'https://res.cloudinary.com/ntpikwj6/image/upload/v1794981803/37.png',
    aspectRatio: 'landscape',
    description: 'Textural landscape and figure study created with layered oil pigments.',
  },
  {
    id: 'artwork-3',
    accessionNumber: 'AC-2026-03',
    title: 'Dravesh',
    category: 'ALL',
    dimensions: '60 × 40 cm',
    medium: 'Oil on Canvas',
    year: '2026',
    price: '250 USD',
    imageUrl: 'https://res.cloudinary.com/ntpikwj6/image/upload/v1794981794/34.png',
    aspectRatio: 'portrait',
    description: 'Expressive figurative composition exploring shadow and dramatic lighting.',
  },
  {
    id: 'artwork-4',
    accessionNumber: 'AC-2026-04',
    title: 'Zikr',
    category: 'ALL',
    dimensions: '60 × 40 cm',
    medium: 'Oil on Canvas',
    year: '2026',
    price: '400 USD',
    imageUrl: 'https://res.cloudinary.com/ntpikwj6/image/upload/v1794981785/39.png',
    aspectRatio: 'portrait',
    description: 'Spiritual narrative and atmospheric portrait study from the Bukhara atelier.',
  },
  {
    id: 'artwork-5',
    accessionNumber: 'AC-2026-05',
    title: 'Usta',
    category: 'ALL',
    dimensions: '55 × 75 cm',
    medium: 'Oil on Canvas',
    year: '2026',
    price: '500 USD',
    imageUrl: 'https://res.cloudinary.com/ntpikwj6/image/upload/v1794981784/40.png',
    aspectRatio: 'portrait',
    description: 'Master portrait study showcasing refined brushwork and historical depth.',
  },
];



