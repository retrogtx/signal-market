import type { IncomingMessage, ServerResponse } from "node:http";
import { fetchSignals } from "../server/signals.ts";
let cache: { at: number; data: unknown } | undefined;
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end(JSON.stringify({ error: "Use POST" }));
    return;
  }
  try {
    if (!cache || Date.now() - cache.at > 300000) {
      const { trends, sourceCount } = await fetchSignals();
      cache = {
        at: Date.now(),
        data: {
          trends: trends.slice(0, 12),
          sourceCount,
          scannedAt: new Date().toISOString(),
          mode: "signals",
        },
      };
    }
    res.end(JSON.stringify(cache.data));
  } catch {
    res.statusCode = 502;
    res.end(
      JSON.stringify({
        error: "Trend source is unavailable. Please try again.",
      }),
    );
  }
}
