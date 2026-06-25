import { defaultApiHandler } from "../server/apiCore.js";

export async function runApi(req, res, path) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);
  const url = `https://youshu.local${path}`;
  const response = await defaultApiHandler(
    new Request(url, {
      method: req.method,
      headers: req.headers,
      body: body.length > 0 ? body : undefined,
    }),
  );
  const responseBody = await response.text();

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.send(responseBody);
}
