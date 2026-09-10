"""Sample animation frame delivery while scrolling in headless Chromium.

This measures the test machine, not a guarantee for all visitor hardware.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from intro_browser import URL

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    page = browser.new_page(viewport={'width':1440,'height':900})
    page.goto(URL, wait_until='networkidle')
    report = page.evaluate('''() => new Promise(resolve => {
      const root=document.querySelector('[data-intro]');
      const range=root.offsetHeight-root.querySelector('.intro-stage').offsetHeight;
      const intervals=[];let previous=0, frame=0;
      function sample(t) {
        if(previous) intervals.push(t-previous);
        previous=t;
        scrollTo({top:range*(.48+.42*frame/180),behavior:'instant'});
        if(++frame<180) requestAnimationFrame(sample);
        else {
          const sorted=[...intervals].sort((a,b)=>a-b);
          resolve({frames:intervals.length,medianMs:sorted[Math.floor(sorted.length*.5)],
            p95Ms:sorted[Math.floor(sorted.length*.95)],
            over34Ms:intervals.filter(n=>n>34).length,
            domNodes:document.querySelectorAll('*').length,
            visibleFish:document.querySelectorAll('[data-fish]').length});
        }
      }
      requestAnimationFrame(sample);
    })''')
    browser.close()
output=Path('/private/tmp/orca-intro-qa')
output.mkdir(parents=True,exist_ok=True)
(output/'performance.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
assert report['medianMs'] <= 20, 'Desktop median frame delivery missed 60fps target'
assert report['p95Ms'] <= 34, 'Frequent long frames during scroll'
