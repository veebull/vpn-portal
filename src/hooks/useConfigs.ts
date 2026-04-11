import { useState, useEffect, useCallback } from 'react';
import type { ConfigFile, ParsedConfig } from '../types';
import { parseConfigFile } from '../utils/parser';

const CACHE_TTL = 1000 * 60 * 15; // 15 min

interface CacheEntry {
  data: ParsedConfig[];
  ts: number;
  count: number;
}

const memCache = new Map<string, CacheEntry>();

export function useConfigs(file: ConfigFile | null) {
  const [configs, setConfigs] = useState<ParsedConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [count, setCount] = useState(0);

  const fetchConfigs = useCallback(async (force = false) => {
    if (!file) { setConfigs([]); return; }

    const cached = memCache.get(file.id);
    if (!force && cached && Date.now() - cached.ts < CACHE_TTL) {
      setConfigs(cached.data);
      setCount(cached.count);
      setLastUpdated(new Date(cached.ts));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try CDN first, fallback to raw GitHub
      let res = await fetch(file.cdnUrl + '?t=' + Math.floor(Date.now() / CACHE_TTL));
      if (!res.ok) res = await fetch(file.rawUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text();
      const parsed = parseConfigFile(text);
      const entry: CacheEntry = { data: parsed, ts: Date.now(), count: parsed.length };
      memCache.set(file.id, entry);

      setConfigs(parsed);
      setCount(parsed.length);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [file]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return { configs, loading, error, lastUpdated, count, refetch: () => fetchConfigs(true) };
}

export function useGithubLastCommit() {
  const [lastCommit, setLastCommit] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/igareck/vpn-configs-for-russia/commits/main?per_page=1')
      .then(r => r.json())
      .then(d => {
        const ts = d?.commit?.committer?.date;
        if (ts) setLastCommit(ts);
      })
      .catch(() => {});
  }, []);

  return lastCommit;
}
