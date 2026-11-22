import { useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark';

// The site is light by default. Only an explicit choice made with the theme toggle
// (saved in localStorage) switches it to dark; the device's dark-mode setting is ignored.
export function resolveInitialTheme(
  savedTheme: string | null | undefined,
  _prefersDark?: boolean
): ThemeMode {
  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function getChladniThemeColors(theme: ThemeMode): {
  sand: string;
  plate: string;
} {
  return theme === 'dark'
    ? { sand: '#FF2A2A', plate: '#0a0a0a' }
    : { sand: '#D20000', plate: '#FFFFFF' };
}

export function getParticleTransitionInk(theme: ThemeMode): string {
  return theme === 'dark' ? '#FF2A2A' : '#D20000';
}

function getThemeSnapshot(): ThemeMode {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function getServerThemeSnapshot(): ThemeMode {
  return 'light';
}

function subscribeTheme(onStoreChange: () => void): () => void {
  if (typeof document === 'undefined') return () => {};

  const observer =
    typeof MutationObserver !== 'undefined'
      ? new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.attributeName === 'data-theme') {
              onStoreChange();
              break;
            }
          }
        })
      : null;

  observer?.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  const onStorage = (event: StorageEvent) => {
    if (event.key === 'theme') {
      const next = resolveInitialTheme(
        event.newValue,
        typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
      );
      document.documentElement.dataset.theme = next;
      onStoreChange();
    }
  };

  window.addEventListener('storage', onStorage);

  return () => {
    observer?.disconnect();
    window.removeEventListener('storage', onStorage);
  };
}

export function useTheme(): ThemeMode {
  return useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );
}
