"""Insert native, text/shape-only context slides while preserving every original slide part."""
import json
import re
import zipfile
from pathlib import Path
from defusedxml.minidom import parseString

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'build/out'
BASE = OUT / 'looped-transformers.pptx'
ADD = OUT / 'current-context-20261108.pptx'
DEST = OUT / 'looped-transformers-updated-20261108.pptx'
REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'

def xml(doc):
    return doc.toxml(encoding='UTF-8')

with zipfile.ZipFile(BASE) as z:
    original = {n: z.read(n) for n in z.namelist()}
with zipfile.ZipFile(ADD) as z:
    extra = {n: z.read(n) for n in z.namelist()}
result = dict(original)
old_count = len([n for n in original if re.fullmatch(r'ppt/slides/slide\d+\.xml', n)])
new_count = len([n for n in extra if re.fullmatch(r'ppt/slides/slide\d+\.xml', n)])
presentation = parseString(original['ppt/presentation.xml'])
ids = presentation.getElementsByTagName('p:sldIdLst')[0]
old_ids = list(ids.getElementsByTagName('p:sldId'))
rels = parseString(original['ppt/_rels/presentation.xml.rels'])
types = parseString(original['[Content_Types].xml'])
max_id = max(int(n.getAttribute('id')) for n in old_ids)
max_rel = max(int(n.getAttribute('Id')[3:]) for n in rels.documentElement.childNodes if n.nodeType == n.ELEMENT_NODE and re.fullmatch(r'rId\d+', n.getAttribute('Id')))

for i in range(1, new_count + 1):
    j = old_count + i
    # Shared blank layout and notes master come from the same existing lib.js.
    for stem in ('slides/slide', 'notesSlides/notesSlide'):
        src = f'ppt/{stem}{i}.xml'
        result[f'ppt/{stem}{j}.xml'] = extra[src]
        folder, name = stem.rsplit('/', 1)
        rel_src = f'ppt/{folder}/_rels/{name}{i}.xml.rels'
        doc = parseString(extra[rel_src])
        for r in doc.documentElement.childNodes:
            if r.nodeType != r.ELEMENT_NODE:
                continue
            target = r.getAttribute('Target')
            if r.getAttribute('Type').endswith('/notesSlide'):
                r.setAttribute('Target', f'../notesSlides/notesSlide{j}.xml')
            elif r.getAttribute('Type').endswith('/slide'):
                r.setAttribute('Target', f'../slides/slide{j}.xml')
            elif r.getAttribute('TargetMode') != 'External':
                assert target in ('../slideLayouts/slideLayout1.xml', '../notesMasters/notesMaster1.xml'), target
        result[f'ppt/{folder}/_rels/{name}{j}.xml.rels'] = xml(doc)
        content = types.createElement('Override')
        content.setAttribute('PartName', f'/ppt/{stem}{j}.xml')
        kind = 'slide' if folder == 'slides' else 'notesSlide'
        content.setAttribute('ContentType', f'application/vnd.openxmlformats-officedocument.presentationml.{kind}+xml')
        types.documentElement.appendChild(content)
    rid = f'rId{max_rel + i}'
    r = rels.createElement('Relationship')
    for k, v in {'Id': rid, 'Type': REL + '/slide', 'Target': f'slides/slide{j}.xml'}.items():
        r.setAttribute(k, v)
    rels.documentElement.appendChild(r)
    n = presentation.createElement('p:sldId')
    n.setAttribute('id', str(max_id + i))
    n.setAttributeNS(REL, 'r:id', rid)
    ids.insertBefore(n, old_ids[1])  # immediately after the existing title slide

result['ppt/presentation.xml'] = xml(presentation)
result['ppt/_rels/presentation.xml.rels'] = xml(rels)
result['[Content_Types].xml'] = xml(types)
app = parseString(original['docProps/app.xml'])
app.getElementsByTagName('Slides')[0].firstChild.nodeValue = str(old_count + new_count)
result['docProps/app.xml'] = xml(app)
changed = [n for n in original if original[n] != result[n]]
assert set(changed) == {'ppt/presentation.xml', 'ppt/_rels/presentation.xml.rels', '[Content_Types].xml', 'docProps/app.xml'}
with zipfile.ZipFile(DEST, 'w', zipfile.ZIP_DEFLATED) as z:
    for name, data in result.items():
        z.writestr(name, data)
report = {'original_slides': old_count, 'inserted_slides': new_count,
          'inserted_positions': list(range(2, new_count + 2)),
          'original_slide_note_media_parts_byte_identical': True,
          'changed_package_metadata_only': changed, 'output': str(DEST)}
(OUT / 'context-update-preservation.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
