# Branding & Design System

The full design language for Citrus. Tokens live in `app/globals.css` as CSS
custom properties; Tailwind utilities are wired to them. Edit tokens, not
components.

## Brand

**Citrus** — Creative Operations. A studio-running OS.

The brand pass is **Soft Violet**: lavender-tinted off-white neutrals with a
single violet accent. Calm, premium, refined. The accent does the brand work —
brand mark, active state, primary call-to-action — and everywhere else stays
quiet and neutral (monochrome accent; no second pop colour).

The violet is `#6d5ef0` (hover `#5b4ce0`). Text on the accent is **white**
(`--accent-fg: #fff`) — violet buttons get white text, not dark. The neutral
ramp itself carries a faint lavender undertone (blue > red > green) so surfaces
read as soft violet off-whites rather than dead grey.

## Where it lives

Everything is in `app/globals.css`:

- **Foundation tokens** in `:root` at the top — type, weights, line-heights,
  spacing, radii, shadows, layout dims, neutral ramp, semantic aliases
- **Brand pass** in `:root` at the bottom — the `COLOR TOKENS — Soft Violet`
  block overrides `--accent`, `--accent-hover`, `--accent-fg` only

Comment out the brand pass block to revert to grayscale instantly. Swap the
hex values in that block to repaint the brand without touching anything else.

## Type

| Token         | Size      | Use                          |
|---------------|-----------|------------------------------|
| `--text-3xl`  | 40 px     | hero metric numbers          |
| `--text-2xl`  | 28 px     | page title                   |
| `--text-xl`   | 22 px     | section header               |
| `--text-lg`   | 18 px     | card title                   |
| `--text-base` | 15 px     | body default                 |
| `--text-sm`   | 13 px     | secondary text, table cells  |
| `--text-xs`   | 12 px     | captions, eyebrows, labels   |

Weights: 400 / 500 / 600 / 700 (`--fw-regular` → `--fw-bold`).
Line heights: 1.15 tight · 1.35 snug · 1.55 normal.

Fonts:
- **Hanken Grotesk** — body
- **JetBrains Mono** — numbers, labels, codes

Both are loaded from Google Fonts in `app/layout.tsx`. They live behind
`--font-sans` and `--font-mono` so swapping the family is one token.

Metric values use the `.metric-value` class — 40 px, bold, tabular-nums, mono.
Eyebrows / labels use the `.eyebrow` class — 12 px, semibold, uppercase,
tracked.

## Color

### Neutral ramp

`--n-0` (off-white) through `--n-950` (near-black). Lavender-tinted neutrals
(faint purple undertone), used for every surface, border, and text color.

### Semantic aliases

| Alias              | Points at      | Use                       |
|--------------------|----------------|---------------------------|
| `--bg-app`         | `--n-50`       | page background           |
| `--bg-surface`     | `--n-0`        | card / panel              |
| `--bg-sunken`      | `--n-100`      | hover, inset wells        |
| `--border`         | `--n-200`      | default borders, dividers |
| `--border-strong`  | `--n-300`      | inputs, stronger borders  |
| `--text-primary`   | `--n-900`      | body / titles             |
| `--text-secondary` | `--n-600`      | secondary text            |
| `--text-muted`     | `--n-400`      | meta, captions, labels    |
| `--accent`         | brand pass     | the violet                |
| `--accent-hover`   | brand pass     | hover for accent surfaces |
| `--accent-fg`      | brand pass     | text on accent (ink)      |

Tailwind exposes these as `bg-app`, `bg-surface`, `bg-sunken`, `border-line`,
`border-line-strong`, `text-primary`, `text-secondary`, `text-muted`,
`bg-accent`, `bg-accent-hover`, `text-accent-fg`.

### Accent restraint

`--accent` is reserved for:

- Brand mark (the C square in the sidebar)
- Active nav item
- Primary buttons
- Focus rings (`focus:ring-accent/20`)

**Status badges do not use accent.** They use the semantic palette below.
Spreading accent elsewhere — random panel borders, hover backgrounds, info
chips — dilutes the brand. Default to neutrals.

### Semantic state colors

For status pills and chart/bar fills. Each semantic color comes as a **four-
tier set** so you can pick the right weight for the surface:

| Tier      | Use                                          |
|-----------|----------------------------------------------|
| `--*`     | dark — text on a tinted bg (badges)          |
| `--*-mid` | medium — solid fills (bars, dots, charts)    |
| `--*-bg`  | very light — badge backgrounds               |
| `--*-border` | light — badge borders                     |

| Token              | Hex       | Use                                |
|--------------------|-----------|------------------------------------|
| `--success`        | `#15803d` | success text                       |
| `--success-mid`    | `#34d399` | success fill (chart segment, dot)  |
| `--success-bg`     | `#dcfce7` | success badge bg                   |
| `--success-border` | `#86efac` | success badge border               |
| `--warning`        | `#b45309` | warning text                       |
| `--warning-mid`    | `#fbbf24` | warning fill                       |
| `--warning-bg`     | `#fef3c7` | warning badge bg                   |
| `--warning-border` | `#fcd34d` | warning badge border               |
| `--danger`         | `#b91c1c` | danger text                        |
| `--danger-mid`     | `#f87171` | danger fill                        |
| `--danger-bg`      | `#fee2e2` | danger badge bg                    |
| `--danger-border`  | `#fca5a5` | danger badge border                |
| `--info`           | `#1d4ed8` | info text (in-progress badge)      |
| `--info-mid`       | `#60a5fa` | info fill (in-progress chart seg)  |
| `--info-bg`        | `#dbeafe` | info badge bg                      |
| `--info-border`    | `#93c5fd` | info badge border                  |

Tailwind exposes all of these as utilities — `text-success`, `bg-success-mid`,
`bg-success-bg`, `border-success-border` (and `warning` / `danger` variants).

**Picking the right tier:** if you're filling more than a few pixels of area
solid, use `--*-mid`. The dark `--*` tier is for *text only* — used as a fill
it reads muddy and competes with neutrals.

If you need a new semantic color (e.g. `--info`), add the full four-token set
to the same block in `globals.css` and wire matching Tailwind utilities.

## Spacing & radii

Spacing is a 4 px scale: `--space-1` (4) through `--space-16` (64). Skip
values are intentional (no `--space-7`, `--space-9`, `--space-11`) to keep
rhythm tight.

Radii: `--radius-sm` (6) for buttons / inputs / pills · `--radius-md` (10)
for cards / panels / dialogs · `--radius-lg` (14) reserved for larger
surfaces.

## Layout

- Sidebar: fixed 248 px (`--sidebar-w`)
- Top bar: sticky 60 px (`--topbar-h`)
- Content max-width: 1200 px
- Breakpoint: sidebar collapses + grids reflow at 880 px

## Status badge weights

`<StatusBadge status={...} kind={...} />` picks visual weight per status to
read across a table at a glance:

Color convention follows productivity-tool norms: **green = done**,
**blue = in motion**, **amber = needs attention**, **red = urgent**.

| Tone          | Treatment                            | Used for                                          |
|---------------|--------------------------------------|---------------------------------------------------|
| `success`     | green tint, no outline               | project / task `completed`                        |
| `info`        | blue tint, no outline                | project `active`, task `in_progress`              |
| `warning`     | amber tint, no outline               | project / task `review`, priority `high`          |
| `danger`      | red tint, no outline                 | priority `urgent`                                 |
| `ghost`       | dashed outline, transparent fill     | project `planning`, task `todo`                   |
| `neutral`     | sunken bg, no outline                | `medium` priority, client / team `active`         |
| `muted`       | sunken bg, quiet text, no outline    | `low`, `archived`, `inactive`                     |
| `strike`      | sunken bg, line-through              | project `cancelled`                               |
| `outline`     | strong-bordered, surface fill        | (available, not currently mapped)                 |
| `accent`      | filled violet                        | (available, **not used on status** — see above)   |

All pills also carry a subtle top-to-bottom white sheen (`.badge-gradient`) —
a low-opacity highlight overlaid on the base color. Adds a hint of depth
without the heaviness of an outline.

## Doing a future brand pass

1. Pick new `--accent` + `--accent-hover` + `--accent-fg`
2. Edit only the `COLOR TOKENS` block in `app/globals.css`
3. (Optional) warm or cool the neutral ramp by shifting each `--n-*` value
4. Don't touch component files

If you want semantic colors beyond accent (success / warning / danger), add
them as new aliases in the same block (`--success`, `--warning`, `--danger`)
and wire matching Tailwind utility names. Don't reach for `green-500` /
`red-500` directly.
