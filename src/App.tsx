import { useCallback, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';

import { BotLayer } from './components/BotLayer';
import { CookieConsent } from './components/CookieConsent';
import { Hairlines } from './components/Hairlines';
import { HaloLayer } from './components/HaloLayer';
import { Header } from './components/Header';
import { KeyboardLegend } from './components/KeyboardLegend';
import { MobileMenu } from './components/MobileMenu';
import { Rail } from './components/Rail';
import { Scrim } from './components/Scrim';

import { Contact } from './sections/Contact';
import { Dashboard } from './sections/Dashboard';
import { Faq } from './sections/Faq';
import { FeatureScene } from './sections/FeatureScene';
import { FooterSection } from './sections/FooterSection';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { Numbers } from './sections/Numbers';
import { Platform } from './sections/Platform';
import { Process } from './sections/Process';

import { useKeyboardNav } from './hooks/useKeyboardNav';
import { usePointer } from './hooks/usePointer';
import { useIsTouch, usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useSectionScroll } from './hooks/useSectionScroll';
import { scrollToSection } from './lib/navigate';

import { featureSections } from './data/content';
import { LINKS, SECTIONS, SECTION_IDS } from './data/sections';

export default function App() {
  const reduced = usePrefersReducedMotion();
  const touch = useIsTouch();
  const pointer = usePointer(!reduced && !touch);
  const [menuOpen, setMenuOpen] = useState(false);
  const [keysEnabled, setKeysEnabled] = useState(true);

  // one scroll, one section (CHANGES-V2 §E) — also the single source of the
  // active index that the rail, the header and the scene presets read
  const { activeIndex, next, prev, goTo } = useSectionScroll(SECTION_IDS, reduced, touch);

  const active = SECTIONS[activeIndex] ?? SECTIONS[0];

  const onDemo = useCallback(() => scrollToSection('contact'), []);
  const onLogin = useCallback(() => {
    window.open(LINKS.login, '_blank', 'noopener,noreferrer');
  }, []);
  const onEscape = useCallback(() => setMenuOpen(false), []);

  const page = useMemo(
    () => (
      <main id="main">
        <Hero reduced={reduced} />
        <Numbers reduced={reduced} />
        <HowItWorks />
        {featureSections.map((section) => (
          <FeatureScene key={section.id} section={section} />
        ))}
        <Platform />
        <Dashboard />
        <Process />
        <Faq />
        <Contact />
        <FooterSection />
      </main>
    ),
    [reduced],
  );
  const onFirst = useCallback(() => goTo(SECTION_IDS[0]), [goTo]);
  const onLast = useCallback(() => goTo(SECTION_IDS[SECTION_IDS.length - 1]), [goTo]);

  useKeyboardNav({
    enabled: keysEnabled,
    onPrev: prev,
    onNext: next,
    onDemo,
    onLogin,
    onEscape,
    onFirst,
    onLast,
  });

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:text-white"
      >
        Skip to content
      </a>

      {/* ---- fixed scenery, in depth order ----
           z-0  the neon halo — always behind the bot, always behind the hairlines
           z-1  the 3D canvas (or its PNG fallback, which sits at z-0 with it)
           z-2  the scrim, behind the copy column only
           z-3  the four hairlines
           z-10 the page                                                   */}
      <HaloLayer halo={active.scene.halo} reduced={reduced} pointer={pointer} />
      <BotLayer
        preset={active.scene}
        reduced={reduced}
        coarsePointer={touch}
        pointer={pointer}
      />
      <Scrim align={active.align} />
      <Hairlines />

      {/* ---- fixed chrome ---- */}
      <Header activeId={active.id} onOpenMenu={() => setMenuOpen(true)} />
      <Rail activeIndex={activeIndex} />
      <KeyboardLegend enabled={keysEnabled} onToggle={() => setKeysEnabled((v) => !v)} />
      <MobileMenu open={menuOpen} onClose={onEscape} />

      {/* ---- the page ----
           Memoised on `reduced` alone. `activeIndex` changes on every frame of
           a scroll (the rAF-throttled sync), and without this every one of the
           fifteen sections re-rendered with it — a full reconciliation 60×/s
           during the very animation it was making janky. Nothing below the
           fold depends on which section is active; only the fixed layers and
           the chrome above do. This is the scroll-jank fix. */}
      {page}

      <CookieConsent />
    </MotionConfig>
  );
}
