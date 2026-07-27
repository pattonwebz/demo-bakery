# a11y test site

A deliberately half-broken static site — "Demo Bakery" — used to demo accessibility testing in
CI/CD. On every push it deploys to GitHub Pages and is then scanned live by
[axe-scan-action](https://github.com/pattonwebz/axe-scan-action) +
[axe-report-action](https://github.com/pattonwebz/axe-report-action) — see the job summary of any
[Deploy and scan run](../../actions) for the report.

**The workflow is expected to fail.** That's the demo: the report enforces `fail-on: serious`
against pages that contain intentional violations.

## Pull-request merge gate (fast CI path)

This repo now includes a dedicated PR workflow at
`.github/workflows/pr-gate-scan.yml` with job name:

- **`PR Accessibility Gate`**

The job serves `site/` locally on the Actions runner, scans all pages with
`axe-scan-action`, renders summary/report artifacts, and fails on threshold.
Because it scans localhost on-runner, it is much faster than server deploy
flows and is ideal for live CI gate demos.

To make this a true merge gate, set branch protection on `main` and require:

- **`PR Accessibility Gate`**

All seven pages share a real product-site look (`site/assets/style.css`): a nav bar, a hero
section, a menu/feature grid, and a footer with a working newsletter signup form — so the
intentional violations sit inside a page that actually looks like something worth scanning,
rather than bare unstyled markup. That chrome is itself real, tested code: verified with a real
axe-core scan against all three pages, with two contrast bugs the chrome introduced (a footer text
color and a footer link color, both only checked against the light background originally, not the
footer's dark one) found and fixed the same way — by actually running the scan, not assuming the
CSS was fine. `clean.html` is re-verified at 0 violations after every change to the shared chrome,
since that's its entire job.

| Page | Intentional issues |
|---|---|---|
| `index.html` | Image without alt text, low-contrast text, clickable `div`, link with no text |
| `about.html` | Missing `lang` attribute, skipped heading level, unlabeled form inputs (note: axe's automated `label` rule does not flag the unlabeled inputs — `placeholder` text satisfies the accessible-name computation even though it disappears on focus; this is a real, documented limit of automated scanning, not a bug in this demo) |
| `menu.html` | Table without `scope` on `th`, empty `th` (empty-table-header), decorative SVG icon with `aria-hidden` instead of accessible name, dead link (`href=""`), low-contrast promo banner text |
| `gallery.html` | Gallery images with no `alt` attribute (image-alt), SVG icon with `role="presentation"` that conveys meaning, `tabindex="3"` on non-interactive element, `role="img"` without `aria-label`, empty link wrapping content |
| `events.html` | Heading level skip (h2→h5), non-semantic list (div-based), `<p>` styled to look like a heading, low-contrast `date-badge--faint` |
| `contact.html` | Duplicate `id` attribute on two inputs, submit button with no text content, textarea without associated `<label>`, mislabeled team photo (decorative `alt=""` on informative image) |
| `clean.html` | None — exists to show a passing row in the report |

## Running locally (no CI cost)

```bash
npm install
npm run demo:local
```

This serves `site/` on `http://127.0.0.1:8899/` and runs the *actual* axe-scan-action and
axe-report-action code (both installed as normal git devDependencies, pinned to the same tags
the workflow uses) as plain Node scripts driven by `INPUT_*` env vars — exactly how the GitHub
Actions runner invokes them. No GitHub Actions runtime, no CI minutes, same report as CI produces.

Writes `artifacts/axe-results.json` and `artifacts/a11y-summary.md`. Override the port with
`PORT=8898 npm run demo:local` if 8899 is taken, or `FAIL_ON=none npm run demo:local` /
`SHOW_PERSONAS=false npm run demo:local` to change thresholds without touching the workflow file.
