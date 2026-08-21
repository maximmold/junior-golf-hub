import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');
const standalonePath = path.join(distDir, 'standalone_junior_golf_hub.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found! Run `npm run build` first.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf-8');

// Inline all CSS
html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (match, href) => {
  const cssPath = path.join(distDir, href.replace(/^\.\//, ''));
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    return `<style>\n${cssContent}\n</style>`;
  }
  return match;
});

// Inline all JS
html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (match, src) => {
  const jsPath = path.join(distDir, src.replace(/^\.\//, ''));
  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf-8');
    return `<script type="module">\n${jsContent}\n</script>`;
  }
  return match;
});

fs.writeFileSync(standalonePath, html, 'utf-8');
console.log(`\n🎉 Success! Standalone single-file HTML generated at:\n   ${standalonePath}\n`);
