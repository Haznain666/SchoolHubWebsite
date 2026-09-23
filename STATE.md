# STATE.md — School Hub marketing website

**The handover file.** A new session reads this first and can resume without
re-deriving anything. Update it at the end of every working session.

This is the *website* project. It is **not** the SaaS product. The product's own
state file is `../STATE.md` (17k lines, about the Next.js/Supabase app at
`schoolhub.codexmill.com`) — read it only when you need product facts, and grep
rather than open it.

---

## 1. What this is

A single-page marketing site for **School Hub**, a multi-tenant school
management SaaS for Pakistani schools. Marketing only: no backend, no database,
no auth, no analytics. The contact form is inert by design.

**Project root:** `D:\School-Management-Website\School-Management-Website\schoolhub-website`

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  → dist/
npm run preview    # http://localhost:4173, serves dist/
npm run typecheck
npm run lint       # eslint --max-warnings 0
```

Stack: **Vite 5 · React 18 · TypeScript (strict) · Tailwind v3 · Framer Motion ·
Lenis · three.js + @react-three/fiber + drei + postprocessing**. Fonts are
self-hosted via `@fontsource`. **Nothing is fetched from a CDN at runtime** —
that is a hard requirement and it is tested.

---

## 2. The documents, and which one wins

| File | Status |
| --- | --- |
| `docs/CHANGES-V2.md` | **Authoritative.** Supersedes the brief wherever they conflict. Scene presets, scroll machine, halo, infographics, copy rules. |
| `docs/BRIEF.md` | Still authoritative for: §2 stack, §3 brand tokens + typography, §5.1 scene layout, §5.4 hairlines, §5.5 rail, §5.6 header, §5.7 keyboard legend, §5.9 card hover, §6 CTAs, §9 accessibility. Its §5.2, §5.3, §5.8, §5.10, §7, §8 are **superseded**. |
| `docs/QA-REPORT.md` | QA pass of 2026-09-23. 1 blocker + 3 majors fixed, 3 minors + 2 polish open. |
| `docs/BUILD-NOTES.md` | Nine recorded deviations from spec, with reasons. |

⚠ **There is no bloom pass, and it should not come back.** `BotCanvas` rendered
one for three revisions and the client rejected it three times — "trapped in an
egg shell", then "a layer of white glaze covering the bot". The root cause is
that postprocessing's `luminanceThreshold` is applied AFTER ACES tone mapping,
which compresses everything bright into a narrow band near 1.0: polished chrome
specular and the emissive cyan both land at ~0.93-0.98, so **no threshold can
separate them**. Any bloom strong enough to light the eyes also veils the body.
Removed 2026-09-23 along with `@react-three/postprocessing` (BotCanvas chunk
1022 kB -> 932 kB). The cost is that the eyes read as pale cyan rather than
vivid cyan — bloom was what saturated them — so if that needs lifting, the lever
is `EMISSIVE_PATCH`'s multiplier in `BotModel.tsx`, NOT a new bloom pass.

⚠ **Known spec bug:** `CHANGES-V2.md` §D.5 and §L.5 say the halo is on "7 of 15"
sections; its own §D table marks **8**. The code follows the table. The prose is
wrong, not the code.

---

## 3. Two standing client rules — do not violate these

1. **No explainer filler in copy.** No implementation asides written for an
   engineer ("integer paise", "refused at the write", "computed, not stored",
   anything naming a column, permission key, route or storage type). The client
   calls these "AI slop" and the instruction covers the *category*. If a
   sentence only makes sense to someone who has read the schema, cut it.
2. **Every person named anywhere is Western.** Alex Morgan, John Carter, Mike
   Bennett, Emily Hart, Sarah Whitfield, Daniel Reed, Laura Finch. Never copy
   names or figures from the live Askari tenant — those are real students.

---

## 4. Architecture, in one pass

```
src/
  data/sections.ts     ← SINGLE SOURCE OF TRUTH. 13 sections: id, num, rail
                         label, eyebrow, align, and the full 3D scene preset
                         (camera + model + halo). The rail, header nav,
                         keyboard nav and every fixed layer read from here.
  data/content.ts      ← all marketing copy, typed
  hooks/useSectionScroll.ts  ← the wheel state machine + Lenis scrollTo
  components/bot/      ← BotCanvas (r3f), BotModel (glb + material patch),
                         SceneRig (per-frame damping), BotBoundary
  components/HaloLayer.tsx   ← the two neon sparkles
  components/IsoPlane.tsx    ← §07 isometric card plane (3x3, near row = charts)
  components/Bento.tsx       ← §08 dashboard grid
  components/TravellingGradient.tsx
                             ← the SMIL pulse that lights a flow line. Shared
                               by §02's portal diagram and §09's onboarding
                               flow, so the two are the SAME animation rather
                               than two that merely resemble each other.
```

### The depth stack (App.tsx)

```
z-0   HaloLayer      — always behind the bot
z-1   BotCanvas      — the 3D layer
z-2   Scrim          — light gradient, behind the copy column only
z-3   Hairlines      — four vertical steel rules
z-10  the page
```

### Motion model — this is the important one

Nothing tweens on a fixed duration. Every scene channel is **exponentially
damped per frame**, `value += (target − value) * (1 − exp(−rate * dt))`, with
`dt` clamped to 1/30. Rates live in `src/lib/damp.ts` (`camPos 6.4`,
`camTarget 7.6`, `modelPos 6.8`, `modelRot 7.6`, `halo 5.1`, `light 3.4`).

Three properties fall out and all three are wanted: it cannot judder on a late
frame; channels settle at different times so nothing lands at once; and it never
fully arrives, which *is* the "keeps animating while you sit on a section"
quality. **Do not replace this with a tween, and do not add a separate idle
loop.**

⚠ **The camera is damped in ORBIT space, not world XYZ — keep it that way.**
`SceneRig` damps `azimuth`, `elevation` and `distance` separately and converts
to a position each frame; `dampAngle` wraps the azimuth into (−π, π] so the
short arc is always taken. Damping the Cartesian position instead interpolates
along the *chord* between two points on the orbit sphere, and a chord always
passes nearer the origin than the arc: measured over the shipped presets, 9 of
the 12 adjacent transitions dipped inside both endpoints, and `messaging →
performance` dived to radius 0.877 where neither end is closer than 2.732 — the
bot swelled to **3.1× its correct size** mid-transition before shrinking back.
That is the client's *"the bot zooms out to a huge size before getting back to
the actual position"*. `platform → dashboard` was 2.3×; the rest 1.06–1.19×,
which is the low-grade "jerky" on every other move.

### The scroll machine

`preventDefault()` on every wheel event — the document never free-scrolls.
Thresholds 35 (mouse) / 70 (trackpad); **re-arm needs 140 ms of wheel silence**,
so one continuous flick moves exactly one section however hard you spin. Travel
is `lenis.scrollTo(..., { duration: 0.34, easing: easeInOutCubic, lock: true })`,
settle 40 ms. Lenis runs `{ lerp: 0.09, smoothWheel: false }` — it is only the
animated `scrollTo` engine. Touch keeps native scrolling.

⚠ **`syncFromScroll` bails while `lockedUntilRef` is in the future — do not
remove that guard.** `scrollToStep` publishes the destination index up front,
but the scroll listener runs on every frame of the 0.34 s travel and picks the
*nearest* stop, which for the first half of the journey is still the one being
left. The active index therefore went destination → origin → destination inside
340 ms, which the rig renders as the bot setting off, stopping dead, and setting
off again — the client's *"the bot moves then stops and then moves to the actual
position"*. A nav-bar jump across several sections was worse: the sweep dragged
the index through every intervening stop, so the bot tried to strike each pose
on the way past.

### The 3D bot

`public/models/school-bot.opt.glb` — **1.62 MB, Draco.** Compressed from a
9.98 MB master now kept outside `public/` at `assets-src/models/school-bot.glb`
so it is not shipped. The Draco decoder is bundled at `public/draco/`;
`useGLTF.setDecoderPath('/draco/')`. **Never point it at a CDN.**

The model is normalised at runtime (bounding box → centred, largest dimension
scaled to 1), so every preset number assumes a unit model. Size on screen comes
from camera `distance` and `fov`, **never** from model scale.

Fallback to `schoolbot.png` in exactly three cases — reduced motion, no WebGL2,
loader error. It is **not** a loading placeholder; see §6.

**A coarse pointer is no longer one of them.** Phones used to get the flat PNG
at full opacity sitting on top of the copy, which is what the client flagged as
*"the mobile responsive view still uses the old bot image"*. They now get the
real model, tuned three ways:

| where | what | why |
| --- | --- | --- |
| `SceneRig.COMPACT` | distance ×1.62, lateral offset ×0.12, vertical ×0.4 | the §D table frames a two-column landscape viewport; on one column the lateral offset throws the model off a 390 px screen and the framing distance fills it |
| `BotLayer.MOBILE_OPACITY` | canvas at 0.42 | the model is directly behind the words, not beside them |
| `BotCanvas` | `dpr` capped at 1.5 (desktop 2) | a handset's DPR is routinely 3, and a full-screen WebGL canvas at 3× is the most expensive thing on the page |

The scrim is also switched below `md` from the two horizontal washes to one
full-width vertical one: the horizontal gradients have faded out by 68% of the
width, which on a phone left the right third of every line on bare metal.
Composited, the model reads at ~0.18 against the paper and body copy keeps
about 5:1.

**Cost, and it is not small:** a phone now pulls the 1.62 MB Draco `.glb` (it is
already compressed, so gzip saves ~8 kB), the ~250 kB Draco decoder and the
264 kB gzipped `BotCanvas` chunk — roughly 2.1 MB, all after first paint. Until
it lands the frame has no subject at all, because the PNG is suppressed whenever
the 3D layer is going to run. That is the standing "no loading flash" rule
applied to a much longer wait; revisit it with the client if it reads badly on a
real connection.

---

## 5. Scene presets — the rule that governs them

`src/data/sections.ts`, one preset per section. Two invariants:

1. **The bot sits opposite the copy.** `align: 'start'` (copy left) → positive
   `model.position.x`; `align: 'end'` (copy right) → negative. Section 10 is the
   documented exception (see §6).
2. **Apparent facing** is `model.yaw − camera.azimuth`. Keep `|turn| ≤ 0.5` rad
   so the bot always looks at the copy or at the viewer, **never away**.

⚠ **Two sign traps, both hit on 2026-09-23.**

**Facing.** `turn = model.yaw − camera.azimuth`. A **negative** turn faces the
bot toward **screen-left**, a **positive** turn toward **screen-right**. So a
copy-LEFT section needs a NEGATIVE turn and a copy-RIGHT section a POSITIVE one.
An earlier pass had this exactly backwards.

**Position — this is the subtle one.** `model.position.x` is *not* the screen
position. The camera aims at `focus`, so the on-screen offset is

```
screenX = (model.x − focus.x)·cos(az) + (model.z − focus.z)·(−sin az)
```

A check that compared `model.position.x` against zero reported "0 violations"
while six sections actually had the bot on the wrong side — `numbers` read
`x −0.50` and rendered at `+0.68`, on the right, behind the stat cards.

**The presets now park the model at the origin and aim the camera instead.**
For a model at the origin, `screenX = −focus.x·cos(az) + focus.z·sin(az)`, so
the solve uses whichever of `focus.x` / `focus.z` has the larger trig
coefficient — that keeps `|focus|` bounded near `az = ±π/2`, where solving on
the small axis would explode (at `az = 1.45`, `cos(az) = 0.12`).

Verify the invariants without opening a browser:

```bash
python scripts/verify-presets.py
```

It prints every section's true `screenX` and `turn` and exits non-zero on any
violation. It is mutation-tested: flipping the sign of one section's `focus.x`
makes it fail with that section named. `dashboard` is the one documented
exception to the side rule (§6). Last run: **PASS, 13/13, 0 violations**.
Expected: `screenX` **positive** for `align: start`, **negative** for
`align: end`; `turn` **negative** for `align: start`, **positive** for
`align: end`. `dashboard` is the one documented exception to the side rule
(§6). Last run: **0 violations / 15**.
Expected: `screenX` positive for `align: start`, negative for `align: end`;
`turn` negative for `align: start`, positive for `align: end`. `dashboard` is
the one documented exception to the side rule — see §6.


---

## 6. What changed on 2026-09-23, and why

Client review produced five corrections. All are done except the infographics
redesign.

**✅ The white "egg shell" around the bot was bloom, not an overlay.**
`luminanceThreshold: 0.62` sat *below* the brushed metal's own luminance, so the
whole body cleared it and `mipmapBlur` at `radius: 0.72` smeared a white shell
around the silhouette. Now `threshold 0.95 / radius 0.3 / intensity 0.7`, so only
the emissive cyan blooms. **If the shell ever returns, this threshold is the
first thing to check.**

**✅ Gloss.** On a fully metallic body, shine is roughness + reflection, not
lighting. `BotModel.patchMaterial` forces `metalness 1`, clamps `roughness ≤ 0.18`
and raises `envMapIntensity` to 1.9.

**✅ Two halos, fluorescent, distant.** The four-layer composite read as a pale
smear. Now two `<Sparkle>` instances — one near, one smaller/dimmer offset behind
— each with a single soft bleed. `DISTANCE_SCALE = 0.6` in `HaloLayer.tsx` scales
every §D diameter to push the pair back. They breathe on 12 s and 19 s with an
offset phase so they never sync.

**✅ Mouse tracking was imperceptible.** The spec's ±0.12/±0.08 rad is 7°/5° on a
subject filling the viewport. Now `HEAD_YAW 0.46 / HEAD_PITCH 0.25` at rate 6.5,
plus `HEAD_DRIFT 0.12` of lateral body sway so the whole bot follows rather than
the head pivoting alone.

**✅ Scroll jank had a specific cause.** `activeIndex` updates every frame of a
scroll, and all fifteen sections were children of that state — React reconciled
the whole page ~60×/s *during* the animation. `App.tsx` now memoises the page on
`reduced` alone; only the fixed layers and chrome re-render. **Do not un-memoise
it.** Travel also cut 0.5 s → 0.34 s, settle 80 ms → 40 ms.

**✅ The loading flash.** `schoolbot.png` used to render under the canvas and fade
out when the model resolved, so everyone saw the flat matte still first. The
client asked for it gone permanently. `BotLayer` now renders nothing when the 3D
layer is going to run; the PNG only appears in the four genuine fallback cases.

**✅ Bot missing on §09 / §10.** Both had the bot on the *same side as the copy*
and pushed to ±1.05 — off-frame. §09 moved to the free lower-left (the iso cards
bleed top-left, the copy is centre-right). §10 is the exception to invariant 1:
its bento grid runs x≈248→1185 of 1440 and the left is taken by the rail and copy
column, so **the only clear gutter is on the right** and the bot sits at +0.85.

**✅ §09 blocker (QA).** All nine iso cards rendered *above* their wrapper and were
clipped by `overflow: hidden`, leaving the section empty. `rotateX(52deg)
rotateZ(-38deg)` about origin `0 0` projects the plane **upward**, so `top: -30vh`
put everything off the top. Now `left: -13vw; top: 15vh`. 8 of 9 cards in frame
at 1440×900.

---

## 7. Open work — start here

1. ✅ **Closed 2026-09-23 — the infographics redesign is CANCELLED.** The client
   ruled it out explicitly: *"no re-design for section 9 or 10."* §09's iso-plane
   and §10's bento both stay exactly as they are. Ignore the "Work that works"
   target in `docs/CHANGES-V2.md` §G.1 — do not reopen this.
2. ✅ **Closed 2026-09-23.** All 13 sections satisfy both invariants, checked
   with the focus-aware formula above: **0 violations**.
3. 🟡 Client has not yet confirmed the reworked hero (bot bigger at
   `distance 4.9`, moved left to `x 0.28`, facing the text at `turn −0.34`;
   halos +20% to `d 0.456` and moved right to `x 0.76`).
4. ✅ **Closed 2026-09-24 — both motion fixes verified live.** The pane was
   brought up and the camera radius sampled per frame across four real jumps
   (`messaging → performance`, `→ platform`, `→ contact`, `→ start`). In every
   one the radius stayed inside the interval between the two endpoints
   (`dippedBelowBothEnds: false`) and `aria-current` reported exactly **one**
   section for the whole travel — no sweep through intermediates, even on the
   eleven-section jump back to the hero. `messaging → performance` ran
   2.753 → 2.841 monotonically; under the old Cartesian damping the same move
   dived to 0.877.
5. 🟡 Three QA items could not be verified in this environment and are **not**
   marked as passing: damping under CPU throttle, reduced motion, real `:hover`.
   Each needs a manual devtools pass.
6. 🟢 Minor, documented, unfixed: keyboard legend overlaps two bento cells by
   20 px at 1024×768; FAQ inactive questions are below AA but §G.3 requires them
   muted.

---

### ⚠ `.detail-list` needs its surface — do not delete `.detail-list::before`

The rule/title/text rows on §06 and §08 are transparent, as the client's
reference is. That reference had no chrome robot behind it. Measured at 1440px,
the model's projected box covers **80% of the copy column on §06 and 75% on
§08** — the six-card grid the rows replaced was hiding that with an opaque
paper panel per card, and removing the cards removed the masking with them, so
the first build put the bot's eyes directly behind "Four portals".

`.detail-list::before` is the single frosted sheet that replaces it: 62% paper,
9px blur, inset past the rows on all four sides, `z-index: -1` inside an
`isolation: isolate` context so it cannot fall behind the canvas. One sheet, not
one per row — per-row surfaces would just be the cards again.

For reference, §04 Students runs 67% overlap and always has; substantial
bot-behind-copy is normal here, and every copy block is expected to carry its
own legibility.

---

## 8. Hazards — read before debugging

⚠ **The Claude browser pane is not a reliable renderer.** When it is hidden,
behind another window, or collapsed small: `requestAnimationFrame` stops firing
(so the 3D canvas never mounts and damped motion never runs), screenshots return
a **uniform blank `#F7F8FA` page over a fully-rendered DOM**, and `setTimeout` is
clamped to ~1 s, which silently breaks any timing test. **Never conclude "section
X is blank" from a screenshot.** Corroborate with `getBoundingClientRect`,
`getComputedStyle` and `elementFromPoint` first. Hours were lost to this twice.

Note that `document.visibilityState` still reports `"visible"` while this is
happening, so it is not a usable test. Probe the frame loop directly instead —
count callbacks over ~600 ms:

```js
const t0 = performance.now();
await new Promise(res => { let n = 0;
  const tick = () => { n++; performance.now() - t0 < 600 ? requestAnimationFrame(tick) : res(n); };
  requestAnimationFrame(tick); setTimeout(() => res(n), 1500); });
```

A result of `0` means nothing on the page is animating or rendering: no three.js
frames, no framer-motion, no CSS transitions. Stop and ask for the pane to be
shown rather than trying to verify anything visual.

For poses specifically there is a way round it. In dev builds `<SceneRig>`
publishes `window.__schoolhubScene = { camera, model }` (stripped from
production — `grep __schoolhubScene dist/` returns nothing). With the frame loop
alive, that lets a gaze be **projected** onto the heading's DOM rect and checked
numerically, instead of squinting at a render. Given how often the §D sign
conventions have been got backwards, prefer that to eyeballing.

⚠ **Vite serves stale modules.** A `ContactForm.tsx` edit was served stale across
full reloads; touching the file fixed it. If a fix appears not to land, check the
served module before changing more code.

✅ **`RangeError: Invalid array length` on boot — FIXED 2026-09-23, and this
entry previously blamed the wrong thing.** It was recorded here as a stale
pre-bundle artefact that "looked like an infinite effect loop and was not". It
was exactly an infinite effect loop, and clearing `node_modules/.vite` only ever
hid it by chance. `useSectionScroll`'s `measure()` divides by `vh * 0.8`; when
`window.innerHeight` is 0 — hidden pane, collapsed window, pre-layout — that
made `subSteps` `Infinity` and the loop pushed into `steps` until the array
exceeded its maximum length. The `RangeError` escapes a passive effect, so React
unmounts everything and you get a blank page whose stack points at react-dom.
`measure()` now bails at `vh <= 0` and `subSteps` is capped at `MAX_SUB_STEPS`.

The lesson: the stack said react-dom, but react-dom was only the messenger. The
truncated top frames are the ones that matter — capture them with a real
`addEventListener('error')` probe rather than reading the console tool's elided
output.

⚠ **`npm run build` runs `tsc --noEmit` first**, so a type error fails the build.

⚠ The uncompressed master `.glb` must stay out of `public/` — it was shipping in
`dist/` and cost 10 MB (16 MB → 6.4 MB when moved).

---

## 9. Current status

Build, typecheck and lint all clean; `verify-presets.py` **PASS 13/13**. Main
bundle 213 kB (67 kB gzip); three.js split into the lazy 955 kB `BotCanvas`
chunk (264 kB gzip). No external network requests.

**Last updated:** 2026-09-24 — `changes.pdf` round: orbit-space camera damping
and the `syncFromScroll` guard (the two halves of the jerky/ballooning bot),
Messaging and Performance moved to the four-row `DetailList`, frosted-pill
header off the hero, `hello@getschoolhub.com` and Karachi everywhere, hero chips
to Academics/Admin/Accounts/HR/Parents/Students, and the 3D bot enabled on
phones with a full mobile type/tap-target pass.
