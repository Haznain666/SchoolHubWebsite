/** Resolve a file in `public/` against the build's base URL. */
export const asset = (file: string): string => `${import.meta.env.BASE_URL}assets/${file}`;

export const ASSETS = {
  logo: asset('logo.png'),
  logoWhite: asset('logo-white.png'),
  /** the flat cut-out — now only the fallback for the 3D layer */
  bot: asset('schoolbot.png'),
  /** the glyph the neon halo is built out of */
  sparkle: asset('ai-glow.png'),
  /** the bot's eye-plate mark — the hub glyph in §02 and the favicon source */
  botMark: asset('bot-mark.png'),
} as const;

/**
 * The Draco-compressed model (CHANGES-V2 §M). `school-bot.glb` stays in the
 * repo as the master; this is the file that ships.
 */
export const MODEL_URL = `${import.meta.env.BASE_URL}models/school-bot.opt.glb`;
