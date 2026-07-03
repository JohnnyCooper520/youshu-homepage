import { describe, expect, it, vi } from "vitest";
import { loadCloudEntitlements } from "./cloudEntitlements.js";

describe("cloudEntitlements", () => {
  it("loads active Supabase entitlement rows into frontend entitlement state", async () => {
    const orderMock = vi.fn(async () => ({
      data: [
        { product_key: "bazi", included_quantity: 1, used_quantity: 0, status: "active" },
        { product_key: "question", included_quantity: 12, used_quantity: 2, status: "active" },
      ],
      error: null,
    }));
    const eqMock = vi.fn(() => ({ order: orderMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const client = { from: vi.fn(() => ({ select: selectMock })) };

    const entitlements = await loadCloudEntitlements(client, { id: "user-1" });

    expect(client.from).toHaveBeenCalledWith("user_entitlements");
    expect(selectMock).toHaveBeenCalledWith("product_key,included_quantity,used_quantity,status,expires_at");
    expect(eqMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(entitlements).toMatchObject({
      purchases: {
        bazi: true,
        question: true,
      },
      remaining: {
        bazi: 1,
        question: 10,
      },
    });
  });
});
