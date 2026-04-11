import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import type { ConfigFile } from '../types';
import { useConfigs } from '../hooks/useConfigs';
import { getProtocolColor, buildDeepLink } from '../utils/parser';

interface Props {
  file: ConfigFile;
  onClose: () => void;
}

const CLIENTS = [
  { id: 'v2box',     name: 'v2Box',         icon: '📦', platforms: ['iOS', 'Android'] },
  { id: 'v2ray',     name: 'v2RayNG',       icon: '⚡', platforms: ['Android'] },
  { id: 'happ',      name: 'Happ',          icon: '🌀', platforms: ['iOS', 'Android'] },
  { id: 'streisand', name: 'Streisand',     icon: '🛡️', platforms: ['iOS'] },
  { id: 'nekobox',   name: 'NekoBox',       icon: '🐱', platforms: ['Android'] },
  { id: 'shadowrocket', name: 'Shadowrocket', icon: '🚀', platforms: ['iOS'] },
];

export function ConfigDetail({ file, onClose }: Props) {
  const { configs, loading, error, count, lastUpdated, refetch } = useConfigs(file);
  const [search, setSearch] = useState('');
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [qrTarget, setQrTarget] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 30;

  const protocols = [...new Set(configs.map(c => c.protocol))].filter(Boolean);

  const filtered = configs.filter(c => {
    const matchProto = !activeProtocol || c.protocol === activeProtocol;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.server || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.country || '').toLowerCase().includes(search.toLowerCase());
    return matchProto && matchSearch;
  });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  useEffect(() => { setPage(0); }, [search, activeProtocol]);

  useEffect(() => {
    if (!qrTarget) { setQrDataUrl(null); return; }
    QRCode.toDataURL(qrTarget, { width: 220, margin: 2, color: { dark: '#0a0e1a', light: '#e2e8f0' } })
      .then(setQrDataUrl).catch(() => {});
  }, [qrTarget]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="detail-panel">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{file.name}</h2>
            {lastUpdated && (
              <span className="detail-meta">
                {count} конфигов · Загружено {lastUpdated.toLocaleTimeString('ru')}
              </span>
            )}
          </div>
          <div className="detail-actions">
            <button className="btn-icon" onClick={refetch} title="Обновить">↻</button>
            <button className="btn-icon" onClick={onClose} title="Закрыть">✕</button>
          </div>
        </div>

        {/* Subscription URL */}
        <div className="sub-url-block">
          <div className="sub-url-label">Ссылка для импорта подписки</div>
          <div className="sub-url-row">
            <code className="sub-url">{file.cdnUrl}</code>
            <button
              className={`btn-copy ${copied === 'url' ? 'copied' : ''}`}
              onClick={() => copyText(file.cdnUrl, 'url')}
            >
              {copied === 'url' ? '✓' : 'Копировать'}
            </button>
          </div>
        </div>

        {/* Open in clients */}
        <div className="clients-section">
          <div className="clients-label">Открыть в приложении</div>
          <div className="clients-row">
            {CLIENTS.map(client => (
              <a
                key={client.id}
                href={buildDeepLink(file.cdnUrl, client.id)}
                className="client-btn"
                title={client.platforms.join(', ')}
              >
                <span className="client-icon">{client.icon}</span>
                <span className="client-name">{client.name}</span>
                <span className="client-platform">{client.platforms.join('/')}</span>
              </a>
            ))}
          </div>
        </div>

        {/* QR */}
        <div className="qr-section">
          <button
            className="btn-qr"
            onClick={() => setQrTarget(qrTarget ? null : file.cdnUrl)}
          >
            {qrTarget ? 'Скрыть QR' : '📷 QR-код подписки'}
          </button>
          {qrDataUrl && (
            <div className="qr-wrap">
              <img src={qrDataUrl} alt="QR" className="qr-img" />
              <p className="qr-hint">Сканируйте в v2Box / Streisand / любом клиенте</p>
            </div>
          )}
        </div>

        {/* Config list */}
        <div className="configs-section">
          <div className="configs-toolbar">
            <input
              className="search-input"
              placeholder="Поиск по стране, серверу..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="proto-filters">
              <button
                className={`proto-filter ${!activeProtocol ? 'active' : ''}`}
                onClick={() => setActiveProtocol(null)}
              >Все</button>
              {protocols.map(p => (
                <button
                  key={p}
                  className={`proto-filter ${activeProtocol === p ? 'active' : ''}`}
                  style={{ '--pcolor': getProtocolColor(p) } as React.CSSProperties}
                  onClick={() => setActiveProtocol(activeProtocol === p ? null : p)}
                >{p}</button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loader-ring" />
              <span>Загружаем конфиги...</span>
            </div>
          )}
          {error && <div className="error-state">⚠ {error}</div>}

          {!loading && !error && (
            <>
              <div className="configs-list">
                {paginated.map((c, i) => (
                  <div key={i} className="config-row">
                    <div className="config-row-left">
                      <span className="config-flag">{c.flag}</span>
                      <div className="config-info">
                        <span className="config-name">{c.name.slice(0, 60)}{c.name.length > 60 ? '…' : ''}</span>
                        {c.server && (
                          <span className="config-server">{c.server}:{c.port}</span>
                        )}
                      </div>
                    </div>
                    <div className="config-row-right">
                      <span
                        className="proto-tag"
                        style={{ color: getProtocolColor(c.protocol) }}
                      >{c.protocol}</span>
                      <button
                        className={`btn-copy-sm ${copied === `row-${i}` ? 'copied' : ''}`}
                        onClick={() => copyText(c.raw, `row-${i}`)}
                      >{copied === `row-${i}` ? '✓' : '⎘'}</button>
                      <button
                        className="btn-qr-sm"
                        onClick={() => setQrTarget(qrTarget === c.raw ? null : c.raw)}
                        title="QR для этого конфига"
                      >⬡</button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>←</button>
                  <span>{page + 1} / {totalPages} · {filtered.length} конфигов</span>
                  <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>→</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* QR popup for individual config */}
        {qrTarget && qrTarget !== file.cdnUrl && qrDataUrl && (
          <div className="qr-popup" onClick={() => setQrTarget(null)}>
            <div className="qr-popup-inner" onClick={e => e.stopPropagation()}>
              <img src={qrDataUrl} alt="QR" />
              <p>Сканируйте в VPN-клиенте</p>
              <button onClick={() => setQrTarget(null)}>Закрыть</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
