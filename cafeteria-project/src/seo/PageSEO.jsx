import { Helmet } from 'react-helmet-async';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_AUTHOR,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
} from './siteConfig';

/**
 * SEO: Dynamic per-page meta tags via react-helmet-async.
 * Updates document title, description, canonical URL, Open Graph, and Twitter cards
 * when React Router navigates between SPA routes (Google can index rendered JS).
 */
export default function PageSEO({
  title,
  description,
  keywords = DEFAULT_KEYWORDS,
  path = '/',
  noindex = false,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
}) {
  const canonical = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const robots = noindex ? 'noindex, nofollow' : 'index, follow';

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={DEFAULT_AUTHOR} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph — used by Facebook, LinkedIn, etc. */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
