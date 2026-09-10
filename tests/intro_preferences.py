"""Runtime preference changes must preserve the authored fish composition."""
from playwright.sync_api import sync_playwright
from intro_browser import URL

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(URL, wait_until='networkidle')
    sizes = page.locator('[data-fish]').evaluate_all(
        "nodes=>nodes.map(n=>n.style.getPropertyValue('--fish-size'))")
    page.emulate_media(reduced_motion='reduce')
    page.wait_for_function("!document.body.classList.contains('intro-ready')")
    page.wait_for_function("getComputedStyle(document.querySelector('[data-project]')).opacity === '1'")
    assert page.locator('[data-project]').evaluate('n=>getComputedStyle(n).opacity') == '1'
    assert page.locator('[data-fish]').evaluate_all(
        "nodes=>nodes.map(n=>n.style.getPropertyValue('--fish-size'))") == sizes, 'Reduced motion changed authored sizes'
    page.emulate_media(reduced_motion='no-preference')
    page.wait_for_function("document.body.classList.contains('intro-ready')")
    assert page.locator('.intro-ready').count() == 1
    assert page.locator('[data-fish]').evaluate_all(
        "nodes=>nodes.map(n=>n.style.getPropertyValue('--fish-size'))") == sizes
    browser.close()
print('Live reduced-motion preference preserves composition.')
