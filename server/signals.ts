import type { Trend } from "../src/domain.ts";
export async function fetchSignals() {
  const since = Math.floor(Date.now() / 1000) - 7 * 86400;
  const response = await fetch(
    `https://hn.algolia.com/api/v1/search?tags=story&numericFilters=created_at_i>${since},points>20&hitsPerPage=24`,
    { signal: AbortSignal.timeout(15000) },
  );
  if (!response.ok)
    throw new Error("Trend source is unavailable. Please retry.");
  const data = await response.json();
  const trends: Trend[] = data.hits
    .filter((h: any) => h.title)
    .map((h: any) => ({
      id: String(h.objectID),
      title: h.title,
      category: /\bai\b|llm|agent|model|gpt|claude|gemini/i.test(h.title)
        ? "AI & automation"
        : /build|startup|business/i.test(h.title)
          ? "Business"
          : "Technology",
      description: `${h.title}. ${h.points} points and ${h.num_comments} comments on Hacker News. Validate buyer demand before building.`,
      audience: "People interested in this topic",
      format: "Guide & templates",
      score: Math.min(99, Math.round(20 + Math.log2(h.points + 1) * 6)),
      source: "Hacker News",
      url: `https://news.ycombinator.com/item?id=${h.objectID}`,
      points: h.points,
      publishedAt: h.created_at,
      sample: false,
    }));
  if (!trends.length)
    throw new Error("No recent signals found. Try again later.");
  return { trends, sourceCount: data.hits.length };
}
