export type Language = 'uz' | 'en' | 'ru';

export interface LanguageOption {
  code: Language;
  label: string;
  shortLabel: string;
  nativeName: string;
}

export interface TranslationDictionary {
  nav: {
    gallery: string;
    gallerySubtitle: string;
    about: string;
    aboutSubtitle: string;
    contact: string;
    contactSubtitle: string;
    menuTitle: string;
    openMenu: string;
    closeMenu: string;
    selectLanguage: string;
    entranceGate: string;
  };
  portfolio: {
    catalogueTitle: string;
    catalogueSubtitle: string;
    allCategory: string;
    oilCategory: string;
    watercolorCategory: string;
    soldCategory: string;
    soldBadge: string;
    availableLabel: string;
    searchPlaceholder: string;
    searchLabel: string;
    clearSearch: string;
    searchEmptyHeading: string;
    searchEmptyDescription: string;
    inspectArtwork: string;
    viewDetails: string;
    curatorialArchive: string;
    emptyHeadingAll: string;
    emptyHeadingCategory: string;
    emptyDescription: string;
    viewAllCategories: string;
    inquirePrivateViewing: string;
  };
  about: {
    sectionLabel: string;
    aboutHeadline: string;
    aboutByline: string;
    statementLead: string;
    statementParagraphs: string[];
    tagMedium: string;
    tagCompositions: string;
    tagLocation: string;
    atelierPractice: string;
    studioLocation: string;
    painterRole: string;
  };
  contact: {
    sectionLabel: string;
    heading: string;
    lead: string;
    directCorrespondence: string;
    representation: string;
    representationValue: string;
    journalNotes: string;
    comingSoon: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    subjectLabel: string;
    defaultSubject: string;
    inquiryPrefix: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendInquiry: string;
    sendAnotherMessage: string;
    inquirySent: string;
    inquiryConfirmation: (name: string, subject: string, email: string) => string;
    errors: {
      name: string;
      email: string;
      emailInvalid: string;
      message: string;
    };
  };
  lightbox: {
    close: string;
    previous: string;
    next: string;
    medium: string;
    dimensions: string;
    price: string;
    edition: string;
    availability: string;
    availableStatus: string;
    soldStatus: string;
    uniqueOriginal: string;
    buyButton: string;
  };
  footer: {
    rightsReserved: string;
    entranceGate: string;
    backToTop: string;
  };
}
