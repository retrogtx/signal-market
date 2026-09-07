import { z } from "zod";
export const trendSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(180),
  category: z.string(),
  description: z.string(),
  audience: z.string(),
  format: z.string(),
  score: z.number().min(0).max(100),
  source: z.string(),
  url: z.string().url(),
  points: z.number(),
  publishedAt: z.string(),
  sample: z.boolean(),
});
export type Trend = z.infer<typeof trendSchema>;
export const blueprintSchema = z.object({
  name: z.string().min(1).max(80),
  tagline: z.string().min(1).max(160),
  description: z.string().min(1).max(1200),
  audience: z.string().max(500),
  price: z.number().min(1).max(10000),
  productType: z.string().max(80),
  deliverables: z.array(z.string().max(300)).min(3).max(6),
  launchSteps: z.array(z.string().max(300)).min(3).max(6),
  adHeadline: z.string().max(120),
  adCopy: z.string().max(600),
  creativePrompt: z.string().max(1000),
});
export type Blueprint = z.infer<typeof blueprintSchema>;
export type Store = {
  id: string;
  trend: Trend;
  blueprint: Blueprint;
  createdAt: string;
  mode: "ai" | "template";
  checkoutUrl: string;
  campaign?: { id: string; status: string };
  campaignRequest?: { id: string; payload: ReturnType<typeof campaignPayload> };
};
export const campaignSchema = z.object({
  storeId: z.string(),
  budget: z.number().min(5).max(1000),
  days: z.number().int().min(1).max(30),
  country: z.enum(["US", "GB", "CA", "AU", "IN"]),
  destination: z
    .string()
    .url()
    .refine((v) => {
      let u: URL;
      try {
        u = new URL(v);
      } catch {
        return false;
      }
      return (
        u.protocol === "https:" &&
        (u.hostname === "whop.com" || u.hostname.endsWith(".whop.com"))
      );
    }, "Use your published Whop store URL"),
  creativeId: z.string().regex(/^file_[a-zA-Z0-9]+$/),
  socialAccountId: z.string().regex(/^sacc_[a-zA-Z0-9]+$/),
  headline: z.string().min(1).max(120),
  copy: z.string().min(1).max(600),
});
export type CampaignInput = z.infer<typeof campaignSchema>;
export function campaignPayload(
  input: CampaignInput,
  name: string,
  accountId: string,
) {
  return {
    title: `${name} launch ad`,
    primary_texts: [input.copy],
    headlines: [input.headline],
    call_to_action: "learn_more",
    url: input.destination,
    creatives: [{ id: input.creativeId }],
    social_accounts: [{ id: input.socialAccountId }],
    ad_group: {
      title: `${input.country} discovery`,
      conversion_location: "website",
      budget_amount: input.budget * input.days,
      budget_type: "lifetime",
      ends_at: new Date(Date.now() + input.days * 86400000).toISOString(),
      regions: { include: { countries: [input.country] } },
      ad_campaign: {
        account_id: accountId,
        title: `${name} · first customers`,
        platform: "meta",
        objective: "sales",
        status: "draft",
      },
    },
  };
}
export function templateBlueprint(t: Trend): Blueprint {
  const name = t.sample ? t.title : `${t.title.slice(0, 42)} Toolkit`;
  return {
    name,
    tagline: `Your practical starting point for ${t.category.toLowerCase()}.`,
    description: `Turn your interest in ${t.title.toLowerCase()} into a concrete project. A focused collection of guides, templates, and exercises for ${t.audience.toLowerCase()}.`,
    audience: t.audience,
    price: 29,
    productType: t.format,
    deliverables: [
      "A step-by-step getting started guide",
      "Five editable templates for your first project",
      "A practical launch and review checklist",
    ],
    launchSteps: [
      "Interview five potential buyers to validate the problem",
      "Create and review every promised resource",
      "Publish your Whop product and connect checkout",
      "Test a small campaign and measure purchases",
    ],
    adHeadline: `Start with ${t.category.toLowerCase()}`,
    adCopy: `Curious about ${t.title.toLowerCase()}? Get a practical toolkit with guides, editable templates, and a clear starting point. Explore what’s included.`,
    creativePrompt: `Editorial product photograph for ${name}. A beautifully arranged printed workbook, clean typography, warm natural lighting. No earnings claims.`,
  };
}
export const samples: Trend[] = [
  [
    "Creator workflow kits",
    "AI & automation",
    "Turn scattered AI tools into a repeatable content workflow.",
    "Independent creators and small content teams",
    "Templates & guide",
    91,
    "✳",
  ],
  [
    "The analog reset",
    "Lifestyle",
    "A hands-on digital detox for people who want their attention back.",
    "Busy professionals looking for intentional routines",
    "Digital workbook",
    86,
    "◉",
  ],
  [
    "Build your first AI agent",
    "AI & automation",
    "Practical, small-scale automations for everyday business tasks.",
    "Freelancers and solo business owners",
    "Mini course",
    89,
    "⌘",
  ],
  [
    "The running club playbook",
    "Community",
    "Help local organizers turn a weekly run into a lasting community.",
    "First-time running club organizers",
    "Playbook",
    82,
    "↗",
  ],
  [
    "Small-space growing",
    "Lifestyle",
    "Make a productive garden out of a balcony, windowsill, or spare corner.",
    "Apartment dwellers and beginner gardeners",
    "Guide & planner",
    78,
    "✿",
  ],
  [
    "A one-person studio",
    "Business",
    "A lightweight system for turning a creative skill into a service.",
    "Designers and independent creatives",
    "Templates & guide",
    84,
    "◇",
  ],
].map(([title, category, description, audience, format, score], i) => ({
  id: `sample-${i}`,
  title: String(title),
  category: String(category),
  description: String(description),
  audience: String(audience),
  format: String(format),
  score: Number(score),
  source: "Sample concept",
  url: "https://news.ycombinator.com/",
  points: 0,
  publishedAt: "",
  sample: true,
}));
