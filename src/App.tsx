import { useCallback, useMemo, useState } from 'react';
import { ArtworkLightbox } from './components/ArtworkLightbox';
import { BackToTopButton } from './components/BackToTopButton';
import { CinematicBackdrop } from './components/CinematicBackdrop';
import { ContactSection } from './components/ContactSection';
import { Navbar } from './components/Navbar';
import { PortfolioGallery } from './components/PortfolioGallery';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { WelcomeGate } from './components/WelcomeGate';
import { ARTWORKS, GALLERY_CATEGORIES } from './data/portfolioData';
import { Artwork } from './types/artwork';
import { filterArtworks, getAdjacentArtwork, getAvailableArtworks } from './utils/galleryLogic';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [inquirySubject] = useState<string>('');

  const availableArtworks = useMemo(
    () => getAvailableArtworks(ARTWORKS),
    []
  );

  const filteredArtworks = useMemo(
    () => filterArtworks(availableArtworks, 'ALL', searchQuery),
    [availableArtworks, searchQuery]
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

  const handleOpenArtwork = useCallback((artwork: Artwork) => {
    setSelectedArtworkId(artwork.id);
  }, []);

  return (
    <LanguageProvider>
      <div
        className="relative min-h-screen bg-[#FFFFFF] text-[#222222]"
        data-entered={isEntered ? 'true' : 'false'}
      >
        {!isEntered && <CinematicBackdrop />}
        <ScrollProgressBar visible={isEntered} layoutKey={`ALL-${filteredArtworks.length}`} />
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
              artworks={availableArtworks}
              categories={GALLERY_CATEGORIES}
              activeCategory="ALL"
              searchQuery={searchQuery}
              isEntered={isEntered}
              isLoading={isGalleryLoading}
              onSearchChange={setSearchQuery}
              onOpenArtwork={handleOpenArtwork}
            />
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
        />

        <BackToTopButton
          isEntered={isEntered}
          isLightboxOpen={selectedArtwork !== null}
        />

        {!isEntered && <div aria-hidden="true" data-testid="film-grain-overlay" className="film-grain-overlay" />}
      </div>
    </LanguageProvider>
  );
}
