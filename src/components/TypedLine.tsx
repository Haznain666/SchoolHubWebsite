import { useMemo } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

interface Props {
  /** the part typed in body colour */
  lead: string;
  /** the tail, typed in the accent colour */
  accent: string;
  reduced: boolean;
}

interface Piece {
  char: string;
  accent: boolean;
}

/**
 * The typed hero sub-heading (BRIEF §5.8).
 * Characters are wrapped per-word in `inline-block` spans so a word can never
 * break mid-wrap; the final phrase is rendered in the accent colour; a 4px
 * block caret blinks at the end and fades when typing finishes. The full string
 * is also present once, visually hidden, for screen readers.
 */
export function TypedLine({ lead, accent, reduced }: Props) {
  const { words, total } = useMemo(() => {
    const pieces: Piece[] = [
      ...Array.from(lead).map((char) => ({ char, accent: false })),
      ...Array.from(accent).map((char) => ({ char, accent: true })),
    ];
    const grouped: Piece[][] = [];
    let current: Piece[] = [];
    pieces.forEach((p) => {
      if (p.char === ' ') {
        if (current.length) grouped.push(current);
        grouped.push([p]);
        current = [];
      } else {
        current.push(p);
      }
    });
    if (current.length) grouped.push(current);
    return { words: grouped, total: pieces.length };
  }, [lead, accent]);

  const { revealed, done } = useTypewriter(total, reduced, { delay: 800, speed: 34 });

  let cursor = 0;

  return (
    <p className="display chrome-legible mt-6 text-[clamp(1.15rem,2.6vw,1.9rem)] leading-[1.25]">
      <span className="sr-only">
        {lead}
        {accent}
      </span>
      <span aria-hidden="true">
        {words.map((word, wi) => {
          const isSpace = word.length === 1 && word[0].char === ' ';
          const node = (
            <span key={wi} className={isSpace ? 'inline' : 'inline-block whitespace-pre'}>
              {word.map((piece) => {
                const i = cursor;
                cursor += 1;
                return (
                  <span
                    key={i}
                    className={piece.accent ? 'text-accent' : 'text-steel-700'}
                    style={{ opacity: i < revealed ? 1 : 0 }}
                  >
                    {piece.char}
                  </span>
                );
              })}
            </span>
          );
          return node;
        })}
        <span
          className={`ml-1 inline-block h-5 w-1 translate-y-[2px] rounded-sm bg-accent/70 align-baseline md:h-6 ${
            done || reduced ? 'opacity-0' : 'caret'
          }`}
          style={{ transition: 'opacity 500ms ease' }}
        />
      </span>
    </p>
  );
}
