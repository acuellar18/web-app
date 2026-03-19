const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('app/api', function(filePath) {
  if (filePath.endsWith('route.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('force-dynamic')) {
      fs.writeFileSync(filePath, "export const dynamic = 'force-dynamic';\n" + content);
    }
  }
});
console.log('Fixed API routes');
