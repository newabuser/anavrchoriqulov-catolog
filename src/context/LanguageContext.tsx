import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Language, LanguageOption, TranslationDictionary } from '../types/i18n';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../i18n/translations';

const STORAGE_KEY = 'anvar_portfolio_lang';
const DEFAULT_LANGUAGE: Language = 'uz';

function isSupportedLanguage(val: string | null): val is Language {
  return val === 'uz' || val === 'en' || val === 'ru';
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(saved)) {
      return saved;
    }
  } catch {
    // In private browsing or restricted iframe mode, localStorage may fail gracefully
  }
  return DEFAULT_LANGUAGE;
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  options: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Graceful fallback
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: TRANSLATIONS[language],
    options: LANGUAGE_OPTIONS,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
