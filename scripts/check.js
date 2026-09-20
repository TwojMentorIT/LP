// Repository rules linter. Usage: node scripts/check.js   (exit code 1 on any violation)
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://twojmentor.it";
const GA_ID = "G-GP38ZVC1XN";
const ALLOWED_NON_ASCII = new Set([..."ąćęłńóśźżĄĆĘŁŃÓŚŹŻ", "§", "★", "🎁"]);
const BAD_ENTITIES = /&(mdash|ndash|hellip|rarr|larr|ldquo|rdquo|lsquo|rsquo|bdquo|laquo|raquo);/;
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const exists = (f) => fs.existsSync(path.join(ROOT, f));

function walk(dir, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if ([".git", "node_modules", "img"].includes(e.name)) continue;
    const rel = path.posix.join(dir, e.name);
    e.isDirectory() ? walk(rel, out) : out.push(rel);
  }
  return out;
}

const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
const textFiles = walk(".").filter((f) => /\.(html|css|js|txt|xml|md)$/.test(f)).map((f) => f.replace(/^\.\//, ""));
const route = (f) => (f === "index.html" ? "/" : "/" + f.replace(/\.html$/, ""));

// 1. Simple ASCII only: no AI-style typography (em/en dash, curly quotes, ellipsis char, arrows, emoji).
for (const f of textFiles) {
  const t = read(f);
  const bad = new Set([...t].filter((c) => c.charCodeAt(0) > 127 && !ALLOWED_NON_ASCII.has(c)));
  if (bad.size) fail(f, "forbidden characters: " + [...bad].map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")).join(", "));
  if (f.endsWith(".html") && BAD_ENTITIES.test(t)) fail(f, "forbidden typographic HTML entity (use plain ASCII)");
  if (/\.(html|xml|txt)$/.test(f) && t.includes("github.io")) fail(f, "contains github.io (production host is " + SITE + ")");
}

// 2. Per page rules.
for (const f of pages) {
  const t = read(f);
  if (!t.includes(`googletagmanager.com/gtag/js?id=${GA_ID}`) || !t.includes(`gtag('config', '${GA_ID}')`)) fail(f, "missing Google tag " + GA_ID);
  if (f === "404.html") continue;
  const canon = (t.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  if (canon !== SITE + route(f)) fail(f, `canonical should be ${SITE + route(f)} (found ${canon})`);
  if (!/<title>[^<]+<\/title>/.test(t)) fail(f, "missing <title>");
  if (!/<meta name="description" content="[^"]+"/.test(t)) fail(f, "missing meta description");
  if ((t.match(/<h1[\s>]/g) || []).length !== 1) fail(f, "page must have exactly one <h1>");
  for (const m of t.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { fail(f, "invalid JSON-LD: " + e.message); }
  }
}

// 3. Internal links: root-absolute, no trailing slash, target exists (GitHub Pages resolution).
for (const f of pages) {
  const t = read(f);
  for (const m of t.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
    const v = m[1];
    if (/^(https?:|mailto:|tel:|data:|#)/.test(v) || v === "") continue;
    if (!v.startsWith("/")) { fail(f, `relative link "${v}" (use root-absolute paths)`); continue; }
    const p = v.split(/[?#]/)[0];
    if (p === "/") continue;
    if (p.endsWith("/")) { fail(f, `trailing slash in "${v}"`); continue; }
    if (!exists(p.slice(1)) && !exists(p.slice(1) + ".html")) fail(f, `broken link "${v}"`);
  }
}

// 4. sitemap.xml lists every indexable page, nothing else.
const locs = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const f of pages.filter((p) => p !== "404.html")) if (!locs.includes(SITE + route(f))) fail("sitemap.xml", `missing ${SITE + route(f)}`);
for (const l of locs) {
  if (!l.startsWith(SITE)) fail("sitemap.xml", `foreign host ${l}`);
  if (l !== SITE + "/" && l.endsWith("/")) fail("sitemap.xml", `trailing slash ${l}`);
  const p = l.slice(SITE.length);
  if (p !== "/" && !exists(p.slice(1) + ".html")) fail("sitemap.xml", `no page for ${l}`);
}

// 5. SEO / AI files and GitHub Pages routing.
if (!read("robots.txt").includes(`Sitemap: ${SITE}/sitemap.xml`)) fail("robots.txt", "missing Sitemap line");
if (!exists("llms.txt")) fail("llms.txt", "missing");
if (!exists("404.html")) fail("404.html", "missing (needed for /path/ -> /path redirect)");
for (const d of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (d.isDirectory() && exists(path.posix.join(d.name, "index.html"))) fail(d.name, "directory with index.html forces a trailing slash on GitHub Pages; use " + d.name + ".html");
}

if (errors.length) { console.error(errors.map((e) => "FAIL " + e).join("\n")); process.exit(1); }
console.log(`OK: ${pages.length} pages, ${textFiles.length} text files checked.`);
