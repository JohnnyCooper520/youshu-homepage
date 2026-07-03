import { createVerify } from "node:crypto";

function normalizePublicKey(publicKey) {
  if (!publicKey) {
    return "";
  }
  if (publicKey.includes("BEGIN PUBLIC KEY")) {
    return publicKey;
  }
  const body = publicKey.replace(/\s+/g, "").match(/.{1,64}/g)?.join("\n") || "";
  return `-----BEGIN PUBLIC KEY-----\n${body}\n-----END PUBLIC KEY-----`;
}

export function canonicalizeAlipayFields(fields) {
  return Object.entries(fields)
    .filter(([key, value]) => key !== "sign" && key !== "sign_type" && value !== undefined && value !== null && String(value) !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export function verifyAlipaySignature(fields, publicKey) {
  const sign = fields.sign;
  const pem = normalizePublicKey(publicKey);
  if (!sign || !pem) {
    return false;
  }

  const algorithm = fields.sign_type === "RSA" ? "RSA-SHA1" : "RSA-SHA256";
  const verifier = createVerify(algorithm);
  verifier.update(canonicalizeAlipayFields(fields), "utf8");
  verifier.end();

  try {
    return verifier.verify(pem, sign, "base64");
  } catch {
    return false;
  }
}

export function createAlipayVerifier({ env = process.env } = {}) {
  return (fields) => verifyAlipaySignature(fields, env.ALIPAY_PUBLIC_KEY || "");
}

export function parseAlipayPassbackParams(rawValue) {
  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return Object.fromEntries(new URLSearchParams(rawValue));
  }
}
