export const entitlementCatalog = {
  bazi: {
    grants: { bazi: 1 },
  },
  question: {
    grants: { question: 1 },
  },
  annual: {
    grants: { annual: 1 },
  },
  membership: {
    membership: true,
    grants: {
      bazi: 1,
      annual: 1,
      question: 12,
      monthly: 12,
      followup: 12,
      archive: 1,
    },
  },
};

export function createEmptyEntitlements() {
  return {
    purchases: {},
    remaining: {},
    updatedAt: "",
  };
}

export function normalizeEntitlements(value) {
  if (!value || typeof value !== "object") {
    return createEmptyEntitlements();
  }

  return {
    purchases: value.purchases && typeof value.purchases === "object" ? value.purchases : {},
    remaining: value.remaining && typeof value.remaining === "object" ? value.remaining : {},
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}

function toCount(value) {
  const nextValue = Number(value);
  if (!Number.isFinite(nextValue) || nextValue < 0) {
    return 0;
  }
  return Math.floor(nextValue);
}

export function grantProduct(currentEntitlements, productKey, updatedAt = new Date().toISOString()) {
  const catalogItem = entitlementCatalog[productKey];
  const current = normalizeEntitlements(currentEntitlements);

  if (!catalogItem) {
    return current;
  }

  const next = {
    purchases: { ...current.purchases, [productKey]: true },
    remaining: { ...current.remaining },
    updatedAt,
  };

  Object.entries(catalogItem.grants).forEach(([mode, amount]) => {
    const currentAmount = toCount(next.remaining[mode]);
    const alreadyHasMembership = productKey === "membership" && current.purchases.membership;
    next.remaining[mode] = alreadyHasMembership ? Math.max(currentAmount, amount) : currentAmount + amount;
  });

  return next;
}

export function getModeAccess(currentEntitlements, mode) {
  const current = normalizeEntitlements(currentEntitlements);
  const remaining = toCount(current.remaining[mode]);
  const membershipActive = Boolean(current.purchases.membership && remaining > 0);
  const singleActive = Boolean(remaining > 0);

  if (membershipActive) {
    return { unlocked: true, source: "membership", remaining };
  }

  if (singleActive) {
    return { unlocked: true, source: "single", remaining };
  }

  return { unlocked: false, source: current.purchases[mode] ? "used" : "locked", remaining: 0 };
}

export function getProductStatus(currentEntitlements, productKey) {
  const current = normalizeEntitlements(currentEntitlements);
  if (productKey === "membership") {
    return current.purchases.membership ? "active" : "locked";
  }

  const mode = productKey;
  const access = getModeAccess(current, mode);
  if (access.unlocked) {
    return access.source === "membership" ? "included" : "active";
  }
  return current.purchases[productKey] ? "used" : "locked";
}

export function consumeEntitlement(currentEntitlements, mode, updatedAt = new Date().toISOString()) {
  const current = normalizeEntitlements(currentEntitlements);
  const remaining = toCount(current.remaining[mode]);

  if (remaining <= 0) {
    return current;
  }

  return {
    ...current,
    remaining: {
      ...current.remaining,
      [mode]: remaining - 1,
    },
    updatedAt,
  };
}
