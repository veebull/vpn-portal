import { useState, useMemo } from 'react';
import { CONFIG_FILES, CATEGORY_META } from './data/configs';
import type { ConfigFile } from './types';
import { useGithubLastCommit } from './hooks/useConfigs';
import { ConfigCard } from './components/ConfigCard';
import { ConfigDetail } from './components/ConfigDetail';
import { CategoryBadge } from './components/CategoryBadge';
import { EasyMode } from './components/EasyMode';
import './App.css';

type Mode = 'easy' | 'expert';
type Category = 'all' | 'black' | 'white' | 'tor';

export default function App() {
  const [mode, setMode] = useState<Mode>('easy');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [selectedFile, setSelectedFile] = useState<ConfigFile | null>(null);
  const [easyDone, setEasyDone] = useState(false);
  const lastCommit = useGithubLastCommit();

  const filteredFiles = useMemo(() => {
    if (activeCategory === 'all') return CONFIG_FILES;
    return CONFIG_FILES.filter(f => f.category === activeCategory);
  }, [activeCategory]);

  const categories: { id: Category; label: string; emoji: string; count: number }[] = [
    { id: 'all',   label: 'Все',            emoji: '✦',  count: CONFIG_FILES.length },
    { id: 'black', label: 'Обычный список',  emoji: '🌍', count: CONFIG_FILES.filter(f => f.category === 'black').length },
    { id: 'white', label: 'Белые списки',   emoji: '🗺️', count: CONFIG_FILES.filter(f => f.category === 'white').length },
    { id: 'tor',   label: 'Tor Bridges',    emoji: '🧅', count: CONFIG_FILES.filter(f => f.category === 'tor').length },
  ];

  const ModeSwitcher = () => (
    <div className="mode-switch">
      <button className={`mode-btn ${mode === 'easy' ? 'active' : ''}`} onClick={() => setMode('easy')}>
        ✨ Просто
      </button>
      <button className={`mode-btn ${mode === 'expert' ? 'active' : ''}`} onClick={() => setMode('expert')}>
        ⚙️ Эксперт
      </button>
    </div>
  );

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── Topbar ───────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="logo">
            <span className="logo-mark">⬡</span>
            <span className="logo-text">VPN<span className="logo-accent">Portal</span></span>
          </div>
          <div className="topbar-center">
            <ModeSwitcher />
          </div>
          <div className="topbar-right">
            {lastCommit && (
              <div className="last-update">
                <span className="pulse-dot" />
                <span>{new Date(lastCommit).toLocaleString('ru', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Easy mode ────────────────────────────────────── */}
      {mode === 'easy' && (
        <div className={`easy-page ${easyDone ? 'easy-page--done' : ''}`}>
          {/* Hero: скрывается когда список выбран */}
          {!easyDone && (
            <div className="hero-center">
              <h1 className="hero-title-sm">Найдётся другой <span className="hero-accent">путь</span></h1>
              <p className="hero-sub-sm">Проверенные конфигурации. Автотест каждые 1–2 часа.</p>
            </div>
          )}
          <main className="main main--easy">
            <EasyMode onDone={setEasyDone} />
          </main>
        </div>
      )}

      {/* ── Expert mode ──────────────────────────────────── */}
      {mode === 'expert' && (
        <>
          <div className="expert-header">
            <div className="expert-header-inner">
              <div>
                <h1 className="hero-title-sm">Найдётся другой <span className="hero-accent">путь</span></h1>
                <p className="hero-sub-sm">Проверенные конфигурации. Автотест каждые 1–2 часа.</p>
              </div>
            </div>
            <nav className="category-nav">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => { setActiveCategory(cat.id as Category); setSelectedFile(null); }}
                >
                  <span className="cat-emoji">{cat.emoji}</span>
                  <span className="cat-label">{cat.label}</span>
                  <span className="cat-count">{cat.count}</span>
                </button>
              ))}
            </nav>
          </div>
          <main className="main">
            {activeCategory !== 'all' && (
              <div className="category-banner">
                <CategoryBadge category={activeCategory} />
                <p className="category-desc">
                  {CATEGORY_META[activeCategory as keyof typeof CATEGORY_META]?.longDescription}
                </p>
              </div>
            )}
            <div className="cards-grid">
              {filteredFiles.map(file => (
                <ConfigCard
                  key={file.id}
                  file={file}
                  isSelected={selectedFile?.id === file.id}
                  onClick={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                />
              ))}
            </div>
            {selectedFile && (
              <ConfigDetail file={selectedFile} onClose={() => setSelectedFile(null)} />
            )}
          </main>
        </>
      )}

      <footer className="footer">
        <p>Данные из <a href="https://github.com/igareck/vpn-configs-for-russia" target="_blank" rel="noreferrer">igareck/vpn-configs-for-russia</a> · Обновляется через GitHub Actions · Не собирает данные</p>
      </footer>
    </div>
  );
}
