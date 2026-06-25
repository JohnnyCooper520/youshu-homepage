import http from "node:http";
import { defaultApiHandler } from "./apiCore.js";

const port = Number(process.env.API_PORT || 8787);

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

const server = http.createServer(async (req, res) => {
  const body = await collectBody(req);
  const request = new Request(`http://127.0.0.1:${port}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body,
  });
  const response = await defaultApiHandler(request);
  const responseBody = await response.arrayBuffer();

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(Buffer.from(responseBody));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Youshu API listening on http://127.0.0.1:${port}`);
});
