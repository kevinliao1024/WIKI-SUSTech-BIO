from pathlib import Path
import json
from hashlib import sha256

ROOT=Path(__file__).resolve().parent
source=json.loads((ROOT/'src/interviews.en.json').read_text())
# Include only display fields; source document names and paragraph references stay in the editable source.
content={
    'interviewer':{'name':source['interviewer']['name']},
    'topics':source['topics'],
    'teachers':[
        {**{key:t[key] for key in ['id','name','role']},
         'sections':[{'title':s['title'],'pairs':[{'q':p['q'],'a':p['a']} for p in s['pairs']]} for s in t['sections']]}
        for t in source['teachers']
    ]
}
# Keep cartoon portraits in the conversation; the unmodified screenshot is a separate record below it.
labels=json.loads((ROOT/'src/labels.json').read_text())
js=(ROOT/'src/component.js').read_text()
js=js.replace('/*__CONTENT__*/ {}',json.dumps(content,ensure_ascii=False))
js=js.replace('/*__LABELS__*/ {}',json.dumps(labels,ensure_ascii=False))
js=js.replace("/*__CSS__*/ ''",json.dumps((ROOT/'src/component.css').read_text(),ensure_ascii=False))
(ROOT/'orca-interviews.js').write_text(js)
assets={}
for name in ['interview-li-original.png','avatar-fu-jiawen.png','avatar-yali-teacher.png','avatar-wang-sijie.png','orca-team-logo.png']:
    path=ROOT/'assets'/name
    assets[name]={'bytes':path.stat().st_size,'sha256':sha256(path.read_bytes()).hexdigest()}
(ROOT/'asset-manifest.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
print('Built English-only Wiki component with 20 Q&As and original interview imagery.')
