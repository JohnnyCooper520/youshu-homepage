import { createClient } from "@supabase/supabase-js";
import { entitlementCatalog } from "../src/lib/entitlements.js";

function getSupabaseAdminConfig(env = process.env) {
  return {
    url: env.SUPABASE_URL || env.VITE_SUPABASE_URL || "",
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || "",
  };
}

function toMetadata(payment, productKey) {
  return {
    provider: payment.provider,
    provider_trade_id: payment.providerTradeId || "",
    source_product_key: payment.productKey,
    amount: payment.amount || "",
    kind: payment.productKey === productKey ? "purchase" : "grant",
  };
}

export function buildEntitlementRows(payment, now = new Date().toISOString()) {
  const catalogItem = entitlementCatalog[payment.productKey];
  if (!catalogItem) {
    throw new Error(`Unsupported product key: ${payment.productKey}`);
  }

  const grants = { ...catalogItem.grants };

  return Object.entries(grants).map(([productKey, quantity]) => ({
    user_id: payment.userId,
    product_key: productKey,
    status: "active",
    included_quantity: quantity,
    used_quantity: 0,
    starts_at: now,
    source: payment.provider,
    order_id: payment.orderId,
    metadata: toMetadata(payment, productKey),
  }));
}

export function createSupabaseEntitlementStore({ env = process.env, createSupabaseClient = createClient } = {}) {
  const config = getSupabaseAdminConfig(env);

  return {
    async recordPayment(payment) {
      if (!config.url || !config.serviceKey) {
        throw new Error("Supabase service role credentials are not configured");
      }

      const rows = buildEntitlementRows(payment);
      const client = createSupabaseClient(config.url, config.serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { error } = await client
        .from("user_entitlements")
        .upsert(rows, { onConflict: "order_id,product_key", ignoreDuplicates: true });

      if (error) {
        throw error;
      }

      return { inserted: rows.length };
    },
  };
}
