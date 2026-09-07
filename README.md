<p align="center"><img src="docs/banner.svg" alt="Signal Market: Catch the signal. Build what’s next." width="100%" /></p>

<p align="center"><strong>Turn an internet signal into a digital-product blueprint, a storefront, and a first ad brief.</strong></p>
<p align="center">React · TypeScript · Vite · Express · Vercel</p>

## From curiosity to a concrete idea

Signal Market is an MVP workspace for exploring what to build next. Find a recent story, shape an offer, preview a real website, and prepare a small customer-acquisition experiment.

1. **Discover** recent Hacker News stories with source links and engagement signals, or explore six clearly labeled sample concepts.
2. **Build** a blueprint with an audience, offer, price, proposed deliverables, launch checklist, and ad copy.
3. **Make it yours** by editing the name, headline, offer, audience, and price.
4. **Preview and export** a standalone HTML storefront. Add your published Whop product URL to enable its checkout link.
5. **Prepare acquisition** with an editable Meta ad brief, creative direction, audience location, and lifetime budget.

## Two ways to run it

| Capability                | Hosted demo                    | Local application                     |
| ------------------------- | ------------------------------ | ------------------------------------- |
| Live internet signals     | Yes, through a Vercel function | Yes                                   |
| Blueprint generation      | Labeled templates              | Templates; optional OpenAI generation |
| Blueprint persistence     | This browser’s local storage   | Local `.data/stores.json`             |
| Website and JSON exports  | Yes                            | Yes                                   |
| Campaign brief and budget | Yes                            | Yes                                   |
| Whop API draft submission | Disabled                       | Optional, with your own credentials   |
| API keys required         | **None**                       | None for the basic workflow           |

**The hosted demo is deliberately key-free.** It does not receive or use Whop or OpenAI credentials. Each visitor’s blueprints stay in their own browser. Clearing browser storage removes them; export anything you want to keep.

## Run locally

Requires Node.js 22.12 or newer within Node 22.

```bash
npm ci
npm run dev
```

Open **http://localhost:4310**. The sample workflow and live trend scan work immediately.

```bash
npm run build       # Typecheck and build the local client
npm start           # Serve the production build locally
npm test            # Campaign boundaries and validation tests
npm run build:demo  # Build the key-free, browser-storage client
```

### Optional local integrations

```bash
cp .env.example .env
```

Edit `.env` locally and restart the server:

| Variable          | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| `OPENAI_API_KEY`  | AI opportunity analysis and custom blueprint generation |
| `OPENAI_MODEL`    | Responses API model; defaults to `gpt-5-mini`           |
| `WHOP_API_KEY`    | Scoped Whop key for your own account                    |
| `WHOP_ACCOUNT_ID` | Account that owns the campaign                          |
| `PORT`            | Local port; defaults to `4310`                          |

Never commit `.env` files. The repository and deployment ignore them, along with local data, test exports, and Vercel metadata. `.env.example` contains placeholders only. No credentials are needed in Vercel.

## Deploy to Vercel

Import this repository into Vercel. The included `vercel.json` selects Vite, runs `npm run build:demo`, serves `dist`, and deploys `api/trends.ts` as a Node function. **Leave environment variables empty.**

The hosted build uses browser storage instead of a shared server filesystem, so visitors do not share blueprints. The serverless function only fetches public trend signals; it has no AI, payment, or advertising integration.

## What the MVP does—and what it doesn’t

- **Signals are not validated demand.** The live source is Hacker News, not comprehensive social listening. Scores are engagement-based prioritization heuristics, not forecasts of sales or market size.
- **Blueprints are plans.** Proposed guides, templates, and courses still need to be produced and reviewed before selling.
- **A website export is not automatic store provisioning.** The HTML is usable, but hosting that storefront and creating the Whop product are separate steps.
- **Whop integration creates drafts only.** It never activates campaigns or spends an advertising budget. Launch and billing setup happen in Whop.
- **The local integration assumes a USD ad account.** A real draft requires the correct API scopes, a connected Facebook page (`sacc_…`), a creative (`file_…`), and a published Whop destination. A configured key does not establish that all prerequisites are ready.
- **This is not a multi-tenant SaaS backend.** Before enabling provider credentials in a hosted product, add authentication, tenant isolation, a database, quotas, and provider reconciliation.

## Project map

```text
src/
  App.tsx           Discovery, blueprints, storefronts, and campaign UI
  client-api.ts     Local API client and isolated hosted-demo persistence
  domain.ts         Shared schemas, templates, and draft campaign payload
  styles.css        Responsive visual system
server/
  index.ts          Local Express API and optional integrations
  signals.ts        Shared public trend retrieval
  domain.test.ts    Validation and draft-budget tests
api/
  trends.ts         Key-free Vercel function
scripts/
  smoke.ts          Live local-server smoke tests (creates QA data)
```

## Validation

The local flow was exercised through a real browser: scan, create, edit, save, reload, preview, checkout URL validation, and HTML/JSON downloads. Downloaded files were checked for edited content. The running-server smoke suite covers live retrieval, persistence, invalid inputs, and origin rejection.

Provider authentication and rejection handling have been tested separately. **Successful AI generation, live ad delivery, purchases, and customer acquisition are not established by those tests.**

## References

[Whop Ads API](https://docs.whop.com/api-reference/beta/ads/overview) · [Whop setup](https://docs.whop.com/developer/ads/overview) · [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) · [Hacker News API](https://hn.algolia.com/api)
