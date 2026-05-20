/**
 * SEO: Serve sitemap.xml as real XML (not SPA index.html).
 * Google Search Console requires application/xml — Vercel SPA fallback
 * can return HTML for /sitemap.xml; this serverless route fixes that.
 */
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    const xml = fs.readFileSync(sitemapPath, 'utf8');

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, must-revalidate');
    res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap read error:', err);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send('Sitemap unavailable');
  }
};
