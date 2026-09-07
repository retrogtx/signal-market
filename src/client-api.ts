import {
  blueprintSchema,
  campaignSchema,
  trendSchema,
  templateBlueprint,
  type Store,
} from "./domain";
import { z } from "zod";
export const hostedDemo = import.meta.env.VITE_HOSTED_DEMO === "true";
const storageKey = "signal-market-hosted-stores-v1";
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  if (hostedDemo && path !== "/trends") {
    if (path === "/status") return { ai: false, whop: false } as T;
    if (path === "/campaigns")
      throw new Error(
        "Whop submissions are disabled in this key-free demo. Export your campaign brief instead.",
      );
    const stores: Store[] = JSON.parse(
      localStorage.getItem(storageKey) || "[]",
    );
    if (path === "/stores" && method === "GET") return stores as T;
    if (path === "/stores" && method === "POST") {
      const trend = trendSchema.parse((body as { trend: unknown }).trend);
      const store: Store = {
        id: crypto.randomUUID(),
        trend,
        blueprint: templateBlueprint(trend),
        createdAt: new Date().toISOString(),
        mode: "template",
        checkoutUrl: "",
      };
      localStorage.setItem(storageKey, JSON.stringify([store, ...stores]));
      return store as T;
    }
    if (path.startsWith("/stores/") && method === "PATCH") {
      const store = stores.find((s) => s.id === path.split("/")[2]);
      if (!store) throw new Error("Store not found");
      const update = z
        .object({
          blueprint: blueprintSchema,
          checkoutUrl: z.union([
            z.literal(""),
            campaignSchema.shape.destination,
          ]),
        })
        .parse(body);
      const next = { ...store, ...update };
      localStorage.setItem(
        storageKey,
        JSON.stringify(stores.map((s) => (s.id === store.id ? next : s))),
      );
      return next as T;
    }
    throw new Error("This action is unavailable in the hosted demo.");
  }
  const r = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Something went wrong");
  return data;
}
