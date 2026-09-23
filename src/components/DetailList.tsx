import type { FeatureCard } from '../data/content';

/**
 * The rule / title / text list used by §06 Messaging and §08 Performance.
 *
 * These two sections carry fewer, longer points than the card grid was built
 * for: a 28-word body inside `.info-card` either wraps to six lines in a
 * two-column grid or forces the card taller than its neighbours. A full-width
 * row gives the line length somewhere to go, and the leading rule does the
 * separating that the card border used to.
 *
 * The rule is drawn twice — a static hairline as the row's own top border, and
 * an accent line on `::before` that wipes across it on hover. That is the same
 * gesture as `.card-rule`'s 1rem → 3rem growth in `.info-card`, so the two
 * layouts still read as one system.
 */
export function DetailList({ items }: { items: readonly FeatureCard[] }) {
  return (
    <ol className="detail-list mt-7">
      {items.map((item, i) => (
        <li key={item.title} className="detail-row" tabIndex={0}>
          <span className="detail-index eyebrow tabular-nums text-steel-500">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="display text-[1.35rem] leading-[1.15] sm:text-[1.5rem]">{item.title}</h3>
            <p className="body-copy mt-2 text-[0.9rem] text-steel-700 sm:text-[0.85rem]">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
