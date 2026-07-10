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

    content = content.replace(/text-gray-900/g, 'text-pink-950');
    content = content.replace(/text-gray-800/g, 'text-pink-900');
    content = content.replace(/text-gray-700/g, 'text-pink-800');
    content = content.replace(/text-gray-600/g, 'text-pink-700');
    content = content.replace(/text-gray-500/g, 'text-pink-600/80');
    content = content.replace(/text-gray-400/g, 'text-pink-400');
    content = content.replace(/text-gray-300/g, 'text-pink-300');
    content = content.replace(/text-gray-200/g, 'text-pink-200');

    content = content.replace(/bg-gray-900/g, 'bg-pink-950');
    content = content.replace(/bg-gray-800/g, 'bg-pink-900');
    content = content.replace(/bg-gray-700/g, 'bg-pink-800');
    content = content.replace(/bg-gray-100/g, 'bg-pink-100/50');
    content = content.replace(/bg-gray-50/g, 'bg-pink-50/50');
    
    content = content.replace(/border-gray-300/g, 'border-pink-300');
    content = content.replace(/border-gray-200/g, 'border-pink-200');
    content = content.replace(/border-gray-100/g, 'border-pink-100');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
