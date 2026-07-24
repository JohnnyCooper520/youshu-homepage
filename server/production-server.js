import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultApiHandler } from "./apiCore.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const defaultDistDir = path.resolve(currentDir, "../dist");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function collectBody(req) {
  if (req.method === "GET" || req.method === "HEAD") {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      resolve(body.length > 0 ? body : undefined);
    });
    req.on("error", reject);
  });
}

function sendFile(req, res, filePath) {
  const stat = fs.statSync(filePath);
  res.statusCode = 200;
  res.setHeader("Content-Type", MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream");
  res.setHeader("Content-Length", stat.size);
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  fs.createReadStream(filePath).pipe(res);
}

function resolveStaticFile(distDir, pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath = decodedPath.replace(/^\/+/, "");
  const candidate = path.resolve(distDir, relativePath || "index.html");
  const relativeCandidate = path.relative(distDir, candidate);
  if (relativeCandidate.startsWith("..") || path.isAbsolute(relativeCandidate)) {
    return null;
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  return null;
}

export function createProductionServer({
  distDir = defaultDistDir,
  apiHandler = defaultApiHandler,
} = {}) {
  const indexFile = path.join(distDir, "index.html");
  if (!fs.existsSync(indexFile)) {
    throw new Error(`Production build not found at ${indexFile}. Run npm run build first.`);
  }

  return http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || "/", "http://127.0.0.1");

      if (requestUrl.pathname.startsWith("/api/")) {
        const body = await collectBody(req);
        const request = new Request(`http://127.0.0.1${requestUrl.pathname}${requestUrl.search}`, {
          method: req.method,
          headers: req.headers,
          body,
        });
        const response = await apiHandler(request);
        const responseBody = await response.arrayBuffer();

        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        res.end(Buffer.from(responseBody));
        return;
      }

      if (requestUrl.pathname === "/healthz") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      if (req.method !== "GET" && req.method !== "HEAD") {
        res.statusCode = 405;
        res.setHeader("Allow", "GET, HEAD");
        res.end("Method Not Allowed");
        return;
      }

      const staticFile = resolveStaticFile(distDir, requestUrl.pathname);
      sendFile(req, res, staticFile || indexFile);
    } catch (error) {
      console.error("Production server request failed", error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8788);
  const host = process.env.HOST || "127.0.0.1";
  const server = createProductionServer();

  server.listen(port, host, () => {
    console.log(`Youshu production server listening on http://${host}:${port}`);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
