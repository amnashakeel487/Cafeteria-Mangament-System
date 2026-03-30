const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'frontend');
const targetDir = __dirname;

const filesToMove = [
  'index.html',
  'package.json',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'eslint.config.js',
  'src',
  'public',
  '.gitignore',
  'README.md'
];

try {
  filesToMove.forEach(file => {
    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(targetDir, file);
    if (fs.existsSync(srcPath)) {
      if (fs.existsSync(destPath)) {
         fs.rmSync(destPath, { force: true, recursive: true });
      }
      fs.renameSync(srcPath, destPath);
      console.log(`Moved ${file} to root.`);
    }
  });
  console.log("Move complete.");
} catch (e) {
  console.error("Move failed", e);
}
