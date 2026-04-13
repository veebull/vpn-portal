import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { buildDeepLink } from '../utils/parser';

// Sub URLs per type
const SUB_URLS: Record<string, string> = {
  normal:    'https://cdn.jsdelivr.net/gh/igareck/vpn-configs-for-russia@main/BLACK_VLESS_RUS_mobile.txt',
  whitelist: 'https://cdn.jsdelivr.net/gh/igareck/vpn-configs-for-russia@main/Vless-Reality-White-Lists-Rus-Mobile.txt',
  outline:   'https://cdn.jsdelivr.net/gh/igareck/vpn-configs-for-russia@main/BLACK_SS+All_RUS.txt',
};


export function DeepLinkRedirect() {
  const { clientId, subType } = useParams<{ clientId: string; subType: string }>();

  useEffect(() => {
    const subUrl = SUB_URLS[subType || 'normal'] || SUB_URLS.normal;
    const deepLink = buildDeepLink(subUrl, clientId || 'v2box');

    // Small delay so page renders first (avoids blank flash)
    const timer = setTimeout(() => {
      // If running inside Telegram Mini App — use Telegram's native openLink
      if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(deepLink);
      } else {
        // Regular browser — just navigate
        window.location.href = deepLink;
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [clientId, subType]);

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
      gap: 16,
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 40 }}>🔗</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#e8f0ff' }}>Открываем приложение…</div>
      <div style={{ fontSize: 13, color: '#5a7090', maxWidth: 320 }}>
        Если ничего не произошло — скопируйте ссылку на подписку и вставьте вручную.
      </div>
      <div style={{
        width: 32, height: 32,
        border: '3px solid rgba(74,158,255,0.2)',
        borderTopColor: '#4a9eff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginTop: 8,
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
