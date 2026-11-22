import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ArtworkLightbox } from './components/ArtworkLightbox';
import { BackToTopButton } from './components/BackToTopButton';
import { CinematicBackdrop } from './components/CinematicBackdrop';
import { ContactSection } from './components/ContactSection';
import { Navbar } from './components/Navbar';
import ParticleTransition from './components/ParticleTransition';
import { PortfolioGallery } from './components/PortfolioGallery';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { WelcomeGate } from './components/WelcomeGate';
import { ARTIST_PROFILE, ARTWORKS, GALLERY_CATEGORIES } from './data/portfolioData';
import { Artwork } from './types/artwork';
import { filterArtworks, getAdjacentArtwork, getAvailableArtworks } from './utils/galleryLogic';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import {
  disableBrowserScrollRestoration,
  instantResetScrollToTop,
} from './utils/scrollReset';
import { getParticleTransitionInk, useTheme } from './utils/useTheme';

function shouldAutostartFromQuery(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('autostart') === '1';
}

function shouldShowSkeletonFromQuery(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('skeleton') === '1';
}

function PortfolioApp() {
  const { language, t } = useLanguage();
  const theme = useTheme();
  const [transitionActive, setTransitionActive] = useState<boolean>(false);
  const [isEntered, setIsEntered] = useState<boolean>(shouldAutostartFromQuery);
  const [titleVisible, setTitleVisible] = useState<boolean>(shouldAutostartFromQuery);
  const [isGalleryLoading] = useState<boolean>(shouldShowSkeletonFromQuery);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [inquirySubject] = useState<string>('');

  useEffect(() => {
    disableBrowserScrollRestoration();
  }, []);

  useLayoutEffect(() => {
    if (isEntered) {
      instantResetScrollToTop();
    }
  }, [isEntered]);

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
    instantResetScrollToTop();
    setTransitionActive(true);
  }, []);

  const handleTransitionStart = useCallback(() => {
    setIsEntered(true);
    instantResetScrollToTop();
  }, []);

  const handleTransitionDone = useCallback(() => {
    setTransitionActive(false);
    setTitleVisible(true);
  }, []);

  const handleReplayEntrance = useCallback(() => {
    setSelectedArtworkId(null);
    setTransitionActive(false);
    setIsEntered(false);
    setTitleVisible(false);
    instantResetScrollToTop();
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
    <div
      className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)]"
      data-entered={isEntered ? 'true' : 'false'}
    >
      {!isEntered && <CinematicBackdrop />}
      {isEntered && (
        <ScrollProgressBar visible={isEntered} layoutKey={`ALL-${filteredArtworks.length}`} />
      )}
      <WelcomeGate isEntered={isEntered} onEnter={handleEnterPlatform} />

      {isEntered && (
        <div className="relative z-10 opacity-100">
          <Navbar onReplayEntrance={handleReplayEntrance} />

          <main>
            <PortfolioGallery
              artworks={availableArtworks}
              categories={GALLERY_CATEGORIES}
              activeCategory="ALL"
              searchQuery={searchQuery}
              isEntered={isEntered}
              isTransitioning={transitionActive}
              isLoading={isGalleryLoading}
              titleVisible={titleVisible}
              onSearchChange={setSearchQuery}
              onOpenArtwork={handleOpenArtwork}
            />
          </main>

          <ContactSection
            prefilledSubject={inquirySubject}
            isEntered={isEntered}
            isTransitioning={transitionActive}
            onReplayEntrance={handleReplayEntrance}
          />
        </div>
      )}

      <ParticleTransition
        active={transitionActive}
        imageSrc={ARTIST_PROFILE.heroImageUrl}
        text={t.portfolio.catalogueTitle}
        locale={language}
        bg="#080808"
        ink={getParticleTransitionInk(theme)}
        onStart={handleTransitionStart}
        onDone={handleTransitionDone}
      />

      {isEntered && (
        <>
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
        </>
      )}

      {!isEntered && (
        <div
          aria-hidden="true"
          data-testid="film-grain-overlay"
          className="film-grain-overlay"
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <PortfolioApp />
    </LanguageProvider>
  );
}
