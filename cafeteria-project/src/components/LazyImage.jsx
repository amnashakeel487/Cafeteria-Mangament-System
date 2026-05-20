/**
 * SEO & Performance: Lazy-loaded image with required alt text for accessibility and search.
 * Uses native loading="lazy" and decoding="async" to defer off-screen images.
 */
export default function LazyImage({ src, alt, className = '', ...props }) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt || 'Image'}
      loading="lazy"
      decoding="async"
      className={className}
      {...props}
    />
  );
}
