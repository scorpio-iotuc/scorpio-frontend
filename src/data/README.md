# Map geometry

`countries.json` contains country geometries from Natural Earth's 1:110m Admin 0 countries dataset, distributed with the installed `three-globe` example (`example/country-polygons/ne_110m_admin_0_countries.geojson`). Only geometry is retained. Natural Earth data is public domain; boundaries are for geographic context, not authoritative territorial claims.


# Website articles

`articles/core.json` is the article and collaborator registry. Each article has a
`path` (filename stem), `languages`, a website `link`, `last_edited`, and
`author_indexes` referencing positions in `collaborators`.

Each article and language now has its own JSONC file:

- `articles/documentation-en.jsonc` and `documentation-es.jsonc`
- `articles/aboutus-en.jsonc` and `aboutus-es.jsonc`

The filename convention is `<path>-<language>.jsonc`. Each file has one flat
`articles_content` array of ordered blocks, rather than an outer array of articles.
The frontend reads these files through Vite raw imports.

```jsonc
{
  // One article, one language
  "articles_content": [
    { "page_num": 0, "type": "h1", "content": "Article title" },
    { "page_num": 0, "type": "text", "content": "Introduction" }
  ]
}
```

The block contract is unchanged:

- `page_num`: logical page/section number.
- `type`: `h1`, `h2`, `h3`, `text`, `link`, `img`, `ul`, `ol`, `li`, `code`, or `cite`.
- `content`: a string (empty for lists); image alternative text for `img`.
- `img_src` and optional `img_legend`: image path and caption.
- `list_content`: array of strings for `ul` and `ol`.
- `highlights`: optional array of exact phrases for `text`.

Inline Markdown links, bold, emphasis, inline code and superscripts are supported.
HTML is not executed. Code preserves whitespace. JSONC accepts `//` and `/* */`
comments outside strings; trailing commas are not supported.

Documentation pages 0–5 correspond to the source overview and guide pages.
About Us pages 0–4 hold introductory sections; collaborator `content_page` values
point to their biography blocks. `core.json` stores localized `role`, `team-role`
and `nationality`, plus institutional references, photos and optional public
contact/profile links. `team_groups` determines display order. Nationality and
institution country are distinct. `null` nationality is supported and hidden.

To refresh the documentation and its images:

```sh
python3 scripts/import-documentation.py /path/to/Scorpio-Project/docs
```

This replaces only `documentation-en.jsonc` and `documentation-es.jsonc`, and
copies `docs/imgs` to `public/images/documentation`. About Us files and core
metadata are preserved. Source navigation is replaced by website navigation;
commented-out Markdown stays unpublished. No source repository is needed at runtime.

Research provenance is recorded in `docs/about-us-sources.md`.
