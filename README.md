# Demo Bakery

A static site for a bakery that does not exist, used to demonstrate accessibility testing in CI/CD
with [axe-scan-action](https://github.com/pattonwebz/axe-scan-action) +
[axe-report-action](https://github.com/pattonwebz/axe-report-action).

**Live: https://pattonwebz.github.io/demo-bakery/**

**`main` is clean — zero axe violations across all six pages.** That is the whole point. Breakage is
introduced deliberately *in pull requests*, so what the demo shows is a gate catching a regression
before it reaches production, not a build that is permanently red.

> Previously this repo was called `a11y-test-site` and worked the other way round: `main` shipped
> intentional violations with a single `clean.html` as the one passing row. That made it impossible
> to demonstrate a gate blocking anything, because the baseline was already failing. The old GitHub
> Pages URL 404s — GitHub redirects renamed *repository* URLs but not *Pages* URLs.

## How the gate works

### On pull request — `.github/workflows/pr-gate-scan.yml`

Job name: **`PR Accessibility Gate`**

Serves `site/` on the runner, scans every page with axe-core, renders summary and report artifacts,
and fails at `serious` or above. Because it scans localhost on the runner rather than waiting on a
deploy, a full run takes roughly 20 seconds — fast enough to demo live.

This is the check to require in branch protection. See [Making it a real
gate](#making-it-a-real-gate) below.

### On push to `main` — `.github/workflows/deploy-and-scan.yml`

Two jobs, in this order:

1. **`Accessibility Gate`** — same scan, against a local server on the runner.
2. **`Deploy to GitHub Pages`** — declares `needs: accessibility`.

The gate runs *first*, so a site with a serious violation is never published; the deploy job is
skipped entirely. This workflow used to deploy first and scan the live site afterwards, which meant
a violation could not stop anything — the broken site was already up by the time the scan reported.

### URL lists

All three entry points — both workflows and the local runner — build their URL list from the
`.html` files actually present in `site/`. Add or remove a page and it is picked up automatically;
there is no hardcoded list to drift out of sync.

## Making it a real gate

Until branch protection is configured, a failing check is only *advisory* — GitHub shows it red and
still lets you merge. To make the merge button genuinely refuse:

**Settings → Rules → Rulesets → New branch ruleset**

- **Enforcement status: Active** (it defaults to Disabled, and a disabled ruleset does nothing)
- **Target branches**: Include default branch
- **Bypass list**: leave it empty. Anyone on that list — including repository admins — gets a
  "bypass branch protections" merge button, which looks exactly like the gate not working.
- **Require a pull request before merging**, with **0 required approvals**. The status check rule
  only gates merges; without this, a direct push to `main` sidesteps it entirely.
- **Require status checks to pass** → add **`PR Accessibility Gate`**
- Leave **Require branches to be up to date before merging** off — it forces a re-run every time
  `main` moves ahead.

The required check string is the **job** name (`PR Accessibility Gate`), not the workflow name. If
the job is ever renamed, the ruleset waits forever for a check that no longer reports and pull
requests sit pending rather than failing.

Verify with:

```bash
gh pr view <number> --json mergeable,mergeStateStatus
```

A blocked pull request reports `"mergeStateStatus": "BLOCKED"`.

## The site

Six pages: `index`, `menu`, `gallery`, `events`, `about`, `contact`.

The design system lives in `site/assets/style.css`: a cool near-monochrome palette where the
photography carries all the colour, built on explicit type, spacing, radius and elevation scales.
Body text runs at 8.6:1 and muted-on-dark at 12.0:1, both clearing AAA. Every page has a skip link
and a `<main>` landmark, and there are no inline `style` attributes.

All photography is vendored locally in `site/assets/img/` — see
[`ATTRIBUTIONS.md`](site/assets/img/ATTRIBUTIONS.md) for photographer and source per image. **The
site makes no remote requests at all.** It previously hotlinked eight Unsplash URLs, four of which
had already gone 404, so the published site was serving broken images. Vendoring also keeps the site
scannable when the network is unreliable — which, at a conference, it is.

## Running locally (no CI cost)

```bash
npm install
npm run demo:local
```

Serves `site/` on `http://127.0.0.1:8899/` and runs the *actual* axe-scan-action and
axe-report-action code — both installed as normal git devDependencies pinned to the same tags the
workflows use — as plain Node scripts driven by `INPUT_*` env vars, exactly how the Actions runner
invokes them. No Actions runtime, no CI minutes, same report CI produces.

Writes `artifacts/axe-results.json` and `artifacts/a11y-summary.md`.

| Variable | Effect |
| --- | --- |
| `PORT=8898` | Use a different port if 8899 is taken |
| `FAIL_ON=none` | Report everything without failing |
| `SHOW_PERSONAS=false` | Drop the persona breakdown from the summary |

## Demonstrating it

Two pull requests are kept open, unmerged, as a matched pair:

| PR | Branch | Result |
| --- | --- | --- |
| [#1](../../pull/1) | `demo/promo-banner` | **Fails.** One serious `color-contrast` violation — a promo banner at 1.96:1 |
| [#2](../../pull/2) | `demo/winter-hours` | **Passes.** A new menu item and homepage card, no violations |

Both are ordinary-looking content changes. The failing one is a plausible design tweak rather than
obviously broken markup, which is the point: this is the kind of regression that reaches production
when nothing is watching for it.

To build your own, open a pull request introducing a serious violation — a missing `alt` on a
meaningful image, an unlabelled control, a contrast regression. The check goes red and the report
artifact names the rule, the element and the page.

Keep `main` clean. That is what makes a red check mean something.
