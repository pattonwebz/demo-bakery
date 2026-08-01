# Image attributions

All photography is from [Unsplash](https://unsplash.com) under the
[Unsplash License](https://unsplash.com/license): free to use commercially, no permission or
attribution required. Attribution is recorded here anyway as good practice.

No Unsplash+ (premium) images are used — every file below is from the free tier.

All images are vendored locally. The site makes **no remote image requests**, which keeps it
scannable in CI and safe to demo on an unreliable conference network.

## Files

Images in use are emitted at up to three widths: `-2000`, `-1200` and `-800`. Widths that no page
references have been pruned, so not every subject has all three. A few subjects
(`chocolate-cake`, `croissants-sheet`, `pastry-case`) are kept at `-800` only as a small library for
future pages.

| Asset | Photographer | Source |
| --- | --- | --- |
| `bread-baskets` | Herry Sutanto | https://unsplash.com/photos/assorted-bread-in-wicker-baskets-SU4fLpg2zgw |
| `coffee-pastries` | Nathan Dumlao | https://unsplash.com/photos/coffee-surrounded-by-four-baked-breads-z3em1GBRhvY |
| `croissants-sheet` | arh Lee | https://unsplash.com/photos/freshly-baked-croissants-on-a-baking-sheet-P3uyZxdjhX8 |
| `croissants-tray` | With Mahdy | https://unsplash.com/photos/croissants-on-a-baking-sheet-lined-up-in-a-row-ePh7mI8y_bA |
| `display-case` | Sitraka | https://unsplash.com/photos/a-bakery-filled-with-lots-of-different-types-of-pastries-gKWvWZVRwZQ |
| `dough-hands` | Skyler Ewing | https://unsplash.com/photos/a-person-kneading-a-ball-of-dough-on-top-of-a-table-2uiZDQYTHBM |
| `hero-flour` | Tetiana Padurets | https://unsplash.com/photos/a-loaf-of-bread-being-sprinkled-with-flour-I5G_suhoqBQ |
| `kneading` | Victor Rodríguez Iglesias | https://unsplash.com/photos/a-person-kneading-dough-on-top-of-a-counter-zTG8dSz10tQ |
| `pastry-case` | Patrick Langwallner | https://unsplash.com/photos/a-display-case-filled-with-lots-of-pastries-eWy6Yvcsppc |
| `rolls-rack` | Rexi Pratama | https://unsplash.com/photos/a-bunch-of-cinnamon-rolls-sitting-on-a-cooling-rack-qm7hrKF6lq0 |
| `sourdough-loaf` | Monika Grabkowska | https://unsplash.com/photos/baked-bread-in-closeup-photography-0Oh1bChh2ao |

### Sourced before the Unsplash search API was used

These were already referenced by the site as hotlinks and have been vendored. Photographer names
were not captured at download time; all are free-tier Unsplash photos identified by photo ID.

| Asset | Unsplash photo ID |
| --- | --- |
| `bakery-counter` | `photo-1517433670267-08bbd4be890f` |
| `cafe-interior` | `photo-1555396273-367ea4eb4db5` |
| `chocolate-cake` | `photo-1578985545062-69928b1d9587` |
| `cinnamon-rolls` | `photo-1509365465985-25d11c17e812` |
| `rustic-loaves` | `photo-1509440159596-0249088772ff` |

## Note on the old hotlinks

Before this rebuild the site hotlinked eight Unsplash URLs. **Four of them already returned 404** —
the live site was serving broken images. That is exactly why everything is vendored now.
