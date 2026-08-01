# Changelog

Notable changes to this demo site and its scan pipeline.

## 2026-08-01

### Changed — repository renamed

`a11y-test-site` → `demo-bakery`, to match what the project actually is now that `main` is a clean
site rather than a catalogue of violations.

**The GitHub Pages URL changed** to https://pattonwebz.github.io/demo-bakery/. GitHub redirects the
old *repository* URL, but not the old *Pages* URL — https://pattonwebz.github.io/a11y-test-site/
now 404s. Update any bookmark or slide pointing at it.

### Changed — the premise is inverted

`main` is now **clean: zero axe violations across all six pages**. Deliberate breakage moves into
pull requests. Previously `main` shipped catalogued violations with `clean.html` as the single
passing row, which meant the gate could never be shown blocking anything — the baseline was already
red.

### Changed — the deploy gates on the scan

`deploy-and-scan.yml` previously deployed to Pages *first* and scanned the live site afterwards, so
a violation could not stop the deploy. The scan now runs against a local server on the runner as an
`Accessibility Gate` job, and the Pages deploy `needs:` it. A broken site is never published.

Both workflows now derive their URL list from the `.html` files present in `site/` rather than a
hardcoded list, so the list cannot drift when pages are added or removed. `scripts/run-locally.mjs`
does the same.

### Changed — full visual rebuild

- New design system in `site/assets/style.css`: cool near-monochrome palette, photography carries
  the colour. Explicit type, spacing, radius and elevation scales. One card language throughout.
  Body text 8.6:1, muted-on-dark 12.0:1 — both AAA.
- All six pages rebuilt on it: full-bleed hero and statement sections, a real menu list, a
  nine-image gallery, an events list, an about page with stats, and a described contact form.
- Every page gains a skip link and a `<main>` landmark.
- No inline `style` attributes remain.

### Added — local photography

- 16 royalty-free Unsplash photographs vendored into `site/assets/img/` at three widths each, with
  `site/assets/img/ATTRIBUTIONS.md` recording photographer and source per image. No Unsplash+
  (premium) images are used.

### Fixed

- **The live site was serving broken images.** Of the eight hotlinked Unsplash URLs, four already
  returned 404. The site now makes no remote requests at all.
- A ghost button rendered near-black on the dark hero photograph, making its label invisible. Dark
  grounds now invert the button pair.

### Removed

- `clean.html`, and its nav entry. Every page is the accessible page now, so the special case had no
  meaning left.
- `site/assets/bread.svg`, unused after the rebuild.

## 2026-07-24

### Added (local runner)

- `package.json` + `scripts/run-locally.mjs`: a no-cost local equivalent of the `accessibility`
  job. Serves `site/` on `127.0.0.1` instead of a real Pages deploy, then runs the actual
  axe-scan-action and axe-report-action code (git devDependencies, pinned to the same tags the
  workflow uses) as plain Node scripts via `INPUT_*` env vars — same code path as CI, no GitHub
  Actions runtime. `npm install && npm run demo:local`.

### Removed

- The `custom-rules` job (EDAC custom ruleset scan via the private `accessibility-checker-rules`
  and `axe-html-report-action` repos). It was a curiosity experiment to see if a custom ruleset
  was feasible in this pipeline — confirmed it was, but the site's actual scan pipeline goes back
  to vanilla standard axe-core only, via the `accessibility` job. The `index.html` "Custom rule
  triggers" section (justified text, tiny text, underlined non-link text) is left in place but is
  now inert — nothing in this workflow checks it anymore.

### Added

- Shared site chrome (`site/assets/style.css`): nav bar, hero section, a menu/feature grid on
  `index.html`, and a footer with a working newsletter signup form across all three pages — so
  the site looks like a real product page instead of bare unstyled markup. All new chrome is
  itself intentionally clean; every pre-existing intentional violation is untouched.

### Changed

- Bumped `axe-report-action` to v0.0.3 and set `show-personas: true` on the report step — the
  job summary now includes a "Personas: who these findings affect" section, mapping each
  violated rule to the real GOV.UK / GDS accessibility personas it affects (Ashleigh, Claudia,
  Christopher, Pawel, Ron, Saleem, Simone), not just a disability category. This replaces
  `scripts/persona-report.mjs`, a repo-local script added and then removed the same day: persona
  mapping belongs in the report action itself so every site using it gets it, not duplicated
  per demo repo.

### Fixed

- Two contrast bugs introduced by the new footer chrome, both caught by a real axe-core scan
  after building it (not assumed): footer meta text and footer links were only checked against
  the light page background, not the footer's own dark background, and measured 2.42:1 and
  2.24:1 respectively — both now correctly use light-on-dark colors verified at 12:1 and 9.7:1.
- Missing `<main>` landmark on `index.html`/`about.html` after adding a `<nav>` — was tripping
  axe's `landmark-one-main` and `region` rules as new, unintended violations; wrapped existing
  content in `<main>` to fix (`clean.html` already had one).

## 2026-07-11 (later)

### Changed

- Workflow: axe-scan-action bumped to v0.0.3 (opt-in custom rulesets via configure-file + rules filter).

## 2026-07-11

### Added

- MIT `LICENSE`.

### Changed

- Workflow: axe-scan-action and axe-report-action bumped to v0.0.2 (JSON `urls` input, non-2xx responses fail the scan by default).

## 2026-07-10

Initial version: static demo site with intentional accessibility issues (plus a clean control page), deployed to GitHub Pages and scanned by axe-scan-action / axe-report-action on every deploy.
