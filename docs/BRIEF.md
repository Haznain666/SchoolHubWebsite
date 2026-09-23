# School Hub — marketing website build brief

This is the single source of truth for the build. It was assembled by reading
`STATE.md`, driving the live product at `schoolhub.codexmill.com` (Super Admin →
Features, and the Askari School System tenant), and dissecting the inspiration
site `https://scfo.de/#start` (its shipped HTML and CSS were downloaded and
read, so the mechanics below are not guesses).

**Project root:** `D:\School-Management-Website\School-Management-Website\schoolhub-website`

---

## 1. What we are building

A single-page marketing website for **School Hub**, a multi-tenant SaaS school
management system for Pakistani schools. It is a *marketing* site — no login, no
data, no backend. CTAs link out.

It must feel like `scfo.de`: one full-viewport "scene" per section, a fixed
subject that moves and animates behind the copy, a left "On this page" rail, a
minimalist top nav, keyboard navigation, and four vertical hairlines running down
the screen. The difference is the palette: **white and steel**, not black.

---

## 2. Stack (decided — do not substitute)

| Concern | Choice |
| --- | --- |
| Build | **Vite 5** |
| Framework | **React 18 + TypeScript** |
| Styling | **Tailwind CSS v3** (plus a small `index.css` for the custom classes below) |
| Animation | **Framer Motion** (`motion`) for entrance/exit; plain `requestAnimationFrame` for the video scrub and parallax |
| Smooth scroll | **Lenis** (`@studio-freight/lenis` or `lenis`) — optional but recommended; must degrade gracefully |
| Fonts | **self-hosted** via `@fontsource/libre-baskerville` (400, 700) and `@fontsource/poppins` (300, 400, 500) — do **not** hotlink Google Fonts |
| Icons | inline SVG only. No icon library. |

Scripts required in `package.json`: `dev`, `build`, `preview`, `typecheck`
(`tsc --noEmit`), `lint`.

No backend, no database, no analytics, no cookie banner.

---

## 3. Brand

### Colours — sampled from the real logo files

| Token | Value | Use |
| --- | --- | --- |
| `--ink` / `accent` | `#01112E` | **The accent.** The dark navy of the "Scho…l" wordmark. Headings, primary buttons, active rail dash, eyebrow accents, the typed hero word. |
| `--ink-soft` | `#0B1E3D` | secondary dark text |
| `--brand-blue` | `#0040F8` | the bright blue in the logo mark |
| `--brand-blue-mid` | `#0080F8` | mid of the mark's gradient |
| `--brand-cyan` | `#00E0F8` | top of the mark's gradient |
| `--paper` | `#F7F8FA` | page background (shade of white) |
| `--paper-2` | `#FFFFFF` | raised surfaces |
| `--steel-100` | `#E7EAEF` | hairlines, panel borders |
| `--steel-300` | `#C3CAD4` | dividers |
| `--steel-500` | `#8A94A3` | muted body text |
| `--steel-700` | `#4A5463` | body text |

Body text sits at `--steel-700`, muted/secondary at `--steel-500`, headings at
`--ink`. Background is `--paper` with a very soft steel gradient — never pure
flat white, never black.

`--brand-blue → --brand-cyan` is the gradient used for the logo mark, the AI
sparkle, chart fills and the "glow" behind the bot.

### Typography — identical to the inspiration

```css
.display {                      /* every heading and sub-heading */
  font-family: 'Libre Baskerville', Baskerville, 'Times New Roman', serif;
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.015em;
}
.eyebrow {                      /* section labels, nav items, kbd legend */
  font-family: 'Poppins', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  font-weight: 500;
  font-size: 0.68rem;
}
.body-copy {
  font-family: 'Poppins', sans-serif;
  font-weight: 300;
  line-height: 1.65;
}
```

Because the background is light, **replace the inspiration's dark text-shadows
with light ones** — e.g. `text-shadow: 0 1px 14px rgba(255,255,255,.9), 0 0 4px rgba(247,248,250,.9)`
on the fixed chrome so it stays readable over the bot/video.

Hero display size: `clamp(2.8rem, 8.5vw, 7rem)`.

### Logo

`public/assets/logo.png` (navy + blue-cyan wordmark, transparent) — use this on
the light background. `logo-white.png` is the white version; keep it for any
dark panel. Render the header logo at ~26–30px height, `image-rendering:auto`,
with a very soft drop shadow: `filter: drop-shadow(0 1px 2px rgba(1,17,46,.18))`.
Do not re-type "SCHOOL HUB" as text in the header — use the logo image, with the
`alt` text "School Hub".

---

## 4. Assets already prepared in `public/assets/`

| File | What it is |
| --- | --- |
| `logo.png` | colour logo, transparent background |
| `logo-white.png` | white logo, transparent background |
| `schoolbot.png` | **the 3D bot, already cut out** — white background removed, cropped to 317×577, alpha-feathered. This is the hero/scene subject. |
| `schoolbot-original.png` | the untouched original, in case a different crop is wanted |
| `ai-glow.png` | **the AI sparkle from `ai.png`, already recoloured** to the logo's cyan→blue vertical gradient, 1024×1024, transparent. This replaces the inspiration site's background cloud. |
| `bot-video.mp4` | the mouse-scrub hero video (1.2 MB) |

**No image generation is required.** `schoolbot.png` and `ai-glow.png` are done.
Do **not** call Higgsfield or any other generator — the brief only permits that
"IF REQUIRED", and it is not.

---

## 5. The mechanics to reproduce, exactly

These were read out of the inspiration site's shipped markup. Reproduce the
behaviour, not the German copy.

### 5.1 Section scenes

Each section is its own full-viewport scene:

```html
<section id="students" class="relative z-10 flex min-h-[100svh] px-6 pb-16 md:px-12
         items-start pt-28 md:items-center md:pt-16 justify-end lg:pr-10">
  <div class="relative max-w-[32rem]">
    <p class="eyebrow mb-5 text-accent">
      <span class="mr-3 tabular-nums opacity-70">02</span>Students
    </p>
    <h2 class="display …">…</h2>
    <p class="body-copy mt-6 …">…</p>
    …
  </div>
</section>
```

- `min-h-[100svh]`, content constrained to `max-w-[32rem]`.
- Sections **alternate** `justify-start` / `justify-end` so the fixed subject
  always has the opposite half of the screen.
- Every section carries a **two-digit tabular number** (`00`…`12`) before its
  eyebrow label.
- Content enters with `opacity: 0; transform: translateY(42px)` and animates to
  `opacity: 1; translateY(0)` when the section becomes active, staggered ~60ms
  between children, easing `cubic-bezier(.22,1,.36,1)`, ~700ms.

### 5.2 The fixed subject — the bot

`schoolbot.png` is rendered in a **fixed, full-viewport layer at `z-0`**, behind
all content. It is the equivalent of the inspiration site's chess piece.

- Per section, it moves to a different **position, scale and rotation**. Store
  this as a per-section config array (`x%`, `y%`, `scale`, `rotate`, `blur`).
  Always land on the side opposite the copy.
- Transitions between section poses: ~1.2s, `cubic-bezier(.22,1,.36,1)`.
- **While idle on a section it must keep animating**: a slow vertical float
  (±10px, ~6s), a gentle rotate (±1.5°, ~9s), and a pulsing glow behind it.
  Use independent looping tweens so the pose transition and the idle float
  compose rather than fight.
- Behind the bot: a soft radial glow in `--brand-blue-mid` at low opacity, and a
  faint contact shadow ellipse beneath it, both animated with the float.

### 5.3 The AI sparkle — replaces the cloud

`ai-glow.png` is a second fixed layer, also `z-0`, **further back and larger**
than the bot (e.g. 40–70vw, `opacity: .10–.20`, `filter: blur(0.5px)`).

- It also repositions per section, but **more slowly and by a larger distance**
  than the bot — that difference is what reads as depth/parallax.
- It rotates very slowly and continuously (one full turn over ~80s) and breathes
  in scale (±6%, ~12s).
- It additionally responds to pointer position with a small parallax offset
  (max ~30px), lerped.
- On light backgrounds keep it subtle — it is atmosphere, not a graphic.

### 5.4 The four vertical hairlines

Four 1px full-height vertical lines, `position: fixed`, `z-index: 1`, behind
content and in front of the bot layer, at **20% / 40% / 60% / 80%** of the
viewport width. On the light theme they are steel, not white:
`background: linear-gradient(to bottom, transparent, #C3CAD4 12%, #C3CAD4 88%, transparent); opacity: .5;`
Hide below `lg`. They do not move.

### 5.5 "On this page" rail (left)

```html
<aside class="fixed left-8 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:left-12">
  <p class="eyebrow mb-6 text-steel-500/70">On this page</p>
  <ul class="space-y-4">
    <li><a class="group flex items-center text-left" href="#start">
      <span class="mr-4 h-px transition-all duration-500 w-10 bg-accent"></span>
      <span class="text-[0.8rem] font-light tracking-wide transition-colors duration-500 text-ink">Start</span>
    </a></li>
    <li><a class="group flex items-center text-left" href="#numbers">
      <span class="mr-4 h-px transition-all duration-500 w-4 bg-steel-300 group-hover:bg-steel-500"></span>
      <span class="… text-steel-500/70 group-hover:text-ink/70">In numbers</span>
    </a></li>
    …
  </ul>
</aside>
```

**The whole mechanic is that one dash.** Active item: dash `w-10` + `bg-accent`,
label at full `--ink`. Inactive: dash `w-4` + `bg-steel-300`, label muted. Both
transition over **500ms**. Active state is driven by an IntersectionObserver /
scroll-position observer over the sections. Clicking scrolls smoothly.

### 5.6 Header nav (minimalist, corresponds to the rail)

Fixed, full-width, transparent, `z-40`, `max-w-7xl`, rounded-full row,
`px-6 py-3`:

- **Left:** the logo image, linking to `#start`.
- **Centre (`lg` and up):** four `.eyebrow` links at `text-steel-500` →
  `hover:text-ink`, 300ms: **Features · Platform · Process · Contact**, each
  pointing at the matching section id. The centre nav is deliberately shorter
  than the rail — that is the inspiration's pattern.
- **Right:** two CTAs (see §6).
- Below `lg`: logo + hamburger, opening a full-screen overlay menu listing every
  section from the rail.
- **No DE / EN switch.** Removed entirely.
- **No "Nominee" tag.** Removed entirely.

### 5.7 Keyboard navigation legend — bottom right

The inspiration puts this bottom-left and the language switch bottom-right. The
language switch is gone, so put the legend **bottom right** (`fixed bottom-8
right-8 z-30 hidden lg:block xl:right-12`), which is what the brief asked for.

```
NAVIGATION  [toggle pill]
[↑][↓][W][S]   Change section
[K]            Book a demo
[L]            Login
[Esc]          Close menu
```

- `kbd` styling: `inline-flex h-[17px] min-w-[17px] items-center justify-center
  rounded-[3px] border border-steel-300 px-[3px] font-sans text-[0.58rem]
  font-medium leading-none text-steel-700`.
- The small pill to its right is a **toggle** (`aria-pressed`) that enables or
  disables keyboard navigation; when off, the `dl` fades to `opacity-40` and the
  handlers detach.
- **Wire the keys for real**: ↑/W → previous section, ↓/S → next section,
  K → scroll to Contact, L → open the login URL, Esc → close the mobile menu.
  Ignore all of them while focus is in an input/textarea.
- Mirror the shortcuts as `aria-keyshortcuts` on the corresponding links.

### 5.8 The hero, section `00`

Layout: eyebrow → display title on two lines → **typed sub-heading** → body copy
→ CTA row → "Scroll to explore" with a pulsing 32px vertical rule.

**Typed sub-heading (required).** Split the string into per-character `<span>`s
grouped into per-word `inline-block` wrappers so words never break mid-wrap.
Reveal characters sequentially (~28–40ms each) after the title has settled.
**The final phrase is rendered in the accent colour**, exactly as the inspiration
tints its last word. A 4px-wide block caret (`h-5 md:h-6`, `bg-accent/70`,
`rounded-sm`) blinks at the end and fades out when typing finishes. Provide the
full string once in an `sr-only` `<p>` and mark the animated version
`aria-hidden="true"`. Respect `prefers-reduced-motion`: render the full string
instantly.

**Background video (mouse-scrub).** Per the brief:

```
<video> position: fixed; inset: 0; z-index: 0; object-fit: cover;
        object-position: 70% center;
src = /assets/bot-video.mp4
muted, playsInline, preload="auto", NOT autoplay
```

Scrub logic — `mousemove` on `window`:

```js
const SENSITIVITY = 0.8;
delta = currentX - prevX;
targetTime += (delta / window.innerWidth) * SENSITIVITY * video.duration;
targetTime = Math.min(Math.max(targetTime, 0), video.duration);
```

Seek with `video.currentTime`, and use an `onSeeked` handler that issues the next
seek only if `targetTime` has moved since — this is what prevents seek-flooding.
Seed `prevX` on the first event rather than assuming 0.

Requirements on top of the raw spec:
- The video layer is **only** visible while the hero is the active section; fade
  it out (opacity, 600ms) as the user leaves section `00` and detach the
  `mousemove` listener so it costs nothing for the rest of the page.
- On the light theme it needs a scrim so the copy stays readable: overlay a
  `linear-gradient(100deg, var(--paper) 0%, rgba(247,248,250,.92) 38%, rgba(247,248,250,.35) 70%, rgba(247,248,250,.55) 100%)`.
- Touch devices and `prefers-reduced-motion`: do not mount the video at all —
  show the static `schoolbot.png` composition instead.
- The bot in the video reads as "the face follows the cursor", which is the
  effect asked for. Additionally, on the **static** bot layer (used on every
  other section and as the touch fallback), give the bot a subtle
  cursor-following tilt: `rotateY` up to ±7°, `rotateX` up to ±5°, lerped
  toward the pointer, with `transform-style: preserve-3d`.

### 5.9 Hover animation on infographic cards

The inspiration's card hover, to be used on **every** infographic and feature
card:

- The card is `relative overflow-hidden` with a `1px` steel border and a white
  surface.
- On hover: border → `--accent/35`, background lifts to pure white, a soft
  shadow appears (`0 18px 50px -20px rgba(1,17,46,.28)`), the card rises
  `translateY(-4px)`, and a `radial-gradient` "spotlight" follows the pointer
  inside the card (track `--mx`/`--my` CSS variables from `mousemove`).
- Simultaneously the card's leading rule grows from `w-4` to `w-12` in the accent
  colour, and its index number fades up in opacity — the same language as the
  rail dash.
- All of it on 400–500ms `cubic-bezier(.22,1,.36,1)`. Must be keyboard-reachable:
  apply the same treatment on `:focus-within`.

### 5.10 The blurred animated screens (required)

The inspiration's "work that works" section has stylised UI panels stacked in the
top-right corner, partly blurred, drifting. Reproduce this in the **Platform /
"How it fits together"** section:

- Three or four overlapping panel mockups, rotated slightly, staggered in depth.
- The back panels carry `filter: blur(3–6px)` and lower opacity; the front panel
  is sharp.
- They drift continuously on slightly different periods (translate ±8px,
  rotate ±1°, 7–11s) so the stack never looks static.
- On hover of the stack, the front panel lifts and sharpens and the back panels
  recede further.

Build the panels as **HTML/CSS/SVG recreations of real School Hub screens**, not
raster screenshots — they scale crisply, animate, and carry no real tenant data.
§7 gives the exact structure of the real screens to recreate.

---

## 6. CTAs

Two, following the my-skoolz.com pattern (a text login link plus a solid pill):

| | Label | Style | Target |
| --- | --- | --- | --- |
| Secondary | **Login** | `.eyebrow`, text only, `text-steel-700` → `hover:text-accent`, 300ms | `https://schoolhub.codexmill.com/login` |
| Primary | **Book a Demo** | solid pill, `bg-accent text-white`, `rounded-full px-5 py-2.5`, `.eyebrow text-[0.6rem]`, hover: `bg-brand-blue`, lift `-1px`, shadow `0 10px 30px -12px rgba(1,17,46,.55)` | `#contact` |

In the hero, show them larger and side by side: primary **"Book a Demo →"**
(arrow translates `+4px` on hover) and secondary **"Explore Features"** as an
outlined pill (`border-steel-300`, hover `border-accent`). Repeat the pair in the
Contact section.

Below the hero CTAs, a row of ticked feature chips — the my-skoolz device:
`✓ Students · ✓ Teachers · ✓ Fees · ✓ Leave · ✓ Messaging · ✓ KPIs`.

---

## 7. Content — all of it, verified against the live product

Everything below came from the live Super Admin → Features catalogue and the
Askari tenant. It is accurate; do not invent capabilities beyond it.

### Section map

| # | id | Rail label | Header nav | Purpose |
| --- | --- | --- | --- | --- |
| 00 | `start` | Start | — | Hero |
| 01 | `numbers` | In numbers | — | Proof stats |
| 02 | `students` | Students | Features | Student Management |
| 03 | `teachers` | Teachers | — | Teacher Management |
| 04 | `fees` | Fees | — | Fee Management |
| 05 | `leave` | Leave | — | Leave Management |
| 06 | `messaging` | Messaging | — | Built-in messaging |
| 07 | `performance` | Performance | — | Performance KPIs |
| 08 | `platform` | The platform | Platform | How it fits together + blurred screen stack |
| 09 | `process` | Onboarding | Process | From demo to first term |
| 10 | `faq` | FAQ | — | Three questions |
| 11 | `contact` | Contact | Contact | Book a demo |
| 12 | `footer` | Footer | — | Footer |

### 00 — Hero

- Eyebrow: `Student Management · Fees · Staff · Performance`
- Title (two lines): **School** / **Hub**
- Typed sub-heading: `One system that runs the whole school.`
  — type the last two words, **"whole school."**, in the accent colour.
- Body: *Admissions, attendance, fees, staff, leave and messaging in one place —
  on your school's own subdomain, built for Pakistani schools.*
- CTAs + ticked chips (§6). Then: `Scroll to explore`.

### 01 — In numbers

Eyebrow `01 Numbers`. Heading **In numbers**. Sub: *What the platform already
carries.* Four stat cards, each animating its figure up on entry (count-up,
`tabular-nums`, honour reduced-motion):

| Label | Figure | Caption |
| --- | --- | --- |
| Modules | `13` | switchable per school |
| Roles | `12` | from Administrator to Parent |
| Portals | `4` | office, teaching, student, family |
| Features | `51` | live in the platform today |

(13 modules = Academics & Timetable, LMS, Exams & Results, Events, Admissions &
Enrollment, Fee Management, Accounts & Finance, HR & Payroll, Staff KPIs, Chat,
Transport, Library, Hostel. 12 roles and 51 features are the live counts.)

### 02 — Student Management

- Eyebrow `02 Students`
- Heading: **Every student, one record**
- Lead: *Bring four hundred students across from a spreadsheet, map the columns
  once, and see what would fail before anything is written.*
- Cards (use the §5.9 hover):
  1. **The student record** — profile, guardians, uploaded documents, academic history.
  2. **CSV import** — column mapping, per-row validation, and a sample sheet generated from the importer's own rules.
  3. **Admissions & enrolment** — applications through to a placed student, one active enrolment at a time.
  4. **Campus transfer** — move a student between campuses without losing their history.
  5. **Attendance** — present, absent, late, excused and holiday, marked in the classroom and visible to the family the same morning.
  6. **Report cards** — grading schemes, marks entry, promotions and printable report cards.

### 03 — Teacher Management

- Eyebrow `03 Teachers`
- Heading: **The staff room, on the record**
- Lead: *One record per member of staff, whether or not they have a login, and a
  salary built out of named components rather than a single figure.*
- Cards:
  1. **Personnel file** — one person, one record, linked to their login.
  2. **Roles & permissions** — twelve roles, and a permission matrix each school can edit.
  3. **Timetable & teacher calendar** — a teacher's whole week across sections; a clash is refused at the write, not merely hidden.
  4. **Substitute cover** — who is covering, and what they are covering.
  5. **Lesson plans** — planned, submitted, reviewed.
  6. **Payroll** — salary components, payroll runs, payslips and approvals.

### 04 — Fee Management

- Eyebrow `04 Fees`
- Heading: **The month's vouchers, in one pass**
- Lead: *Raise a month's vouchers for the whole school at once, print them on the
  school's own stationery, and take the money at the counter.*
- Cards:
  1. **Fee structures** — fee types, and a structure per grade.
  2. **Bulk vouchers** — generated in bulk or one at a time, with a per-school voucher number series.
  3. **Part payments** — receipts and a payment history against every voucher.
  4. **Family vouchers** — siblings on one voucher, with sibling discounts.
  5. **Concessions & late fees** — rules, not manual edits.
  6. **Aged debt** — defaulters by age of debt, and finance reports behind it.
- Pull-quote worth keeping: *Money is integer paise in code and NUMERIC in the
  database — no rounding drift.*

### 05 — Leave Management

- Eyebrow `05 Leave`
- Heading: **Applied on a phone, decided up the chain**
- Lead: *A teacher applies on their phone, their coordinator decides it, and the
  payroll already knows.*
- Cards:
  1. **Leave types** — defined by the school, with settings per campus.
  2. **Apply anywhere** — from the teaching portal or the dashboard.
  3. **The chain of command** — coordinator, section head, vice principal, principal.
  4. **HR keeps the rules** — and the files for staff with no login; HR does not approve.
  5. **Quotas & balances** — computed, never stored, so they cannot drift.
  6. **Staff register** — daily staff attendance and Saturday duty.

### 06 — Built-in messaging

- Eyebrow `06 Messaging`
- Heading: **Inside the school's own system**
- Lead: *Parents and teachers message each other inside the school's own system,
  under the school's own rules — not on a phone number nobody controls.*
- Cards:
  1. **Four portals** — office, teaching, student and family, all in one thread list.
  2. **Office desks** — a parent writes to the fee office, not to a person who left.
  3. **Time-limited grants** — open a class for a fixed window, then close it.
  4. **Moderation** — attachments, reporting, and moderation of reported messages.
  5. **Oversight** — head-level, scoped by the same principal scope as everything else.
  6. **Broadcasts** — one message to a whole class, delivered instantly with a bell and a browser notification.

### 07 — Performance KPIs

- Eyebrow `07 Performance`
- Heading: **Appraisal every month, not every year**
- Lead: *Appraisal that happens monthly instead of once a year, and a single
  number a salary review can actually turn on.*
- Cards:
  1. **KPIs per role** — defined by the school, not by us.
  2. **Monthly ratings** — and an annual overall.
  3. **Who rates whom** — seniority decides, and it is enforced.
  4. **One figure per person** — the number a salary review turns on.
  5. **The board** — every member of staff, ranked, filtered by campus.
  6. **Reports** — performance alongside attendance, fees and academics.

### 08 — The platform

- Eyebrow `08 The platform`
- Heading: **How it fits together**
- Lead: *Not a bundle of tools. One system per school, on its own subdomain, with
  one switch per module.*
- Content: three or four stat/diagram blocks plus the **blurred animated screen
  stack** (§5.10), which should sit top-right of this section.
  1. **Your own subdomain** — `yourschool.schoolhub.codexmill.com`, provisioned automatically, HTTPS included.
  2. **Multi-campus** — branches under one school, with data scoped to the campus a person belongs to.
  3. **Thirteen modules, one switch each** — turn on only what the school runs.
  4. **Roles that mean something** — twelve roles and a permission matrix the school can edit; what a Coordinator holds is a setting, not a rebuild.
  5. **Works on the phone** — an installable app with web push, for staff who are never at a desk.
  6. **Branding** — the school's own logo and palette, on screen and on every printed voucher and report card.

### 09 — Onboarding (process)

Eyebrow `09 Onboarding`. Heading **From demo to first term**. Four numbered
steps, same numbered-card language as the inspiration:

1. **Demo** — we walk your team through the system with your own kind of data.
2. **Setup** — campuses, grades, sections, fee structure and roles configured with you.
3. **Import** — students and staff brought across from your spreadsheets, validated before anything is written.
4. **Go live** — your subdomain opens, invitations go out, and we stay on support through the first term.

### 10 — FAQ

Eyebrow `10 FAQ`. Heading **Answers, up front**. Three items, accordion, first
open by default:

- **Does every school get its own system?** — *Yes. Each school runs on its own subdomain with its own data, its own branding and its own permission matrix. Nothing is shared between schools.*
- **Can we run more than one campus?** — *Yes. Branches sit under one school, and every record is scoped to the campus it belongs to — including who can see it. Fees, attendance and reports can be read per campus or across all of them.*
- **Do we have to take all of it at once?** — *No. Thirteen modules, one switch each. Start with admissions, fees and attendance; turn on payroll, KPIs, messaging or transport whenever the school is ready.*

### 11 — Contact

Eyebrow `11 Book a demo`. Heading **Ready to run the whole school?** Lead: *Tell
us about your school in a few questions. We will come back to you personally —
with an honest assessment, not a standard quote.* Primary CTA **Book a Demo**,
secondary **Login**. Small print: *Takes about 60 seconds.*

A small contact form is acceptable (name, school, email, phone, campuses) but it
must be **inert** — validate client-side, then show a "Thank you — we will be in
touch" state. There is no backend. Do not post anywhere.

### 12 — Footer

Logo, one-line description, three link columns (Product: the section anchors ·
Platform: School portal, Super Admin, Status · Legal: Privacy, Terms), contact
`hello@schoolhub.codexmill.com` (SUPERSEDED 2026-09-24 — now
`hello@getschoolhub.com`), and a copyright line
`© 2026 School Hub — All rights reserved.`

---

## 8. Real screen structures, for the mockup panels

Recreate these as HTML/CSS. Use the demo figures below — they are illustrative,
not the live tenant's real financials.

**Dashboard.** Left rail: Dashboard · Users & Staff · Branches · Communications ·
Messages · Reports · Calendar · Settings · Feedback. Top bar: school crest +
"Your School", a search field, a bell, the user's role. Action row: *Invite
staff · Enroll a student · Vouchers · Attendance · School settings · Roles &
permissions · Principals & divisions · Admissions & Enrollment · Fee Management*.
Alert chips: *"321 vouchers past their due date"*, *"29 classes with no register
taken today"*, *"1 leave request awaiting a decision"*. Stat cards: **Collected
this month**, **Outstanding this month**, **Attendance today**, **Students
enrolled**, **Net cash this month**. Charts: *Collection by campus* (horizontal
bars, billed vs collected), *Enrollment share* (donut with the total in the
centre), *Income against expense by campus*, *Collections by campus* (line).

**Students list.** Title "Students", sub *"Everyone enrolled, by academic year."*
Buttons: Export · Enroll student. Filters: Search · Status (All / Active /
Transferred / Withdrawn / Graduated) · Fees (Not billed / Admission unpaid /
Overdue / Due / Cleared) · Academic year · Branch · Grade · Section. Table
columns: `STUDENT ID · NAME · GRADE · SECTION · GUARDIAN PHONE · FEES ·
ENROLLED · STATUS · ACTIONS`. Rows look like
`ASST-2026-0102 · Abdullah Alvi · Year 2 · B · (0312) 531-4752 · Overdue ·
15-Aug-2026 · Active · View profile`.

**Vouchers.** Title "Vouchers", sub *"Every bill your school has raised, with
what has been paid against it."* Tabs: **Student vouchers** / **Family
vouchers**. Filters: Search · Status · Kind · Academic year · Billing month ·
Billing year · Grade · Section · Clear filters. Sidebar under Fee Management:
Overview · Fee Structure · Vouchers · Family Vouchers · Aged Debt · Reports ·
Settings.

**Performance.** A ranked board of staff with a monthly rating and one overall
figure, filterable by campus.

**Messages.** A thread list with office desks, class grants and broadcasts, and
an unread bell.

---

## 9. Accessibility and quality bar

- `prefers-reduced-motion: reduce` must disable the video mount, the typed
  reveal (show full text), the floats, the drifts and the count-ups. Section
  changes become instant scroll.
- Skip link to `#main` as the first focusable element.
- Every section is `<section aria-labelledby="…">` with a real heading.
- Rail and nav links are real `<a href="#…">`; active is marked
  `aria-current="true"`.
- Keyboard: everything reachable, visible focus rings (`ring-1 ring-accent/60`),
  the accordion operable by keyboard, the mobile menu trapping focus and closing
  on Esc.
- Contrast: body text ≥ 4.5:1 against `--paper`. Because the bot and video sit
  behind text, the light text-shadow scrim in §3 is not optional.
- Responsive: 360px, 768px, 1024px, 1440px, 1920px. Below `lg` the rail, the
  hairlines and the keyboard legend are hidden; sections become a normal stacked
  scroll with the bot as a smaller decorative element.
- No console errors or warnings. `npm run typecheck` and `npm run build` clean.
- No hotlinked fonts, no CDN scripts — everything bundled.
