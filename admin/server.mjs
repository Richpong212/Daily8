import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3004);
const root = resolve(fileURLToPath(new URL("./dist", import.meta.url)));
const indexFile = join(root, "index.html");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const getContentType = (filePath) => {
  return contentTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream";
};

const getStaticPath = (url) => {
  const pathname = new URL(url, `http://${host}`).pathname;
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = resolve(join(root, normalizedPath));

  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    return null;
  }

  return filePath;
};

const sendFile = (res, filePath) => {
  res.writeHead(200, {
    "Content-Type": getContentType(filePath),
    "Cache-Control": filePath === indexFile ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(filePath).pipe(res);
};

const server = createServer((req, res) => {
  if (!req.url || req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ message: "Method not allowed" }));
    return;
  }

  const filePath = getStaticPath(req.url);

  if (!filePath) {
    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ message: "Invalid path" }));
    return;
  }

  try {
    const stats = statSync(filePath);
    sendFile(res, stats.isDirectory() ? join(filePath, "index.html") : filePath);
  } catch {
    sendFile(res, indexFile);
  }
});

server.listen(port, host, () => {
  console.log(`Admin server listening on http://${host}:${port}`);
});
