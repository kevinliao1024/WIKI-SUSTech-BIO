"""Team route integration and content-boundary checks; browser checks in QA log."""
from dataclasses import replace
from pathlib import Path
import json
import unittest
from unittest.mock import patch

from app import app
from wiki_content import load_markdown_content


class TeamCardsTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.content = load_markdown_content('team/team.md', asset_url=lambda path: '/assets/' + path)

    def render_members(self, members):
        content = replace(self.content, metadata={**self.content.metadata, 'members': members})
        with patch('app.load_markdown_content', return_value=content):
            response = self.client.get('/team')
        self.assertEqual(response.status_code, 200)
        return response.get_data(as_text=True)

    def test_live_route_imports_supplied_portraits_without_inventing_quotes(self):
        response = self.client.get('/team')
        self.assertEqual(response.status_code, 200)
        page = response.get_data(as_text=True)
        self.assertEqual(page.count('data-member-card '), 25)
        self.assertEqual(page.count('Personal one-liner to come'), 5)
        self.assertIn('A million dreams are keeping me awake.', page)
        self.assertIn('data-content-source="docs/team/team.md"', page)
        self.assertIn('team-cards.css', page)
        self.assertIn('team-cards.js', page)
        self.assertIn('https://gitlab.igem.org/2026/sustech', page)
        self.assertNotIn('YOUR ONE-LINER GOES HERE', page)

    def test_new_igem_portraits_keep_existing_member_quotes(self):
        by_name = {member['name']: member for member in self.content.metadata['members']}
        page = self.client.get('/team').get_data(as_text=True)
        for name, filename in [('Huiwen Ma', 'huiwen-ma'), ('Junming Feng', 'junming-feng'), ('Xueyin Lu', 'xueyin-lu'), ('Yanfei Pu', 'yanfei-pu')]:
            with self.subTest(name=name):
                expected = f'https://static.igem.wiki/teams/6085/wiki/team/{filename}.avif'
                self.assertEqual(by_name[name]['photo'], expected)
                self.assertIn(f'src="{expected}"', page)
        self.assertFalse(by_name['Xueyin Lu'].get('quote'))

    def test_members_are_escaped_not_interpreted_as_html(self):
        page = self.render_members([{'name':'<img onerror=alert(1)>', 'quote':'<script>alert(2)</script>'}])
        self.assertIn('&lt;script&gt;alert(2)&lt;/script&gt;', page)
        self.assertNotIn('<script>alert(2)</script>', page)
        self.assertNotIn('<img onerror=alert(1)>', page)

    def test_no_script_has_both_faces_and_a_hidden_inactive_control(self):
        page = self.render_members([{'name':'Layout fixture', 'quote':'Only fixture text.'}])
        self.assertIn('Only fixture text.', page)
        self.assertIn('data-card-toggle hidden', page)
        self.assertNotIn('data-card-back aria-hidden="true"', page)
        self.assertIn('<noscript>', page)

    def test_avatar_missing_and_empty_roster_are_explicit(self):
        page = self.render_members([])
        self.assertIn('card layout preview', page)
        self.assertIn('Card layout preview · portrait pending', page)
        self.assertNotIn('member-card__photo', page)

    def test_role_icons_and_multiline_chinese_quote(self):
        page = self.render_members([{'name':'Fixture', 'roles':[{'label':'Design','icon':'design'}, {'label':'Outreach','icon':'outreach'}], 'quote':'第一行\n第二行', 'quote_lang':'zh'}])
        self.assertIn('第一行\n第二行', page)
        self.assertIn('lang="zh"', page)
        self.assertIn('>Design</span>', page)
        self.assertIn('>Outreach</span>', page)

    def test_portrait_urls_are_served_and_budgeted(self):
        total = 0
        for member in self.content.metadata['members']:
            if not member.get('photo_asset'):
                continue
            filename = member['photo_asset']
            response = self.client.get('/static/' + filename)
            self.assertEqual(response.status_code, 200, filename)
            total += len(response.data)
            response.close()
        self.assertLess(total, 8_000_000)
        manifest = json.loads((Path(app.root_path)/'static/assets/team/compression-manifest.json').read_text())
        self.assertEqual(total, manifest['total_output_bytes'])
        self.assertTrue(manifest['originals_untouched'])

    def test_user_confirmed_aliases_and_categories(self):
        members = self.content.metadata['members']
        by_name = {m['name']: m for m in members}
        self.assertTrue(by_name['Ping Sun']['photo_asset'].endswith('/ping_sun.avif'))
        self.assertTrue(by_name['Lorraine Liu']['photo_asset'].endswith('/xinyi_liu_advisor.avif'))
        self.assertTrue(by_name['Muyin GUO']['photo_asset'].endswith('/muyin_guo.avif'))
        self.assertEqual([m['name'] for m in members if m['category']=='instructor'], ['Hengwei Su','Xueyin Lu'])
        self.assertEqual(by_name['Jacky Man-leuk Yuen']['category'], 'advisors')
        self.assertEqual(sum(m['category']=='team-members' for m in members), 15)
        self.assertEqual(sum(m['category']=='advisors' for m in members), 5)
        pis = [m for m in members if m['category']=='pi']
        self.assertEqual([m['name'] for m in pis], ['Zefeng Wang', 'Fuxing Zeng', 'Min Zhang'])
        self.assertEqual([m['roles'][0]['label'] for m in pis], ['Primary PI', 'Secondary PI', 'Secondary PI'])
        self.assertTrue(all(not m.get('quote') and not m.get('photo') and not m.get('photo_asset') for m in pis))

    def test_long_quote_has_no_read_quote_control(self):
        page = self.client.get('/team').get_data(as_text=True)
        self.assertNotIn('data-read-quote', page)
        self.assertNotIn('data-quote-dialog', page)
        self.assertNotIn('Read Hengwei Su full quote', page)
        self.assertIn('Good luck！', page)
        self.assertIn('member-card--long-quote', page)
        self.assertNotIn('member-card__brand', page)
        self.assertNotIn('member-card__orca', page)
        self.assertNotIn('ORCA iGEM', page)
        self.assertNotIn('questionnaire-orca.png', page)
        self.assertIn('data-member-card', page)

    def test_user_confirmed_workstreams_and_personal_tags(self):
        by_name = {member['name']: member for member in self.content.metadata['members']}
        expected = {
            'Bolin Dong': ['Dry Lab', 'RNA LAMAR Model'],
            'Dengxiang Yang': ['Student Leader', 'Dry Lab', 'Wiki', 'Foundation Model'],
            'Hansen Zhang': ['Student Leader', 'Wet Lab', 'Wiki'],
            'Chenfan Liao': ['Student Leader', 'HP', 'Wiki', 'Inclusivity', 'Builder'],
            'Wenxiang Huang': ['HP', 'Wiki', 'Video Production'],
            'Fengyi Tang': ['HP', 'Interview'],
            'Yilin Liu': ['Student Leader', 'HP', 'Wiki'],
            'Lili Yu': ['Design', 'Hand-drawn Artist'],
            'Benxiang Xiao': ['Dry Lab', 'Wiki', 'Supercomputing Contest'],
        }
        for name, labels in expected.items():
            with self.subTest(name=name):
                member = by_name[name]
                self.assertEqual([role['label'] for role in member['roles']], labels)
                page = self.render_members([member])
                for label in labels:
                    self.assertIn(f'>{label}</span>', page)
                card = page.split(f'data-member-name="{name}"', 1)[1].split('</article>', 1)[0]
                bottom_roles = card.split('aria-label="Roles">', 1)[1].split('</ul>', 1)[0]
                self.assertNotIn('Student Leader', bottom_roles)
                if 'Student Leader' in labels:
                    self.assertEqual(card.count('data-card-leader'), 1)
                    self.assertIn('aria-describedby="team-card-1-leader team-card-1-roles"', card)
                else:
                    self.assertNotIn('data-card-leader', card)

    def test_categories_remain_grouped_without_middle_navigation(self):
        page = self.client.get('/team').get_data(as_text=True)
        self.assertNotIn('team-category-nav', page)
        for key in ['team-members','advisors','instructor','pi']:
            self.assertIn(f'id="{key}"', page)

    def test_frozen_page_resolves_portraits_under_a_subdirectory(self):
        with app.test_request_context('/team', base_url='https://example.test/sustech/'):
            from flask import render_template
            page = render_template('pages/team.html', content=self.content)
        self.assertIn('/sustech/static/assets/team/portraits/', page)


if __name__ == '__main__':
    unittest.main()
