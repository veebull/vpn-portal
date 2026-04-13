import { useState } from 'react';

// ── Telegram WebApp typing ────────────────────────────
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        platform?: string;
      };
    };
  }
}

const isInTelegram = () => !!(window.Telegram?.WebApp?.openLink);

const SUBS = {
  normal: {
    label: 'Обычный список',
    emoji: '🌍',
    cdnUrl: 'https://cdn.jsdelivr.net/gh/igareck/vpn-configs-for-russia@main/BLACK_VLESS_RUS_mobile.txt',
    hint: 'Подходит когда всё работает штатно. Стабильное зашифрованное соединение через быстрые серверы.',
    color: '#e05c5c',
  },
  whitelist: {
    label: 'Белый список',
    emoji: '🗺️',
    cdnUrl: 'https://cdn.jsdelivr.net/gh/igareck/vpn-configs-for-russia@main/Vless-Reality-White-Lists-Rus-Mobile.txt',
    hint: 'Когда часть привычных сервисов перестала открываться — этот список тихо подключается только к нужным адресам, не трогая остальное.',
    color: '#4fc3f7',
  },
  outline: {
    label: 'Ключи Outline',
    emoji: '🔑',
    cdnUrl: 'https://cdn.jsdelivr.net/gh/igareck/vpn-configs-for-russia@main/BLACK_SS+All_RUS.txt',
    hint: 'SS-ключи для Outline и других совместимых клиентов. Скопируйте любой ключ и вставьте в приложение.',
    color: '#f0b429',
  },
};

type SubType = keyof typeof SUBS;
type CheckState = 'idle' | 'checking' | 'done';

// Build actual deeplink for regular browser
function buildDeepLink(cdnUrl: string, clientId: string): string {
  const encoded = encodeURIComponent(cdnUrl);
  const b64 = btoa(cdnUrl);
  switch (clientId) {
    case 'v2box':        return `v2box://install-sub?url=${encoded}`;
    case 'v2ray':        return `v2rayng://install-config?url=${encoded}`;
    case 'happ':         return `happ://add/${encoded}`;
    case 'streisand':    return `streisand://import/${b64}`;
    case 'nekobox':      return `clash://install-config?url=${encoded}`;
    case 'shadowrocket': return `sub://${b64}`;
    default:             return cdnUrl;
  }
}

const CLIENTS = [
  { id: 'v2box',        name: 'v2Box',        icon: '📦', note: 'iOS / Android' },
  { id: 'happ',         name: 'Happ',         icon: '🌀', note: 'iOS / Android' },
  { id: 'streisand',    name: 'Streisand',    icon: '🛡️', note: 'iOS'           },
  { id: 'v2ray',        name: 'v2RayNG',      icon: '⚡', note: 'Android'       },
  { id: 'nekobox',      name: 'NekoBox',      icon: '🐱', note: 'Android'       },
  { id: 'shadowrocket', name: 'Shadowrocket', icon: '🚀', note: 'iOS'           },
];

interface Props {
  onDone: (done: boolean) => void;
}

// Client button: handles Telegram Mini App deeplink restrictions
// Desktop Telegram: openLink works fine with custom schemes
// Mobile Telegram: openLink with custom schemes is unreliable — use window.open with user-gesture instead
function ClientBtn({ clientId, subType }: { clientId: string; subType: SubType }) {
  const client = CLIENTS.find(c => c.id === clientId)!;
  const sub = SUBS[subType];
  const deeplink = buildDeepLink(sub.cdnUrl, clientId);

  function handleClick(e: React.MouseEvent) {
    if (!isInTelegram()) return; // regular browser: follow <a href> normally

    e.preventDefault();
    const tg = window.Telegram!.WebApp!;

    // Detect mobile Telegram (iOS/Android)
    const platform = tg.platform || '';
    const isMobileTg = /ios|android/i.test(platform);

    if (isMobileTg) {
      // On mobile TG, openLink doesn't reliably open custom schemes.
      // window.open in a user-gesture context IS allowed and triggers the app.
      window.open(deeplink, '_blank');
    } else {
      // Desktop Telegram supports openLink with custom schemes
      tg.openLink(deeplink, { try_instant_view: false });
    }
  }

  return (
    <a
      className="easy-client"
      href={deeplink}
      onClick={handleClick}
      // rel needed so window.open isn't blocked as popup
      rel="noopener"
    >
      <span className="easy-client-icon">{client.icon}</span>
      <span className="easy-client-name">{client.name}</span>
      <span className="easy-client-note">{client.note}</span>
    </a>
  );
}

export function EasyMode({ onDone }: Props) {
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [activeSub, setActiveSub]   = useState<SubType>('normal');
  const [animating, setAnimating]   = useState(false);
  const [copied, setCopied]         = useState<Record<string, boolean>>({});

  const sub = SUBS[activeSub];
  const showResult = checkState === 'done';

  async function runCheck() {
    setCheckState('checking');
    const probe = (url: string, ms = 3500): Promise<boolean> =>
      new Promise(res => {
        const img = new Image();
        const t = setTimeout(() => { img.src = ''; res(false); }, ms);
        img.onload  = () => { clearTimeout(t); res(true); };
        img.onerror = () => { clearTimeout(t); res(false); };
        img.src = url + '?_=' + Date.now();
      });
    const ok = await probe('https://www.google.com/favicon.ico').catch(() => false);
    setActiveSub(ok ? 'normal' : 'whitelist');
    setCheckState('done');
    onDone(true);
  }

  function switchTo(type: SubType) {
    if (type === activeSub) return;
    setAnimating(true);
    setTimeout(() => { setActiveSub(type); setAnimating(false); }, 240);
  }

  function selectManual(type: SubType) {
    setActiveSub(type);
    setCheckState('done');
    onDone(true);
  }

  function reset() {
    setCheckState('idle');
    setActiveSub('normal');
    onDone(false);
  }

  function copyUrl(url: string, key: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(p => ({ ...p, [key]: true }));
      setTimeout(() => setCopied(p => ({ ...p, [key]: false })), 1800);
    });
  }

  /* ── IDLE ──────────────────────────────────────────── */
  if (!showResult) {
    return (
      <div className="easy-idle">
        <button
          className={`easy-check-btn ${checkState === 'checking' ? 'loading' : ''}`}
          onClick={runCheck}
          disabled={checkState === 'checking'}
        >
          {checkState === 'checking'
            ? <><span className="easy-spinner" />Проверяем соединение…</>
            : <>🔍 Определить автоматически</>}
        </button>
        <p className="easy-hint-text">Нажмите — подберём нужный вариант за пару секунд</p>

        <div className="easy-manual-wrap">
          <span className="easy-manual-label">Выбрать вручную</span>
          <div className="easy-manual-row">
            <button className="easy-manual-pill pill-normal"  onClick={() => selectManual('normal')}>🌍 Обычный список</button>
            <button className="easy-manual-pill pill-white"   onClick={() => selectManual('whitelist')}>🗺️ Белый список</button>
            <button className="easy-manual-pill pill-outline" onClick={() => selectManual('outline')}>🔑 Outline</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── RESULT ────────────────────────────────────────── */
  return (
    <div className={`easy-result ${animating ? 'fade-out' : 'fade-in'}`}>

      <div className="easy-result-card" style={{ '--rc': sub.color } as React.CSSProperties}>
        {/* Header */}
        <div className="easy-result-head">
          <span className="easy-result-emoji">{sub.emoji}</span>
          <div>
            <div className="easy-result-tag">Рекомендуем</div>
            <div className="easy-result-name">{sub.label}</div>
          </div>
          <button className="easy-recheck" onClick={reset} title="Начать заново">↺</button>
        </div>

        <p className="easy-result-hint">{sub.hint}</p>

        {/* Outline mode */}
        {activeSub === 'outline' ? (
          <OutlineKeys />
        ) : (
          <>
            {/* Sub URL */}
            <div className="easy-url-block">
              <div className="easy-url-label">Ссылка на подписку</div>
              <div className="easy-url-row">
                <code className="easy-url">{sub.cdnUrl}</code>
                <button
                  className={`easy-copy-btn ${copied['url'] ? 'ok' : ''}`}
                  onClick={() => copyUrl(sub.cdnUrl, 'url')}
                >{copied['url'] ? '✓ Скопировано' : '⎘ Копировать'}</button>
              </div>
            </div>

            {/* All 6 clients in one unified grid — no toggle */}
            <div className="easy-clients-label">Открыть в приложении</div>
            <div className="easy-clients">
              {CLIENTS.map(c => (
                <ClientBtn key={c.id} clientId={c.id} subType={activeSub} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* "Still not working" */}
      <div className="easy-fallback-block">
        <div className="easy-fallback-title">Всё ещё не работает?</div>
        <p className="easy-fallback-desc">Попробуйте другой список — иногда один вариант работает лучше в зависимости от вашей сети.</p>
        <div className="easy-fallback-pills">
          {(['normal', 'whitelist', 'outline'] as SubType[]).map(type => (
            <button
              key={type}
              className={`easy-type-pill ${activeSub === type ? 'pill-current' : ''}`}
              style={activeSub === type
                ? { borderColor: SUBS[type].color, color: SUBS[type].color, background: `${SUBS[type].color}18` }
                : {}}
              onClick={() => switchTo(type)}
              disabled={activeSub === type}
            >
              {SUBS[type].emoji} {SUBS[type].label}
            </button>
          ))}
        </div>
      </div>

      <p className="easy-amnezia-note">
        🔒 Ключи AmneziaWG в этом репозитории не публикуются — для Amnezia используйте встроенный поиск серверов внутри приложения.
      </p>
    </div>
  );
}

/* ── Outline SS key viewer ───────────────────────────── */
const SS_URL = 'https://cdn.jsdelivr.net/gh/igareck/vpn-configs-for-russia@main/BLACK_SS+All_RUS.txt';

function OutlineKeys() {
  const [keys, setKeys]       = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded]   = useState(false);
  const [copied, setCopied]   = useState<Record<number, boolean>>({});
  const [search, setSearch]   = useState('');

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch(SS_URL + '?t=' + Date.now());
      const text = await res.text();
      const ssKeys = text.split('\n').map(l => l.trim()).filter(l => l.startsWith('ss://'));
      setKeys(ssKeys);
      setLoaded(true);
    } catch { setKeys([]); }
    setLoading(false);
  }

  function copyKey(key: string, idx: number) {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(p => ({ ...p, [idx]: true }));
      setTimeout(() => setCopied(p => ({ ...p, [idx]: false })), 1600);
    });
  }

  const filtered = keys.filter(k =>
    !search || k.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50);

  if (!loaded) {
    return (
      <div className="outline-load-wrap">
        <p className="outline-desc">
          SS-ключи совместимы с <strong>Outline</strong>, Shadowsocks и другими клиентами с поддержкой протокола SS.
        </p>
        <button className="outline-load-btn" onClick={load} disabled={loading}>
          {loading ? <><span className="easy-spinner" />Загружаем ключи…</> : '🔑 Показать SS-ключи'}
        </button>
      </div>
    );
  }

  return (
    <div className="outline-keys-wrap">
      <div className="outline-toolbar">
        <input className="outline-search" placeholder="Поиск…" value={search} onChange={e => setSearch(e.target.value)} />
        <span className="outline-count">{filtered.length} / {keys.length}</span>
      </div>
      <div className="outline-list">
        {filtered.map((k, i) => (
          <div key={i} className="outline-key-row">
            <code className="outline-key-text">{k.slice(0, 72)}{k.length > 72 ? '…' : ''}</code>
            <button className={`outline-copy ${copied[i] ? 'ok' : ''}`} onClick={() => copyKey(k, i)}>
              {copied[i] ? '✓' : '⎘'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
