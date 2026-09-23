# School Hub — revision 2

**This document supersedes `BRIEF.md` wherever the two conflict.** It was written
after the client reviewed the first build in a browser. Everything in `BRIEF.md`
that is not contradicted here still stands — in particular §2 (stack), §3 (brand
tokens and typography), §6 (CTAs) and §9 (accessibility).

Superseded outright: `BRIEF.md` §5.2 (bot layer), §5.3 (sparkle layer), §5.8's
video paragraphs, §5.10 (screen stack), §7 (section map and copy), §8 (screen
structures). Read this document for those.

The mechanics below are not design opinions. They were read out of the
inspiration site's shipped JavaScript bundle (`index-CIZ1YkZ9.js`) and its scene
configuration is quoted verbatim where useful. Build to these numbers.

---

## A. The client's verdict on build 1, item by item

| # | Client said | Resolution |
| --- | --- | --- |
| 1 | The hero bot is faded; animation is jerky | Scrim reduced (§D.6); fixed-duration tweens replaced with per-channel exponential damping (§C) |
| 2 | Convert the bot to the 3D model on scroll | **The `.glb` replaces the flat PNG everywhere, from section 00 onward.** §B |
| 3 | One scroll should move one section | Wheel state machine. §E |
| 4 | The blue AI image is dull — give it blowing neon, keep it distant | Multi-layer halo with enforced minimum intensities. §F |
| 5 | Cut "Money is integer paise…" and every line like it | §H. This is a category, not one line |
| 6 | Too much blank space; make the bot bigger | The model is 60–90% of viewport height and cropped by the frame. §B.3 |
| 7 | Dashboard section: Askari screens as animated infographics | §G.2 — the bento treatment |
| 8 | FAQ in the same style as the reference | §G.3 |
| 9 | Add "How it Works" between In numbers and Students | New section 02. §I |
| 10 | Platform infographics are poor — make it "Work that works" | §G.1 — the isometric bleeding stack |
| 11 | Footer is the worst — make it exactly like the reference | §G.4 |
| 12 | Place bot and sparkle in varied positions, sparkle not on every screen | §D — per-section presets; halo on 7 of 15 sections |

Two decisions the client has now given:

- **The mouse-scrub video is dropped.** Delete `HeroVideo.tsx`,
  `useVideoScrub.ts` and the `<video>` element. `bot-video.mp4` stays in the repo
  but is no longer referenced. The 3D model replaces it and gives a better
  cursor-follow than scrubbing ever did.
- **The Askari screens are recreated in HTML/CSS/SVG, not screenshotted.**

---

## B. The 3D bot

### B.1 The asset

`Bot images/AI Bot.glb` (9.98 MB). Move it to `public/models/school-bot.glb`.

`Bot images/1.jpg` is the look the client wants: brushed gunmetal body, near-black
visor, **cyan** eyes and accent rings, crisp and bright — not washed out. Match
its lighting.

**Compress it.** 9.98 MB is too heavy for a hero. Run it through
`gltf-transform` with Draco or meshopt plus texture resizing:

```bash
npx @gltf-transform/cli optimize "public/models/school-bot.glb" \
  "public/models/school-bot.opt.glb" --compress draco --texture-size 2048
```

Expect 10–15× on geometry. Commit the optimised file and load that. If the
toolchain fails, say so in `BUILD-NOTES.md` and ship the uncompressed file
rather than blocking — but lazy-load the three.js chunk either way, so first
paint never waits on it.

### B.2 The renderer

- `three` + `@react-three/fiber` + `@react-three/drei`.
- The whole 3D layer is a **lazily imported chunk** (`React.lazy` + `Suspense`),
  mounted after first paint. Until it resolves, show the existing
  `schoolbot.png` in the same screen position so there is no empty frame.
- Canvas is `position: fixed; inset: 0; z-index: 0; pointer-events: none`.
- `dpr={[1, 2]}`, `gl={{ antialias: true, alpha: true }}`,
  `ACESFilmicToneMapping`, `outputColorSpace: SRGBColorSpace`.
- On mount, **normalise the model**: compute its bounding box, recentre it on the
  origin, and scale so its largest dimension is exactly 1 unit. Every number in
  §D assumes a unit-normalised model. Do not hand-tune scale per section —
  §D drives size through camera `distance` and `fov`, never through model scale.
- Lighting to match `1.jpg`: a key light, a strong rim, a low fill, and emissive
  cyan (`#00E0F8`) on the eye and chest-ring materials so they read as lit. Add a
  subtle bloom pass — the eyes should glow.
- **Fallbacks, all of which render `schoolbot.png` instead and never load the
  `.glb`:** `prefers-reduced-motion: reduce`, coarse pointer (phones/tablets), no
  WebGL2, and any loader error. Wrap the canvas in an error boundary.

### B.3 Sizing — this is what fixes the blank space

The inspiration site keeps its subject at `scale: 1` and frames it with
`distance` 5.0–6.1 at `fov` 22–28. The result is a subject occupying **60–90% of
viewport height** and **deliberately cropped by the frame edges** — it bleeds off
the bottom on nearly every section.

Do the same. If a section looks empty in the middle, the camera is too far back.
The bot is the furniture, not a decoration in a corner.

### B.4 Cursor follow

The bot's head tracks the pointer. Add a small additive yaw/pitch offset on the
head bone (or on the whole model if the head is not separable):

- yaw ±0.12 rad, pitch ±0.08 rad, mapped from normalised pointer position.
- Damped at rate 4.0 (§C), so it lags the cursor slightly rather than snapping.
- This composes **on top of** the section pose — add the offsets after the pose
  has been damped, never replace it.

---

## C. Why the animation must be damped, not tweened

The current build tweens on fixed durations, which is why the client called it
jerky: a late frame visibly stutters.

Replace every scene transition with **frame-rate-independent exponential
damping**, evaluated per frame:

```ts
const damp = (current: number, target: number, rate: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-rate * dt));
```

Each channel gets its own rate. These are the shipped values from the
inspiration site — use them as-is:

```ts
export const DAMPING = {
  camPos:    6.4,
  camTarget: 7.6,
  camRoll:   4.9,
  camFov:    5.6,
  modelPos:  6.8,
  modelRot:  7.6,
  halo:      5.1,
  light:     3.4,
};
```

Three properties fall out of this and all three are wanted:

1. **It cannot judder.** `dt` is in the exponent, so a dropped frame changes
   nothing about the curve.
2. **Channels settle at different times** — rotation (7.6) lands before the
   lights (3.4) — so nothing arrives all at once and nothing snaps to a stop.
3. **It never truly finishes.** Asymptotic approach means the scene is always
   still moving a little, which *is* the "keeps animating while you sit on a
   section" quality. Do not add a separate idle loop to fake it.

Where a blend factor is needed between two presets, ease it with smoothstep
(`t * t * (3 - 2 * t)`), not linearly.

Clamp `dt` to a sane maximum (say 1/30 s) so a backgrounded tab does not
teleport the camera on return.

---

## D. Per-section scene presets

One preset per section. Shape:

```ts
type ScenePreset = {
  id: string;
  camera: { azimuth: number; elevation: number; distance: number;
            fov: number; roll: number; focus: [number, number, number] };
  model:  { position: [number, number, number];
            yaw: number; pitch: number; roll: number };
  halo:   { visible: boolean; x: number; y: number; d: number;
            opacity: number; frameMode: 'contained' | 'cropped';
            minVisibleFraction?: number } ;
};
```

`azimuth`/`elevation` are radians orbiting the origin; `distance` is in model
units; `focus` is the look-at point, damped separately from position — that
separation is what makes the camera feel hand-held rather than mechanical.
`halo.x`/`halo.y` are **normalised viewport coordinates** (0–1), `halo.d` is
diameter as a fraction of the viewport's smaller edge.

| # | id | Copy side | azimuth | elev | dist | fov | roll | focus | model pos | yaw | pitch | roll | halo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 00 | `start` | left | −0.35 | 0.05 | 5.9 | 27 | 0.02 | [−0.30, 0.25, 0] | [0.35, −0.10, 0] | 0.31 | −0.07 | −0.035 | **x .62 y .40 d .38 op .92 contained** |
| 01 | `numbers` | right | 0.55 | 0.02 | 6.1 | 25 | −0.02 | [−0.94, 0.14, 0.58] | [−0.40, −0.05, 0] | −0.66 | 0.09 | 0.035 | hidden |
| 02 | `how-it-works` | left | 1.25 | 0.16 | 5.2 | 26 | 0.015 | [−0.34, 0.49, 0.78] | [0.95, −0.28, 0] | 0.55 | 0.03 | −0.03 | **x .90 y .22 d .24 op .70 cropped .5** |
| 03 | `students` | right | −0.15 | 0.35 | 5.0 | 23 | −0.03 | [−0.36, 0.55, −0.05] | [−0.55, −0.15, 0] | −0.21 | 0.16 | −0.05 | hidden |
| 04 | `teachers` | left | −0.25 | −0.18 | 5.6 | 24 | −0.04 | [0.61, 0.50, 0.16] | [0.50, −0.12, 0] | 1.10 | −0.09 | −0.06 | **x .14 y .34 d .30 op .88 contained** |
| 05 | `fees` | right | 0.45 | 0.12 | 5.4 | 28 | 0.03 | [−0.86, 0.22, 0.42] | [−0.60, −0.20, 0] | 0.17 | −0.05 | 0.05 | hidden |
| 06 | `leave` | left | 0.08 | 0.06 | 6.4 | 22 | 0 | [0.63, 0.25, −0.05] | [0.60, −0.30, 0] | 0.06 | 0.02 | −0.02 | **x .84 y .24 d .34 op .90 cropped .7** |
| 07 | `messaging` | right | −1.15 | 0.14 | 5.0 | 26 | −0.015 | [0.41, 0.49, 0.74] | [−0.85, −0.18, 0] | −0.45 | 0.03 | 0.04 | hidden |
| 08 | `performance` | left | 1.45 | 0.20 | 5.2 | 26 | 0.02 | [−0.20, 0.48, 0.83] | [0.90, −0.24, 0] | 0.62 | 0.04 | −0.04 | hidden |
| 09 | `platform` | low-right | 1.25 | 0.16 | 5.6 | 26 | 0.015 | [−0.34, 0.49, 0.78] | [1.05, −0.35, 0] | 0.55 | 0.03 | −0.03 | hidden |
| 10 | `dashboard` | left | −1.15 | 0.14 | 5.2 | 26 | −0.015 | [0.41, 0.49, 0.74] | [−1.05, −0.18, 0] | −0.45 | 0.03 | 0.04 | **x .10 y .42 d .26 op .78 cropped .5** |
| 11 | `onboarding` | right | 0.08 | 0.06 | 6.8 | 22 | 0 | [0.63, 0.25, −0.05] | [−0.45, −0.10, 0] | 0.06 | 0.02 | −0.02 | hidden |
| 12 | `faq` | left | 1.20 | 0.18 | 5.4 | 26 | 0.02 | [−0.29, 0.35, 0.74] | [0.70, −0.15, 0] | 0.75 | 0.05 | −0.05 | **x .80 y .30 d .28 op .90 contained** |
| 13 | `contact` | centre | −0.10 | 0.22 | 8.6 | 26 | −0.02 | [2.48, 1.50, −0.09] | [−0.50, −0.40, 0] | 1.47 | 0.19 | −0.09 | **x .86 y .18 d .22 op .82 contained** |
| 14 | `footer` | centre-left | 1.20 | 0.18 | 5.4 | 26 | 0.02 | [−0.79, 0.94, 1.57] | [0.75, −0.30, 0] | 0.75 | 0.05 | −0.05 | **x .80 y .26 d .34 op .92 cropped .58** |

### D.5 Notes on the table

- The halo appears on **7 of 15 sections**, never two adjacent ones except
  13→14. That is the client's "not all the screens".
- Copy side alternates so the bot always has the opposite half.
- `dist` 5.0 (section 03) is the closest and biggest; `dist` 8.6 (section 13)
  is the widest, where the bot becomes a small shape and the copy centres.
- `platform` and `dashboard` push the model to the frame edge
  (`x = ±1.05`) so it reads as a silhouette and the infographics own the page.
- Sections with `hidden` halos still render the aura and bloom on the bot
  itself — only the sparkle disappears.

### D.6 The scrim

Reduce it. The bot must read as a solid metal object, not a ghost. Apply the
light gradient **only behind the copy column**, not across the whole viewport:

```css
background: linear-gradient(
  100deg,
  var(--paper) 0%,
  rgba(247,248,250,.94) 30%,
  rgba(247,248,250,.55) 52%,
  rgba(247,248,250,0) 68%
);
```

Mirror it for right-aligned sections. Keep the light text-shadow on the copy
(`BRIEF.md` §3) so it stays legible where the gradient thins.

---

## E. One scroll, one section

The inspiration site never scrolls the document. It calls `preventDefault()` on
every wheel event and runs a state machine. Reproduce it exactly.

```ts
const THRESHOLD_WHEEL    = 35;   // mouse wheel (deltaMode !== 0, or |delta| >= 50)
const THRESHOLD_TRACKPAD = 70;   // fine-grained deltas
const REARM_GAP_MS       = 140;  // silence required before a new gesture counts
const GESTURE_FLOOR_MS   = 160;  // minimum spacing between section changes
const SETTLE_MS          = 80;   // cooldown after the scroll lands
const SCROLL_DURATION    = 0.5;  // seconds (0.25 when reduced-motion)
```

Rules:

1. Normalise `deltaY` across modes: `deltaMode === 1` → `× 16`,
   `deltaMode === 2` → `× window.innerHeight`.
2. Accumulate into `wheelAccumulator`. Cross `±threshold` → advance exactly one
   section, then set `armed = false` and reset the accumulator.
3. **Re-arm only after `REARM_GAP_MS` of no wheel events.** A continuous flick,
   however violent, moves one section and no more. This is the whole point.
4. Respect `GESTURE_FLOOR_MS` and `SETTLE_MS` as additional locks.
5. The move itself: `lenis.scrollTo(offset, { duration: SCROLL_DURATION,
   easing: easeInOutCubic, lock: true, force: true })`, where easeInOutCubic is
   `t < .5 ? 4t³ : 1 - (-2t + 2)³ / 2`.
6. Lenis config: `{ lerp: 0.09, smoothWheel: false, syncTouch: false }`.
   `smoothWheel` is **off** because the wheel is fully intercepted; Lenis is only
   the animated `scrollTo` engine.
7. A section taller than the viewport gets sub-steps:
   `1 + Math.ceil((height - vh) / (vh * 0.8))`. Step through those before moving
   to the next section.
8. Do not intercept when the pointer is inside an element marked
   `[data-scroll-scope]` that can still scroll in that direction — that is how an
   inner scrollable panel keeps working.
9. Touch devices keep native scrolling. Do not `preventDefault` there.
10. Keyboard (↑/↓/W/S/PageUp/PageDown) drives the same `next()`/`prev()`.

---

## F. The neon halo — replacing the dull sparkle

The current flat tinted PNG at low opacity will never glow. Build the sparkle as
a **composite of four layers**, all centred on the same point:

1. **Core** — the `ai.png` glyph at full saturation, small, with
   `filter: drop-shadow()` stacked 2–3 deep in `--brand-cyan`.
2. **Inner glow** — the same glyph scaled ~1.4×, blurred ~18px,
   `mix-blend-mode: screen`, in `#00E0F8`.
3. **Outer glow** — scaled ~2.2×, blurred ~60px, in `#0080F8`, low opacity.
4. **Aura** — a wide radial gradient (scale 2.6–3.2× the glyph) in
   `#0040F8`, very low opacity, giving the ambient wash.

Then enforce floors, exactly as the inspiration site does — it clamps its halo so
it can never go dull:

```ts
const HALO_FLOOR = {
  opacity:       0.82,
  coreIntensity: 2.8,
  innerGlow:     0.28,
  outerGlow:     0.08,
};
```

Animation:

- Position, diameter and opacity damp toward the section preset at rate `5.1`.
- Continuous slow rotation, one turn per ~80 s.
- Scale breathes ±6% over ~12 s.
- Core intensity pulses ±8% over ~4 s, offset from the scale period so the two
  never sync.
- Pointer parallax up to 30 px, lerped, **opposite** in sign to the bot's so the
  depth separation is felt.
- `frameMode: 'cropped'` means it is allowed to sit partly outside the viewport,
  showing only `minVisibleFraction` of itself. Do not clamp it back on screen.

It stays **behind** the bot at all times (`z-index` below the canvas) and behind
the hairlines. The bot is always in front. That is the client's rule.

---

## G. The four infographic treatments

### G.1 Section 09 `platform` — the "Work that works" treatment

The reference does **not** put its artwork in the content column. It bleeds an
isometric plane of UI cards off the **top-left corner of the viewport**.

- 8–10 UI cards laid out on a shared isometric plane
  (`transform: rotateX(52deg) rotateZ(-38deg)` on a parent, cards as children).
- The plane's origin sits **outside** the viewport, top-left. Cards are cropped
  by the top and left edges. Do not fit the whole plane on screen.
- Depth by blur: the furthest cards `blur(7px)` at `opacity .35`, mid
  `blur(3px)` at `.6`, nearest sharp at `.95`.
- The whole plane drifts slowly — translate ±10 px, rotate ±0.8°, over 9–13 s,
  each card on its own phase offset so the plane breathes rather than slides.
- Content sits **low-right**: eyebrow `09 THE PLATFORM`, heading
  **"One system, not six tools"**, one line of lead, then three portal cards in a
  row (Office · Teaching · Family), each with the §5.9 hover.
- The bot is a silhouette on the far-right edge (`model.position.x = 1.05`).

Cards on the plane are simplified School Hub screens — a voucher, a register, a
timetable grid, a KPI board, a chat thread, a report card. Recognisable at a
glance, not readable.

### G.2 Section 10 `dashboard` — the "How a site is put together" bento

A **bento grid** occupying the right ~55% of the screen, bot and halo holding the
left. Every cell: hairline border, white surface, eyebrow + serif title + one
line of body, and the §5.9 hover.

| Cell | Span | Content |
| --- | --- | --- |
| **Collection by campus** | wide (2 cols) | Horizontal bar chart, billed vs collected, three campuses. Bars grow from zero on entry, staggered 80 ms. |
| **Enrollment share** | tall | Donut with the total in the centre. Arc draws in on entry; centre figure counts up. |
| **Today's register** | 1 | Attendance ring at 94%, with present/absent/late counts ticking up. |
| **Vouchers** | 1 | Miniature voucher list, three rows, one flipping from *Overdue* to *Cleared* on a loop. |
| **Staff KPIs** | 1 | Four ranked rows with score bars that fill on entry. |
| **Messages** | 1 | Chat thread with two bubbles that type themselves in on a loop. |

All of it recreated in HTML/CSS/SVG from the real Askari screens (§J), with
**invented figures** and **Western names** (§H.2). No screenshots.

Section copy sits left: eyebrow `10 THE DASHBOARD`, heading **"The morning
view"**, lead *"Everything the office needs to know before the first bell, on one
screen."*

### G.3 Section 12 `faq` — the reference's panel style

Not a conventional accordion. One bordered panel:

- Eyebrow `IN DETAIL` at the top inside the panel.
- The three questions stacked as serif (`.display`) lines, ~1.15rem.
- The **active** question carries a left rule in the accent colour and sits at
  full `--ink`; the others are muted.
- The answer appears **below the stack**, in body copy, cross-fading when the
  active question changes (fade out 150 ms, fade in 250 ms) — the questions do
  not push each other apart.
- Panel background is a very faint steel wash with a hairline border and a soft
  inner highlight, so it reads as glass over the bot.
- Keyboard operable: arrow keys move between questions, Enter/Space selects.

### G.4 Section 14 `footer` — match the reference exactly

Layout, in order:

1. Eyebrow: `14  SCHOOL HUB`
2. The logo, then a short paragraph (3 lines max) in body copy.
3. A row of small social icon links.
4. A parenthetical eyebrow line: `(ASK AI ABOUT SCHOOL HUB)` followed by a row
   of four circular icon buttons.
5. **Five link columns** in a grid — `NAVIGATION`, `PLATFORM`, `CONTACT` on the
   first row; `TRUST`, `LEGAL` on the second. Column headings are `.eyebrow` at
   `--steel-500`; links are body copy at `--steel-700` hovering to `--ink`.
   - **NAVIGATION** — Start · Features · Platform · Process · FAQ
   - **PLATFORM** — In numbers · How it works · School portal · Super Admin
   - **CONTACT** — hello@schoolhub.codexmill.com · Book a demo · Lahore, Pakistan
     > SUPERSEDED 2026-09-24: the address is `hello@getschoolhub.com`, the city
     > is Karachi, and the city line was removed from the contact section
     > entirely on 2026-09-23. See STATE.md §9.
   - **TRUST** — Security · Data protection · Report a vulnerability · Accessibility
   - **LEGAL** — Privacy · Terms · Cookies · Copyright · Cookie settings
6. A hairline divider.
7. `© 2026 SCHOOL HUB — All rights reserved.`
8. A final `.eyebrow` line at `--steel-500`: `RENDERED IN REAL TIME · WEBGL`

The footer is a full scene like any other — the bot is large on the right, the
halo is visible, and the content sits centre-left. It is **not** a short bar
stuck at the bottom.

---

## H. Copy rules

### H.1 No explainer filler

Delete `Money is integer paise in code and NUMERIC in the database — no rounding
drift.` and **every line of that kind**. The client calls these "AI slop" and the
instruction covers the category, not the single sentence.

The category is the implementation aside written for an engineer and dropped into
copy meant for a head teacher. Sweep all of `BRIEF.md` §7 and remove these
wherever they appear. Known offenders:

- "Money is integer paise in code and NUMERIC in the database — no rounding drift."
- "A slot belonging to another structure is refused at the write, not merely hidden."
- "Marked by the teacher timetabled into the section — checked on the server."
- "Quotas and balances computed, not stored, so they cannot drift."
- "A sample sheet generated from the importer's own rules."
- "Derived from the platform's default permissions."
- Anything naming a database column, a permission key, a route, or a storage type.

If a sentence only makes sense to someone who has read the schema, cut it. State
the benefit and stop.

### H.2 Names

**Every person named anywhere on the site — students, teachers, guardians, staff,
chat participants, KPI rows, voucher rows — must have a Western name.** Alex
Morgan, John Carter, Mike Bennett, Sarah Whitfield, Daniel Reed, Emily Hart, and
so on.

Do not copy names from the live Askari tenant. Those are real students' names and
must not appear on a public page. Do not substitute other locally plausible
names either — the client asked for foreign names specifically.

Likewise invent all figures. Do not reproduce the live tenant's real collection
totals or overdue counts.

---

## I. New section 02 — "How it Works"

Sits between `01 numbers` and `03 students`.

- Eyebrow: `02  HOW IT WORKS`
- Heading: **"Four portals, one system"**
- Lead: *Office, teaching, family and platform each see their own view of the
  same records. Nothing is re-entered, and nothing is out of date.*
- Second paragraph: *A fee taken at the counter shows in the parent's app before
  they reach the gate. A register marked in class is on the head's dashboard the
  same morning.*

**The diagram** — modelled on the reference's node graph, which is the thing to
copy:

- Four labelled source nodes down the **left**, each a small circular icon with
  an `.eyebrow` label to its left: `OFFICE`, `TEACHING`, `FAMILY`, `PLATFORM`.
- Curved SVG paths from each node converging into a **central hub node** labelled
  `SCHOOL HUB`, carrying the logo mark.
- One path continuing out to the right to a node labelled `YOUR SCHOOL`.
- **The paths animate with a travelling gradient** — a `linearGradient` whose
  `x1/x2/y1/y2` are animated along the stroke, with a per-path `delay` and
  `repeatDelay`, easing `[.16, 1, .3, 1]`. That travelling stop is what makes it
  read as flow rather than a static diagram. This is exactly how the reference
  does it.
- Stagger the four paths so pulses arrive at the hub at different times.
- On hover of a source node, its path brightens and its pulse speeds up.

Content column is on the **left**, the diagram beneath the copy. Bot is a
silhouette on the far right with the halo cropped behind it.

---

## J. The Askari screens, for recreation

Structure is faithful; **all names and figures are invented** per §H.2.

**Dashboard.** Left rail: Dashboard · Users & Staff · Branches · Communications ·
Messages · Reports · Calendar · Settings · Feedback. Top bar: school crest, school
name, search field, bell, role label. Action row: *Invite staff · Enroll a
student · Vouchers · Attendance · School settings · Roles & permissions*. Alert
chips in a warning tint: *"18 vouchers past their due date"*, *"4 classes with no
register taken today"*, *"1 leave request awaiting a decision"*. Stat cards:
**Collected this month**, **Outstanding this month**, **Attendance today**,
**Students enrolled**, **Net cash this month**. Charts: *Collection by campus*
(horizontal bars, billed vs collected), *Enrollment share* (donut, total in the
centre), *Income against expense by campus*, *Collections by campus* (line).

**Students list.** Title "Students", sub *"Everyone enrolled, by academic year."*
Buttons: Export · Enroll student. Filters: Search · Status (All / Active /
Transferred / Withdrawn / Graduated) · Fees (Not billed / Admission unpaid /
Overdue / Due / Cleared) · Academic year · Branch · Grade · Section. Columns:
`STUDENT ID · NAME · GRADE · SECTION · GUARDIAN PHONE · FEES · ENROLLED ·
STATUS · ACTIONS`. Sample rows:

```
SH-2026-0102 · Alex Morgan     · Year 2      · B · (0312) 000-0000 · Overdue · 15-Aug-2026 · Active
SH-2026-0145 · Emily Hart      · Pre-Nursery · A · (0331) 000-0000 · Cleared · 15-Aug-2026 · Active
SH-2026-0200 · John Carter     · Prep        · A · (0346) 000-0000 · Due     · 15-Aug-2026 · Active
SH-2026-0203 · Mike Bennett    · Year 1      · B · (0333) 000-0000 · Cleared · 15-Aug-2026 · Active
SH-2026-0167 · Sarah Whitfield · Year 4      · C · (0300) 000-0000 · Overdue · 15-Aug-2026 · Active
```

**Vouchers.** Title "Vouchers", sub *"Every bill your school has raised, with what
has been paid against it."* Tabs: **Student vouchers** / **Family vouchers**.
Filters: Search · Status · Kind · Academic year · Billing month · Billing year ·
Grade · Section · Clear filters. Sub-rail: Overview · Fee Structure · Vouchers ·
Family Vouchers · Aged Debt · Reports · Settings.

**Performance.** A ranked board — name, role, campus, monthly rating, overall
figure — filterable by campus.

**Messages.** A thread list showing office desks, class grants and broadcasts,
with an unread bell.

---

## K. Section map, revised

| # | id | Rail label | Header nav |
| --- | --- | --- | --- |
| 00 | `start` | Start | — |
| 01 | `numbers` | In numbers | — |
| 02 | `how-it-works` | How it works | — |
| 03 | `students` | Students | Features |
| 04 | `teachers` | Teachers | — |
| 05 | `fees` | Fees | — |
| 06 | `leave` | Leave | — |
| 07 | `messaging` | Messaging | — |
| 08 | `performance` | Performance | — |
| 09 | `platform` | The platform | Platform |
| 10 | `dashboard` | The dashboard | — |
| 11 | `onboarding` | Onboarding | Process |
| 12 | `faq` | FAQ | — |
| 13 | `contact` | Contact | Contact |
| 14 | `footer` | Footer | — |

Copy for 03–08, 11, 12, 13 is unchanged from `BRIEF.md` §7 **after the §H.1
sweep**. Sections 02, 09, 10 and 14 are specified above. Renumber every eyebrow
to match this table.

---

## L. Definition of done for revision 2

1. The `.glb` renders, normalised, lit to match `Bot images/1.jpg`, filling
   60–90% of viewport height, cropped by the frame, in front of the halo.
2. No `<video>` element remains anywhere in the source.
3. One wheel flick advances exactly one section, and spinning the wheel hard
   still advances only one. Verified by hand.
4. Motion is damped, not tweened — confirmed by throttling the CPU in devtools
   and seeing the camera stay smooth.
5. The halo glows, appears on 7 of 15 sections, and moves between them.
6. All four infographic treatments (§G) are built and animated.
7. No explainer filler survives; grep the copy for the §H.1 offenders.
8. Every person named on the site has a Western name.
9. `npm run typecheck` and `npm run build` clean; no console errors.
10. `BUILD-NOTES.md` updated with anything deviated from and why.

---

## M. Model compression — already done, do not redo

`public/models/school-bot.opt.glb` **already exists** and is the file to load.

```
school-bot.glb       9.98 MB   126,128 triangles   uncompressed
school-bot.opt.glb   1.62 MB   112,510 triangles   KHR_draco_mesh_compression
```

A 6.2× reduction for an 11% triangle cut; the bounding box is unchanged
(`-0.48..0.48` x, `-0.95..0.95` y, `-0.40..0.40` z), so the silhouette is intact.
Keep `school-bot.glb` in the repo as the master; ship the `.opt` file.

**The Draco decoder must be bundled, not fetched from a CDN.** `drei`'s
`useGLTF` defaults to a Google-hosted decoder, which violates the no-CDN rule and
breaks offline. Copy the decoder in and point at it:

```bash
mkdir -p public/draco
cp node_modules/three/examples/jsm/libs/draco/gltf/* public/draco/
```

```ts
import { useGLTF } from '@react-three/drei';
useGLTF.setDecoderPath('/draco/');
```

Verify after wiring: the network panel must show no request to any host other
than the dev server.

Because the bounding box is already ~1.9 units tall, the normalisation step in
§B.2 will scale it by ~0.53. That is expected — still do the normalisation
rather than hard-coding the factor, so a re-exported model does not silently
change the framing of all fifteen sections.
