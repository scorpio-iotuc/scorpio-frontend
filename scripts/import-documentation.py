"""Import Scorpio's Markdown guides into the website article contract.
Usage: python3 scripts/import-documentation.py /path/to/Scorpio-Project/docs
"""
import json
import re
import shutil
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])

def convert(path, page):
    text = re.sub(r'<!--.*?-->', '', path.read_text(), flags=re.S)
    # GitHub's page navigation is replaced by the website's sidebar and links.
    lines = [line for line in text.splitlines() if not line.startswith('[←') and not line.startswith('[Versión') and not line.startswith('[English')]
    blocks = []
    def add(kind, content, **extra):
        blocks.append(dict(page_num=page, type=kind, content=content, **extra))
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        i += 1
        if not line:
            continue
        if line.startswith('```'):
            code = []
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code.append(lines[i]); i += 1
            i += 1
            add('code', '\n'.join(code))
        elif line == '<figure>':
            figure = []
            while i < len(lines) and lines[i].strip() != '</figure>':
                figure.append(lines[i]); i += 1
            i += 1
            figure = '\n'.join(figure)
            add('img', re.search(r'alt="([^"]*)"', figure)[1],
                img_src=re.search(r'src="([^"]*)"', figure)[1].replace('../imgs/', '/images/documentation/'),
                img_legend=re.search(r'<figcaption>(.*?)</figcaption>', figure, re.S)[1])
        elif re.match(r'^#{1,3} ', line):
            heading, content = line.split(' ', 1)
            add('h' + str(len(heading)), content)
        elif re.match(r'^(- |\d+\. )', line):
            ordered = bool(re.match(r'^\d+\.', line))
            items = [re.sub(r'^(- |\d+\. )', '', line)]
            while i < len(lines) and re.match(r'^(- |\d+\. )', lines[i]):
                items.append(re.sub(r'^(- |\d+\. )', '', lines[i])); i += 1
            add('ol' if ordered else 'ul', '', list_content=items)
        elif line.startswith('>'):
            add('cite', line.lstrip('> '))
        else:
            paragraph = [line]
            while i < len(lines) and lines[i].strip() and not re.match(r'^(#|```|<figure>|>|- |\d+\. )', lines[i]):
                paragraph.append(lines[i].strip()); i += 1
            add('text', ' '.join(paragraph))
    return blocks

for lang in ('en', 'es'):
    blocks = []
    for page, name in enumerate(['README.md'] + [f'page{i}.md' for i in range(1, 6)]):
        blocks.extend(convert(source / lang / name, page))
    target = root / f'src/data/articles/documentation-{lang}.jsonc'
    payload = json.dumps({'articles_content': blocks}, ensure_ascii=False, indent=2)
    target.write_text('// Documentation: ordered blocks; page 0 is the overview.\n' + payload + '\n')
    print(f'{lang}: {len(blocks)} blocks')
shutil.copytree(source / 'imgs', root / 'public/images/documentation', dirs_exist_ok=True)
