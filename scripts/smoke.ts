import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
const base = "http://localhost:4310/api";
const results: { name: string; passed: boolean; detail: string }[] = [];
async function request(
  path: string,
  method = "GET",
  body?: unknown,
  headers: Record<string, string> = {},
) {
  const r = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: r.status, data: await r.json() };
}
async function check(name: string, fn: () => Promise<string>) {
  try {
    const detail = await fn();
    results.push({ name, passed: true, detail });
    console.log("PASS", name, detail);
  } catch (e) {
    results.push({ name, passed: false, detail: String(e) });
    console.log("FAIL", name, String(e));
  }
}
let store: any;
let trend: any;
await check("Connection status", async () => {
  const r = await request("/status");
  assert.equal(r.status, 200);
  return JSON.stringify(r.data);
});
await check("Live trend retrieval", async () => {
  const r = await request("/trends", "POST", {});
  assert.equal(r.status, 200);
  assert.ok(r.data.trends.length > 0);
  for (const t of r.data.trends) {
    assert.equal(t.sample, false);
    assert.ok(Date.parse(t.publishedAt) >= Date.now() - 7 * 86400000);
    assert.match(t.url, /^https:\/\/news.ycombinator.com\/item\?id=/);
  }
  trend = r.data.trends[0];
  return `${r.data.trends.length} recent source-linked stories; mode=${r.data.mode}`;
});
await check("Create from live signal", async () => {
  const r = await request("/stores", "POST", { trend });
  assert.equal(r.status, 201);
  store = r.data;
  return `store=${store.id}; mode=${store.mode}`;
});
await check("Edit and read saved offer", async () => {
  const b = { ...store.blueprint, name: "QA · Live signal test", price: 47 };
  const r = await request("/stores/" + store.id, "PATCH", {
    blueprint: b,
    checkoutUrl: "https://whop.com/qa-placeholder/",
  });
  assert.equal(r.status, 200);
  store = r.data;
  const reread = await request("/stores");
  assert.equal(
    reread.data.find((s: any) => s.id === store.id).blueprint.price,
    47,
  );
  return "Saved name, $47 price and explicit test checkout URL";
});
await check("Disk persistence", async () => {
  const a = JSON.parse(await readFile(".data/stores.json", "utf8"));
  assert.equal(a.find((s: any) => s.id === store.id).blueprint.price, 47);
  return "Stored in .data/stores.json";
});
await check("Reject hostile checkout URL", async () => {
  const r = await request("/stores/" + store.id, "PATCH", {
    blueprint: store.blueprint,
    checkoutUrl: "javascript:alert(1)",
  });
  assert.equal(r.status, 400);
  return "HTTP 400";
});
await check("Reject invalid blueprint", async () => {
  const r = await request("/stores", "POST", { trend: {} });
  assert.equal(r.status, 400);
  return "HTTP 400";
});
await check("Reject cross-origin mutation", async () => {
  const r = await request(
    "/stores",
    "POST",
    { trend },
    { Origin: "https://evil.example" },
  );
  assert.equal(r.status, 403);
  return "HTTP 403";
});
await check("Missing store returns 404", async () => {
  const r = await request("/stores/nonexistent", "PATCH", {});
  assert.equal(r.status, 404);
  return "HTTP 404";
});
await check(
  "Invalid campaign is rejected before provider submission",
  async () => {
    const r = await request("/campaigns", "POST", {
      storeId: store.id,
      budget: 15,
      days: 7,
      country: "US",
      destination: "https://whop.com/qa-placeholder/",
      creativeId: "",
      socialAccountId: "",
      headline: "QA test",
      copy: "QA only",
    });
    assert.equal(r.status, 400);
    return "HTTP 400; no provider call";
  },
);
await check("Malformed JSON returns 400", async () => {
  const r = await fetch(base + "/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(r.status, 400);
  return "HTTP 400";
});
// Leave the test blueprint identifiable but prevent an accidental purchase through its placeholder.
if (store)
  await request("/stores/" + store.id, "PATCH", {
    blueprint: store.blueprint,
    checkoutUrl: "",
  });
await writeFile(
  "SMOKE-RESULTS.json",
  JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2),
);
process.exitCode = results.some((r) => !r.passed) ? 1 : 0;
