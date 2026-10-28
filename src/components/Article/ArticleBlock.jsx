import { Fragment, useState } from 'react'
import { Link } from 'react-router'

function safeHref(href) {
  return /^(https?:\/\/|mailto:|#|\/[^/])/.test(href) ? href : undefined
}

function docHref(href, language) {
  const page = href.match(/^page(\d+)\.md$/)
  if (page) return `?lang=${language}#page-${page[1]}`
  if (href === 'README.md' || href === '../README.md') return `?lang=${language}#page-0`
  if (/^\.\.\/(en|es)\/README\.md$/.test(href)) return `?lang=${href.split('/')[1]}#page-0`
  return safeHref(href)
}

export function InlineContent({ content, language, highlights = [] }) {
  const parts = content.split(/(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|<sup>.*?<\/sup>)/g)
  return parts.map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      const href = docHref(link[2], language)
      return href?.startsWith('/') || href?.startsWith('?')
        ? <Link key={index} to={href}>{link[1]}</Link>
        : <a key={index} href={href}>{link[1]}</a>
    }
    if (part.startsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
    if (part.startsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>
    if (part.startsWith('<sup>')) return <sup key={index}>{part.slice(5, -6)}</sup>
    if (!highlights.length) return <Fragment key={index}>{part}</Fragment>
    const escaped = highlights.filter(Boolean).map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    return <Fragment key={index}>{escaped.length ? part.split(new RegExp(`(${escaped.join('|')})`, 'g')).map((value, i) => highlights.includes(value) ? <mark key={i}>{value}</mark> : value) : part}</Fragment>
  })
}

function CodeBlock({ content, language }) {
  const [status, setStatus] = useState('')
  async function copy() {
    try {
      await navigator.clipboard.writeText(content)
      setStatus(language === 'es' ? 'Copiado' : 'Copied')
    } catch {
      setStatus(language === 'es' ? 'Selecciona el código para copiarlo' : 'Select the code to copy it')
    }
  }
  return <div className="docs-code"><div className="docs-code-toolbar"><span aria-live="polite">{status || (language === 'es' ? 'Código' : 'Code')}</span><button type="button" onClick={copy}>{language === 'es' ? 'Copiar' : 'Copy'}</button></div><pre><code>{content}</code></pre></div>
}

export default function ArticleBlock({ block, id, language }) {
  const inline = <InlineContent content={block.content} language={language} highlights={block.highlights} />
  if (/^h[123]$/.test(block.type)) {
    const Heading = block.type
    return <Heading id={id}><a className="docs-heading-link" href={`#${id}`}>{inline}</a></Heading>
  }
  switch (block.type) {
    case 'img': return <figure><a href={safeHref(block.img_src)} target="_blank" rel="noreferrer"><img src={safeHref(block.img_src)} alt={block.content} loading="lazy" /></a>{block.img_legend && <figcaption>{block.img_legend}</figcaption>}</figure>
    case 'code': return <CodeBlock content={block.content} language={language} />
    case 'ul':
    case 'ol': {
      const List = block.type
      return <List>{(block.list_content || []).map((item, i) => <li key={i}><InlineContent content={item} language={language} /></li>)}</List>
    }
    case 'li': return <ul><li>{inline}</li></ul>
    case 'cite': return <blockquote>{inline}</blockquote>
    case 'link': return <p>{/^https?:\/\//.test(block.content) ? <a href={safeHref(block.content)}>{block.content}</a> : inline}</p>
    default: return <p>{inline}</p>
  }
}
