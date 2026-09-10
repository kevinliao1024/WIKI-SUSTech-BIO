import unittest
from flask import render_template_string
from app import app


class FishComponentTest(unittest.TestCase):
    def test_optional_motion_controls_are_exposed_to_timeline(self):
        with app.test_request_context('/'):
            html = render_template_string("""{% from 'components/intro/fish.html' import fish %}
              {{ fish('fish-small-01', size=90, initial_x=1.18, initial_y=0.12,
                      path='#custom-path', rotation=12, opacity=0.7) }}""")
        for attribute in ['data-initial-x="1.18"', 'data-initial-y="0.12"',
                          'data-path="#custom-path"', 'data-rotation="12"',
                          'data-opacity="0.7"', '--fish-size:90px']:
            self.assertIn(attribute, html)
