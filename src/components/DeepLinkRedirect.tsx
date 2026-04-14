import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Route: /#/open/:encodedDeeplink
// encodedDeeplink is encodeURIComponent(deeplink), e.g. "v2box%3A%2F%2F..."
// This page opens in external browser (via Telegram openLink) and redirects to the deeplink.
// External browser CAN open custom URL schemes — Mini App webview cannot.

export function DeepLinkRedirect() {
  const { encodedDeeplink } = useParams<{ encodedDeeplink: string }>();
  const deeplink = decodeURIComponent(encodedDeeplink || '');

  useEffect(() => {
    if (!deeplink) return;
    // Tiny delay so the page visually renders before redirect
    const t = setTimeout(() => {
      window.location.href = deeplink;
    }, 150);
    return () => clearTimeout(t);
  }, [deeplink]);

  // Detect protocol for display
  const appName = deeplink.startsWith('v2box') ? 'v2Box'
    : deeplink.startsWith('v2rayng') ? 'v2RayNG'
    : deeplink.startsWith('happ') ? 'Happ'
    : deeplink.startsWith('streisand') ? 'Streisand'
    : deeplink.startsWith('clash') ? 'NekoBox'
    : deeplink.startsWith('sub://') ? 'Shadowrocket'
    : 'приложение';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#060912',
      color: '#c8d8f0',
      fontFamily: "'Outfit', sans-serif",
      gap: 14,
      padding: 28,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 44 }}>🔗</div>
      <div style={{ fontSize: 17, fontWeight: 600, color: '#e8f0ff' }}>
        Открываем {appName}…
      </div>
      <div style={{ fontSize: 13, color: '#5a7090', maxWidth: 300, lineHeight: 1.6 }}>
        Если приложение не открылось — убедитесь, что оно установлено, или скопируйте ссылку на подписку вручную.
      </div>
      <div style={{
        width: 28, height: 28, marginTop: 6,
        border: '2.5px solid rgba(74,158,255,0.2)',
        borderTopColor: '#4a9eff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {deeplink && (
        <a
          href={deeplink}
          style={{ marginTop: 8, fontSize: 12, color: '#4a9eff', textDecoration: 'underline' }}
        >
          Открыть вручную
        </a>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
