import type { ConfigFile } from '../types';
import { CATEGORY_META } from '../data/configs';

interface Props {
  file: ConfigFile;
  isSelected: boolean;
  onClick: () => void;
}

const PROTOCOL_ICONS: Record<string, string> = {
  vless: '◈', ss: '◎', tor: '✿', cidr: '⬡', sni: '◉', mixed: '⬢',
};

export function ConfigCard({ file, isSelected, onClick }: Props) {
  const meta = CATEGORY_META[file.category as keyof typeof CATEGORY_META];
  const icon = PROTOCOL_ICONS[file.listType] || '◈';
  const color = meta?.color || '#4fc3f7';

  return (
    <button
      className={`config-card ${isSelected ? 'selected' : ''} cat-${file.category}`}
      onClick={onClick}
      style={{ '--card-color': color } as React.CSSProperties}
    >
      <div className="card-top">
        <span className="card-icon">{icon}</span>
        {file.badge && <span className="card-badge">{file.badge}</span>}
        {file.isMobile && <span className="card-mobile">📱</span>}
      </div>

      <div className="card-body">
        <h3 className="card-name">{file.name}</h3>
        <p className="card-desc">{file.description}</p>

        {/* Use cases — only when expanded */}
        {isSelected && file.useCases && file.useCases.length > 0 && (
          <ul className="card-usecases">
            {file.useCases.map((uc, i) => (
              <li key={i} className="card-usecase-item">
                <span className="card-usecase-dot">·</span>{uc}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card-footer">
        <div className="card-protocols">
          {file.protocols.slice(0, 3).map(p => (
            <span key={p} className="proto-chip">{p}</span>
          ))}
        </div>
        <span className="card-arrow">{isSelected ? '↑ свернуть' : '↓ подробнее'}</span>
      </div>
    </button>
  );
}
