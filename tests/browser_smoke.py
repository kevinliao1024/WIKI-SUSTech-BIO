from pathlib import Path
import os

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get('WIKI_BASE_URL', 'http://127.0.0.1:8080')
SCREENSHOT_DIR = Path("/private/tmp/sustech-wiki-browser")


def assert_no_horizontal_overflow(page, label: str) -> None:
    dimensions = page.evaluate(
        """() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth
        })"""
    )
    assert dimensions["scrollWidth"] <= dimensions["clientWidth"] + 1, (
        label,
        dimensions,
    )


def reveal_entire_page(page) -> None:
    reveals = page.locator(".reveal")
    for index in range(reveals.count()):
        reveals.nth(index).scroll_into_view_if_needed()
    page.evaluate("window.scrollTo(0, 0)")
    assert page.locator(".reveal:not(.is-visible)").count() == 0


def main() -> None:
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    console_errors: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)

        desktop = browser.new_page(viewport={"width": 1440, "height": 1000})
        desktop.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        desktop.goto(BASE_URL, wait_until="networkidle")
        assert desktop.locator('[data-rna-opening]').count() == 1
        assert desktop.locator('[data-protein-scene]').count() == 1
        assert desktop.locator('[data-global-scene]').count() == 1
        assert desktop.locator('[data-solution-reveal]').count() == 0
        assert desktop.locator('.protein-drop').count() == 16
        assert_no_horizontal_overflow(desktop, "desktop home")
        reveal_entire_page(desktop)
        desktop.screenshot(path=SCREENSHOT_DIR / "home-desktop.png", full_page=True)

        desktop.goto(f"{BASE_URL}/offtarget-atlas", wait_until="networkidle")
        assert desktop.locator(".page-hero h1").count() == 0
        assert desktop.locator(".page-hero__inner").inner_text().strip() == ""
        assert desktop.locator(".page-hero__guide").is_visible()
        assert desktop.get_by_text("318,200", exact=True).is_visible()
        assert_no_horizontal_overflow(desktop, "desktop atlas")
        reveal_entire_page(desktop)
        desktop.screenshot(path=SCREENSHOT_DIR / "atlas-desktop.png", full_page=True)

        desktop.goto(f"{BASE_URL}/brain-delivery", wait_until="networkidle")
        assert_no_horizontal_overflow(desktop, "desktop brain delivery")
        reveal_entire_page(desktop)
        assert desktop.get_by_text("Hypothetical candidate:", exact=False).last.is_visible()
        assert desktop.get_by_role("heading", name="Thirty-four states preserve the handoffs.").is_visible()
        desktop.screenshot(path=SCREENSHOT_DIR / "brain-delivery-desktop.png", full_page=True)

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        mobile.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        mobile.goto(BASE_URL, wait_until="networkidle")
        assert mobile.locator('[data-rna-opening]').count() == 1
        mobile.get_by_role("button", name="Menu", exact=False).click()
        assert mobile.get_by_role("link", name="Team", exact=True).is_visible()
        assert_no_horizontal_overflow(mobile, "mobile menu")
        mobile.screenshot(path=SCREENSHOT_DIR / "home-mobile.png")

        reduced = browser.new_context(
            viewport={"width": 768, "height": 900}, reduced_motion="reduce"
        ).new_page()
        reduced.goto(f"{BASE_URL}/model", wait_until="networkidle")
        opacity = reduced.locator(".page-hero__inner").evaluate(
            "element => getComputedStyle(element).opacity"
        )
        assert opacity == "1", opacity
        assert_no_horizontal_overflow(reduced, "reduced-motion model")

        no_script_context = browser.new_context(
            viewport={"width": 900, "height": 700}, java_script_enabled=False
        )
        no_script = no_script_context.new_page()
        no_script.goto(f"{BASE_URL}/brain-delivery", wait_until="domcontentloaded")
        assert no_script.get_by_role("heading", name="Thirty-four states preserve the handoffs.").is_visible()
        no_script_context.close()

        assert not console_errors, console_errors

        missing = browser.new_page(viewport={"width": 1000, "height": 700})
        response = missing.goto(f"{BASE_URL}/missing-route", wait_until="networkidle")
        assert response is not None and response.status == 404
        assert missing.get_by_role("heading", name="Lost in the current.").is_visible()

        browser.close()

    print(f"Browser smoke passed; screenshots: {SCREENSHOT_DIR}")


if __name__ == "__main__":
    main()
