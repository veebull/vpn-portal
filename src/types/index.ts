export interface ConfigFile {
  id: string;
  name: string;
  filename: string;
  category: 'black' | 'white' | 'tor' | 'other';
  listType: 'cidr' | 'sni' | 'vless' | 'ss' | 'tor' | 'mixed';
  isMobile: boolean;
  isFiltered?: boolean;
  rawUrl: string;
  cdnUrl: string;
  description: string;
  useCases: string[];
  protocols: string[];
  lastUpdated?: string;
  configCount?: number;
  badge?: string;
}

export interface ParsedConfig {
  raw: string;
  protocol: string;
  name: string;
  server?: string;
  port?: number;
  country?: string;
  flag?: string;
  tags?: string[];
}

export interface AppState {
  activeCategory: 'all' | 'black' | 'white' | 'tor';
  selectedFile: ConfigFile | null;
  configs: ParsedConfig[];
  loading: boolean;
  lastFetch: string | null;
}
