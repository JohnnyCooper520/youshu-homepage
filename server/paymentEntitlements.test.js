import { describe, expect, it, vi } from "vitest";
import { buildEntitlementRows, createSupabaseEntitlementStore } from "./paymentEntitlements.js";

const annualPayment = {
  provider: "alipay",
  orderId: "YS202607040099",
  providerTradeId: "2026070422000000000099",
  userId: "00000000-0000-4000-8000-000000000099",
  productKey: "annual",
  amount: "39.90",
};

describe("paymentEntitlements", () => {
  it("creates one entitlement for a one-time annual report payment", () => {
    const rows = buildEntitlementRows(annualPayment, "2026-07-04T00:00:00.000Z");

    expect(rows).toEqual([expect.objectContaining({ product_key: "annual", included_quantity: 1 })]);
    expect(rows[0]).toMatchObject({
      user_id: annualPayment.userId,
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

    await expect(store.recordPayment(annualPayment)).resolves.toEqual({ inserted: 1 });

    expect(createSupabaseClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-role",
      expect.objectContaining({
        auth: { autoRefreshToken: false, persistSession: false },
      }),
    );
    expect(from).toHaveBeenCalledWith("user_entitlements");
    expect(upsert).toHaveBeenCalledWith(
      [expect.objectContaining({ product_key: "annual", included_quantity: 1 })],
      { onConflict: "order_id,product_key", ignoreDuplicates: true },
    );
  });
});
