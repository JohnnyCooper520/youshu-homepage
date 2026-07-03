import { describe, expect, it, vi } from "vitest";
import { buildEntitlementRows, createSupabaseEntitlementStore } from "./paymentEntitlements.js";

const membershipPayment = {
  provider: "alipay",
  orderId: "YS202607040099",
  providerTradeId: "2026070422000000000099",
  userId: "00000000-0000-4000-8000-000000000099",
  productKey: "membership",
  amount: "299.00",
};

describe("paymentEntitlements", () => {
  it("expands annual membership payments into concrete product entitlements", () => {
    const rows = buildEntitlementRows(membershipPayment, "2026-07-04T00:00:00.000Z");

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ product_key: "membership", included_quantity: 1 }),
        expect.objectContaining({ product_key: "bazi", included_quantity: 1 }),
        expect.objectContaining({ product_key: "annual", included_quantity: 1 }),
        expect.objectContaining({ product_key: "question", included_quantity: 12 }),
        expect.objectContaining({ product_key: "monthly", included_quantity: 12 }),
        expect.objectContaining({ product_key: "followup", included_quantity: 12 }),
        expect.objectContaining({ product_key: "archive", included_quantity: 1 }),
      ]),
    );
    expect(rows).toHaveLength(7);
    expect(rows[0]).toMatchObject({
      user_id: membershipPayment.userId,
      status: "active",
      used_quantity: 0,
      source: "alipay",
      order_id: "YS202607040099",
    });
  });

  it("writes payment entitlements with the Supabase service role client", async () => {
    const upsert = vi.fn(async () => ({ error: null }));
    const from = vi.fn(() => ({ upsert }));
    const createSupabaseClient = vi.fn(() => ({ from }));
    const store = createSupabaseEntitlementStore({
      env: {
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
      },
      createSupabaseClient,
    });

    await expect(store.recordPayment(membershipPayment)).resolves.toEqual({ inserted: 7 });

    expect(createSupabaseClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-role",
      expect.objectContaining({
        auth: { autoRefreshToken: false, persistSession: false },
      }),
    );
    expect(from).toHaveBeenCalledWith("user_entitlements");
    expect(upsert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ product_key: "membership" })]),
      { onConflict: "order_id,product_key", ignoreDuplicates: true },
    );
  });
});
