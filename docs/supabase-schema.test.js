import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Supabase schema", () => {
  it("documents user entitlements with RLS and quantity tracking", async () => {
    const schema = await readFile("docs/supabase-schema.sql", "utf8");

    expect(schema).toContain("create table if not exists public.user_entitlements");
    expect(schema).toContain("product_key text not null");
    expect(schema).toContain("included_quantity integer");
    expect(schema).toContain("used_quantity integer not null default 0");
    expect(schema).toContain("alter table public.user_entitlements enable row level security");
    expect(schema).toContain("grant select, insert, update, delete on table public.user_entitlements to service_role");
    expect(schema).toContain('create policy "Users can read their own entitlements"');
    expect(schema).toContain("using (auth.uid() = user_id)");
    expect(schema).toContain("user_entitlements_user_product_idx");
  });
});
