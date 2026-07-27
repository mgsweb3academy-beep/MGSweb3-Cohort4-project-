# Corridor — Product & Design Direction

**Status:** direction only. No features are being built yet. This document exists so the landing page, the eventual product UI, and the copy all come from one decision set.

**Artifact this describes:** `corridor-lms-landing.html` — a single self-contained file, no build step. Open it in a browser to see everything below in motion.

**Name:** *Corridor* is a placeholder. Nothing in the design depends on it. Swap it in the nav, the `<title>`, and the footer.

---

## 1. The product

A learning management system for **cohort-based technical programs** — fixed start, fixed end, everyone moving through the same schedule together.

Four things define it. Everything else is table stakes.

| | |
|---|---|
| **Collaboration** | Learners work in teams on shared tasks, not alone on private exercises. |
| **Submission** | Turning work in *is* pushing to a branch. There is no upload box. |
| **Git contribution tracking** | Every learner's actual share of the work is counted and visible. |
| **AI task manager** | An agent owns the lifecycle of every task on the platform — assigning, advancing, flagging, escalating. |

### What this is not

Not a course marketplace. Not self-paced. Not a video host with quizzes attached. Those products have a different shape and a different landing page, and if the direction drifts toward them, this design stops making sense.

### Audience for the page

The person who runs a program — the instructor or program lead. Not the learner, not a procurement officer. They already run cohorts, probably on a mess of Google Classroom, a Discord, and a spreadsheet. They are not looking for a feature list; they are looking for proof that someone understands the specific job.

### The page's single job

Make a program lead believe that the work happening in their repos can become the record of the course, and that an agent will keep the boring half of that moving. Then get them to start a cohort.

---

## 2. The thesis

> **Turning it in is a push.**

This is the h1 and it is the whole product. It is the claim no general-purpose LMS can make. Every other piece of the page is evidence for it.

Supporting lede (verbatim):

> Corridor runs cohort programs where the work lives in git. Learners team up on tasks, push to a branch, and review each other. A manager watches every task and tells you who is stuck before they say so.

---

## 3. Visual system

### 3.1 Color

Eight tokens. No others. Defined as CSS custom properties on `:root`.

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#10141C` | Page ground. Deep slate-blue, not black. |
| `--ink-2` | `#161C27` | Raised surfaces: cards, panel, nav when condensed. |
| `--ink-3` | `#1E2635` | Recessed fills: empty matrix cells, button hover, progress rails. |
| `--line` | `#2A3346` | Every border and divider. One line colour throughout. |
| `--chalk` | `#ECE9E2` | Primary text. Warm off-white — paper against slate, not pure white. |
| `--dim` | `#8B93A3` | Secondary text, labels, descriptions. |
| `--signal` | `#7FD1C1` | Muted teal. **Progress and system state.** |
| `--mark` | `#E8A54B` | Amber. **The now-moment and the thing needing attention.** |

**The accent rule — enforce this.** The two accents are not interchangeable and are not decoration. Teal means *this is progressing normally*. Amber means *this is where you are, or this is what needs you*. If amber ever appears on something that is fine, the system is broken. Currently amber appears in exactly four places: the highlight swipe under "a push", the current-week column ring, the "Week 5 of 8" status, and the Team 4 lopsided-split bar.

**Ambient light.** One fixed background layer, two radial washes, `pointer-events: none`. Teal at 15%/-10% at 10% opacity; amber at 85%/0% at 6%. This is the only gradient on the page. Do not add more.

### 3.2 Type

Three faces, three jobs. Loaded from Google Fonts.

| Role | Face | Weights | Used for |
|---|---|---|---|
| Display | **Bricolage Grotesque** | 400 / 600 / 800 | All headings, the brand mark, card and step titles. |
| Body | **IBM Plex Sans** | 400 / 500 | Paragraphs, buttons, nav links, UI fragment labels. |
| Utility | **IBM Plex Mono** | 400 / 500 | Every structural label, count, timestamp, week marker, eyebrow. |

The mono is doing real work, not styling. It carries the *schedule and data vocabulary* — weeks, counts, cadence, times, commit shares. When something is a measurement, it is mono. When something is a sentence, it is Plex Sans. Keep that split clean and the interface reads as instrumentation rather than marketing.

**Scale**

| Element | Size | Weight | Tracking | Leading |
|---|---|---|---|---|
| h1 | `clamp(2.5rem, 7vw, 4.6rem)` | 800 | `-0.035em` | `0.98` |
| Section h2 | `clamp(1.8rem, 4vw, 2.6rem)` | 800 | `-0.03em` | `1.05` |
| Closing h2 | `clamp(2rem, 5vw, 3.2rem)` | 800 | `-0.03em` | `1.02` |
| Card h3 | `1.1rem` | 600 | `-0.01em` | — |
| Step h3 | `0.98rem` | 600 | `-0.01em` | — |
| Lede | `clamp(1rem, 2vw, 1.12rem)` | 400 | — | `1.6` |
| Body | `1rem` | 400 | — | `1.6` |
| Card body | `0.9rem` | 400 | — | — |
| Mono label | `0.72rem` | 400 | `0.12em`, uppercase | — |
| Mono micro | `0.58–0.68rem` | 400 | `0.06–0.12em` | — |

Headings are set tight and negative-tracked. `text-wrap: balance` on h1, lede, and closing h2. h1 capped at `16ch` so it always breaks into two or three lines.

### 3.3 Space, shape, depth

- Container: `1120px` max, inline padding `clamp(1.25rem, 4vw, 3rem)`.
- Section rhythm: `5.5rem` top on content sections, `6rem` on the closing block, hero top `clamp(7rem, 16vh, 11rem)`.
- Radii: pills `999px` · buttons `10px` · nav bar and cards `14px` · hero panel `18px` · matrix cells and mini bars `3px` · ticks `4px`.
- One shadow on the whole page: `0 40px 80px -40px rgba(0,0,0,.8)` on the hero panel. Nothing else lifts.
- Borders do the separating, not shadows. `1px solid var(--line)` everywhere.

---

## 4. Motion

Restrained and orchestrated. One page-load sequence, one hover class, no scroll-triggered reveals below the fold.

**Entrance (`.rise`)** — the thing carried over from the reference the direction started from.

```
opacity 0 → 1
filter blur(10px) → blur(0)
transform translateY(14px) → 0
0.9s cubic-bezier(.16, 1, .3, 1)
```

Stagger via a `--d` custom property per element: eyebrow `0.05s` · h1 `0.15s` · lede `0.28s` · CTAs `0.4s` · panel `0.55s`.

**Highlight swipe** — the amber bar under "a push" wipes in with `scaleX(0 → 1)`, origin left, `0.7s`, delay `1.2s`. It lands *after* the panel has settled, so it reads as the last beat of the sequence.

**Matrix fill** — each cell fades in at `0.9s + (row × 0.05s) + (column × 0.03s)`. The diagonal sweep reads as the cohort's history filling in left to right.

**Pulse** — 6px teal dot, expanding shadow ring, `2.6s` infinite. Used in exactly two places: the hero eyebrow and the manager line. It means *live*.

**Nav condense** — at `scrollY > 40`, the bar transitions `max-width` `1120px → 860px`, gains `rgba(22,28,39,.72)` fill, a border, and `backdrop-filter: blur(14px)`, over `0.35s`.

**Reduced motion** — `@media (prefers-reduced-motion: reduce)` kills all animation and transition, forces `.rise` to its end state, and disables smooth scroll. Verify this before shipping; it is the one thing that silently breaks.

---

## 5. Page structure

### 5.1 Nav (fixed)

Brand mark (custom SVG: four bars, third one tall and amber — it is the current week) + wordmark. Links: How a task moves · The screens · Pricing · Docs. Right: `Sign in` (ghost) and `Start a cohort` (solid).

`Start a cohort` is the one primary action on the page and it appears three times with identical wording. Do not vary it.

### 5.2 Hero

Eyebrow pill (live pulse + `312 pushes across 41 learners this week`) → h1 → lede → two CTAs → the signature panel.

The eyebrow leads with a push count, not a customer count. It says what the platform measures on its very first line.

### 5.3 The signature — cohort panel

The most important component on the page. It replaces the fake app screenshot that a page like this would normally carry.

**Header row:** `Backend Engineering — Cohort 07` (display 600) · `41 learners · 9 teams` (mono) · `Week 5 of 8` (mono, amber, right-aligned).

**The contribution matrix.** Rows are learners, columns are the eight weeks of the cohort, cell density is commit volume.

- Grid: `68px | repeat(8, 1fr) | 42px` at mobile; `108px | repeat(8, 1fr) | 54px` from `700px`.
- Header row of mono week markers; the current week reads `now` in amber instead of `w5`.
- Cell heights `17px`, radius `3px`. Four states:
  - `0 commits` → `--ink-3` flat fill
  - `1–2` → teal at 22%
  - `3–5` → teal at 45%
  - `6+` → teal at 78%
  - future weeks → transparent with a `--line` inset ring
- Every cell in the current-week column carries an amber inset ring.
- Right column: total commits per learner, mono.
- Seven learners shown, then `+ 34 more learners`. Showing seven is deliberate — enough rows for a pattern to be visible, few enough to read at a glance.

**Why this is the signature.** It is the schedule and the gradebook in one object. A program lead reading it for three seconds learns the cohort is in week five, that Tobi is carrying a lot, and that Ini has two near-empty rows. No screenshot can do that.

**The manager line.** Below the matrix, above nothing: live pulse, `MANAGER` in teal mono, then a sentence of things the agent *already did*, then a timestamp.

> Reopened **3 tasks** that were merged without a review. Moved **Auth service** into review. Flagged **Team 4** — one member wrote 82% of the commits.

**Deliberately not a chat bubble.** Every AI product page in existence shows a chat input and it communicates nothing. Past-tense, specific, verifiable actions make an agent feel real. Keep this rule for the product UI too: the manager reports what it did, it does not ask what you want.

### 5.4 How a task moves

Five steps in a single bordered strip, hairline-divided. `01` through `05`: **Assigned · Branched · Pushed · Reviewed · Closed**.

The numbering is legitimate here because a task genuinely moves in that order and the order carries information. Do not add numbering anywhere it does not.

Steps 01, 03, and 05 carry a small teal `· MANAGED` marker after the title. This is where the AI claim gets its proof: the reader sees exactly which three steps the agent owns and which two stay human. Vague "AI-powered" claims are worth nothing next to a diagram that shows the division of labour.

Copy, verbatim:

1. **Assigned** — The manager splits the brief into tasks and hands each one to a team.
2. **Branched** — A branch opens with the task. Everything after this happens in the repo.
3. **Pushed** — Commits land against the task. Every learner's share is counted as it goes.
4. **Reviewed** — Two teammates read it first. You only see what survives that.
5. **Closed** — Merged, marked, and written back to the learner's record.

### 5.5 The three screens

Eyebrow: `WHAT YOU OPEN ON MONDAY`. Heading: *Three screens. The manager keeps them current.*

Each card is `mono eyebrow → h3 → one line of description → a real UI fragment`. The fragments are the point. No icons, no lorem.

| Card | Eyebrow | Title | Fragment |
|---|---|---|---|
| 1 | The board | Every task, and who has it | Four task rows with state ticks, team, and status. One amber `in review · 3d`. |
| 2 | The split | Who actually wrote it | Two teams' commit shares as stacked bars. Team 4 is `82 / 11 / 5 / 2` in amber; Team 2 is `31 / 27 / 24 / 18` in teal. |
| 3 | The queue | Work waiting on you | Counts: escalated by manager, peer review stalled, resits, oldest in queue. |

Card 2 is the emotional centre of the page. Every program lead has had the team where one person did everything and found out too late.

### 5.6 Close

*Bring your next intake in.* — "Set the start date, connect the org on GitHub, invite the roster. A cohort takes about an afternoon to stand up." Then the same two CTAs. Minimal footer above a `--line` rule.

---

## 6. Copy rules

- **Sentence case everywhere.** No Title Case headings, no ALL CAPS except mono labels.
- **Name things by what the user controls**, never by how the system is built. "Every task, and who has it", not "Task orchestration engine".
- **Active voice, and the action keeps its name.** The button says `Start a cohort`, so the flow it opens is called starting a cohort, and the confirmation says *Cohort started.*
- **Specific beats clever.** `82 / 11 / 5 / 2` does more work than "surface hidden contribution imbalances".
- **Numbers must be plausible, not impressive.** 41 learners and 312 pushes is a real cohort. Ten thousand anything is not, and a program lead will notice.
- **No adjective stacking.** Nothing on this page is "powerful", "seamless", "intelligent", or "next-generation". If a sentence still works with the adjective removed, remove it.

---

## 7. Quality floor

- Responsive from `320px` up. Matrix, flow strip, and cards all collapse to single column; the matrix keeps all eight columns and shrinks the name column instead of scrolling.
- `:focus-visible` outline: `2px solid var(--signal)`, `3px` offset, on every interactive element.
- The matrix carries a descriptive `role="img"` + `aria-label` since the visual encoding is not available to a screen reader. Any future data visual needs the same.
- Decorative pulses and the SVG mark are `aria-hidden`.
- Reduced motion fully respected.
- Contrast: `--dim` on `--ink` clears 4.5:1 for body text. Mono micro labels at `#5C6577` are decorative-adjacent — do not put anything load-bearing in that colour.

---

## 8. Porting to the codebase

Target stack is Next.js + TypeScript + Tailwind + shadcn/ui, components at `@/components/ui`.

- **Drop `framer-motion` and `AnimatedGroup`.** The entrance is pure CSS with a `--d` stagger property. It is fewer bytes, needs no client boundary, and the hero can stay a server component. Reintroduce a motion library only if a genuine spring interaction shows up.
- Keep shadcn's `Button` with `asChild`; map `.btn` / `.btn-solid` / `.btn-lg` onto `variant` and `size`. The rest is Tailwind arbitrary values, one to one.
- Put the eight color tokens in `globals.css` under `@theme` (Tailwind v4) or `:root` + `theme.extend.colors` (v3), so they are `bg-ink-2` and `text-signal` rather than hex literals in class names.
- Fonts via `next/font/google` for Bricolage Grotesque, IBM Plex Sans, and IBM Plex Mono. Do not ship the `<link>` tag.
- The matrix should be a real component taking `{ learners, weeks, currentWeek }`. On the marketing page it renders seed data; in the product it renders live data. Same component, and that is the point — the landing page should not be able to lie about what the product looks like.
- Everything currently generated in the inline `<script>` (matrix cells, week headers) becomes JSX. The only JS that needs to stay client-side is the nav scroll listener.

---

## 9. Open decisions

These need answers before the product UI is built. They affect schema, not styling.

1. **Commit count is the wrong metric and the page currently leans on it.** Raw commits reward whoever pushes most often, not whoever thought hardest. A learner who works out how the split card is calculated will start splitting one change into nine pushes within a week. Contribution probably needs to be a composite — distinct files touched, lines surviving review, review comments given — with the raw count kept only as a display detail. Decide this early; the matrix and the split card are both built on it.
2. **Scope of the manager's authority.** The flow strip claims it assigns, counts, and closes. Closing a task means marking work, which means the agent is grading. Is that the intent, or does it stage a decision the instructor confirms? The page should not promise more autonomy than the product will ship with.
3. **Git host.** The copy says "connect the org on GitHub". If GitLab or self-hosted matters for the programs this will run, that sentence and the whole submission model need rethinking now, not later.
4. **Team formation.** Teams are shown as a given (`9 teams`). Who forms them — the instructor, the learners, or the manager? If the manager does, that is a strong differentiator worth putting on the page.
5. **What happens when a learner has no commits.** Ini E.'s two empty rows are the most interesting thing in the matrix. The product needs an answer for that row, and if the answer is good it belongs on the landing page.
6. **Private repos and access.** Reading commit data across learner repos is a real permissions and privacy question. Learners should know what is counted and who can see it. Worth a line on the page eventually — it builds trust rather than costing it.
