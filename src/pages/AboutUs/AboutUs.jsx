import { useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import {
  FaMoon,
  FaSun,
  FaArrowUpRightFromSquare,
  FaEnvelope,
} from "react-icons/fa6";
import Navbar from "../../components/NavBar/NavBar.jsx";
import ArticleBlock from "../../components/Article/ArticleBlock.jsx";
import { useAppContext } from "../../app/useAppContext";
import { parseJsonc } from "../../utils/parseJsonc";
import core from "../../data/articles/core.json";
import english from "../../data/articles/aboutus-en.jsonc?raw";
import spanish from "../../data/articles/aboutus-es.jsonc?raw";
import "../Documentation/Documentation.css";
import "./AboutUs.css";

const articles = { en: parseJsonc(english), es: parseJsonc(spanish) };
const labels = {
  en: {
    title: "About SCORPIO",
    eyebrow: "PROJECT AND TEAM",
    language: "Language",
    dark: "Dark mode",
    team: "Meet the people behind SCORPIO",
    jump: "Explore the team",
    docs: "Read the documentation",
    contact: "Contact the team",
    profile: "Research profile",
    email: "Email",
    nationality: "Nationality",
    updated: "Updated",
    skip: "Skip to content",
    by: "Written by",
  },
  es: {
    title: "Acerca de SCORPIO",
    eyebrow: "PROYECTO Y EQUIPO",
    language: "Idioma",
    dark: "Modo oscuro",
    team: "Las personas detrás de SCORPIO",
    jump: "Conoce al equipo",
    docs: "Lee la documentación",
    contact: "Contacta al equipo",
    profile: "Perfil de investigación",
    email: "Correo",
    nationality: "Nacionalidad",
    updated: "Actualizado",
    skip: "Saltar al contenido",
    by: "Escrito por",
  },
};

export default function AboutUs() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useAppContext();
  const article = core.articles.find((item) => item.path === "aboutus");
  const language = article.languages.includes(params.get("lang"))
    ? params.get("lang")
    : "en";
  const t = labels[language];
  const blocks = articles[language].articles_content;
  const renderPage = (page) =>
    blocks
      .filter((block) => block.page_num === page)
      .map((block, index) => (
        <ArticleBlock
          key={index}
          block={block}
          id={`about-${page}-${index}`}
          language={language}
        />
      ));

  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    const previousTitle = document.title;
    document.documentElement.lang = language;
    document.title = `${t.title} · SCORPIO`;
    return () => {
      document.documentElement.lang = previousLanguage;
      document.title = previousTitle;
    };
  }, [language, t.title]);

  return (
    <div className="documentation about-us" lang={language}>
      <a className="docs-skip" href="#about-content">
        {t.skip}
      </a>
      <Navbar showFilterSidebar={false} showTelemetry={false} />
      <main id="about-content" tabIndex={-1}>
        <header className="about-hero">
          <div className="about-hero-top">
            <p className="docs-eyebrow">SCORPIO / {t.eyebrow}</p>
            <div className="docs-controls">
              <button
                type="button"
                className="docs-theme-toggle"
                onClick={toggleDarkMode}
                aria-pressed={darkMode}
                aria-label={t.dark}
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
                  }}
                >
                  {article.languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang === "es" ? "Español" : "English"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="about-introduction">{renderPage(0)}</div>
          <nav
            className="about-actions"
            aria-label={
              language === "es" ? "Explorar SCORPIO" : "Explore SCORPIO"
            }
          >
            <a className="about-button" href="#research-team">
              {t.jump} ↓
            </a>
            <Link
              className="about-button about-button-secondary"
              to={`/documentation?lang=${language}`}
            >
              {t.docs} →
            </Link>
          </nav>
        </header>
        <div className="about-body">
          <section className="about-overview" aria-labelledby="about-1-0">
            <div className="about-prose">{renderPage(1)}</div>
            <div className="about-prose about-infrastructure">
              {renderPage(2)}
            </div>
          </section>
          <section className="about-labs" aria-labelledby="about-3-0">
            <div className="about-prose">{renderPage(3)}</div>
            <div className="about-institutions">
              {Object.entries(core.institutions).map(([id, institution]) => (
                <a
                  href={institution.url}
                  key={id}
                  target="_blank"
                  rel="noreferrer"
                  className="about-institution"
                >
                  {institution.logo ? (
                    <img src={institution.logo} alt="" />
                  ) : (
                    <span className="about-inria-wordmark">Inria</span>
                  )}
                  <span>
                    <strong>{institution.short_name}</strong>
                    <span>
                      {institution.city}, {institution.country[language]}
                    </span>
                  </span>
                  <FaArrowUpRightFromSquare aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>
          <section
            className="about-team"
            id="research-team"
            aria-labelledby="team-heading"
          >
            <p className="docs-eyebrow">IoT-UC / LATINA-UC</p>
            <h2 id="team-heading">{t.team}</h2>
            {core.team_groups.map((group) => (
              <section
                className="about-team-group"
                key={group.path}
                aria-labelledby={`team-${group.path}`}
              >
                <h3 id={`team-${group.path}`}>{group.name[language]}</h3>
                <div className="about-people">
                  {core.collaborators
                    .filter((person) => person.team_group === group.path)
                    .map((person) => {
                      const institution = core.institutions[person.institution];
                      return (
                        <article className="about-person" key={person.id}>
                          <div className="about-person-top">
                            <a
                              href={institution.url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={institution.name}
                              className="about-affiliation"
                            >
                              {institution.logo ? (
                                <img src={institution.logo} alt="" />
                              ) : (
                                <span>Inria</span>
                              )}
                            </a>
                            {person.nationality && (
                              <span
                                className="about-nationality"
                                title={`${t.nationality}: ${person.nationality[language]}`}
                              >
                                <span aria-hidden="true">
                                  {person.nationality.flag}
                                </span>
                                {/* <span>{person.nationality[language]}</span> */}
                              </span>
                            )}
                          </div>
                          <img
                            className="about-portrait"
                            src={person.image}
                            alt={person.name}
                            width="50"
                            height="50"
                            loading="lazy"
                          />
                          <h4>{person.name}</h4>
                          <p className="about-team-role">
                            {person["team-role"][language]}
                          </p>
                          <p className="about-person-role">
                            {person.role[language]}
                          </p>
                          <p className="about-person-institution">
                            {institution.name}
                            <br />
                            {institution.city}, {institution.country[language]}
                          </p>
                          <div className="about-person-links">
                            {person.profile && (
                              <a
                                href={person.profile}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {t.profile}{" "}
                                <FaArrowUpRightFromSquare aria-hidden="true" />
                              </a>
                            )}
                            {person.email && (
                              <a
                                href={`mailto:${person.email}`}
                                aria-label={`${t.email}: ${person.name}`}
                              >
                                <FaEnvelope aria-hidden="true" /> {t.email}
                              </a>
                            )}
                          </div>
                        </article>
                      );
                    })}
                </div>
              </section>
            ))}
          </section>
          <section
            className="about-related about-prose"
            aria-labelledby="about-4-0"
          >
            {renderPage(4)}
          </section>
          <footer className="about-footer">
            <div>
              <strong>SCORPIO</strong>
              <span>IoT-UC · LATINA-UC · UC Chile</span>
            </div>
            <a href="mailto:scorpioiotuc@gmail.com">{t.contact} ↗</a>
            <span>
              {t.updated}{" "}
              <time dateTime={article.last_edited}>
                {new Intl.DateTimeFormat(language, {
                  dateStyle: "long",
                  timeZone: "UTC",
                }).format(new Date(article.last_edited))}
              </time>
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
