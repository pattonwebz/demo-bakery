# a11y test site

A static demo site — "Demo Bakery" — used to demonstrate accessibility testing in CI/CD with
[axe-scan-action](https://github.com/pattonwebz/axe-scan-action) +
[axe-report-action](https://github.com/pattonwebz/axe-report-action).

**`main` is clean: zero axe violations across all six pages.** That is the point. Breakage is
introduced deliberately *in pull requests*, so the demo shows a gate catching a regression before it
reaches production — not a permanently red build.

> This inverts how the repo previously worked. It used to ship intentional violations on `main` with
> a single `clean.html` as the passing row. That premise made it impossible to demonstrate a gate
> actually blocking anything, because the baseline was already failing.

## How the gate works

### On push to `main` — `.github/workflows/deploy-and-scan.yml`

Two jobs, in order:

1. **`Accessibility Gate`** — serves `site/` on the runner and scans every page with axe-core,
   failing on `serious`.
2. **`Deploy to GitHub Pages`** — `needs: accessibility`.

Because the gate runs *first*, a site with a serious violation is never published. The deploy job is
skipped entirely.

### On pull request — `.github/workflows/pr-gate-scan.yml`

- Job name: **`PR Accessibility Gate`**

Serves `site/` locally on the runner, scans all pages, renders summary and report artifacts, and
fails on threshold. Scanning localhost on-runner is much faster than a deploy-then-scan flow, which
makes it suitable for a live CI demo.

To make this a true merge gate, set branch protection on `main` and require the
**`PR Accessibility Gate`** check.

Both workflows derive their URL list from the `.html` files actually present in `site/`, so the list
cannot drift out of sync when a page is added or removed.

## The site

Six pages: `index`, `menu`, `gallery`, `events`, `about`, `contact`.

Design system lives in `site/assets/style.css` — a cool near-monochrome palette with photography
carrying all the colour, built on explicit type, spacing, radius and elevation scales. Body text
runs at 8.6:1 contrast and muted-on-dark at 12.0:1, both clearing AAA.

All photography is vendored locally in `site/assets/img/` — see
[`ATTRIBUTIONS.md`](site/assets/img/ATTRIBUTIONS.md). **The site makes no remote requests.** It
previously hotlinked eight Unsplash URLs, four of which had already gone 404, so the live site was
serving broken images. Vendoring also keeps the site scannable on an unreliable network.

## Running locally (no CI cost)

```bash
npm install
npm run demo:local
```

This serves `site/` on `http://127.0.0.1:8899/` and runs the *actual* axe-scan-action and
axe-report-action code (both installed as normal git devDependencies, pinned to the same tags the
workflow uses) as plain Node scripts driven by `INPUT_*` env vars — exactly how the GitHub Actions
runner invokes them. No GitHub Actions runtime, no CI minutes, same report as CI produces.

Writes `artifacts/axe-results.json` and `artifacts/a11y-summary.md`. Override the port with
`PORT=8898 npm run demo:local` if 8899 is taken, or `FAIL_ON=none npm run demo:local` /
`SHOW_PERSONAS=false npm run demo:local` to change thresholds without touching the workflow file.

## Demonstrating a failure

Open a pull request that introduces a serious violation — a missing `alt` on a meaningful image, an
unlabelled control, a contrast regression. The `PR Accessibility Gate` check goes red and the report
artifact names the rule, the element and the page. With branch protection configured, the merge
button is disabled.

Keep `main` clean. That is what makes the red check mean something.
