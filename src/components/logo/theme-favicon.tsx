import { useEffect } from 'react';
// hooks
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

const FAVICON = {
  light: {
    png32: '/favicon/favicon-32x32.png',
    apple: '/favicon/apple-touch-icon.png',
  },
  dark: {
    png32: '/favicon/favicon-32x32-dark.png',
    apple: '/favicon/apple-touch-icon-dark.png',
  },
} as const;

/**
 * Mantém o favicon alinhado com o themeMode da app (light/dark).
 */
export default function ThemeFavicon() {
  const { themeMode } = useSettingsContext();

  useEffect(() => {
    const assets = themeMode === 'dark' ? FAVICON.dark : FAVICON.light;
    const cacheBust = `?v=${themeMode}`;

    document
      .querySelectorAll<HTMLLinkElement>('link[rel="icon"][type="image/png"]')
      .forEach((link) => {
        if (link.sizes?.contains('32x32') || link.getAttribute('sizes') === '32x32') {
          link.href = `${assets.png32}${cacheBust}`;
          link.removeAttribute('media');
        }
      });

    const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (apple) {
      apple.href = `${assets.apple}${cacheBust}`;
    }
  }, [themeMode]);

  return null;
}
