"""Team opening animation integration checks."""
from pathlib import Path
import re
import unittest

from app import app


ROOT = Path(app.root_path)


class TeamOpeningTest(unittest.TestCase):
    def test_team_route_includes_four_piece_progressive_opening(self):
        with app.test_client() as client:
            response = client.get("/team")
        self.assertEqual(response.status_code, 200)
        page = response.get_data(as_text=True)
        self.assertIn('data-team-opening', page)
        self.assertIn('team-opening.css', page)
        self.assertIn('team-opening.js', page)
        self.assertEqual(page.count('class="team-opening__piece '), 4)
        self.assertIn('id="main-content"', page)
        self.assertNotIn('Different minds.', page)
        self.assertIn('data-team-package', page)
        self.assertIn('data-team-package-frames', page)
        self.assertIn('data-team-compile', page)
        self.assertIn('_skill.md', page)
        frames = re.search(r'data-team-package-frames="([^"]+)"', page).group(1).split('|')
        self.assertEqual(frames, [f"https://static.igem.wiki/teams/6085/wiki/team/pkg{i}.avif" for i in range(1, 5)])
        self.assertIn(f'src="{frames[0]}"', page)
        self.assertIn(f'src="{frames[3]}"', page)
        self.assertIn('team-opening__blur', page)
        self.assertNotIn('Meet our team.', page)
        self.assertNotIn('team-category-nav', page)
        self.assertNotIn('Skip intro', page)
        self.assertNotIn('team-intro__people', page)
        self.assertNotIn('team-intro__manifest', page)

    def test_package_header_precedes_roster_with_unlinked_folders(self):
        with app.test_client() as client:
            page = client.get('/team').get_data(as_text=True)
        self.assertIn('team-package-header.css', page)
        self.assertLess(page.index('data-team-package-header'), page.index('id="team-deck"'))
        header = page.split('data-team-package-header', 1)[1].split('</header>', 1)[0]
        self.assertIn('data-team-package-mount', header)
        self.assertIn('ORCA_TEAM.pkg', header)
        folders = header.split('class="team-skill-folders"', 1)[1].split('</ul>', 1)[0]
        self.assertEqual(folders.count('<li '), 5)
        for name in ['Dry Lab', 'Wet Lab', 'Human Practices', 'Design', 'Wiki']:
            self.assertIn(f'<span>{name}</span>', folders)
        self.assertNotIn('<a ', folders)
        self.assertNotIn('<button', folders)

    def test_compilation_includes_every_member_once_in_order(self):
        with app.test_client() as client:
            page = client.get('/team').get_data(as_text=True)
        orders = re.findall(r'data-team-compile-order="(\d+)"', page)
        self.assertEqual(sorted(map(int, orders)), list(range(33)))
        self.assertEqual(page.count('hidden>extract '), 25)
        self.assertIn('extract jacky_man-leuk_yuen_skill.md', page)
        self.assertIn('build complete · 25 skills ready', page)

    def test_opening_is_outline_only_and_package_gated(self):
        css = (ROOT / "static/team-opening.css").read_text()
        js = (ROOT / "static/team-opening.js").read_text()
        self.assertIn('fill: none', css)
        self.assertIn('prefers-reduced-motion: reduce', css)
        self.assertNotIn('team-opening-exit', css)
        self.assertIn('filter: blur(13px)', css)
        self.assertIn('team-page--opening-blur', css)
        self.assertIn('pointer-events: none', css)
        self.assertIn('member-card.is-ready .member-card__turn', css)
        self.assertIn('team-opening__pkg-art', css)
        self.assertIn('border: 0', css)
        self.assertIn('team-opening__compile-code', css)
        self.assertIn('team-compile-line-in', css)
        self.assertIn('team-package-spinner', css)
        self.assertNotIn('data-team-opening-skip', js)
        self.assertNotIn("['Escape'", js)
        self.assertNotIn('setTimeout(finish, 10000)', js)
        self.assertNotIn("addEventListener('scroll'", js)
        self.assertNotIn("addEventListener('wheel'", js)
        self.assertIn('team-package-open', js)
        self.assertIn('window.scrollTo', js)
        self.assertIn('const sequence = [...frames, ...frames]', js)
        self.assertIn('classList.add(\'is-active\')', js)
        self.assertIn('data-team-compile-order', js)
        self.assertIn('panel.scrollTo', js)
        self.assertIn('createParticleBurst', js)
        self.assertIn('team-particle-field', css)
        self.assertIn('team-package-particle', css)


if __name__ == "__main__":
    unittest.main()
