import type { ParsedConfig } from '../types';

const FLAG_MAP: Record<string, string> = {
  US: '🇺🇸', DE: '🇩🇪', FR: '🇫🇷', NL: '🇳🇱', GB: '🇬🇧', FI: '🇫🇮',
  SE: '🇸🇪', NO: '🇳🇴', AT: '🇦🇹', CH: '🇨🇭', PL: '🇵🇱', CZ: '🇨🇿',
  CA: '🇨🇦', JP: '🇯🇵', SG: '🇸🇬', AU: '🇦🇺', BR: '🇧🇷', TR: '🇹🇷',
  UA: '🇺🇦', LV: '🇱🇻', LT: '🇱🇹', EE: '🇪🇪', MD: '🇲🇩', RO: '🇷🇴',
  BG: '🇧🇬', HU: '🇭🇺', SK: '🇸🇰', SI: '🇸🇮', HR: '🇭🇷', BA: '🇧🇦',
  RS: '🇷🇸', MK: '🇲🇰', AL: '🇦🇱', ME: '🇲🇪', XK: '🇽🇰', GR: '🇬🇷',
  CY: '🇨🇾', MT: '🇲🇹', PT: '🇵🇹', ES: '🇪🇸', IT: '🇮🇹', BE: '🇧🇪',
  LU: '🇱🇺', IE: '🇮🇪', IS: '🇮🇸', DK: '🇩🇰',
};

const COUNTRY_NAMES: Record<string, string> = {
  US: 'США', DE: 'Германия', FR: 'Франция', NL: 'Нидерланды',
  GB: 'Великобритания', FI: 'Финляндия', SE: 'Швеция', NO: 'Норвегия',
  AT: 'Австрия', CH: 'Швейцария', PL: 'Польша', CZ: 'Чехия',
  CA: 'Канада', JP: 'Япония', SG: 'Сингапур', AU: 'Австралия',
  BR: 'Бразилия', TR: 'Турция', UA: 'Украина', LV: 'Латвия',
  LT: 'Литва', EE: 'Эстония',
};

export function parseConfigLine(line: string): ParsedConfig | null {
  line = line.trim();
  if (!line || line.startsWith('#')) return null;

  let protocol = 'unknown';
  let name = '';
  let server = '';
  let port: number | undefined;
  let country = '';
  let flag = '🌐';
  const tags: string[] = [];

  // Extract name from fragment (#...)
  const fragIdx = line.indexOf('#');
  if (fragIdx !== -1) {
    const rawName = decodeURIComponent(line.slice(fragIdx + 1));
    name = rawName;

    // Extract country code from flag emoji or text
    const countryMatch = rawName.match(/🇦-🇿🇦-🇿/u);
    if (countryMatch) flag = countryMatch[0];

    // Look for [BL] / [WL] / [SNI-RU] / [CIDR] tags
    const tagMatches = rawName.match(/\[([^\]]+)\]/g);
    if (tagMatches) tags.push(...tagMatches.map(t => t.slice(1, -1)));

    // Match country code letters after flags
    for (const [code, f] of Object.entries(FLAG_MAP)) {
      if (rawName.includes(f)) { flag = f; country = COUNTRY_NAMES[code] || code; break; }
    }
  }

  // Parse by protocol
  if (line.startsWith('vless://')) {
    protocol = 'VLESS';
    const urlPart = line.slice(8, fragIdx > 0 ? fragIdx : undefined);
    const atIdx = urlPart.indexOf('@');
    if (atIdx !== -1) {
      const hostPort = urlPart.slice(atIdx + 1).split('?')[0];
      const lastColon = hostPort.lastIndexOf(':');
      server = hostPort.slice(0, lastColon);
      port = parseInt(hostPort.slice(lastColon + 1));
    }
    const params = new URLSearchParams(line.split('?')[1]?.split('#')[0] || '');
    const security = params.get('security');
    const type = params.get('type');
    if (security === 'reality') tags.push('REALITY');
    if (security === 'tls') tags.push('TLS');
    if (type === 'ws') tags.push('WS');
    if (type === 'grpc') tags.push('gRPC');
  } else if (line.startsWith('ss://')) {
    protocol = 'SS';
    const atIdx = line.indexOf('@');
    if (atIdx !== -1) {
      const hostPort = line.slice(atIdx + 1).split('?')[0].split('#')[0];
      const lastColon = hostPort.lastIndexOf(':');
      server = hostPort.slice(0, lastColon);
      port = parseInt(hostPort.slice(lastColon + 1));
    }
  } else if (line.startsWith('vmess://')) {
    protocol = 'VMess';
  } else if (line.startsWith('trojan://')) {
    protocol = 'Trojan';
    const urlPart = line.slice(9);
    const atIdx = urlPart.indexOf('@');
    if (atIdx !== -1) {
      const hostPort = urlPart.slice(atIdx + 1).split('?')[0].split('#')[0];
      const lastColon = hostPort.lastIndexOf(':');
      server = hostPort.slice(0, lastColon);
      port = parseInt(hostPort.slice(lastColon + 1));
    }
  } else if (line.startsWith('hysteria2://') || line.startsWith('hy2://')) {
    protocol = 'Hysteria2';
  } else if (line.startsWith('obfs4') || line.startsWith('Bridge')) {
    protocol = 'Tor Bridge';
    if (!name) name = line.slice(0, 60) + '...';
  }

  if (!name) name = `${protocol} — ${server || 'unknown'}:${port || '?'}`;

  return { raw: line, protocol, name, server, port, country, flag, tags };
}

export function parseConfigFile(text: string): ParsedConfig[] {
  return text
    .split('\n')
    .map(parseConfigLine)
    .filter(Boolean) as ParsedConfig[];
}

export function getProtocolColor(protocol: string): string {
  const map: Record<string, string> = {
    'VLESS': '#4ade80',
    'SS': '#facc15',
    'VMess': '#fb923c',
    'Trojan': '#f472b6',
    'Hysteria2': '#a78bfa',
    'Tor Bridge': '#9b59b6',
  };
  return map[protocol] || '#94a3b8';
}

export function buildDeepLink(raw: string, client: string): string {
  const encoded = encodeURIComponent(raw);
  const b64 = btoa(raw);
  switch (client) {
    case 'v2box':        return `v2box://install-sub?url=${encoded}`;
    case 'v2ray':        return `v2rayng://install-config?url=${encoded}`;
    case 'happ':         return `happ://add/${encoded}`;
    case 'streisand':    return `streisand://import/${b64}`;
    case 'nekobox':      return `clash://install-config?url=${encoded}`;
    case 'shadowrocket': return `sub://${b64}`;
    default: return raw;
  }
}
