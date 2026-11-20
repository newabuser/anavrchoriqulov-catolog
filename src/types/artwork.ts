export type ArtworkCategory = 'ALL' | 'OIL' | 'WATERCOLOR' | 'SOLD';

export type ExcludeAllCategory = string;

export type AspectRatioHint = 'portrait' | 'landscape' | 'square';

export type ArtworkMediumType = 'oil' | 'watercolor';

export type ArtworkStatus = 'available' | 'sold';

export interface Artwork {
  id: string;
  accessionNumber: string;
  title: string;
  category: ExcludeAllCategory;
  year: string;
  medium: string;
  mediumType?: ArtworkMediumType;
  dimensions: string;
  width: number;
  height: number;
  price?: string;
  status: ArtworkStatus;
  imageUrl: string;
  aspectRatio: AspectRatioHint;
  description: string;
}

export interface ArtistProfile {
  name: string;
  subtitle: string;
  monogram: string;
  heroImageUrl: string;
  heroImageAlt: string;
  aboutImageUrl?: string;
  studioLocation: string;
  aboutHeadline: string;
  aboutByline: string;
  statementLead: string;
  statementParagraphs: string[];
  exhibitions: Array<{
    year: string;
    title: string;
    venue: string;
  }>;
  contactEmail: string;
  instagramHandle: string;
  representation: string;
}

export interface InquiryFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface InquiryFormErrors {
  name?: string;
  email?: string;
  message?: string;
}
