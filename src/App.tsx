import { useState, useMemo } from "react";
import { CONFIG_FILES, CATEGORY_META } from "./data/configs";
import type { ConfigFile } from "./types";
import { useGithubLastCommit } from "./hooks/useConfigs";
import { ConfigCard } from "./components/ConfigCard";
import { ConfigDetail } from "./components/ConfigDetail";
import { CategoryBadge } from "./components/CategoryBadge";
import "./App.css";

type Category = "all" | "black" | "white" | "tor";

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [selectedFile, setSelectedFile] = useState<ConfigFile | null>(null);
  const lastCommit = useGithubLastCommit();

  const filteredFiles = useMemo(() => {
    if (activeCategory === "all") return CONFIG_FILES;
    return CONFIG_FILES.filter((f) => f.category === activeCategory);
  }, [activeCategory]);

  const categories: {
    id: Category;
    label: string;
    emoji: string;
    count: number;
  }[] = [
    { id: "all", label: "Все", emoji: "✦", count: CONFIG_FILES.length },
    {
      id: "black",
      label: "Обычный список",
      emoji: "🌍",
      count: CONFIG_FILES.filter((f) => f.category === "black").length,
    },
    {
      id: "white",
      label: "Белые списки",
      emoji: "🗺️",
      count: CONFIG_FILES.filter((f) => f.category === "white").length,
    },
    {
      id: "tor",
      label: "Tor Bridges",
      emoji: "🧅",
      count: CONFIG_FILES.filter((f) => f.category === "tor").length,
    },
  ];

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">⬡</span>
            <span className="logo-text">
              VPN<span className="logo-accent">Portal</span>
            </span>
          </div>

          <div className="header-meta">
            {lastCommit && (
              <div className="last-update">
                <span className="pulse-dot" />
                <span>
                  Обновлено{" "}
                  {new Date(lastCommit).toLocaleString("ru", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <a
              href="https://github.com/igareck/vpn-configs-for-russia"
              target="_blank"
              rel="noreferrer"
              className="github-link"
            >
              <svg
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        <div className="hero">
          <h1 className="hero-title">
            Найдётся другой
            <br />
            <span className="hero-accent">путь</span>
          </h1>
          <p className="hero-sub">
            Проверенные конфигурации серверов. Проходят автотест каждые 1–2
            часа.
          </p>
        </div>

        <nav className="category-nav">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(cat.id as Category);
                setSelectedFile(null);
              }}
            >
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-label">{cat.label}</span>
              <span className="cat-count">{cat.count}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {activeCategory !== "all" && (
          <div className="category-banner">
            <CategoryBadge category={activeCategory} />
            <p className="category-desc">
              {
                CATEGORY_META[activeCategory as keyof typeof CATEGORY_META]
                  ?.longDescription
              }
            </p>
          </div>
        )}

        <div className="cards-grid">
          {filteredFiles.map((file) => (
            <ConfigCard
              key={file.id}
              file={file}
              isSelected={selectedFile?.id === file.id}
              onClick={() =>
                setSelectedFile(selectedFile?.id === file.id ? null : file)
              }
            />
          ))}
        </div>

        {selectedFile && (
          <ConfigDetail
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
          />
        )}
      </main>

      <footer className="footer">
        <p>
          Данные из{" "}
          <a
            href="https://github.com/igareck/vpn-configs-for-russia"
            target="_blank"
            rel="noreferrer"
          >
            igareck/vpn-configs-for-russia
          </a>{" "}
          · Обновляется через GitHub Actions · Не собирает данные пользователей
        </p>
      </footer>
    </div>
  );
}
