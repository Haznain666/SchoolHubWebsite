/**
 * Runtime capability probes for the 3D layer (CHANGES-V2 §B.2).
 *
 * The `.glb` is loaded only when every one of these passes. Reduced motion and
 * a missing WebGL2 context fall back to the flat `schoolbot.png` composition
 * and never touch the model or the three.js chunk.
 *
 * A coarse pointer used to be a third bar, and is not any more. It meant every
 * phone got the flat PNG at full opacity, sitting on top of the copy — which
 * is exactly the "still uses the old bot image" the client flagged. Phones now
 * get the real model, pulled back, centred and faded behind the text; the
 * tuning for that lives in `SceneRig` and `BotLayer`, not here.
 */

let webgl2: boolean | null = null;

export function hasWebGL2(): boolean {
  if (webgl2 !== null) return webgl2;
  if (typeof document === 'undefined') {
    webgl2 = false;
    return webgl2;
  }
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('webgl2');
    webgl2 = Boolean(ctx);
    // release the probe context immediately — browsers cap how many live at once
    const lose = ctx?.getExtension('WEBGL_lose_context');
    lose?.loseContext();
  } catch {
    webgl2 = false;
  }
  return webgl2;
}

/** True when the 3D bot may be mounted at all. */
export function canRender3D(reduced: boolean): boolean {
  return !reduced && hasWebGL2();
}
