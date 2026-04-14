import { useState } from 'react';
import type { ConfigFile } from '../types';
import { CATEGORY_META } from '../data/configs';

interface Props {
  file: ConfigFile;
  isSelected: boolean;
  onClick: () => void;        // opens ConfigDetail (configs lightbox)
}

const PROTOCOL_ICONS: Record<string, string> = {
  vless: '◈', ss: '◎', tor: '✿', cidr: '⬡', sni: '◉', mixed: '⬢',
};

export function ConfigCard({ file, isSelected, onClick }: Props) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[file.category as keyof typeof CATEGORY_META];
  const icon = PROTOCOL_ICONS[file.listType] || '◈';
  const color = meta?.color || '#4fc3f7';

  // Toggle expand without bubbling to detail open
  function handleExpandClick(e: React.MouseEvent) {
    e.stopPropagation();
    setExpanded(v => !v);
  }

  // Open detail panel
  function handleDetailClick(e: React.MouseEvent) {
    e.stopPropagation();
    onClick();
  }

  return (
    <div
      className={`config-card ${isSelected ? 'selected' : ''} ${expanded ? 'expanded' : ''} cat-${file.category}`}
      style={{ '--card-color': color } as React.CSSProperties}
    >
      <div className="card-top">
        <span className="card-icon">{icon}</span>
        {file.badge && <span className="card-badge">{file.badge}</span>}
        {file.isMobile && <span className="card-mobile">📱</span>}
      </div>

      <div className="card-body">
        <h3 className="card-name">{file.name}</h3>
        <p className={`card-desc ${expanded ? 'card-desc--full' : ''}`}>{file.description}</p>

        {/* Use cases — shown when expanded */}
        {expanded && file.useCases && file.useCases.length > 0 && (
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
        <div className="card-actions">
          <button className="card-expand-btn" onClick={handleExpandClick}>
            {expanded ? '↑' : '↓ подробнее'}
          </button>
          <button
            className={`card-detail-btn ${isSelected ? 'active' : ''}`}
            onClick={handleDetailClick}
            title="Смотреть конфиги"
          >
            {isSelected ? '✕ закрыть' : 'конфиги →'}
          </button>
        </div>
      </div>
    </div>
  );
}
