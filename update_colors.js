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
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Remove harsh red and orange from gradients, replace with pink/rose combinations
    content = content.replace(/from-pink-500 to-red-400/g, 'from-pink-400 to-pink-600');
    content = content.replace(/from-pink-500 to-red-500/g, 'from-pink-400 to-pink-600');
    content = content.replace(/from-pink-500 via-red-400 to-pink-600/g, 'from-pink-400 via-pink-500 to-pink-600');
    content = content.replace(/from-pink-500 via-red-400 to-pink-500/g, 'from-pink-400 via-pink-500 to-pink-400');
    content = content.replace(/from-pink-500 via-rose-500 to-red-400/g, 'from-pink-400 via-pink-500 to-pink-600');
    content = content.replace(/from-pink-400 to-red-400/g, 'from-pink-400 to-pink-500');
    content = content.replace(/from-pink-300 to-red-300/g, 'from-pink-300 to-pink-400');
    content = content.replace(/from-pink-200 to-red-200/g, 'from-pink-200 to-pink-300');
    content = content.replace(/hover:to-red-600/g, 'hover:to-pink-700');
    content = content.replace(/hover:from-pink-600/g, 'hover:from-pink-500'); // make sure the hover keeps contrast

    // Replace loose red gradients
    content = content.replace(/to-red-500/g, 'to-pink-600');
    content = content.replace(/to-red-400/g, 'to-pink-500');
    content = content.replace(/to-red-300/g, 'to-pink-400');

    // Make utility reds (errors) softer (rose)
    content = content.replace(/text-red-500/g, 'text-rose-500');
    content = content.replace(/text-red-600/g, 'text-rose-600');
    content = content.replace(/text-red-400/g, 'text-rose-400');
    content = content.replace(/bg-red-50/g, 'bg-rose-50');
    content = content.replace(/bg-red-100/g, 'bg-rose-100');
    content = content.replace(/bg-red-200/g, 'bg-rose-200');
    content = content.replace(/bg-red-400/g, 'bg-rose-400');
    content = content.replace(/border-red-200/g, 'border-rose-200');
    content = content.replace(/border-red-300/g, 'border-rose-300');
    content = content.replace(/ring-red-300/g, 'ring-rose-300');
    content = content.replace(/hover:bg-red-50/g, 'hover:bg-rose-50');
    content = content.replace(/hover:bg-red-100/g, 'hover:bg-rose-100');
    content = content.replace(/hover:text-red-500/g, 'hover:text-rose-500');

    // Replace orange entirely with pink/fuchsia to keep it in the 330 hue family
    content = content.replace(/from-orange-100/g, 'from-pink-100');
    content = content.replace(/text-orange-600/g, 'text-pink-600');
    content = content.replace(/text-orange-400/g, 'text-pink-400');
    content = content.replace(/text-orange-500/g, 'text-pink-500');
    content = content.replace(/bg-orange-50/g, 'bg-pink-50');
    content = content.replace(/bg-orange-100/g, 'bg-pink-100');
    content = content.replace(/bg-orange-500/g, 'bg-pink-500');
    content = content.replace(/border-orange-200/g, 'border-pink-200');
    content = content.replace(/hover:bg-orange-600/g, 'hover:bg-pink-600');
    content = content.replace(/hover:text-orange-600/g, 'hover:text-pink-600');
    
    // Some hex colors in Home.tsx and index.css
    content = content.replace(/#f43f5e/g, '#db2777'); // rose-500 -> pink-600
    content = content.replace(/#fb923c/g, '#f472b6'); // orange-400 -> pink-400
    content = content.replace(/#ef4444/g, '#f43f5e'); // red-500 -> rose-500 in CSS
    content = content.replace(/#ec4899 100%\)/g, '#db2777 100%)'); 

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
