import { createSign, generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { canonicalizeAlipayFields, parseAlipayPassbackParams, verifyAlipaySignature } from "./alipay.js";

function createSignedFields(fields, privateKey) {
  const signer = createSign("RSA-SHA256");
  signer.update(canonicalizeAlipayFields(fields), "utf8");
  signer.end();
  return {
    ...fields,
    sign: signer.sign(privateKey, "base64"),
  };
}

describe("alipay", () => {
  it("canonicalizes callback fields in Alipay signature order", () => {
    expect(
      canonicalizeAlipayFields({
        sign: "ignored",
        out_trade_no: "YS202607040001",
        sign_type: "RSA2",
        app_id: "2026000000000000",
        empty: "",
      }),
    ).toBe("app_id=2026000000000000&out_trade_no=YS202607040001");
  });

  it("verifies a real RSA2 callback signature and rejects tampering", () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
      publicKeyEncoding: { type: "spki", format: "pem" },
    });
    const fields = createSignedFields(
      {
        app_id: "2026000000000000",
        trade_status: "TRADE_SUCCESS",
        out_trade_no: "YS202607040001",
        total_amount: "29.90",
        sign_type: "RSA2",
      },
      privateKey,
    );

    expect(verifyAlipaySignature(fields, publicKey)).toBe(true);
    expect(verifyAlipaySignature({ ...fields, total_amount: "1.00" }, publicKey)).toBe(false);
  });

  it("parses Alipay passback params from JSON or query strings", () => {
    expect(parseAlipayPassbackParams('{"userId":"u1","productKey":"bazi"}')).toEqual({
      userId: "u1",
      productKey: "bazi",
    });
    expect(parseAlipayPassbackParams("userId=u2&productKey=question")).toEqual({
      userId: "u2",
      productKey: "question",
    });
  });
});
