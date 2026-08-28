# Visual thesis: the release inspection bench

Installer Release Doctor uses **neo-brutalist utility**: a dense, physical inspection bench rather than a polished SaaS dashboard. Hard black rules, offset shadows, stamped labels, and a graph-paper field make release checks feel concrete. The system fits a CLI that judges artifacts before a registry does.

## Palette

- `--paper: #f3f0e6` — warm stock, used as the page background.
- `--ink: #101010` — primary type, rules, and shadows.
- `--panel: #fffdf5` — raised work surfaces.
- `--acid: #d7ff3f` — the single action and pass-state highlight; black text is 17:1.
- `--cobalt: #2447ff` — links and active inspection marks; white text is 7.1:1.
- `--amber: #ffb000` — warnings paired with labels and symbols.
- `--red: #d9342b` — failures paired with labels and symbols.
- `--muted: #57554f` — supporting text on paper, 6.4:1.
- `--terminal: #171915` — terminal surface with `#f4f2e8` text.

The palette is deliberately single-mode. Paper, ink, safety yellow-green, and inspection blue resemble a marked-up shipping bench. The page always paints its background.

## Type

- Display: `Arial Black`, `Arial Narrow Bold`, sans-serif. Compressed uppercase labels feel like shipping stamps and require no font download.
- Body: `ui-monospace`, `SFMono-Regular`, `Cascadia Code`, `Roboto Mono`, monospace. It keeps commands, paths, and prose in the same technical world.
- Scale: 14 / 16 / 20 / 28 / 48–72 px. Body is never below 16 px. Tables use tabular figures.

## Spacing and shape

- Eight-pixel base rhythm: 8, 16, 24, 32, 48, 64, 96.
- Borders are 2–3 px solid ink. Major panels use a 7 px hard offset shadow.
- Corners stay nearly square (0–3 px). Pills are reserved for status stamps.
- Landing sections alternate full-width ruled bands and open paper. Cards appear only for independent channel results.
- At 390 px, the hero stacks: copy, action, facts, then the inspection art. Wide result tables become labelled result rows.

## Interaction grammar

- Primary actions are acid blocks that depress into their hard shadow.
- Links are underlined; hover thickens the underline.
- Focus uses a 3 px cobalt outline plus a 3 px paper gap.
- The demo terminal types one new diagnostic line after activation, then stops. Results enter as a single vertical inspection sweep.
- Route changes focus the page heading and announce it.

## Motion policy

Motion explains inspection progress only. Panels move 8 px into place over 180 ms; the scan bar crosses once over 700 ms. No animation loops. With `prefers-reduced-motion: reduce`, transforms and type-on delays are removed and final results appear immediately.

## Original asset plan and provenance

- Hero illustration: generated for this product with `/opt/fleet/lib/gen-image.sh` using the factory `factory-image` deployment, then converted to WebP. Prompt: “Neo-brutalist editorial illustration for a CLI release checker landing page. A top-down inspection bench where one archive crate moves through a rigid black mechanical scanner and splits into Linux package, Windows installer, macOS package, signature seal, SBOM sheet, and provenance tag. Warm paper background, black ink outlines, acid chartreuse, electric cobalt, safety amber, vermilion. Screen-print texture, halftone shadows, hard geometry, slightly imperfect registration. Wide landscape composition, dense on the right with quiet negative space on the left. No words, no letters, no logos, no gradients, no glossy 3D, no people, no watermark.” The first output introduced platform marks, so it was not shipped. Edit prompt: “Change only the three recognizable operating-system logos on the blue, yellow, and red packages. Replace each logo with a distinct abstract geometric package symbol made from squares, bars, and circles. Preserve the entire composition, machine, colors, screen-print texture, framing, lighting, and every other object exactly. No words, no letters, no logos, no trademarks, no watermark.”
- Wordmark and channel symbols are hand-made SVG/CSS from basic geometric forms. They are original to this repository and MIT-licensed with the product.
- Open Graph artwork is composed from the same hero image and product typography so social previews match the site.

## Why this is distinct

The visual metaphor is not a generic terminal window. It is an artifact inspection line: packages are physical objects, policy failures are stamped marks, and channel readiness becomes a row of checked shipping bays. The design makes the product’s job visible before any copy is read.
