"""Check the 3D scene presets in src/data/sections.ts without opening a browser.

Two invariants, both of which have been silently broken before:

  side    the bot sits OPPOSITE the copy column.
  facing  the bot looks back toward the copy, never away.

`model.position.x` is NOT the screen position — the camera aims at `focus`, so
the on-screen offset is

    screenX = (model.x - focus.x)*cos(az) + (model.z - focus.z)*(-sin az)

A check that compared `model.position.x` against zero once reported "0
violations" while six sections had the bot on the wrong side. That is the whole
reason this file exists.

`turn = model.yaw - camera.azimuth` is the apparent facing: NEGATIVE turns the
bot toward screen-left, POSITIVE toward screen-right.

Run:  python scripts/verify-presets.py
Exits non-zero if any section violates either invariant.
"""

import math
import re
import sys
from pathlib import Path

# Apparent height of the model as a fraction of the viewport. CHANGES-V2 SB.3
# wants 60-90%; the hero is allowed to run a little hotter.
MIN_HEIGHT, MAX_HEIGHT = 0.50, 0.95

# How far off the frame centre the model may sit, as a fraction of the half
# frame. Past ~0.85 it is clipping the edge and perspective stretch makes it
# look enormous -- which is exactly what shipped on 2026-09-23 when `focus`
# was used to shift the bot sideways.
MAX_FRAME_FRACTION = 0.85

ASPECT = 16 / 9

SRC = Path(__file__).resolve().parent.parent / "src" / "data" / "sections.ts"
FRAME_FILL_RE = re.compile(r"FRAME_FILL = ([\d.]+)")

FIELDS = re.compile(
    r"id: '([a-z-]+)',\s*\n\s*num: '(\d+)',.*?"
    r"align: '(\w+)',.*?"
    # `.*?` rather than `\s*\n\s*` between the camera fields: this file is
    # heavily commented and a `//` note dropped between `azimuth` and
    # `elevation` used to blind the parser. It fails loudly when that happens
    # (the count check below), but tripping over a comment is not a useful
    # failure. The section count is what keeps the lazy match honest.
    r"azimuth: (-?[\d.]+),.*?"
    r"elevation: (-?[\d.]+),.*?"
    r"distance: ([\d.]+),.*?fov: ([\d.]+),.*?"
    r"focus: \[(-?[\d.]+), (-?[\d.]+), (-?[\d.]+)\],.*?"
    r"position: \[(-?[\d.]+), (-?[\d.]+), (-?[\d.]+)\], yaw: (-?[\d.]+)",
    re.S,
)

# The bento grid on §10 runs to x~1185 of 1440 and the rail plus the copy column
# own the left, so its only clear gutter is on the RIGHT even though the copy is
# left-aligned. Documented in STATE.md §6.
SIDE_EXCEPTIONS = {"dashboard": +1}

# Sections where the model is DELIBERATELY cropped past the normal limit, with
# the client's sign-off. Empty since the `fees` section was removed on
# 2026-09-23; it was the only entry, and it sat half below the fold by request.
FRAME_Y_EXCEPTIONS: dict[str, float] = {}

EXPECTED_SECTIONS = 13


def screen_x(az, focus, pos):
    return (pos[0] - focus[0]) * math.cos(az) + (pos[2] - focus[2]) * (-math.sin(az))


def frame_metrics(az, el, distance, fov, frame_fill, focus, pos):
    """Apparent height, and where the model lands inside the frame.

    `frame_x` / `frame_y` are the model's offset from the CENTRE OF FRAME, as a
    fraction of the half-frame. They are measured from `focus`, not from the
    origin, because the camera aims at `focus` -- so a lateral `focus` shows up
    here as the model being flung toward the edge, which is precisely the bug
    that shipped on 2026-09-23.
    """
    fd = distance / frame_fill
    half_h = fd * math.tan(math.radians(fov) / 2)
    if half_h <= 0:
        return float("inf"), float("inf"), float("inf")
    height = 1 / (2 * half_h)

    right = (math.cos(az), 0.0, -math.sin(az))
    d = tuple(pos[i] - focus[i] for i in range(3))
    lateral = sum(d[i] * right[i] for i in range(3))
    vertical = d[1]

    frame_x = lateral / (half_h * ASPECT)
    frame_y = vertical / half_h
    return height, frame_x, frame_y


def main():
    src = SRC.read_text(encoding="utf-8")
    frame_fill = float(FRAME_FILL_RE.search(src).group(1))
    rows = list(FIELDS.finditer(src))

    if len(rows) != EXPECTED_SECTIONS:
        print(f"FAIL  parsed {len(rows)} sections, expected {EXPECTED_SECTIONS}.")
        print("      The preset shape changed and this checker can no longer see it.")
        return 1

    failures = []
    print(f"{'id':14} {'align':7} {'screenX':>8} {'turn':>6} {'height':>7} {'frameX':>6} {'frameY':>6}")
    print("-" * 64)

    for m in rows:
        sid, _num, align, az, el, dist, fov, fx, fy, fz, px, py, pz, yaw = m.groups()
        az, el, dist, fov = float(az), float(el), float(dist), float(fov)
        focus = (float(fx), float(fy), float(fz))
        pos = (float(px), float(py), float(pz))

        sx = screen_x(az, focus, pos)
        turn = float(yaw) - az
        height, frame_x, frame_y = frame_metrics(az, el, dist, fov, frame_fill, focus, pos)

        want = SIDE_EXCEPTIONS.get(sid, +1 if align == "start" else -1 if align == "end" else 0)
        side_ok = True if want == 0 else (sx > 0) == (want > 0)
        face_ok = abs(turn) <= 0.3 if want == 0 else (turn < 0) == (want > 0)
        size_ok = MIN_HEIGHT <= height <= MAX_HEIGHT
        max_y = FRAME_Y_EXCEPTIONS.get(sid, MAX_FRAME_FRACTION)
        frame_ok = abs(frame_x) <= MAX_FRAME_FRACTION and abs(frame_y) <= max_y

        if not side_ok:
            failures.append(f"{sid}: screenX {sx:+.2f} is on the wrong side for align '{align}'")
        if not face_ok:
            failures.append(f"{sid}: turn {turn:+.2f} faces away from the copy")
        if not size_ok:
            failures.append(
                f"{sid}: model fills {height * 100:.0f}% of the viewport "
                f"(want {MIN_HEIGHT * 100:.0f}-{MAX_HEIGHT * 100:.0f}%)"
            )
        if not frame_ok:
            failures.append(
                f"{sid}: model sits at ({frame_x:+.2f}, {frame_y:+.2f}) of the half-frame "
                f"(max x {MAX_FRAME_FRACTION}, max y {max_y}) - it will clip the edge. "
                f"Move `model.position`, not `focus`."
            )

        flags = "".join("." if ok else "X" for ok in (side_ok, face_ok, size_ok, frame_ok))
        print(
            f"{sid:14} {align:7} {sx:>8.2f} {turn:>6.2f} {height * 100:>6.0f}% "
            f"{frame_x:>+6.2f} {frame_y:>+6.2f}  {flags}"
        )

    print()
    print("flags: side / facing / size / frame-edge   ('.' pass, 'X' fail)")
    if failures:
        print()
        print(f"FAIL  {len(failures)} violation(s):")
        for f in failures:
            print("  -", f)
        return 1
    print()
    print(f"PASS  {len(rows)}/{EXPECTED_SECTIONS} sections, 0 violations.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
