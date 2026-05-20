/**
 * SEO: Serve robots.txt as plain text (avoids SPA HTML fallback on Vercel).
 */
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
    const text = fs.readFileSync(robotsPath, 'utf8');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, must-revalidate');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).send('Robots unavailable');
  }
};
