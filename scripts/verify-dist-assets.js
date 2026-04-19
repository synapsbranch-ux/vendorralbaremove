#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`[verify-dist-assets] ${message}`);
  process.exit(1);
}

const distPathArg = process.argv[2];
if (!distPathArg) {
  fail("Usage: node scripts/verify-dist-assets.js <dist-browser-path>");
}

const distPath = path.resolve(process.cwd(), distPathArg);
if (!fs.existsSync(distPath) || !fs.statSync(distPath).isDirectory()) {
  fail(`Dist path not found: ${distPath}`);
}

const indexPath = path.join(distPath, "index.html");
if (!fs.existsSync(indexPath)) {
  fail(`index.html not found in: ${distPath}`);
}

const indexHtml = fs.readFileSync(indexPath, "utf8");
const refs = new Set();

const attrRegex = /(src|href)=["']([^"']+)["']/gi;
let match;
while ((match = attrRegex.exec(indexHtml)) !== null) {
  const rawRef = match[2].trim();
  if (!rawRef) {
    continue;
  }
  if (rawRef.startsWith("http://") || rawRef.startsWith("https://")) {
    continue;
  }
  if (rawRef.startsWith("//")) {
    continue;
  }
  if (rawRef.startsWith("data:")) {
    continue;
  }

  const normalized = rawRef.replace(/^\.\//, "");
  if (!normalized) {
    continue;
  }

  if (
    normalized.endsWith(".js") ||
    normalized.endsWith(".css") ||
    normalized.endsWith(".map")
  ) {
    refs.add(normalized);
  }
}

const missing = [];
for (const ref of refs) {
  const refPath = path.join(distPath, ref);
  if (!fs.existsSync(refPath)) {
    missing.push(ref);
  }
}

if (missing.length > 0) {
  fail(
    `Missing ${missing.length} referenced build asset(s):\n - ${missing.join(
      "\n - "
    )}`
  );
}

console.log(
  `[verify-dist-assets] OK. Verified ${refs.size} referenced JS/CSS/map asset(s).`
);
