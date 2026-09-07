import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Radio,
  Layers,
  Store as StoreIcon,
  Megaphone,
  Settings,
  Plus,
  Check,
  LoaderCircle,
  Download,
  ExternalLink,
  ChevronLeft,
  SlidersHorizontal,
  Sparkles,
  Bookmark,
  Globe,
  CheckCircle2,
  X,
} from "lucide-react";
import { samples, type Trend, type Store, type Blueprint } from "./domain";
import { api, hostedDemo } from "./client-api";
function download(name: string, text: string, type = "application/json") {
  const u = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
const escape = (v: string) =>
  v.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
function storefrontHtml(s: Store) {
  const b = s.blueprint;
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(b.name)}</title><style>body{margin:0;background:#f1f0e7;color:#233629;font:18px system-ui}main{max-width:900px;margin:auto;padding:60px 24px}nav{font-weight:bold;border-bottom:1px solid #ccc;padding-bottom:20px}h1{font:clamp(44px,8vw,84px) Georgia;max-width:800px}p{line-height:1.7;max-width:650px}li{padding:14px}a{display:inline-block;background:#244b34;color:white;padding:18px 25px;border-radius:8px;text-decoration:none}small{display:block;margin-top:30px}</style><main><nav>${escape(b.name)}</nav><h1>${escape(b.tagline)}</h1><p>${escape(b.description)}</p><h2>Inside the ${escape(b.productType.toLowerCase())}</h2><ul>${b.deliverables.map((d) => `<li>${escape(d)}</li>`).join("")}</ul>${s.checkoutUrl ? `<a href="${escape(s.checkoutUrl)}">Get access · $${b.price}</a>` : "<p>Coming soon. This product is in development.</p>"}<small>${s.checkoutUrl ? "Checkout powered by Whop" : "Preview · Create the product resources and connect Whop checkout before selling."}</small></main></html>`;
}
function Art({
  index = 0,
  large = false,
}: {
  index?: number;
  large?: boolean;
}) {
  return (
    <div
      className={`art art-${index % 6} ${large ? "large" : ""}`}
      aria-hidden="true"
    >
      <div className="art-grid" />
      {index % 6 === 0 ? (
        <>
          <div className="orbit o1" />
          <div className="orbit o2" />
          <div className="orbit o3" />
          <div className="art-star">✳</div>
          <span className="art-label">
            MAKE SOMETHING
            <br />
            THAT MATTERS.
          </span>
        </>
      ) : index % 6 === 1 ? (
        <>
          <div className="paper p1" />
          <div className="paper p2">
            <span>
              less scroll.
              <br />
              more life.
            </span>
            <i>the analog reset</i>
          </div>
          <div className="sun" />
        </>
      ) : index % 6 === 2 ? (
        <>
          <div className="node n1">input</div>
          <div className="node n2">✳ agent</div>
          <div className="node n3">output ↗</div>
        </>
      ) : index % 6 === 3 ? (
        <>
          <div className="track t1" />
          <div className="track t2" />
          <div className="track t3" />
          <b className="run">
            RUN
            <br />
            TOGETHER.
          </b>
        </>
      ) : index % 6 === 4 ? (
        <>
          <div className="leaf l1" />
          <div className="leaf l2" />
          <div className="leaf l3" />
          <span className="grow">
            room
            <br />
            to grow.
          </span>
        </>
      ) : (
        <>
          <div className="block b1" />
          <div className="block b2" />
          <div className="block b3" />
          <span className="studio">
            ONE /<br />
            OF ONE.
          </span>
        </>
      )}
    </div>
  );
}
export default function App() {
  const [view, setView] = useState("discover");
  const [trends, setTrends] = useState<Trend[]>(samples);
  const [mode, setMode] = useState("sample");
  const [stores, setStores] = useState<Store[]>([]);
  const [selected, setSelected] = useState<Store | null>(null);
  const [tab, setTab] = useState("blueprint");
  const [filter, setFilter] = useState("All opportunities");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState({ ai: false, whop: false });
  const [scanned, setScanned] = useState("");
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("signal-saved") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    Promise.all([api<Store[]>("/stores"), api<typeof status>("/status")])
      .then(([s, c]) => {
        setStores(s);
        setStatus(c);
      })
      .catch((e) => setError(e.message));
  }, []);
  async function action(name: string, fn: () => Promise<void>) {
    setBusy(name);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy("");
    }
  }
  function open(s: Store) {
    setSelected(s);
    setTab("blueprint");
    setView("detail");
  }
  function bookmark(id: string) {
    const next = saved.includes(id)
      ? saved.filter((v) => v !== id)
      : [...saved, id];
    setSaved(next);
    localStorage.setItem("signal-saved", JSON.stringify(next));
  }
  function update(s: Store) {
    setSelected(s);
    setStores((prev) => prev.map((x) => (x.id === s.id ? s : x)));
  }
  const filtered = trends.filter(
    (t) =>
      (filter === "All opportunities" ||
        (filter === "Saved" && saved.includes(t.id)) ||
        t.category === filter) &&
      `${t.title} ${t.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="app">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("discover")}>
          <span className="brand-icon">✳</span>
          <span>
            signal<span className="brand-light">market</span>
            <sup>β</sup>
          </span>
        </button>
        <div className="workspace">
          <span className="avatar">A</span>
          <div>
            Your workspace<small>Personal account</small>
          </div>
          <span className="workspace-arrow">⌄</span>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {[
            { id: "discover", label: "Discover", icon: Radio },
            { id: "stores", label: "My blueprints", icon: Layers },
            { id: "websites", label: "Storefronts", icon: StoreIcon },
            { id: "campaigns", label: "Ad campaigns", icon: Megaphone },
          ].map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={view === n.id ? "active" : ""}
            >
              <n.icon size={18} />
              {n.label}
              {n.id === "stores" && (
                <span className="count">{stores.length}</span>
              )}
            </button>
          ))}
          <button
            className="mobile-settings"
            aria-label="Connections"
            onClick={() => setView("settings")}
          >
            <Settings size={18} />
          </button>
        </nav>
        <div className="side-bottom">
          <div className="side-note">
            <span>FROM SIGNAL TO STORE</span>
            <p>
              The next big thing
              <br />
              starts small.
            </p>
            <div className="tiny-path">
              ◉ <span>·····</span> ◇ <span>·····</span> ↗
            </div>
          </div>
          <button className="settings" onClick={() => setView("settings")}>
            <Settings size={17} /> Connections <span className="status-dot" />
          </button>
          <div className="profile">
            <span className="avatar dark">A</span>
            <div>
              My workspace<small>MVP edition</small>
            </div>
          </div>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span>
            Workspace <span className="slash">/</span>{" "}
            <strong>
              {view === "detail"
                ? selected?.blueprint.name
                : (
                    {
                      discover: "Discover",
                      stores: "My blueprints",
                      websites: "Storefronts",
                      campaigns: "Ad campaigns",
                      settings: "Connections",
                    } as Record<string, string>
                  )[view]}
            </strong>
          </span>
          <span className="top-right">
            <span className="status-dot" />{" "}
            {status.ai ? "AI connected" : "Explore mode"}
            <span className="avatar small">A</span>
          </span>
        </header>
        <div className="content">
          {error && (
            <div role="alert" className="alert error">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div role="status" className="alert">
              {notice}
              <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {view === "discover" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">THE OPPORTUNITY IS OUT THERE</div>
                  <h1>
                    Catch the signal.
                    <br className="mobile-break" /> Build what’s next.
                  </h1>
                  <p>
                    Spot an emerging trend. Make it a product. Find your first
                    customers.
                  </p>
                </div>
                <button
                  className="primary"
                  disabled={!!busy}
                  onClick={() =>
                    action("scan", async () => {
                      const r = await api<{
                        trends: Trend[];
                        mode: string;
                        scannedAt: string;
                      }>("/trends", "POST", {});
                      setTrends(r.trends);
                      setMode(r.mode);
                      setScanned(r.scannedAt);
                      setFilter("All opportunities");
                    })
                  }
                >
                  {busy === "scan" ? (
                    <LoaderCircle className="spin" size={16} />
                  ) : (
                    <Radio size={16} />
                  )}{" "}
                  {busy === "scan"
                    ? "Scanning the internet…"
                    : "Scan for trends"}
                </button>
              </div>
              <section className="hero">
                <div className="hero-copy">
                  <div className="hero-badge">
                    <span /> YOUR NEXT BUSINESS, STARTS HERE
                  </div>
                  <h2>
                    A little signal.
                    <br />A lot of possibility.
                  </h2>
                  <p>
                    Go from “that’s interesting” to a business
                    <br />
                    blueprint, a storefront, and your first ad.
                  </p>
                  <button
                    onClick={() =>
                      document
                        .getElementById("opportunities")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Explore opportunities <ArrowRight size={17} />
                  </button>
                </div>
                <div className="hero-art">
                  <div className="hero-circle" />
                  <div className="floating-card fc1">
                    <span>01 / DISCOVER</span>
                    <Radio size={25} />
                    <b>Find the spark.</b>
                    <div className="mini-bars">
                      {[15, 25, 18, 35, 29, 48, 60, 70, 90].map((v, i) => (
                        <i key={i} style={{ height: v / 2 }} />
                      ))}
                    </div>
                  </div>
                  <div className="floating-card fc2">
                    <span>02 / CREATE</span>
                    <div className="mini-logo">✳</div>
                    <b>Make it yours.</b>
                    <div className="mini-lines" />
                  </div>
                  <div className="floating-card fc3">
                    <span>03 / GROW</span>
                    <ArrowUpRight size={34} />
                    <b>Meet your people.</b>
                    <div className="mini-avatars">
                      ● ● ● <small>+ you</small>
                    </div>
                  </div>
                  <div className="hero-spark">✳</div>
                </div>
              </section>
              <div className="section-title" id="opportunities">
                <div>
                  <h2>
                    On the radar <span>{trends.length}</span>
                  </h2>
                  <p>
                    {mode === "sample"
                      ? "Sample opportunities to explore the workflow. Scan for live signals."
                      : `${mode === "ai" ? "AI-curated opportunities" : "Recent Hacker News signals"} · Scanned ${new Date(scanned).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                  </p>
                </div>
                <span className="data-tag">
                  <span className="status-dot" />
                  {mode === "sample" ? "SAMPLE DATA" : "LAST 7 DAYS"}
                </span>
              </div>
              <div className="filters">
                <div className="filter-tabs">
                  {[
                    "All opportunities",
                    "AI & automation",
                    "Business",
                    "Lifestyle",
                    "Saved",
                  ].map((f) => (
                    <button
                      key={f}
                      className={filter === f ? "selected" : ""}
                      onClick={() => setFilter(f)}
                    >
                      {f === "Saved" && <Bookmark size={13} />} {f}
                    </button>
                  ))}
                </div>
                <label className="search">
                  <Search size={15} />
                  <input
                    aria-label="Search opportunities"
                    placeholder="Search trends…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <div className="cards">
                {filtered.map((t, i) => (
                  <article className="trend-card" key={t.id}>
                    <div className="card-image">
                      <Art index={trends.indexOf(t)} />
                      <span className="category">{t.category}</span>
                      <button
                        className={`bookmark ${saved.includes(t.id) ? "bookmarked" : ""}`}
                        aria-label={`${saved.includes(t.id) ? "Unsave" : "Save"} ${t.title}`}
                        onClick={() => bookmark(t.id)}
                      >
                        <Bookmark
                          size={16}
                          fill={saved.includes(t.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="card-meta">
                        <span>{t.format}</span>
                        <span
                          className="score"
                          title="Editorial opportunity score, not measured market demand"
                        >
                          ↗ {t.score} <small>/ 100</small>
                        </span>
                      </div>
                      <h3>{t.title}</h3>
                      <p>{t.description}</p>
                      <div className="card-source">
                        {t.sample ? (
                          <span>◌ Illustrative concept</span>
                        ) : (
                          <a href={t.url} target="_blank" rel="noreferrer">
                            {t.source} · {t.points} points{" "}
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                      <button
                        className="build-button"
                        disabled={!!busy}
                        onClick={() =>
                          action(t.id, async () => {
                            const s = await api<Store>("/stores", "POST", {
                              trend: t,
                            });
                            setStores((prev) => [s, ...prev]);
                            open(s);
                          })
                        }
                      >
                        {busy === t.id ? (
                          <>
                            <LoaderCircle className="spin" size={15} />
                            Building your blueprint…
                          </>
                        ) : (
                          <>
                            Build this idea <ArrowUpRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!filtered.length && (
                <div className="empty">
                  No opportunities here yet. Try another filter or scan for new
                  trends.
                </div>
              )}
              <div className="footnote">
                <SlidersHorizontal size={14} /> Scores help prioritize
                exploration. They don’t measure buyer demand.
              </div>
            </>
          )}
          {["stores", "websites", "campaigns"].includes(view) && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR IDEAS, TAKING SHAPE</div>
                  <h1>
                    {view === "stores"
                      ? "The drawing board."
                      : view === "websites"
                        ? "Made for the internet."
                        : "Find your first customers."}
                  </h1>
                  <p>
                    {view === "campaigns"
                      ? "Turn your store blueprint into a focused Whop ad campaign."
                      : "Every business starts with an idea worth exploring."}
                  </p>
                </div>
                <button className="primary" onClick={() => setView("discover")}>
                  <Plus size={16} /> New blueprint
                </button>
              </div>
              {stores.length ? (
                <div className="store-list">
                  {stores.map((s, i) => (
                    <button
                      key={s.id}
                      className="store-row"
                      onClick={() => {
                        open(s);
                        setTab(
                          view === "campaigns"
                            ? "ads"
                            : view === "websites"
                              ? "website"
                              : "blueprint",
                        );
                      }}
                    >
                      <div className="store-thumb">
                        <Art index={i} />
                      </div>
                      <div>
                        <h3>{s.blueprint.name}</h3>
                        <p>
                          {s.blueprint.productType} · ${s.blueprint.price} ·{" "}
                          {s.mode === "ai" ? "AI generated" : "Template draft"}
                        </p>
                      </div>
                      <span className="pill">
                        {view === "campaigns"
                          ? s.campaign
                            ? "Whop draft"
                            : "Not connected"
                          : "Draft"}
                      </span>
                      <ArrowUpRight size={20} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <Layers size={35} />
                  <h2>Your first idea belongs here.</h2>
                  <p>Pick an opportunity and we’ll help you shape it.</p>
                  <button
                    className="primary"
                    onClick={() => setView("discover")}
                  >
                    Find an opportunity <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          {view === "detail" && selected && (
            <>
              <button className="back" onClick={() => setView("stores")}>
                <ChevronLeft size={16} /> All blueprints
              </button>
              <div className="page-heading detail-heading">
                <div>
                  <div className="eyebrow">
                    {selected.mode === "ai"
                      ? "AI GENERATED BLUEPRINT"
                      : "TEMPLATE BLUEPRINT"}{" "}
                    · DRAFT
                  </div>
                  <h1>{selected.blueprint.name}</h1>
                  <p>From an emerging idea to a business you can build.</p>
                </div>
                <button
                  className="secondary"
                  onClick={() =>
                    download(
                      "blueprint.json",
                      JSON.stringify(selected, null, 2),
                    )
                  }
                >
                  <Download size={16} /> Export blueprint
                </button>
              </div>
              <div className="detail-tabs">
                {[
                  ["blueprint", "01", "Blueprint"],
                  ["website", "02", "Storefront"],
                  ["ads", "03", "Whop ads"],
                ].map(([id, n, label]) => (
                  <button
                    key={id}
                    className={tab === id ? "active" : ""}
                    onClick={() => setTab(id)}
                  >
                    <span>{n}</span>
                    {label}
                    {tab === id && <span className="status-dot" />}
                  </button>
                ))}
              </div>
              {tab === "blueprint" ? (
                <BlueprintEditor
                  key={selected.id}
                  store={selected}
                  busy={!!busy}
                  onSave={(b) =>
                    action("save", async () => {
                      update(
                        await api<Store>("/stores/" + selected.id, "PATCH", {
                          blueprint: b,
                          checkoutUrl: selected.checkoutUrl,
                        }),
                      );
                      setNotice("Blueprint saved. Storefront updated.");
                    })
                  }
                  onNext={() => setTab("website")}
                />
              ) : tab === "website" ? (
                <div>
                  <div className="preview-actions">
                    <span>
                      <Globe size={15} /> Your storefront preview
                    </span>
                    <button
                      className="secondary"
                      onClick={() =>
                        download(
                          "index.html",
                          storefrontHtml(selected),
                          "text/html",
                        )
                      }
                    >
                      <Download size={15} /> Download website
                    </button>
                  </div>
                  <iframe
                    title="Generated storefront"
                    className="store-preview"
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                    srcDoc={storefrontHtml(selected)}
                  />
                  <Checkout
                    store={selected}
                    busy={!!busy}
                    onSave={(url) =>
                      action("checkout", async () => {
                        update(
                          await api<Store>("/stores/" + selected.id, "PATCH", {
                            blueprint: selected.blueprint,
                            checkoutUrl: url,
                          }),
                        );
                        setNotice("Checkout link saved.");
                      })
                    }
                  />
                  <button className="primary" onClick={() => setTab("ads")}>
                    Prepare your first ad <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <AdEditor
                  key={selected.id}
                  store={selected}
                  connected={status.whop}
                  busy={!!busy}
                  onSubmit={(body) =>
                    action("campaign", async () => {
                      const campaign = await api<
                        NonNullable<Store["campaign"]>
                      >("/campaigns", "POST", body);
                      update({ ...selected, campaign });
                      setNotice(
                        `Whop ad draft created: ${campaign.id}. Review and launch in your Whop dashboard.`,
                      );
                    })
                  }
                />
              )}
            </>
          )}
          {view === "settings" && (
            <>
              <div className="page-heading">
                <div className="eyebrow">CONNECT THE DOTS</div>
                <h1>Your engine room.</h1>
                <p>
                  Connect AI generation and your Whop account to go beyond
                  sample mode.
                </p>
              </div>
              <div className="connection-grid">
                {[
                  {
                    name: "Internet signals",
                    sub: "Hacker News · last 7 days",
                    enabled: true,
                    icon: Radio,
                    body: "A live public feed of recent stories, ranked by engagement. AI turns source stories into product opportunities when connected.",
                  },
                  {
                    name: "OpenAI",
                    sub: status.ai ? "Configured" : "Not configured",
                    enabled: status.ai,
                    icon: Sparkles,
                    body: "Add OPENAI_API_KEY to your local .env file, then restart the app. Enables source-backed opportunity analysis and custom store blueprints.",
                  },
                  {
                    name: "Whop Ads",
                    sub: status.whop ? "Configured" : "Not configured",
                    enabled: status.whop,
                    icon: Megaphone,
                    body: "Add WHOP_API_KEY and WHOP_ACCOUNT_ID to .env. Connect a Facebook page and upload your creative in Whop, then create a campaign draft here.",
                  },
                ].map((c) => (
                  <div className="panel connection" key={c.name}>
                    <c.icon size={24} />
                    <span className={`pill ${c.enabled ? "green" : ""}`}>
                      {c.sub}
                    </span>
                    <h2>{c.name}</h2>
                    <p>{c.body}</p>
                  </div>
                ))}
              </div>
              <div className="panel">
                <h3>Built for your first experiment</h3>
                <p>
                  {hostedDemo
                    ? "This hosted demo saves blueprints in this browser."
                    : "This local MVP stores blueprints on this computer."}{" "}
                  Generated products are plans: create the resources before
                  selling. Whop campaign creation sends a real draft when
                  configured; launch and payment setup happen in Whop.
                </p>
                <a
                  href="https://docs.whop.com/developer/ads/overview"
                  target="_blank"
                  rel="noreferrer"
                >
                  Whop advertising setup <ArrowUpRight size={14} />
                </a>
              </div>
            </>
          )}
        </div>
        <footer>
          <span>✳ signalmarket</span>
          <span>A small start. Something bigger.</span>
        </footer>
      </main>
    </div>
  );
}
function BlueprintEditor({
  store,
  busy,
  onSave,
  onNext,
}: {
  store: Store;
  busy: boolean;
  onSave: (b: Blueprint) => void;
  onNext: () => void;
}) {
  const [b, setB] = useState(store.blueprint);
  const dirty = JSON.stringify(b) !== JSON.stringify(store.blueprint);
  return (
    <div className="editor-grid">
      <form
        className="panel blueprint-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(b);
        }}
      >
        <div className="panel-heading">
          <h2>The idea, made concrete.</h2>
          <span className="pill">
            {dirty ? "Unsaved changes" : "Saved draft"}
          </span>
        </div>
        <label>
          Store name
          <input
            required
            maxLength={80}
            value={b.name}
            onChange={(e) => setB({ ...b, name: e.target.value })}
          />
        </label>
        <label>
          Headline
          <input
            required
            maxLength={160}
            value={b.tagline}
            onChange={(e) => setB({ ...b, tagline: e.target.value })}
          />
        </label>
        <label>
          The offer
          <textarea
            required
            maxLength={1200}
            rows={4}
            value={b.description}
            onChange={(e) => setB({ ...b, description: e.target.value })}
          />
        </label>
        <div className="two-cols">
          <label>
            Price (USD, one-time)
            <input
              type="number"
              required
              min={1}
              max={10000}
              value={b.price}
              onChange={(e) => setB({ ...b, price: Number(e.target.value) })}
            />
          </label>
          <label>
            Product format
            <input
              required
              value={b.productType}
              onChange={(e) => setB({ ...b, productType: e.target.value })}
            />
          </label>
        </div>
        <label>
          Who it’s for
          <textarea
            rows={2}
            value={b.audience}
            onChange={(e) => setB({ ...b, audience: e.target.value })}
          />
        </label>
        <button className="primary" disabled={busy}>
          {busy ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <Check size={16} />
          )}
          Save blueprint
        </button>
      </form>
      <div>
        <div className="panel">
          <div className="eyebrow">WHAT YOU’LL CREATE</div>
          <h2>A product with a purpose.</h2>
          <ul className="deliverables">
            {b.deliverables.map((d) => (
              <li key={d}>
                <CheckCircle2 size={17} />
                {d}
              </li>
            ))}
          </ul>
          <div className="note">
            These are proposed deliverables. Create and review the actual
            resources before selling.
          </div>
        </div>
        <div className="panel">
          <div className="eyebrow">YOUR FIRST FOUR MOVES</div>
          <ol className="steps">
            {b.launchSteps.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ol>
        </div>
        <button className="primary full" disabled={dirty} onClick={onNext}>
          Preview your storefront <ArrowRight size={16} />
        </button>
        {dirty && <small>Save your changes to update the storefront.</small>}
      </div>
    </div>
  );
}
function Checkout({
  store,
  busy,
  onSave,
}: {
  store: Store;
  busy: boolean;
  onSave: (s: string) => void;
}) {
  const [url, setUrl] = useState(store.checkoutUrl);
  return (
    <form
      className="panel checkout-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(url);
      }}
    >
      <label>
        Whop checkout URL
        <input
          type="url"
          placeholder="https://whop.com/your-store/"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <button className="secondary" disabled={busy}>
        Save checkout
      </button>
      <small>
        Publish your product on Whop, then connect its URL to enable the
        storefront’s buy button.
      </small>
    </form>
  );
}
function AdEditor({
  store,
  connected,
  busy,
  onSubmit,
}: {
  store: Store;
  connected: boolean;
  busy: boolean;
  onSubmit: (body: unknown) => void;
}) {
  const [headline, setHeadline] = useState(store.blueprint.adHeadline),
    [copy, setCopy] = useState(store.blueprint.adCopy),
    [budget, setBudget] = useState(15),
    [days, setDays] = useState(7),
    [country, setCountry] = useState("US"),
    [url, setUrl] = useState(store.checkoutUrl),
    [creative, setCreative] = useState(""),
    [social, setSocial] = useState("");
  const body = {
    storeId: store.id,
    headline,
    copy,
    budget,
    days,
    country,
    destination: url,
    creativeId: creative,
    socialAccountId: social,
  };
  return (
    <div className="editor-grid">
      <form
        className="panel blueprint-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(body);
        }}
      >
        <div className="panel-heading">
          <h2>Your first customer experiment.</h2>
          <span className="pill">Whop × Meta</span>
        </div>
        <label>
          Ad headline
          <input
            required
            maxLength={120}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </label>
        <label>
          Primary text
          <textarea
            required
            rows={4}
            maxLength={600}
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
          />
        </label>
        <div className="two-cols">
          <label>
            Daily planning budget (USD)
            <input
              type="number"
              min={5}
              max={1000}
              required
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </label>
          <label>
            Experiment length (days)
            <input
              type="number"
              min={1}
              max={30}
              required
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </label>
        </div>
        <label>
          Audience location
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {[
              ["US", "United States"],
              ["GB", "United Kingdom"],
              ["CA", "Canada"],
              ["AU", "Australia"],
              ["IN", "India"],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          Published Whop destination
          <input
            type="url"
            required
            placeholder="https://whop.com/your-store/"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <div className="two-cols">
          <label>
            Whop creative file ID
            <input
              required
              pattern="file_[a-zA-Z0-9]+"
              placeholder="file_…"
              value={creative}
              onChange={(e) => setCreative(e.target.value)}
            />
          </label>
          <label>
            Facebook social account ID
            <input
              required
              pattern="sacc_[a-zA-Z0-9]+"
              placeholder="sacc_…"
              value={social}
              onChange={(e) => setSocial(e.target.value)}
            />
          </label>
        </div>
        <div className="form-actions">
          <button
            className="primary"
            disabled={busy || !connected || !!store.campaign}
          >
            {busy ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Megaphone size={16} />
            )}{" "}
            {store.campaign ? "Draft created" : "Create Whop draft"}
          </button>
          <button
            className="secondary"
            type="button"
            onClick={() =>
              download(
                "campaign-brief.json",
                JSON.stringify(
                  {
                    ...body,
                    creativePrompt: store.blueprint.creativePrompt,
                    status: "local_brief",
                  },
                  null,
                  2,
                ),
              )
            }
          >
            <Download size={15} /> Export brief
          </button>
        </div>
        {!connected && (
          <div className="note">
            Connect Whop in .env to create a real draft. You can export your
            campaign brief now.
          </div>
        )}
        {store.campaign && (
          <div className="note">
            Whop ad: {store.campaign.id} · {store.campaign.status}. Review its
            current state in Whop before launching.
          </div>
        )}
      </form>
      <div>
        <div className="panel ad-preview">
          <div className="eyebrow">CREATIVE DIRECTION · PREVIEW</div>
          <Art index={0} />
          <div className="ad-copy">
            <strong>{store.blueprint.name}</strong>
            <small>Sponsored · Meta preview</small>
            <p>{copy}</p>
            <h3>{headline}</h3>
            <span className="mock-cta">Learn more ↗</span>
          </div>
        </div>
        <div className="panel budget">
          <span>Total experiment cap</span>
          <h2>
            ${budget * days}
            <small> USD</small>
          </h2>
          <p>
            A lifetime budget over {days} days. No spend until you launch in
            Whop. Your Whop ad account must use USD.
          </p>
          <hr />
          <span>Creative brief</span>
          <p>{store.blueprint.creativePrompt}</p>
          <a
            href="https://whop.com/dashboard/"
            target="_blank"
            rel="noreferrer"
          >
            Open Whop dashboard <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
