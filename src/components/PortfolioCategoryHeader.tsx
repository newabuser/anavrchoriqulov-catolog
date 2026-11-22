import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import portfolioDividerOrnamentWhite from '../assets/images/portfolio-divider-ornament-white.png';

interface PortfolioCategoryHeaderProps {
  id?: string;
  headingId?: string;
  title?: string;
  subtitle?: string;
}

export function PortfolioCategoryHeader({
  id = 'home',
  headingId = 'portfolio-heading',
  title,
  subtitle,
}: PortfolioCategoryHeaderProps) {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  const displayTitle = title ?? t.portfolio.catalogueTitle;
  const displaySubtitle = subtitle ?? t.portfolio.catalogueSubtitle;

  return (
    <motion.header
      id={id}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
      }
      className="portfolio-category-header"
    >
      <h1 id={headingId} className="portfolio-category-title">
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
