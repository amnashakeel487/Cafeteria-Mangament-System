const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(dirPath);
    });
}

const srcPath = path.join(__dirname, 'src');
let filesUpdated = 0;

walk(srcPath, function(filePath) {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content.replace(/['"]http:\/\/localhost:5000\//g, "'/");
        newContent = newContent.replace(/`http:\/\/localhost:5000\//g, "`/");
        newContent = newContent.replace(/http:\/\/localhost:5000/g, "");
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log("Updated URLs in", filePath);
            filesUpdated++;
        }
    }
});

console.log(`URL cleanup finished. Updated ${filesUpdated} files.`);
