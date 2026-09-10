"""Check the actual scroll sequence, not just the presence of animation hooks."""
from pathlib import Path
import json
import os
from playwright.sync_api import sync_playwright

OUT = Path('/private/tmp/orca-intro-qa')
URL = os.environ.get('WIKI_BASE_URL', 'http://127.0.0.1:8080')


def seek(page, progress):
    page.evaluate('''p => {
      const root=document.querySelector('[data-intro]');
      const stage=root.querySelector('.intro-stage');
      window.scrollTo({top:root.offsetTop+(root.offsetHeight-stage.offsetHeight)*p,behavior:'instant'});
    }''', progress)
    page.wait_for_timeout(650)


def snapshot(page):
    return page.evaluate('''() => {
      const root=document.querySelector('[data-intro]');
      const leader=root.querySelector('[data-kind="leader"]');
      const box=leader.getBoundingClientRect();
      return {progress:root.dataset.progress,leader:{x:box.x,y:box.y},
        titleOpacity:Number(getComputedStyle(root.querySelector('[data-project]')).opacity),
        neuralOpacity:Number(getComputedStyle(root.querySelector('[data-neural]')).opacity),
        route:[...root.querySelectorAll('[data-kind="route"]')].filter(n=>getComputedStyle(n).display!=='none').map(n=>{
          const b=n.getBoundingClientRect();return {x:b.x,y:b.y,opacity:Number(getComputedStyle(n).opacity)};
        }), overflow:document.documentElement.scrollWidth>innerWidth+1};
    }''')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    results={}
    with sync_playwright() as pw:
        browser=pw.chromium.launch()
        for label,width,height,count in [('desktop',1440,900,12),('tablet',820,1000,8),('mobile',390,844,6)]:
            page=browser.new_page(viewport={'width':width,'height':height})
            errors=[]
            page.on('pageerror',lambda error: errors.append(str(error)))
            page.goto(URL,wait_until='networkidle')
            assert page.locator('.intro-ready').count()==1
            assert page.locator('img').evaluate_all('(images)=>images.every(i=>i.loading==="lazy" || (i.complete && i.naturalWidth>0))')
            page.wait_for_function("document.querySelector('[data-intro]').dataset.introState === 'ready'", timeout=7000)
            frames={}
            for p in [0,.12,.26,.36,.45,.55,.7,.85,1]:
                seek(page,p)
                frames[str(p)]=snapshot(page)
                assert not frames[str(p)]['overflow']
                page.screenshot(path=str(OUT/f'{label}-{p}.png'))
            assert frames['0']['titleOpacity']==1
            assert frames['0.26']['titleOpacity']==1
            assert frames['0.45']['titleOpacity']==1
            assert frames['0.55']['neuralOpacity']==1
            assert len(frames['0.7']['route'])==count
            assert all(f['opacity']==0 for f in frames['0']['route'])
            assert frames['0']['leader']['x']<width*.4
            assert frames['0.26']['leader']['x']<width*.4
            assert frames['0.7']['route']!=frames['0.85']['route']
            seek(page,.36)
            assert abs(snapshot(page)['progress'] and float(snapshot(page)['progress'])-.36)<.003
            page.locator('[data-skip]').click()
            page.wait_for_timeout(1000)
            assert page.locator('.research-heading').is_visible()
            if label=='mobile':
                page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
                page.get_by_role('button',name='Menu').click()
                assert page.locator('.story-links').is_visible()
                page.locator('.story-links a[href="#team"]').click()
                assert page.get_by_role('button',name='Menu').get_attribute('aria-expanded')=='false'
            assert not errors,errors
            results[label]=frames
            page.close()
        for label,settings in [('reduced',{'reduced_motion':'reduce'}),('no-js',{'java_script_enabled':False})]:
            context=browser.new_context(viewport={'width':390,'height':844},**settings)
            page=context.new_page();page.goto(URL,wait_until='networkidle')
            assert page.locator('[data-project]').evaluate('n=>getComputedStyle(n).opacity')=='1'
            assert page.locator('.intro-sequence').evaluate('n=>n.offsetHeight')<=900
            page.screenshot(path=str(OUT/f'{label}.png'))
            context.close()
        browser.close()
    (OUT/'results.json').write_text(json.dumps(results,indent=2))
    print(f'Intro QA passed; screenshots and sampled timeline: {OUT}')


if __name__=='__main__':main()
