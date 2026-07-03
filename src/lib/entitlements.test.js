import { describe, expect, it } from "vitest";
import { consumeEntitlement, getModeAccess, grantProduct, mergeEntitlements } from "./entitlements.js";

describe("entitlements", () => {
  it("grants a single bazi report and consumes one use after generation", () => {
    const opened = grantProduct(undefined, "bazi", "2026-07-04T00:00:00.000Z");

    expect(getModeAccess(opened, "bazi")).toMatchObject({
      unlocked: true,
      source: "single",
      remaining: 1,
    });

    const consumed = consumeEntitlement(opened, "bazi", "2026-07-04T00:01:00.000Z");

    expect(getModeAccess(consumed, "bazi")).toMatchObject({
      unlocked: false,
      remaining: 0,
    });
  });

  it("grants annual membership quantities across all paid report modes", () => {
    const opened = grantProduct(undefined, "membership", "2026-07-04T00:00:00.000Z");

    expect(getModeAccess(opened, "bazi")).toMatchObject({ unlocked: true, source: "membership", remaining: 1 });
    expect(getModeAccess(opened, "annual")).toMatchObject({ unlocked: true, source: "membership", remaining: 1 });
    expect(getModeAccess(opened, "question")).toMatchObject({ unlocked: true, source: "membership", remaining: 12 });
  });

  it("merges cloud and local entitlements without double-counting the same product", () => {
    const merged = mergeEntitlements(
      { purchases: { bazi: true }, remaining: { bazi: 1 }, updatedAt: "2026-07-04T00:00:00.000Z" },
      { purchases: { bazi: true, question: true }, remaining: { bazi: 1, question: 4 }, updatedAt: "2026-07-04T00:01:00.000Z" },
    );

    expect(merged).toMatchObject({
      purchases: { bazi: true, question: true },
      remaining: { bazi: 1, question: 4 },
      updatedAt: "2026-07-04T00:01:00.000Z",
    });
  });
});
