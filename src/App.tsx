import { useCallback, useMemo, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { ArtworkLightbox } from './components/ArtworkLightbox';
import { BackToTopButton } from './components/BackToTopButton';
import { CinematicBackdrop } from './components/CinematicBackdrop';
import { ContactSection } from './components/ContactSection';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { PortfolioGallery } from './components/PortfolioGallery';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { WelcomeGate } from './components/WelcomeGate';
import { ARTWORKS, GALLERY_CATEGORIES } from './data/portfolioData';
import { Artwork, ArtworkCategory } from './types/artwork';
import { filterArtworksByCategory, getAdjacentArtwork } from './utils/galleryLogic';
import { LanguageProvider } from './context/LanguageContext';

function shouldAutostartFromQuery(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('autostart') === '1';
}

function shouldShowSkeletonFromQuery(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('skeleton') === '1';
}

export default function App() {
  const [isEntered, setIsEntered] = useState<boolean>(shouldAutostartFromQuery);
  const [isGalleryLoading] = useState<boolean>(shouldShowSkeletonFromQuery);
  const [activeCategory, setActiveCategory] = useState<ArtworkCategory>('ALL');
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [inquirySubject, setInquirySubject] = useState<string>('');

  const filteredArtworks = useMemo(
    () => filterArtworksByCategory(ARTWORKS, activeCategory),
    [activeCategory]
  );

  const selectedIndex = useMemo(
    () => filteredArtworks.findIndex((item) => item.id === selectedArtworkId),
    [filteredArtworks, selectedArtworkId]
  );

  const selectedArtwork: Artwork | null =
    selectedIndex >= 0 ? filteredArtworks[selectedIndex] : null;

  const handleEnterPlatform = useCallback(() => {
    setIsEntered(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleReplayEntrance = useCallback(() => {
    setSelectedArtworkId(null);
    setIsEntered(false);
  }, []);

  const handleSelectCategory = useCallback((category: ArtworkCategory) => {
    setActiveCategory(category);
    setSelectedArtworkId(null);
  }, []);

  const handleNavigateLightbox = useCallback(
    (direction: 'prev' | 'next') => {
      const target = getAdjacentArtwork(
        filteredArtworks,
        selectedArtworkId,
        direction
      );
      if (target) {
        setSelectedArtworkId(target.id);
      }
    },
    [filteredArtworks, selectedArtworkId]
  );

  const handleInquireFromLightbox = useCallback((artworkTitle: string) => {
    setSelectedArtworkId(null);
    setInquirySubject(artworkTitle);
    const contactEl = document.getElementById('contact');
    contactEl?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <LanguageProvider>
      <div
        className="relative min-h-screen bg-[#050505] text-[#eaeaea]"
        data-entered={isEntered ? 'true' : 'false'}
      >
        <CinematicBackdrop />
        <ScrollProgressBar visible={isEntered} layoutKey={activeCategory} />
        <WelcomeGate isEntered={isEntered} onEnter={handleEnterPlatform} />

        <div
          aria-hidden={!isEntered}
          className={`relative z-10 transition-opacity duration-700 ease-out ${
            isEntered ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'
          }`}
        >
          <Navbar onReplayEntrance={handleReplayEntrance} />

          <main>
            <PortfolioGallery
              artworks={ARTWORKS}
              categories={GALLERY_CATEGORIES}
              activeCategory={activeCategory}
              isEntered={isEntered}
              isLoading={isGalleryLoading}
              onSelectCategory={handleSelectCategory}
              onOpenArtwork={(artwork) => setSelectedArtworkId(artwork.id)}
            />

            <AboutSection />
          </main>

          <ContactSection
            prefilledSubject={inquirySubject}
            onReplayEntrance={handleReplayEntrance}
          />
        </div>

        <ArtworkLightbox
          artwork={selectedArtwork}
          totalCount={filteredArtworks.length}
          currentIndex={selectedIndex}
          onClose={() => setSelectedArtworkId(null)}
          onNavigate={handleNavigateLightbox}
          onInquire={handleInquireFromLightbox}
        />

        <BackToTopButton
          isEntered={isEntered}
          isLightboxOpen={selectedArtwork !== null}
        />

        <div aria-hidden="true" data-testid="film-grain-overlay" className="film-grain-overlay" />
        <CustomCursor />
      </div>
    </LanguageProvider>
  );
}
