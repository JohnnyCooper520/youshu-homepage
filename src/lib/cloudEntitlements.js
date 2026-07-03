import { normalizeEntitlements } from "./entitlements.js";

function toRemaining(row) {
  const included = Number(row.included_quantity ?? 1);
  const used = Number(row.used_quantity ?? 0);
  if (!Number.isFinite(included) || included < 0) {
    return 0;
  }
  if (!Number.isFinite(used) || used < 0) {
    return Math.floor(included);
  }
  return Math.max(0, Math.floor(included) - Math.floor(used));
}

function isActive(row, now = new Date()) {
  if (row.status !== "active") {
    return false;
  }
  if (!row.expires_at) {
    return true;
  }
  return new Date(row.expires_at).getTime() > now.getTime();
}

export function rowsToEntitlements(rows) {
  const entitlements = normalizeEntitlements();

  (rows || []).filter((row) => isActive(row)).forEach((row) => {
    const remaining = toRemaining(row);
    if (remaining <= 0) {
      return;
    }

    entitlements.purchases[row.product_key] = true;
    entitlements.remaining[row.product_key] = (entitlements.remaining[row.product_key] || 0) + remaining;
  });

  entitlements.updatedAt = new Date().toISOString();
  return entitlements;
}

export async function loadCloudEntitlements(client, user) {
  if (!client || !user?.id) {
    return normalizeEntitlements();
  }

  const { data, error } = await client
    .from("user_entitlements")
    .select("product_key,included_quantity,used_quantity,status,expires_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return rowsToEntitlements(data);
}
