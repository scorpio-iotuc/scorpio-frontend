import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import Navbar from "../../components/NavBar/NavBar.jsx";
import ArticleBlock from "../../components/Article/ArticleBlock.jsx";
import core from "../../data/articles/core.json";
import english from "../../data/articles/documentation-en.jsonc?raw";
import spanish from "../../data/articles/documentation-es.jsonc?raw";
import { parseJsonc } from "../../utils/parseJsonc.js";
import { FaMoon, FaSun } from "react-icons/fa6";
import { useAppContext } from "../../app/useAppContext";
import "./Documentation.css";

const content = { en: parseJsonc(english), es: parseJsonc(spanish) };
const labels = {
  en: {
    title: "Documentation",
    intro:
      "Build your Scorpio ground station. From your first Raspberry Pi boot to a connected, running infrastructure.",
    search: "Search documentation",
    contents: "Contents",
    all: "All sections",
    empty: "No matching sections. Try another search.",
    updated: "Updated",
    by: "Written by",
    source: "View on GitHub",
    top: "Back to top",
    guide: "INSTALLATION GUIDE",
    language: "Language",
  },
  es: {
    title: "Documentación",
    intro:
      "Construye tu estación terrestre Scorpio. Desde el primer arranque de tu Raspberry Pi hasta una infraestructura conectada y en funcionamiento.",
    search: "Buscar en la documentación",
    contents: "Contenido",
    all: "Todas las secciones",
    empty: "No se encontraron secciones. Prueba otra búsqueda.",
    updated: "Actualizado",
    by: "Escrito por",
    source: "Ver en GitHub",
    top: "Volver arriba",
    guide: "GUÍA DE INSTALACIÓN",
    language: "Idioma",
  },
};

export default function Documentation() {
  const { darkMode, toggleDarkMode } = useAppContext();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const article = core.articles.find((article) => article.path === "documentation");
  const language = article.languages.includes(params.get("lang")) ? params.get("lang") : "en";
  const t = labels[language];
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("page-0");
  const [expandedPages, setExpandedPages] = useState(() => new Set());
  const blocks = content[language].articles_content;
  const pages = useMemo(() => {
    const groups = [];
    for (const [index, block] of blocks.entries()) {
      let page = groups.find((item) => item.number === block.page_num);
      if (!page) {
        page = { number: block.page_num, blocks: [] };
        groups.push(page);
      }
      page.blocks.push({
        ...block,
        id:
          block.type === "h1"
            ? `page-${block.page_num}`
            : `section-${block.page_num}-${index}`,
      });
    }
    return groups;
  }, [blocks]);
  const needle = query.trim().toLocaleLowerCase(language);
  const filtered = pages.filter((page) =>
    page.blocks.some((block) =>
      `${block.content} ${(block.list_content || []).join(" ")}`
        .toLocaleLowerCase(language)
        .includes(needle),
    ),
  );

  useEffect(() => {
    document.title = `Scorpio - ${t.title}`;
    const previous = document.documentElement.lang;
    document.documentElement.lang = language;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [language, t.title]);

  useEffect(() => {
    const scrollToHash = () => {
      const target = document.getElementById(window.location.hash.slice(1));
      target?.scrollIntoView({ block: "start" });
    };
    const frame = requestAnimationFrame(scrollToHash);
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [language, location.hash]);

  useEffect(() => {
    const headings = [
      ...document.querySelectorAll(
        ".docs-article h1, .docs-article h2, .docs-article h3",
      ),
    ];
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const current = headings
        .filter((heading) => heading.getBoundingClientRect().top <= 150)
        .at(-1);
      setActive(current?.id || "page-0");
    };
    const onScroll = () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [language]);

  return (
    <div className="documentation" lang={language}>
      <a className="docs-skip" href="#docs-content">
        {language === "es" ? "Saltar al contenido" : "Skip to content"}
      </a>
      <Navbar showFilterSidebar={false} showTelemetry={false} />
      <header className="docs-hero" id="documentation-top">
        <div>
          <p className="docs-eyebrow">SCORPIO / {t.guide}</p>
          <h1>{t.title}</h1>
          <p className="docs-intro">{t.intro}</p>
        </div>
        <div className="docs-controls">
          <button
            type="button"
            className="docs-theme-toggle"
            onClick={toggleDarkMode}
            aria-pressed={darkMode}
            aria-label={language === "es" ? "Modo oscuro" : "Dark mode"}
            title={
              language === "es"
                ? darkMode
                  ? "Activar modo claro"
                  : "Activar modo oscuro"
                : darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <FaSun aria-hidden="true" />
            ) : (
              <FaMoon aria-hidden="true" />
            )}
          </button>
          <label className="docs-language">
            {t.language}
            <select
              value={language}
              onChange={(event) => {
                const next = new URLSearchParams(params);
                next.set("lang", event.target.value);
                navigate(
                  {
                    pathname: location.pathname,
                    search: next.toString(),
                    hash: location.hash,
                  },
                  { preventScrollReset: true },
                );
                setQuery("");
              }}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </label>
        </div>
      </header>
      <div className="docs-layout">
        {/* Sidebar */}
        <aside className="docs-sidebar">
          <label className="docs-search">
            <span>{t.search}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                language === "es" ? "Buscar una sección…" : "Find a section…"
              }
            />
          </label>
          <nav aria-label={t.contents}>
            <p className="docs-nav-label">{t.contents}</p>
            {filtered.length === 0 && <p role="status">{t.empty}</p>}
            {filtered.map((page) => (
              <div className="docs-nav-group" key={page.number}>
                <a
                  className="docs-page-link"
                  aria-expanded={expandedPages.has(page.number)}
                  aria-current={
                    active === `page-${page.number}` ? "location" : undefined
                  }
                  href={`#page-${page.number}`}
                  onClick={() => {
                    setExpandedPages((current) => {
                      const next = new Set(current);
                      if (next.has(page.number)) {
                        next.delete(page.number);
                      } else {
                        next.add(page.number);
                      }
                      return next;
                    });
                  }}
                >
                  {page.blocks.find((block) => block.type === "h1")?.content}
                </a>
                {expandedPages.has(page.number) &&
                  page.blocks
                    .filter((block) => block.type === "h2" || block.type === "h3")
                    .map((block) => (
                      <a
                        className={`docs-section-link docs-section-link--${block.type}`}
                        aria-current={
                          active === block.id ? "location" : undefined
                        }
                        key={block.id}
                        href={`#${block.id}`}
                      >
                        {block.content}
                      </a>
                    ))}
              </div>
            ))}
          </nav>
          <a
            className="docs-source"
            href={`https://github.com/scorpio-iotuc/Scorpio-Project/tree/main/docs/${language}`}
            target="_blank"
            rel="noreferrer"
          >
            {t.source} ↗
          </a>
        </aside>
        {/* Main document */}
        <main className="docs-article" id="docs-content" tabIndex={-1}>
          <div className="docs-meta">
            {/* Last date edited */}
            <span>
              {t.updated}{" "}
              <time dateTime={article.last_edited}>
                {new Intl.DateTimeFormat(language, {
                  dateStyle: "long",
                  timeZone: "UTC",
                }).format(new Date(article.last_edited))}
              </time>
            </span>
            {/* Authors who wrote the document */}
            <span>
              {t.by}{" "}
              {article.author_indexes
                .map((index) => core.collaborators[index]?.name)
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
          {/* Document content */}
          {pages.map((page) => (
            <section
              className="docs-page"
              key={`${language}-${page.number}`}
              aria-labelledby={`page-${page.number}`}
            >
              {page.blocks.map((block) => (
                <ArticleBlock
                  key={block.id}
                  block={block}
                  id={block.id}
                  language={language}
                />
              ))}
            </section>
          ))}
          <footer className="docs-footer">
            <span>SCORPIO - {t.title}</span>
            <a href="#documentation-top">{t.top} ↑</a>
          </footer>
        </main>
      </div>
    </div>
  );
}
