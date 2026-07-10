const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('artifacts/launchpad/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Enhance candy gradients
    content = content.replace(/from-pink-400 to-pink-600/g, 'from-pink-400 via-pink-500 to-pink-600');
    content = content.replace(/from-pink-400 via-pink-500 to-pink-600/g, 'from-pink-400 via-pink-500 to-pink-600');
    content = content.replace(/from-pink-400 to-pink-500/g, 'from-pink-300 via-pink-400 to-pink-500');
    content = content.replace(/from-pink-300 to-pink-400/g, 'from-pink-300 to-pink-400');
    
    // Elevate button hovers
    content = content.replace(/hover:from-pink-500 hover:to-pink-700/g, 'hover:from-pink-500 hover:via-pink-600 hover:to-pink-700');
    
    // Soften borders further
    content = content.replace(/border-pink-200/g, 'border-pink-200/60');
    content = content.replace(/border-pink-300/g, 'border-pink-300/60');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated candy gradients', filePath);
    }
  }
});
