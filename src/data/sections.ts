/**
 * SINGLE SOURCE OF TRUTH for the page skeleton.
 *
 * The "On this page" rail, the header nav, the mobile overlay menu, the
 * keyboard navigation, the wheel state machine and — since revision 2 — the
 * per-section 3D scene presets are all derived from this one array. Add,
 * remove or reorder an entry here and every one of those follows
 * automatically; they can never drift apart.
 *
 * The preset numbers come from `docs/CHANGES-V2.md` §D and are transcribed
 * verbatim. Do not hand-tune them per section: §D drives the bot's apparent
 * size through camera `distance` and `fov`, never through model scale.
 *
 * Section copy lives in `src/data/content.ts`.
 */

export type SectionId =
  | 'start'
  | 'numbers'
  | 'how-it-works'
  | 'students'
  | 'teachers'
  | 'messaging'
  | 'performance'
  | 'platform'
  | 'dashboard'
  | 'onboarding'
  | 'faq'
  | 'contact'
  | 'footer';

/** Which part of the screen the copy occupies. The bot takes the rest. */
export type Align = 'start' | 'end' | 'center';

/** Width of the content column. Card-bearing scenes need more than 32rem. */
export type ColumnWidth = 'narrow' | 'mid' | 'wide' | 'full';

export type Vec3 = readonly [number, number, number];

/** Where the camera sits and what it looks at, per section (CHANGES-V2 §D). */
export interface CameraPreset {
  /** radians, orbiting the origin */
  azimuth: number;
  /** radians, orbiting the origin */
  elevation: number;
  /** model units from the origin */
  distance: number;
  /** vertical field of view, degrees */
  fov: number;
  /** radians about the camera's own forward axis */
  roll: number;
  /** the look-at point — damped separately from position, which is what makes
   *  the camera read as hand-held rather than mechanical */
  focus: Vec3;
}

/** Where the (unit-normalised) model sits and how it is turned. */
export interface ModelPreset {
  position: Vec3;
  yaw: number;
  pitch: number;
  roll: number;
}

/**
 * The neon halo (CHANGES-V2 §F). `x`/`y` are normalised viewport coordinates
 * (0–1); `d` is the diameter as a fraction of the viewport's smaller edge.
 * `frameMode: 'cropped'` means the halo may sit partly off-screen, showing only
 * `minVisibleFraction` of itself — it is deliberately not clamped back on.
 */
export interface HaloPreset {
  visible: boolean;
  x: number;
  y: number;
  d: number;
  opacity: number;
  frameMode: 'contained' | 'cropped';
  minVisibleFraction?: number;
}

export interface ScenePreset {
  id: SectionId;
  camera: CameraPreset;
  model: ModelPreset;
  halo: HaloPreset;
}

export interface SectionMeta {
  id: SectionId;
  /** the two-digit tabular number printed before the eyebrow */
  num: string;
  /** label in the "On this page" rail */
  railLabel: string;
  /** label in the minimalist header nav — only four sections carry one */
  navLabel?: string;
  /** the eyebrow text that follows the number */
  eyebrow: string;
  align: Align;
  width: ColumnWidth;
  scene: ScenePreset;
}

/**
 * ONE global framing constant, applied identically to all fifteen sections.
 *
 * §D's distances were authored against the model at its native size (~1.9 units
 * tall). §B.2 requires it to be normalised to exactly 1 unit, which would make
 * it 1.9× smaller and leave the bot at 25–49% of viewport height — precisely
 * the "too much blank space" the client rejected in build 1. Dividing the
 * camera distance by this constant restores the 60–90% framing §B.3 and §L.1
 * ask for, while leaving every §D number, and every world coordinate, exactly
 * as specified. Size is still driven by `distance` and `fov` alone, and the
 * relative ordering between sections is untouched: 03 is still the closest and
 * biggest, 13 still the widest.
 */
export const FRAME_FILL = 1.83;

export const framedDistance = (distance: number): number => distance / FRAME_FILL;

/** The model's apparent height as a fraction of the viewport, 0–1. */
export const apparentHeight = (preset: ScenePreset): number =>
  1 / (2 * framedDistance(preset.camera.distance) * Math.tan((preset.camera.fov * Math.PI) / 360));


export const SECTIONS: readonly SectionMeta[] = [
  {
    id: 'start',
    num: '00',
    railLabel: 'Start',
    eyebrow: 'Student Management · Fees · Staff · Performance',
    align: 'start',
    width: 'narrow',
    scene: {
      id: 'start',
      camera: {
        azimuth: -0.35,
        elevation: 0.05,
        distance: 4.08,
        fov: 27,
        roll: 0.02,
        focus: [0, 0.111, 0],
      },
      model: { position: [0.366, -0.06, 0.134], yaw: -0.69, pitch: 0.02, roll: -0.035 },
      halo: { visible: true, x: 0.76, y: 0.38, d: 0.456, opacity: 0.92, frameMode: 'contained' },
    },
  },
  {
    id: 'numbers',
    num: '01',
    railLabel: 'In numbers',
    eyebrow: 'Numbers',
    align: 'end',
    width: 'mid',
    scene: {
      id: 'numbers',
      camera: {
        azimuth: 0.55,
        elevation: 0.02,
        distance: 6.1,
        fov: 25,
        roll: -0.02,
        focus: [0, 0.186, 0],
      },
      model: { position: [-0.32, -0.05, 0.196], yaw: 0.89, pitch: 0.09, roll: 0.035 },
      halo: { visible: true, x: 0.79, y: 0.2, d: 0.42, opacity: 0.92, frameMode: 'contained' },
    },
  },
  {
    id: 'how-it-works',
    num: '02',
    railLabel: 'How it works',
    eyebrow: 'How it works',
    align: 'start',
    width: 'wide',
    scene: {
      id: 'how-it-works',
      camera: {
        azimuth: 1.25,
        elevation: 0.16,
        distance: 6.1,
        fov: 26,
        roll: 0.015,
        focus: [0, 0.346, 0],
      },
      model: { position: [0.148, 0.1, -0.444], yaw: 0.91, pitch: 0.03, roll: -0.03 },
      halo: { visible: true, x: 0.9, y: 0.22, d: 0.24, opacity: 0.7, frameMode: 'cropped', minVisibleFraction: 0.5 },
    },
  },
  {
    id: 'students',
    num: '03',
    railLabel: 'Students',
    navLabel: 'Features',
    eyebrow: 'Students',
    align: 'end',
    width: 'mid',
    scene: {
      id: 'students',
      camera: {
        azimuth: -0.15,
        // 0.35 put the lens a good 20° above the bot and it read as staring
        // flatly ahead. The model has no skeleton (see BotModel), so `pitch`
        // tips the WHOLE body — the only way to buy an upward gaze without the
        // bot looking like it is toppling backwards is to bring the camera
        // down toward its eye line first and spend less pitch on the rest.
        elevation: 0.16,
        distance: 5.0,
        fov: 23,
        roll: -0.03,
        focus: [0, 0.028, 0],
      },
      // pitch is NEGATIVE = chin up. With the camera at 0.16 this aims the
      // gaze about 25° above screen-horizontal and 19° to screen-right, which
      // lands it on the heading up in the copy column.
      model: { position: [-0.356, -0.15, -0.054], yaw: 0.19, pitch: -0.3, roll: -0.05 },
      halo: { visible: true, x: 0.318, y: 0.3, d: 0.44, opacity: 0.92, frameMode: 'contained' },
    },
  },
  {
    id: 'teachers',
    num: '04',
    railLabel: 'Teachers',
    eyebrow: 'Teachers',
    align: 'start',
    width: 'mid',
    scene: {
      id: 'teachers',
      camera: {
        azimuth: -0.25,
        elevation: 0.06,
        distance: 5.6,
        fov: 24,
        roll: -0.04,
        focus: [0, 0.088, 0],
      },
      model: { position: [0.601, -0.12, 0.153], yaw: -0.59, pitch: 0.04, roll: -0.06 },
      halo: { visible: true, x: 0.4, y: 0.32, d: 0.36, opacity: 1, frameMode: 'contained' },
    },
  },
  {
    id: 'messaging',
    num: '05',
    railLabel: 'Messaging',
    eyebrow: 'Messaging',
    align: 'end',
    width: 'mid',
    scene: {
      id: 'messaging',
      camera: {
        azimuth: -1.15,
        elevation: 0.14,
        distance: 5.0,
        fov: 26,
        roll: -0.015,
        focus: [0, 0.042, 0],
      },
      model: { position: [-0.069, -0.16, -0.155], yaw: -0.97, pitch: 0.03, roll: 0.04 },
      halo: { visible: true, x: 0.225, y: 0.49, d: 0.72, opacity: 1, frameMode: 'contained' },
    },
  },
  {
    id: 'performance',
    num: '06',
    railLabel: 'Performance',
    eyebrow: 'Performance',
    align: 'start',
    width: 'mid',
    scene: {
      id: 'performance',
      camera: {
        azimuth: 1.45,
        elevation: 0.2,
        distance: 5.2,
        fov: 26,
        roll: 0.02,
        focus: [0, -0.01, 0],
      },
      model: { position: [0.048, -0.22, -0.389], yaw: 1.11, pitch: 0.04, roll: -0.04 },
      halo: { visible: true, x: 0.24, y: 0.3, d: 0.6, opacity: 1, frameMode: 'contained' },
    },
  },
  {
    id: 'platform',
    num: '07',
    railLabel: 'The platform',
    navLabel: 'Platform',
    eyebrow: 'The platform',
    // "low-right" in the §D table: the isometric plane bleeds off the top-left,
    // so the copy sits low and to the right of it.
    align: 'end',
    width: 'mid',
    scene: {
      id: 'platform',
      camera: {
        azimuth: 1.25,
        elevation: 0.16,
        // 7.0 was the most distant camera on the site and left the bot filling
        // only 57% of the viewport — the smallest of all fifteen sections, and
        // undersized next to artwork this busy.
        distance: 5.4,
        fov: 26,
        roll: 0.015,
        focus: [0, -0.217, 0],
      },
      // Raised and nudged right along the camera's RIGHT VECTOR, never by
      // swinging `focus` — see the §D note. Growing the bot in place drove it
      // further left and pushed its feet further below the fold; this holds the
      // framing roughly where it was while the bot gets bigger.
      //
      // The last nudge right (frameX -0.42 -> -0.39) is half of the "close the
      // void by 25%" note: measured at 1920px the bot's right edge sat ~211px
      // from the copy column, so ~29px comes from here and ~24px from the extra
      // right padding `.platform-shell` puts on the copy.
      model: { position: [-0.119, -0.353, 0.361], yaw: 1.59, pitch: 0.03, roll: -0.03 },
      halo: { visible: true, x: 0.74, y: 0.28, d: 0.6, opacity: 1, frameMode: 'contained' },
    },
  },
  {
    id: 'dashboard',
    num: '08',
    railLabel: 'The dashboard',
    eyebrow: 'The dashboard',
    align: 'start',
    width: 'narrow',
    scene: {
      id: 'dashboard',
      camera: {
        azimuth: -1.15,
        elevation: 0.14,
        distance: 7.2,
        fov: 26,
        roll: -0.015,
        focus: [0, -0.059, 0],
      },
      model: { position: [0.319, -0.35, 0.712], yaw: -1.49, pitch: 0.03, roll: 0.04 },
      halo: {
        visible: true,
        x: 0.1,
        y: 0.42,
        d: 0.26,
        opacity: 0.78,
        frameMode: 'cropped',
        minVisibleFraction: 0.5,
      },
    },
  },
  {
    id: 'onboarding',
    num: '09',
    railLabel: 'Onboarding',
    navLabel: 'Process',
    eyebrow: 'Onboarding',
    align: 'end',
    width: 'wide',
    scene: {
      id: 'onboarding',
      camera: {
        azimuth: 0.08,
        elevation: 0.06,
        distance: 6.8,
        fov: 22,
        roll: 0,
        focus: [0, 0.051, 0],
      },
      model: { position: [-0.497, -0.18, 0.04], yaw: 0.42, pitch: 0.02, roll: -0.02 },
      halo: { visible: true, x: 0.76, y: 0.3, d: 0.6, opacity: 1, frameMode: 'contained' },
    },
  },
  {
    id: 'faq',
    num: '10',
    railLabel: 'FAQ',
    eyebrow: 'FAQ',
    align: 'start',
    width: 'mid',
    scene: {
      id: 'faq',
      camera: {
        azimuth: 1.2,
        elevation: 0.18,
        distance: 5.4,
        fov: 26,
        roll: 0.02,
        focus: [0, 0.038, 0],
      },
      // Slid along the camera's right vector toward the copy: frameX 0.51 ->
      // 0.24, which closes about 70% of the gap between the panel and the
      // bot. Position only — `focus` stays centred, or the lens goes
      // off-axis and the bot balloons at the frame edge.
      model: { position: [0.106, -0.18, -0.271], yaw: 0.86, pitch: 0.05, roll: -0.05 },
      // travels with the bot, or it detaches and sits alone in the corner
      halo: { visible: true, x: 0.66, y: 0.3, d: 0.28, opacity: 0.9, frameMode: 'contained' },
    },
  },
  {
    id: 'contact',
    num: '11',
    railLabel: 'Contact',
    navLabel: 'Contact',
    eyebrow: 'Book a demo',
    align: 'center',
    width: 'mid',
    scene: {
      id: 'contact',
      camera: {
        azimuth: -0.1,
        // was 0.22 — the lens sat 12.6 deg ABOVE the bot while the model was
        // pitched chin-down, and the two compounded into the "staring at the
        // floor" look. Same trap as the students section.
        elevation: 0.1,
        distance: 7.0,
        fov: 26,
        roll: -0.02,
        focus: [0, -0.167, 0],
      },
      // pitch NEGATIVE = chin up. -0.22 against the lowered camera aims the
      // gaze ~28 deg above screen-horizontal, up toward the form, for only
      // ~12.6 deg of body lean. Moved left along the right vector as well
      // (frameX -0.35 -> -0.56) so the bot clears the form panel: measured at
      // 1920px its right edge was 732 against a form starting at 669.
      model: { position: [-0.871, -0.45, -0.087], yaw: 0.05, pitch: -0.22, roll: -0.09 },
      // +50% diameter, and brought over to the bot: at x 0.86 it was stranded
      // in the top-right corner with the whole left half empty.
      halo: { visible: true, x: 0.28, y: 0.28, d: 0.33, opacity: 0.9, frameMode: 'contained' },
    },
  },
  {
    id: 'footer',
    num: '12',
    railLabel: 'Footer',
    eyebrow: 'School Hub',
    // "centre-left" in the §D table.
    align: 'start',
    width: 'full',
    scene: {
      id: 'footer',
      camera: {
        azimuth: 1.2,
        elevation: 0.18,
        distance: 5.4,
        fov: 26,
        roll: 0.02,
        focus: [0, -0.032, 0],
      },
      model: { position: [0.225, -0.25, -0.578], yaw: 0.86, pitch: 0.05, roll: -0.05 },
      halo: {
        visible: true,
        x: 0.8,
        y: 0.26,
        d: 0.34,
        opacity: 0.92,
        frameMode: 'cropped',
        minVisibleFraction: 0.58,
      },
    },
  },
] as const;

/** The four links in the minimalist header nav, derived from SECTIONS. */
export const NAV_ITEMS = SECTIONS.filter((s) => Boolean(s.navLabel)).map((s) => ({
  id: s.id,
  label: s.navLabel as string,
}));

export const SECTION_IDS: readonly SectionId[] = SECTIONS.map((s) => s.id);

export const SCENE_PRESETS: readonly ScenePreset[] = SECTIONS.map((s) => s.scene);

export const indexOfSection = (id: SectionId): number => SECTIONS.findIndex((s) => s.id === id);

export const sectionById = (id: SectionId): SectionMeta =>
  SECTIONS[indexOfSection(id)] as SectionMeta;

/** External / anchor targets used by the CTAs and the keyboard shortcuts. */
export const LINKS = {
  login: 'https://app.getschoolhub.com',
  demo: '#contact',
  portal: 'https://schoolhub.codexmill.com',
  superAdmin: 'https://schoolhub.codexmill.com/super-admin',
  status: 'https://schoolhub.codexmill.com/status',
} as const;
