export function disableBrowserScrollRestoration(): void {
  if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
}

export function instantResetScrollToTop(scrollContainers?: Array<HTMLElement | null>): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  disableBrowserScrollRestoration();

  const html = document.documentElement;
  const body = document.body;
  const prevHtmlBehavior = html.style.scrollBehavior;
  const prevBodyBehavior = body.style.scrollBehavior;

  html.style.scrollBehavior = 'auto';
  body.style.scrollBehavior = 'auto';

  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    html.scrollTop = 0;
    html.scrollLeft = 0;
    body.scrollTop = 0;
    body.scrollLeft = 0;

    if (scrollContainers) {
      for (const el of scrollContainers) {
        if (!el) continue;
        const prevContainerBehavior = el.style.scrollBehavior;
        el.style.scrollBehavior = 'auto';
        try {
          el.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          el.scrollTop = 0;
          el.scrollLeft = 0;
        } finally {
          el.style.scrollBehavior = prevContainerBehavior;
        }
      }
    }
  } finally {
    html.style.scrollBehavior = prevHtmlBehavior;
    body.style.scrollBehavior = prevBodyBehavior;
  }
}
