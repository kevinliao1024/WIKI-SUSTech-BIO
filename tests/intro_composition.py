"""Verify the complete original brain, not a substitute drawn composition."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from intro_browser import URL, seek

OUT=Path('/private/tmp/orca-reference-qa')
OUT.mkdir(parents=True,exist_ok=True)

with sync_playwright() as pw:
    browser=pw.chromium.launch()
    for width,height in [(1440,900),(820,1000),(390,844),(320,700),(844,390)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        page.goto(URL,wait_until='networkidle')
        page.wait_for_function("document.querySelector('[data-intro]').dataset.introState === 'ready'",timeout=7000)
        geometry=page.evaluate('''() => {
          const plate=document.querySelector('.reference-plate').getBoundingClientRect();
          const image=document.querySelector('.reference-plate img').getBoundingClientRect();
          const stage=document.querySelector('.intro-stage').getBoundingClientRect();
          return {left:plate.left,top:plate.top,width:plate.width,
            scaleX:image.width/1241,scaleY:image.height/1080,
            brainBottom:plate.top+455*plate.width/712,
            screenBottom:Math.min(innerHeight,stage.bottom)};
        }''')
        assert abs(geometry['scaleX']-geometry['scaleY'])<.001, 'Original is stretched'
        assert geometry['left']>=0 and geometry['width']<=width+1, 'Brain side is cropped'
        assert geometry['brainBottom']<=geometry['screenBottom']+1, 'Whole brain does not fit'
        assert abs(geometry['scaleX']-geometry['width']/712)<.001, 'Wrong source viewport'
        assert page.locator('.reference-whale-crop image').get_attribute('href').endswith('visual-system-reference.jpg')
        assert page.locator('.reference-copy').evaluate('n=>getComputedStyle(n).clipPath')=='inset(50%)', 'Extra title overlays original title'
        assert page.locator('.research-thread').count()==0, 'A replacement curve overlays the original'
        page.screenshot(path=str(OUT/f'original-{width}x{height}.png'))
        seek(page,.6)
        page.screenshot(path=str(OUT/f'dive-{width}x{height}.png'))
        seek(page,1)
        assert page.evaluate('''() => {
          const route=document.querySelector('#neural-route');
          const end=route.getPointAtLength(route.getTotalLength()).matrixTransform(route.getScreenCTM());
          const content=document.querySelector('.research-home').getBoundingClientRect();
          return Math.abs(end.y-content.top)<2;
        }'''), 'Original tail is not aligned with the content handoff'
        assert page.locator('.research-home').evaluate('n=>getComputedStyle(n).backgroundColor')=='rgba(0, 0, 0, 0)'
        assert page.evaluate("Number(getComputedStyle(document.querySelector('.intro-stage')).zIndex)>Number(getComputedStyle(document.querySelector('.research-home')).zIndex)")
        assert page.locator('.intro-guide').evaluate('n=>getComputedStyle(n).opacity')=='0'
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        page.screenshot(path=str(OUT/f'connection-{width}x{height}.png'))
        page.close()
    browser.close()
print(f'Original brain proportions, correct whale and continuous handoff passed: {OUT}')
