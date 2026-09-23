# School Hub — QA report, revision 2

Tested against `docs/CHANGES-V2.md` (authoritative) and `docs/BRIEF.md` §2, §3,
§5.1, §5.4–5.7, §5.9, §6, §9.

- Dev server: `http://localhost:5173`
- Production preview: `http://localhost:4173` (serving `dist/`)
- Test viewport unless stated: 1440 × 900, fine pointer, Chromium.

Every finding below was corroborated with DOM assertions
(`getBoundingClientRect`, `getComputedStyle`, `elementFromPoint`,
`SVGSVGElement.getCurrentTime`) and not from a screenshot alone.

**Counts:** 1 blocker · 3 major · 3 minor · 2 polish · 3 not verifiable here.

**Fix pass:** the blocker and all three majors are fixed and re-tested (dev and
production build). The three minors and two polish items are documented and left
alone — two of them are things the specs ask for and one is a contradiction in
the spec itself. After the fixes: `npm run typecheck` clean, `npm run lint`
(`--max-warnings 0`) clean, `npm run build` clean — main bundle 354.18 kB
(111.74 kB gzip), three.js still isolated in the lazy `BotCanvas` chunk, `dist/`
6.4 MB, no console errors on either server.

Files changed by the fix pass: `src/styles/index.css`,
`src/hooks/useKeyboardNav.ts`, `src/App.tsx`, `src/components/HaloLayer.tsx`,
`src/components/InfoCard.tsx`, `src/components/Bento.tsx`,
`src/components/StatCard.tsx`, `src/components/ContactForm.tsx`,
`src/sections/HowItWorks.tsx`, `src/sections/Numbers.tsx`,
`src/sections/Contact.tsx`, `src/sections/FooterSection.tsx`.

---

## BLOCKER

### B1 — Section 09 `platform`: the whole isometric card plane renders outside the viewport

- **Requirement:** CHANGES-V2 §G.1, §L.6; §A item 10 ("Platform infographics are
  poor"), §A item 6 ("too much blank space").
- **Status: FIXED** (see *Fix* below; re-tested).

**Reproduce**

1. Open `http://localhost:5173`, viewport 1440 × 900.
2. `window.scrollTo(0, document.getElementById('platform').offsetTop)`.
3. Measure every `.iso-card` and probe the viewport with `elementFromPoint`.

**Observed (before fix)**

```
wrapTop            0        (.iso-wrap is the section box, overflow: hidden)
maxCardBottom     -4        every one of the 9 cards ends ABOVE y = 0
elementFromPoint   0 hits   over a 24 × 15 grid covering the whole viewport
```

Same result in the production preview (`localhost:4173`): `isoCards 9`,
`isoMaxBottom` 4 px above the section's top edge.

**Cause.** `.iso-plane` is placed at `left: -19vw; top: -30vh` with
`transform: rotateX(52deg) rotateZ(-38deg); transform-origin: 0 0`. That matrix
projects plane-space `(x, y)` to screen `(0.788x + 0.616y, −0.379x + 0.485y)`,
so the plane extends *upward* and to the right of its origin. Its lowest point
is only 267 px below the origin, while the origin sits 270 px above the viewport
top — so the entire plane is above the fold and is then clipped by
`.iso-wrap { overflow: hidden }`.

**Required.** 8–10 UI cards on a shared isometric plane, cropped by the top and
left edges, plane not fitted on screen. **Observed.** Nothing at all; the
section is an empty upper-left two-thirds with the copy alone at lower-right —
precisely the complaint §G.1 exists to fix.

**Fix.** `src/styles/index.css` — move the plane's origin to where the projection
actually puts the cards in frame: `left: -13vw; top: 15vh` (2xl: `-9vw / 13vh`).
The origin is still outside the viewport (off the left edge), the cards are still
cropped by the top and left edges, and the plane is still not fitted. No card
geometry, tier, blur, opacity or drift period was changed.

**Re-tested** — scroll settled at `platform.offsetTop`, card rects measured
against the `.iso-wrap` box:

| viewport | cards in frame | cropped by top | cropped by left |
| --- | --- | --- | --- |
| 1024 × 768 | 8 / 9 (the furthest, most-blurred card clears the top edge) | 3 | 2 |
| 1440 × 900 | 9 / 9 | 3 | 2 |
| 1920 × 1080 | 9 / 9 | 3 | 2 |
| 1440 × 900, production build | 9 / 9 | 3 | 2 |

Confirmed visually too: the section now shows the isometric plane bleeding off
the top-left, with the copy and the three portal cards at lower-right.

One correction to the evidence above: `elementFromPoint` returns 0 card hits
both before and after the fix, because `.iso-wrap` is `pointer-events: none` —
it was never the discriminating measurement. The rects are. Before the fix the
lowest card ended 4 px *above* the wrap's top edge and all nine were clipped
away; now all nine intersect it.

---

## MAJOR

### M1 — PageUp / PageDown do not change section

- **Requirement:** CHANGES-V2 §E.10 — "Keyboard (↑/↓/W/S/PageUp/PageDown) drives
  the same `next()`/`prev()`."
- **Status: FIXED.**

**Reproduce.** Focus the document body, press each key, read `window.scrollY`
and the rail's `aria-current`.

**Observed (before fix)**

| key | sections moved |
| --- | --- |
| `ArrowDown` / `s` / `S` | +1 each ✓ |
| `PageDown` | **0** |
| `ArrowUp` / `w` / `W` | −1 each ✓ |
| `PageUp` | **0** |

`src/hooks/useKeyboardNav.ts` handled only `ArrowUp`/`ArrowDown`/`w`/`s`.
Worse: because the two keys were not handled, they were also not
`preventDefault`ed, so a real `PageDown` runs the browser's own page scroll and
desynchronises the document from the wheel state machine's step index — the one
thing §E exists to prevent.

**Fix.** `useKeyboardNav` now handles `PageUp`/`PageDown` (and `Home`/`End`,
which have the same native-scroll hazard, mapped to first/last section) and
calls `preventDefault()` on all of them.

**Re-tested**

| key | from → to | `defaultPrevented` |
| --- | --- | --- |
| `PageDown` | start → numbers | true |
| `PageDown` | numbers → how-it-works | true |
| `PageUp` | how-it-works → numbers | true |
| `End` | numbers → footer | true |
| `Home` | footer → start | true |

Regressions checked: the hard continuous spin (60 wheel events × 240, 2.6 s)
still advances exactly one section, and with focus inside a `<input>` none of
`PageDown`/`PageUp`/`Home`/`End`/`s`/`ArrowDown` is prevented or moves the page —
so the new keys still work as caret keys while typing (BRIEF §5.7).

### M2 — The halo's inner-glow layer is inert: `mix-blend-mode: screen` cannot paint on `--paper`

- **Requirement:** CHANGES-V2 §F (four composite layers, layer 2 = inner glow),
  §L.5 ("the halo glows"), §A item 4 ("blowing neon").
- **Status: FIXED.**

**Reproduce.** Section 00, read the computed style of the halo's three glow
spans.

**Observed (before fix)**

```
layer 4 aura        opacity 0.34   blend normal   radial-gradient #0040F8
layer 3 outer glow  opacity 0.26   blend normal   #0080F8, blur(60px)
layer 2 inner glow  opacity 0.5    blend screen   #00E0F8, blur(18px)   <-- inert
layer 1 core        3 stacked drop-shadows at coreIntensity 2.8         ok
wrapper opacity     0.92 (settles; floor 0.82 met)
```

`screen` computes `1 − (1 − backdrop)(1 − source)`; it can only lighten. The
backdrop here is `--paper` `#F7F8FA` ≈ 0.97 in every channel, so at full mask
alpha the layer's maximum contribution is

```
ΔR = 0,  ΔG ≈ 0.026,  ΔB ≈ 0.029   (before the layer's own 0.5 opacity)
```

— under 4/255, i.e. below perceptible. One of the four layers §F requires is
therefore not rendering at all, and the composite reads as the pale blue star
the client rejected rather than neon. (`screen` is correct on the inspiration
site, which is dark; it is a no-op on this light theme. BRIEF §3 sets the
precedent for adapting the inspiration's dark-background technique — "because
the background is light, replace the inspiration's dark text-shadows with light
ones".)

**Note on the §F floors.** All four numeric floors were *already* met and still
are: wrapper opacity 0.92 ≥ 0.82; core drop-shadow radii 11/31/67 px derived
from `coreIntensity` 2.8; inner 0.5 ≥ 0.28; outer 0.26 ≥ 0.08. The defect is
that meeting the inner-glow floor bought nothing because the layer was composited
in a mode that cannot show it. No floor was raised to paper over this.

**Fix.** `src/components/HaloLayer.tsx` — layer 2 drops `mix-blend-mode: screen`
and paints normally. Recorded as a deviation in `docs/BUILD-NOTES.md`.

**Re-tested.** All three glow spans now report `mix-blend-mode: normal` on both
the dev server and the production build, with their opacities unchanged
(0.34 / 0.26 / 0.5) and the wrapper still settling to 0.92. Visually the sparkle
went from a pale blue wash to a saturated cyan core with a blue bloom around it,
and it is still behind the bot (`z-0` under the canvas at `z-1`).

### M3 — Body copy fails the contrast floor: 2.89 : 1 against `--paper`

- **Requirement:** BRIEF §9 — "Contrast: body text ≥ 4.5:1 against `--paper`";
  BRIEF §3 — "Body text sits at `--steel-700`, muted/secondary at `--steel-500`".
- **Status: FIXED.**

**Reproduce.** Walk every rendered text node in `<main>`, group by computed
colour, compute the WCAG ratio against `#F7F8FA`.

**Observed (before fix)** — `--steel-500` `#8A94A3` on `--paper` = **2.89 : 1**,
used for genuine body copy:

| where | instances | size |
| --- | --- | --- |
| `InfoCard` card description (every feature card, portal card, process step) | 43 | 13.1 px |
| `Bento` cell description | 6 | 11.5 px |
| §I second paragraph, "A fee taken at the counter…" | 1 | 14.7 px |
| §01 footnote, "Thirteen modules: …" | 1 | 11.5 px |
| `StatCard` caption | 4 | 12.5 px |
| §13 "Takes about 60 seconds." / "Or write to us directly" | 2 | 11.2 px |

`--steel-700` `#4A5463` measures 7.11 : 1 and is what BRIEF §3 assigns to body
text, so this is a token misuse as well as an AA failure.

**Fix.** Those paragraphs moved to `text-steel-700`. Deliberately left at
`--steel-500`: eyebrows, rail inactive labels, footer column headings, chart
legends, the keyboard legend and the FAQ's inactive questions — every one of
those is specified as muted by BRIEF §5.5/§5.7 or CHANGES-V2 §G.3/§G.4. (See
P2 for the FAQ case.)

**Re-tested.** All **75** `.body-copy` paragraphs on the page now measure ≥ 4.5 : 1
against `--paper`; zero failing. Confirmed on the dev server and on the
production build.

Still below AA and deliberately left alone, because the briefs specify them as
muted rather than as body copy — listed here so nobody thinks they were missed:
the bento's chart micro-labels ("Billed", "Collected", "Present", "46%", voucher
reference numbers, 8–11 px), the keyboard legend's descriptions, and the FAQ's
inactive questions (P2).

---

## MINOR

### m1 — The bot is not visible on section 09 `platform`

- **Requirement:** CHANGES-V2 §G.1 — "The bot is a silhouette on the far-right
  edge (`model.position.x = 1.05`)."
- **Status: not fixed** (documented; see caveat).

On section 09 no part of the bot appears at the right edge. `model.position.x`
is `1.05` as specified and the static-PNG fallback places its centre at 100.4 %
of the viewport width (so half of it should show), but with the 3D layer mounted
the camera preset (azimuth 1.25, focus `[−0.34, 0.49, 0.78]`, distance 5.6)
appears to carry the model out of frame. I could not measure the projected
silhouette reliably — the 3D layer's contribution is only observable through a
screenshot, and the browser pane in this environment repeatedly stops producing
frames. Flagged for a human eyeball rather than changed, because "correcting" it
means hand-tuning a §D number, which §D and §B.2 forbid.

### m2 — Keyboard legend overlaps the dashboard bento at 1024 px

- **Requirement:** BRIEF §5.7 (legend `fixed bottom-8 right-8`), §9 (responsive
  at 1024).
- **Status: not fixed** (polish; overlay is translucent and non-blocking).

At 1024 × 768 the legend's box starts at x = 765 while two bento cells of
section 10 extend to x = 785 — a 20 px overlap over the "Enrollment share" and
"Messages" cells. No other section collides with the legend or the rail at 1024,
1440 or 1920. At 1440 and 1920 there is no collision anywhere.

### m3 — `CHANGES-V2.md` contradicts itself on the halo count (documentation)

- §D.5 and §L.5 say the halo appears on "7 of 15 sections"; the §D table marks
  **8** rows `visible: true` (00, 02, 04, 06, 10, 12, 13, 14).
- The implementation follows the table. Verified live by stepping all 15
  sections and reading the halo's settled opacity: on for `start`, `how-it-works`,
  `teachers`, `leave`, `dashboard`, `faq`, `contact`, `footer`; off for the other
  seven. Positions and diameters match the table's `x`/`y`/`d` after the §F
  clamping and ±30 px pointer parallax.
- **Status: not fixed** — this is a defect in the spec, not the code. Recorded
  in `BUILD-NOTES.md`.

---

## POLISH

### P1 — The effective wheel re-arm window is 580 ms, which makes `GESTURE_FLOOR_MS` dead

`scrollToStep` locks until `now + SCROLL_DURATION×1000 + SETTLE_MS` = 580 ms, so
a deliberate second flick inside that window is swallowed entirely (measured:
two flicks 450 ms apart → 1 section; 700 ms apart → 2 sections). This matches
§E.4/§E.5 as written ("SETTLE_MS — cooldown after the scroll lands"), but it
means `GESTURE_FLOOR_MS = 160` can never bind. Left as-is: it conforms to the
spec and tightening it would weaken the one-flick-one-section guarantee.

### P2 — FAQ inactive questions sit at 2.89 : 1

CHANGES-V2 §G.3 requires the non-active questions to be muted while the active
one is at full `--ink`. They render at `--steel-500` / 18.4 px serif = 2.89 : 1,
below AA (18.4 px non-bold does not qualify for the 3 : 1 large-text threshold).
Left as-is because §G.3 explicitly asks for the muting and they are `role="tab"`
controls, not body copy — but it is a genuine AA gap and a human should decide.

---

## Verified PASSING

Recorded so the next pass does not re-derive them.

**CHANGES-V2 §B / §M — the 3D bot**
- `.glb` loads from `/models/school-bot.opt.glb`; Draco decoder served from
  `/draco/draco_wasm_wrapper.js` + `/draco/draco_decoder.wasm`. Network panel
  across a full load shows **zero** requests to any host but the dev server.
- Lazy chunk: `BotCanvas.tsx` + `three` + `drei` + `postprocessing` are requested
  only after first paint, and never at all on a coarse pointer.
- Model is normalised at runtime from its measured bounding box (`BotModel.tsx`),
  not a hard-coded factor, as §M requires.
- Fallback matrix honoured: coarse pointer → no canvas, no `.glb`, `schoolbot.png`
  shown instead (verified at 375 × 812 — `canvasPresent: false`, no `.glb` request
  on that load); error boundary present (`BotBoundary`).

**§C — damping**
- `DAMPING` values are the shipped ones, verbatim. Every channel in `SceneRig`
  uses `damp()` with `dt` in the exponent; `clampDt` caps at 1/30 s. No
  fixed-duration tween anywhere in the rig. (Runtime smoothness under CPU
  throttle — see *Not verifiable*.)

**§E — one scroll, one section** (all measured with the pane awake and
`setTimeout` resolution confirmed at ~16 ms)

| test | result |
| --- | --- |
| one mouse flick (`deltaY` 120) | +1 section ✓ |
| **hard continuous spin — 60 events × 240, 844 ms** | **+1 section ✓** |
| two flicks 700 ms apart | +2 sections ✓ |
| one flick up | −1 section ✓ |
| trackpad burst 20 × 8 (=160 ≥ 70) | +1 ✓ |
| trackpad 5 × 8 (=40 < 70) | 0 ✓ |
| `deltaMode: 1`, `deltaY: 3` (→ 48 ≥ 35) | +1 ✓ |
| sub-steps §E.7 | `dashboard` (914 px) and `footer` (1003 px) exceed the 900 px viewport and each get 2 stops ✓ |

**§F — halo** — position/diameter/opacity damp at 5.1 toward the §D preset;
spin 80 s, breathe 12 s, pulse 4 s with a −1.4 s offset so they never sync;
parallax is sign-flipped against the bot's; layer is `z-0`, below the canvas
(`z-1`) and the hairlines (`z-3`). Appears on exactly the 8 sections the §D table
marks visible.

**§G.2 — bento** — all six cells present with the §G.2 titles (Collection by
campus, Enrollment share, Today's register, Vouchers, Staff KPIs, Messages),
each an `.info-card` with the §5.9 hover and `tabIndex=0`.

**§G.3 — FAQ panel** — one bordered panel, `IN DETAIL` eyebrow, three
`role="tab"` questions, a `role="tabpanel"` answer below the stack, roving
tabindex with Enter/Space activation and arrow/Home/End movement.

**§G.4 — footer** — eyebrow, logo, blurb, social row, `(ASK AI ABOUT SCHOOL HUB)`
with four circular buttons, five link columns (Navigation · Platform · Contact /
Trust · Legal) laid out 3-then-2, divider, copyright, `RENDERED IN REAL TIME ·
WEBGL`. 30 links.

**§I — node diagram** — one SVG, 17 paths, 6 `linearGradient`s, 10 SMIL
`<animate>` elements, 4 keyboard-focusable source nodes. Confirmed *running*:
`svg.getCurrentTime()` = 66.09 s and the first gradient's `x1.animVal` had
travelled to 330 (the hub x), so the travelling stop is live and not a static
gradient.

**BRIEF §5.9 — card hover** — `.info-card` carries 8 rules: border → `ink/.35`,
background → white, `0 18px 50px -20px rgba(1,17,46,.28)`, `translateY(-4px)`,
rule `1rem → 3rem` in the accent, index fading up, all on 450 ms
`cubic-bezier(.22,1,.36,1)`, and every one duplicated on `:focus-within`. The
`::before` spotlight is a `radial-gradient(… at var(--mx) var(--my) …)` and
`--mx`/`--my` were confirmed to update on `mousemove` (39.86 px / 24.45 px on a
synthetic move).

**BRIEF §9 — accessibility**
- Skip link to `#main` is present and is the document's first focusable element.
- One `<h1>`; all 15 sections are `<section aria-labelledby>` pointing at a real
  heading element.
- Rail and header links are real `<a href="#…">`; active carries
  `aria-current="true"`.
- Focus rings: confirmed with real `Tab` presses —
  `:focus-visible` matches and paints `0 0 0 2px #F7F8FA, 0 0 0 3px rgba(1,17,46,.6)`.
- Mobile menu: `role="dialog"`, `aria-modal="true"`, focus moves inside on open,
  17 links, `body` locked, `Esc` closes and restores the lock.
- Keyboard: ↑/↓/W/S/K/L/Esc all wired (K → contact, L → opens the login URL);
  all ignored while focus is inside an `<input>`; the legend's `aria-pressed`
  pill genuinely detaches the handlers (arrow keys move nothing while off,
  move again once re-enabled) and the `dl` takes `opacity-40`.
- Responsive: no horizontal overflow at 360, 768, 1024, 1440 or 1920. Rail,
  hairlines, keyboard legend and the isometric plane are all `display: none`
  below `lg`; hamburger appears.

**§L.2 / §L.7 / §L.9**
- No `<video>`, `HeroVideo`, `useVideoScrub` or `bot-video` reference survives in
  `src/` or `index.html`.
- Grep for every §H.1 offender across `src/` returns one hit, and it is the
  explanatory comment at the top of `content.ts` that states the rule.
- No external URLs in source beyond the product's own domain and the social
  links.
- Fresh load of the dev server and of the production preview: no console errors.

---

## NOT VERIFIABLE IN THIS ENVIRONMENT

These are **not** marked as passing.

1. **§L.4 / §C — "throttle the CPU and confirm the camera stays smooth."**
   The browser pane used for testing intermittently stops producing frames
   altogether: `requestAnimationFrame` was measured at **0 fps** on several
   occasions and at ~10 fps otherwise, and screenshots came back as a uniform
   blank page while the DOM was fully rendered. Under those conditions a
   smoothness measurement is meaningless, and adding a CPU throttle on top of it
   would measure the harness, not the site. What *is* verified is structural:
   `SceneRig` damps every channel per frame with `dt` in the exponent and clamps
   `dt` to 1/30 s, which is the property §C says guarantees judder-freedom.
   **A human should confirm this by hand with devtools CPU throttling.**

2. **Reduced motion.** There is no `prefers-reduced-motion` media emulation
   available through the tooling here, and the OS setting cannot be changed from
   the page. Not tested at runtime. By inspection the gates are all present:
   `canRender3D()` returns false when `reduced`, so the `.glb` and the three.js
   chunk are never requested; `useTypewriter` and `useCountUp` short-circuit to
   the final value; `HaloLayer`, `StaticBot`, `Bento`'s voucher/typing loops and
   the `.halo-*`/`bot-float`/`glow-pulse`/`iso-drift` classes are all gated; and
   `index.css` carries a global `@media (prefers-reduced-motion: reduce)` block
   that flattens every animation and transition. **Needs a manual pass with the
   OS setting on.**

3. **Real `:hover` rendering.** Pointer hover cannot be held by the automation,
   so the §5.9 hover was verified as CSS rules + live `--mx`/`--my` tracking
   rather than as a rendered frame. The `:focus-within` half of the same
   treatment *was* verified with real Tab focus.

4. **Side note on a symptom you may hit.** When frame production stops, Lenis's
   `scrollTo(..., { lock: true })` never completes, so `<html>` is left with
   `lenis-locked lenis-scrolling` and no further programmatic scroll takes
   effect until frames resume. This is a consequence of the harness, not a site
   defect — it recovers as soon as rAF fires again — but it will make a hidden
   pane look like a frozen page.

5. **Second side note: the dev server served one stale module.** After the M3
   edits, `http://localhost:5173/src/components/ContactForm.tsx` kept returning
   the pre-edit transform (`text-steel-500`) even across full page loads, while
   every other edited file updated correctly. Touching the file forced Vite to
   re-transform it and the served output matched disk. Worth knowing before
   concluding a fix "didn't take": check the served module, not just the render.
