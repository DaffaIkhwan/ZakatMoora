import fs from 'fs';
import path from 'path';

const dirs = [
  'C:\\\\Users\\\\Acer\\\\Downloads\\\\Research Framework Development\\\\src\\\\components',
  'C:\\\\Users\\\\Acer\\\\Downloads\\\\Research Framework Development\\\\mockup-version\\\\src\\\\components'
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      content = content.replace(/Donasi/g, 'Zakat');
      content = content.replace(/donasi/g, 'zakat');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

dirs.forEach(processDir);
console.log('Done replacing.');
