import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find where dist is located
let distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath) || !fs.existsSync(path.join(distPath, 'index.html'))) {
  distPath = path.join(__dirname, '..', 'frontend', 'dist');
}

// If dist still doesn't exist, build it now
if (!fs.existsSync(distPath) || !fs.existsSync(path.join(distPath, 'index.html'))) {
  console.log('Dist not found. Running build...');
  execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
  distPath = path.join(__dirname, 'dist');
}

console.log(`Serving static files from: ${distPath}`);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
};

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(distPath, urlPath);

  // Check if requested path is a valid file
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // SPA fallback: return index.html for all non-file routes
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(indexPath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: index.html missing');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`VESTRA server running on port ${port}`);
});
