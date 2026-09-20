// Local preview that mimics GitHub Pages routing (extensionless .html, 301 for directories, 404.html).
// Usage: node scripts/serve.js [port]   (default 8080)
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.argv[2]) || 8080;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".json": "application/json",
};

function isFile(p) { try { return fs.statSync(p).isFile(); } catch { return false; } }
function isDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }

function resolve(urlPath) {
  const rel = path.normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, "");
  const abs = path.join(ROOT, rel);
  if (!abs.startsWith(ROOT)) return { status: 404 };
  if (isFile(abs)) return { status: 200, file: abs };
  if (isDir(abs)) {
    if (!urlPath.endsWith("/")) return { status: 301, location: urlPath + "/" };
    if (isFile(path.join(abs, "index.html"))) return { status: 200, file: path.join(abs, "index.html") };
  }
  if (!urlPath.endsWith("/") && isFile(abs + ".html")) return { status: 200, file: abs + ".html" };
  return { status: 404 };
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const r = resolve(url.pathname);
  if (r.status === 301) { res.writeHead(301, { Location: r.location + url.search }); return res.end(); }
  const file = r.status === 200 ? r.file : path.join(ROOT, "404.html");
  res.writeHead(r.status, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Preview (GitHub Pages routing) on http://localhost:${PORT}`));
