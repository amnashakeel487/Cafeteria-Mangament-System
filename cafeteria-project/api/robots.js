const ROBOTS_TXT = `User-agent: *
Allow: /

Disallow: /api/

Sitemap: https://cafeteria-mangament-system.vercel.app/sitemap.xml
`;

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, must-revalidate');
  res.status(200).send(ROBOTS_TXT);
};
