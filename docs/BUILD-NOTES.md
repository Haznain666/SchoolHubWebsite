# Build notes — revision 2

Required by `CHANGES-V2.md` §L.10: everything deviated from, and why.

Written during the QA pass. Items 1–4 predate that pass and were reconstructed
by reading the code; items 5–8 were introduced by it. Defect detail and test
evidence live in `QA-REPORT.md`.

---

## 1. `FRAME_FILL` — the §D camera distances are divided by 1.83

**Spec:** §B.2 "scale so its largest dimension is exactly 1 unit"; §D's table of
`distance`/`fov`; §B.3 "60–90% of viewport height"; §D "Do not hand-tune scale
per section — §D drives size through camera `distance` and `fov`, never through
model scale."

**Deviation:** `src/data/sections.ts` exports `FRAME_FILL = 1.83` and
`framedDistance(d) = d / FRAME_FILL`. Both `SceneRig` and the PNG fallback frame
through it.

**Why:** the two requirements are arithmetically incompatible as written. §M
records the model's bounding box as 1.9 units tall, and §D's distances were
authored against the model at that native size. Normalising the largest
dimension to 1 unit (§B.2) makes the subject 1.9× smaller, which at §D's
distances puts it at 25–49% of viewport height — the "too much blank space" the
client rejected in build 1 (§A item 6). Dividing the *distance* restores §B.3's
framing while leaving every §D number, every world coordinate and every relative
relationship between sections untouched, and it keeps size driven by `distance`
and `fov` rather than by model scale, which is what §D actually forbids.

**Measured result** (`apparentHeight()` across all fifteen presets):

```
00 65%  01 68%  02 76%  03 90%  04 77%  05 68%  06 74%  07 79%
08 76%  09 71%  10 76%  11 69%  12 73%  13 46%  14 73%
```

14 of 15 land inside §B.3's 60–90% band. 03 `students` is at exactly 90% and 13
`contact` at 46% — which is what §D.5 asks for: "`dist` 5.0 (section 03) is the
closest and biggest; `dist` 8.6 (section 13) is the widest, where the bot
becomes a small shape and the copy centres."

**Why measured, not hard-coded:** the normalisation itself still reads the
bounding box at runtime (`BotModel.tsx`), exactly as §M requires, so a
re-exported model cannot silently change the framing of all fifteen sections.

---

## 2. The cursor-follow offsets are applied to the whole model, not a head bone

**Spec:** §B.4 "Add a small additive yaw/pitch offset on the head bone (or on the
whole model if the head is not separable)".

**Deviation, sanctioned by the spec's own parenthesis:** `school-bot.opt.glb` is
a single mesh with one PBR material and no skeleton, so there is no head bone to
drive. `SceneRig` therefore composes the ±0.12 rad yaw / ±0.08 rad pitch onto
the whole model, damped at rate 4.0, *after* the section pose has been damped —
never replacing it, as §B.4 requires.

---

## 3. The cyan emissive is derived in the shader, not authored on a material

**Spec:** §B.2 "emissive cyan (`#00E0F8`) on the eye and chest-ring materials so
they read as lit".

**Deviation:** the model ships one material for the entire body, so there is no
eye or ring material to assign an emissive to. `BotModel.tsx` patches the
standard material's fragment shader instead: it measures how cyan each sampled
texel is and adds emissive radiance in proportion. Neutral gunmetal scores zero
and stays metal; the eyes and accent rings light up and clear the bloom
threshold. The visible result is what §B.2 asks for; the mechanism is not.

## 3b. The environment is a local studio, not an HDRI

`BotCanvas.tsx` builds the surround from `<Lightformer>`s plus a flat background
colour rather than loading an environment map. drei's preset environments are
CDN-hosted, and §M's no-CDN rule ("the network panel must show no request to any
host other than the dev server") applies to the whole scene, not only to the
Draco decoder. The body is fully metallic, so without *some* bright near-neutral
surround it renders navy instead of the brushed silver in `Bot images/1.jpg`.

---

## 4. The uncompressed master model lives in `assets-src/models/`

**Spec:** §M "Keep `school-bot.glb` in the repo as the master; ship the `.opt`
file."

**Deviation:** the 9.98 MB master is at `assets-src/models/school-bot.glb`, not
under `public/`. It is still in the repo, as §M requires — but anything in
`public/` is copied verbatim into `dist/`, which would have shipped the master
alongside the 1.62 MB file that actually loads. `dist/` is 6.4 MB with the master
moved out, and `dist/models/` contains only `school-bot.opt.glb`.

---

## 5. The halo's inner glow does not use `mix-blend-mode: screen`

**Spec:** §F layer 2 — "the same glyph scaled ~1.4×, blurred ~18px,
`mix-blend-mode: screen`, in `#00E0F8`".

**Deviation:** `HaloLayer.tsx` paints that layer with normal blending.

**Why:** `screen` computes `1 − (1 − backdrop)(1 − source)` and can only
lighten. The inspiration site is dark, so screen is how its halo blooms. This
site's background is `--paper` `#F7F8FA` ≈ 0.97 in every channel, so the layer's
largest possible contribution over it is `ΔR = 0, ΔG ≈ 0.026, ΔB ≈ 0.029` before
its own 0.5 opacity — under 4/255, i.e. invisible. Following §F literally meant
one of its four required composite layers rendered nothing, and the halo stayed
the pale blue the client rejected in §A item 4.

This is the same adaptation BRIEF §3 already makes for the light theme —
"because the background is light, replace the inspiration's dark text-shadows
with light ones". **No §F floor was changed to compensate**: opacity 0.92 ≥ 0.82,
`coreIntensity` 2.8, inner 0.5 ≥ 0.28, outer 0.26 ≥ 0.08 were all already met and
still are. Only the compositing mode changed, so that meeting the inner-glow
floor now buys something.

---

## 6. The isometric plane's origin is below the cards, not above them

**Spec:** §G.1 "The plane's origin sits **outside** the viewport, top-left. Cards
are cropped by the top and left edges."

**Deviation:** `.iso-plane` is at `left: -13vw; top: 15vh` (2xl: `-9vw / 13vh`).
The origin is outside the viewport off the **left** edge, but not above the top
edge.

**Why:** `rotateX(52deg) rotateZ(-38deg)` about `transform-origin: 0 0` projects
a plane point `(x, y)` to screen `(0.788x + 0.616y, −0.379x + 0.485y)` — the
plane extends *upward* and to the right of its origin. Over the nine-card grid
the projected Y spans only −290 px to +267 px. Build 1's `top: -30vh` therefore
put every card above the fold, where `.iso-wrap { overflow: hidden }` clipped
them and the section rendered completely empty (QA-REPORT B1). For the cards to
land in the viewport's top-left at all, the origin has to sit below them.

Everything §G.1 actually asks for is delivered: verified at 1024, 1440 and 1920,
three cards are cropped by the top edge, two by the left edge, and the plane is
not fitted on screen. Card geometry, the three depth tiers, their blur/opacity
values and the per-card drift periods are untouched.

---

## 7. `Home` and `End` are handled beyond §E.10's list

**Spec:** §E.10 "Keyboard (↑/↓/W/S/PageUp/PageDown) drives the same
`next()`/`prev()`."

**Addition:** `useKeyboardNav` also handles `Home` and `End`, mapped to the first
and last section.

**Why:** the reason §E.10 names PageUp/PageDown is that an unhandled native
scroll key walks the document out from under the wheel state machine's step
index. `Home` and `End` scroll natively for exactly the same reason and would
have re-introduced the same desynchronisation. They are `preventDefault`ed with
the rest, and — like every other shortcut — ignored while focus is inside a form
field, so they still work as caret keys when typing.

---

## 8. Body copy moved from `--steel-500` to `--steel-700`

Not a deviation — a correction. BRIEF §3 assigns body text to `--steel-700` and
`--steel-500` to muted/secondary only, and BRIEF §9 requires body text at
≥ 4.5 : 1 against `--paper`. `--steel-500` measures 2.89 : 1 and was being used
for every infographic-card description, the §I second paragraph, the §01
footnote, the stat captions and the bento cell descriptions. All 75 `.body-copy`
paragraphs now pass; eyebrows, rail labels, footer column headings, chart
legends, the keyboard legend and the FAQ's inactive questions stay muted because
BRIEF §5.5/§5.7 and §G.3/§G.4 specify them that way.

---

## 9. A contradiction in `CHANGES-V2.md` itself

§D.5 and §L.5 both say the halo appears on "7 of 15 sections". The §D table
marks **8** rows `visible: true`: 00 `start`, 02 `how-it-works`, 04 `teachers`,
06 `leave`, 10 `dashboard`, 12 `faq`, 13 `contact`, 14 `footer`. The table is
self-consistent — §D.5's other rule, "never two adjacent ones except 13→14",
only makes sense with 13 and 14 both visible — so the implementation follows the
table and renders the halo on eight sections. Verified live across all fifteen.

The spec should be corrected to say eight.
