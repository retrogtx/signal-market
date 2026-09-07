import { test } from "node:test";
import assert from "node:assert/strict";
import {
  campaignSchema,
  campaignPayload,
  blueprintSchema,
  templateBlueprint,
  samples,
} from "../src/domain.ts";
const valid = {
  storeId: "store-test",
  budget: 15,
  days: 7,
  country: "US",
  destination: "https://whop.com/test/",
  creativeId: "file_abc",
  socialAccountId: "sacc_abc",
  headline: "A practical toolkit",
  copy: "Explore the included resources.",
};
test("campaign has a lifetime cap and is never automatically activated", () => {
  const input = campaignSchema.parse(valid);
  const payload = campaignPayload(input, "Test", "biz_test");
  assert.equal(payload.ad_group.budget_amount, 105);
  assert.equal(payload.ad_group.budget_type, "lifetime");
  assert.equal(payload.ad_group.ad_campaign.status, "draft");
  assert.ok(Date.parse(payload.ad_group.ends_at) > Date.now());
  assert.equal(payload.creatives[0].id, "file_abc");
  assert.equal(payload.ad_group.ad_campaign.account_id, "biz_test");
});
test("rejects untrusted checkout URLs and malformed advertising inputs", () => {
  for (const destination of [
    "not a url",
    "javascript:alert(1)",
    "https://whop.com.evil.test/",
    "http://whop.com/",
    "https://example.com",
  ])
    assert.equal(
      campaignSchema.safeParse({ ...valid, destination }).success,
      false,
    );
  for (const change of [
    { budget: -1 },
    { budget: 1001 },
    { days: 1.5 },
    { days: 31 },
    { creativeId: "bad" },
    { socialAccountId: "" },
    { copy: "" },
  ])
    assert.equal(
      campaignSchema.safeParse({ ...valid, ...change }).success,
      false,
    );
});
test("all sample concepts generate valid complete blueprints", () => {
  for (const t of samples) {
    const b = blueprintSchema.parse(templateBlueprint(t));
    assert.ok(b.deliverables.length >= 3);
    assert.ok(b.launchSteps.some((s) => s.includes("validate")));
  }
});
