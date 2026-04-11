import { CATEGORY_META } from '../data/configs';

interface Props {
  category: 'black' | 'white' | 'tor';
}

export function CategoryBadge({ category }: Props) {
  const meta = CATEGORY_META[category];
  return (
    <div className="cat-badge-wrap" style={{ '--badge-color': meta.color } as React.CSSProperties}>
      <span className="cat-badge-emoji">{meta.emoji}</span>
      <div>
        <div className="cat-badge-label">{meta.label}</div>
        <div className="cat-badge-desc">{meta.description}</div>
      </div>
    </div>
  );
}
