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

    content = content.replace(/green-700/g, 'emerald-600');
    content = content.replace(/green-600/g, 'emerald-500');
    content = content.replace(/green-500/g, 'emerald-400');
    content = content.replace(/green-400/g, 'emerald-400');
    content = content.replace(/green-300/g, 'emerald-300');
    content = content.replace(/green-200/g, 'emerald-200');
    content = content.replace(/green-100/g, 'emerald-100');
    content = content.replace(/green-50\b/g, 'emerald-50');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
