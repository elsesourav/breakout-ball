import { PageMetadata } from './types';

/**
 * DOM Metadata Updater
 * Manages dynamic document title, standard SEO tags, Open Graph, Twitter Cards,
 * canonical links, and JSON-LD structured data.
 */

const SITE_NAME = 'Breakout Ball';
const DEFAULT_THEME_COLOR = '#03040c';

/**
 * Helper to get or create a <meta> element in document.head
 */
const setMetaTag = (attribute: 'name' | 'property', attrValue: string, content: string): void => {
  if (typeof document === 'undefined') return;

  let meta = document.head.querySelector(`meta[${attribute}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, attrValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

/**
 * Helper to get or create a <link> element in document.head
 */
const setLinkTag = (rel: string, href: string): void => {
  if (typeof document === 'undefined') return;

  let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

/**
 * Helper to update JSON-LD structured data in document.head
 */
const setStructuredData = (id: string, data: Record<string, unknown>): void => {
  if (typeof document === 'undefined') return;

  let script = document.head.querySelector(`script#${id}`) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
};

/**
 * Update the document head with new PageMetadata
 */
export const updatePageMetadata = (meta: PageMetadata): void => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  // 1. Document Title
  document.title = meta.title;

  // 2. Standard Meta Tags
  setMetaTag('name', 'title', meta.title);
  setMetaTag('name', 'description', meta.description);
  if (meta.keywords && meta.keywords.length > 0) {
    setMetaTag('name', 'keywords', meta.keywords.join(', '));
  }
  // Lock mobile status bar / top notch permanently to dark theme so it never flashes or turns neon blue across tabs
  setMetaTag('name', 'theme-color', DEFAULT_THEME_COLOR);

  // 3. Canonical Link
  const fullCanonicalUrl = meta.canonicalUrl.startsWith('http')
    ? meta.canonicalUrl
    : `${window.location.origin}${meta.canonicalUrl.startsWith('/') ? '' : '/'}${meta.canonicalUrl}`;
  setLinkTag('canonical', fullCanonicalUrl);

  // 4. Open Graph Tags (Facebook, Discord, WhatsApp, LinkedIn)
  const og = meta.openGraph;
  const fullOgUrl = og.url.startsWith('http')
    ? og.url
    : `${window.location.origin}${og.url.startsWith('/') ? '' : '/'}${og.url}`;
  const fullOgImage = og.image.startsWith('http')
    ? og.image
    : `${window.location.origin}${og.image.startsWith('/') ? '' : '/'}${og.image}`;

  setMetaTag('property', 'og:site_name', og.siteName || SITE_NAME);
  setMetaTag('property', 'og:type', og.type || 'website');
  setMetaTag('property', 'og:title', og.title);
  setMetaTag('property', 'og:description', og.description);
  setMetaTag('property', 'og:url', fullOgUrl);
  setMetaTag('property', 'og:image', fullOgImage);
  setMetaTag('property', 'og:image:secure_url', fullOgImage);
  setMetaTag('property', 'og:image:type', og.imageType || 'image/jpeg');
  setMetaTag('property', 'og:image:width', String(og.imageWidth || 1200));
  setMetaTag('property', 'og:image:height', String(og.imageHeight || 630));
  setMetaTag('property', 'og:image:alt', og.imageAlt || og.title);
  setMetaTag('property', 'og:locale', og.locale || 'en_US');

  // 5. Twitter Card Tags
  const tw = meta.twitter;
  const fullTwImage = tw.image.startsWith('http')
    ? tw.image
    : `${window.location.origin}${tw.image.startsWith('/') ? '' : '/'}${tw.image}`;

  setMetaTag('name', 'twitter:card', tw.card || 'summary_large_image');
  setMetaTag('name', 'twitter:title', tw.title);
  setMetaTag('name', 'twitter:description', tw.description);
  setMetaTag('name', 'twitter:image', fullTwImage);
  setMetaTag('name', 'twitter:image:alt', tw.imageAlt || tw.title);
  if (tw.site) setMetaTag('name', 'twitter:site', tw.site);
  if (tw.creator) setMetaTag('name', 'twitter:creator', tw.creator);

  // 6. JSON-LD Structured Data
  if (meta.structuredData) {
    setStructuredData('schema-page-meta', meta.structuredData);
  }
};
