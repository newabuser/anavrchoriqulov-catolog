import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import portfolioDividerOrnamentWhite from '../assets/images/portfolio-divider-ornament-white.png';

interface PortfolioCategoryHeaderProps {
  id?: string;
  headingId?: string;
  title?: string;
  subtitle?: string;
  titleVisible?: boolean;
}

export function PortfolioCategoryHeader({
  id = 'home',
  headingId = 'portfolio-heading',
  title,
  subtitle,
  titleVisible = true,
}: PortfolioCategoryHeaderProps) {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  const displayTitle = title ?? t.portfolio.catalogueTitle;
  const displaySubtitle = subtitle ?? t.portfolio.catalogueSubtitle;

  const isLongHeading = displayTitle.trim().length > 13;

  return (
    <motion.header
      id={id}
      initial={false}
      className="portfolio-category-header"
    >
      <h1
        id={headingId}
        data-title-visible={titleVisible ? 'true' : 'false'}
        className="portfolio-category-title"
        style={{
          opacity: titleVisible ? 1 : 0,
          transition: prefersReducedMotion ? 'none' : 'opacity 0.4s ease-out',
          ...(isLongHeading
            ? {
                fontSize: 'clamp(0.95rem, 3.6vw, 1.625rem)',
                letterSpacing: 'clamp(0.26em, 0.85vw, 0.46em)',
                paddingLeft: 'clamp(0.26em, 0.85vw, 0.46em)',
              }
            : undefined),
        }}
      >
        {displayTitle}
      </h1>
      <p className="portfolio-category-subtitle">{displaySubtitle}</p>
      <div aria-hidden="true" className="portfolio-ornament-divider">
        <img
          src={portfolioDividerOrnamentWhite}
          alt=""
          draggable={false}
          data-testid="portfolio-divider-ornament"
          className="portfolio-ornament-img"
        />
      </div>
    </motion.header>
  );
}
