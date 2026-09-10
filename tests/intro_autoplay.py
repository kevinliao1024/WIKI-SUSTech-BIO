"""The first scene is time-driven; scrolling controls only the dive."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from intro_browser import URL, seek, snapshot

OUT = Path('/private/tmp/orca-intro-qa')
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    page = browser.new_page(viewport={'width':1440,'height':900})
    page.goto(URL, wait_until='load')
    initial = snapshot(page)
    assert initial['titleOpacity'] == 0
    page.wait_for_timeout(1200)
    moving = snapshot(page)
    assert moving['leader']['x'] < initial['leader']['x']-100, 'Leader does not enter without scrolling'
    assert moving['titleOpacity'] == 0, 'Title appears before the leader settles'
    page.screenshot(path=str(OUT/'autoplay-arriving.png'))
    page.wait_for_function("document.querySelector('[data-intro]').dataset.introState === 'ready'", timeout=7000)
    ready = snapshot(page)
    assert page.evaluate('scrollY') == 0
    assert ready['titleOpacity'] == 1
    assert ready['leader']['x'] < 1440*.4
    assert all(f['opacity'] == 0 for f in ready['route']), 'School dives before user scrolls'
    assert page.locator('[data-camera]').evaluate('n=>new DOMMatrix(getComputedStyle(n).transform).m42') == 0
    page.screenshot(path=str(OUT/'autoplay-ready.png'))
    seek(page, .4)
    diving = snapshot(page)
    assert any(f['opacity'] > .9 for f in diving['route'])
    assert page.locator('[data-camera]').evaluate('n=>new DOMMatrix(getComputedStyle(n).transform).m42') < 0
    seek(page, 0)
    assert snapshot(page)['titleOpacity'] == 1, 'Returning to top replays the opening'
    assert all(f['opacity'] == 0 for f in snapshot(page)['route'])
    page.reload(wait_until='load')
    seek(page, .5)
    assert page.locator('[data-intro]').get_attribute('data-intro-state') == 'ready', 'Early scroll is blocked by autoplay'
    page.locator('[data-skip]').click()
    page.wait_for_timeout(1000)
    assert page.locator('.research-heading').bounding_box()['y'] < 900
    browser.close()
print('Automatic arrival, title reveal, scroll handoff, reverse and early skip passed.')
