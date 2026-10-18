import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../static/team-filters.js', import.meta.url), 'utf8');
const labels = ['Dry Lab', 'Wet Lab', 'Human Practices', 'Design', 'Wiki'];
const memberSpecs = [
  ['dry', ['Student Leader', 'Dry Lab']],
  ['wet-wiki', ['Wet Lab', 'Wiki']],
  ['hp-wiki', ['HP', 'Wiki']],
  ['hp-long', ['Human Practices']],
  ['designer', ['Design']],
  ['unrelated', ['Advisor of Wiki', 'Dry Laboratory']],
];

function setup(specs = memberSpecs) {
  let focused = null;
  const node = (options = {}) => {
    const listeners = new Map();
    const attributes = { ...options.attributes };
    const classes = new Set();
    return {
      hidden: false, textContent: '', dataset: {}, disabled: false, attributes,
      classList: { add: name => classes.add(name), contains: name => classes.has(name) },
      setAttribute(name, value) { attributes[name] = value; },
      addEventListener(type, listener) { listeners.set(type, listener); },
      focus() { focused = this; },
      click() {
        assert.equal(this.disabled, false, 'A usable filter must be enabled after initialization.');
        assert.ok(listeners.has('click'), 'The control must have a click handler.');
        listeners.get('click')({ currentTarget: this });
      },
      ...options, attributes,
    };
  };
  const cards = specs.map(([name, roles]) => node({
    name, dataset: { memberRoles: JSON.stringify(roles) },
  }));
  const buttons = labels.map(label => node({
    disabled: true, dataset: { teamFilter: label },
    attributes: { 'aria-pressed': 'false', 'aria-controls': 'team-deck' },
  }));
  const count = node();
  const empty = node({ hidden: true });
  const summary = node({ hidden: true });
  const status = node();
  const reset = node({ hidden: true });
  const members = node({
    querySelectorAll(selector) {
      assert.equal(selector, '[data-member-card]');
      return cards;
    },
    querySelector(selector) {
      return ({ '[data-team-member-count]': count, '[data-team-filter-empty]': empty })[selector] ?? null;
    },
  });
  // Matching roles outside the formal roster must never be counted or edited.
  const advisor = node({ dataset: { memberRoles: JSON.stringify(labels) } });
  const instructor = node({ dataset: { memberRoles: '["Wiki"]' } });
  const otherGroups = [
    node({ name: 'advisors', cards: [advisor] }),
    node({ name: 'instructor', cards: [instructor] }),
    node({ name: 'pi', hidden: true, cards: [] }),
  ];
  const deck = node({
    querySelectorAll(selector) {
      assert.equal(selector, '.team-category');
      return [members, ...otherGroups];
    },
  });
  const document = {
    querySelector(selector) {
      return ({
        '#team-members': members, '#team-deck': deck,
        '[data-team-filter-summary]': summary, '[data-team-filter-status]': status,
        '[data-team-filter-reset]': reset,
      })[selector] ?? null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-team-filter]') return buttons;
      if (selector === '[data-member-card]') return [...cards, advisor, instructor];
      assert.fail(`Unexpected document selector: ${selector}`);
    },
  };
  vm.runInNewContext(source, { document });
  return {
    cards, buttons, count, empty, summary, status, reset, deck, otherGroups, advisor, instructor,
    get focused() { return focused; },
    select(label) { buttons.find(button => button.dataset.teamFilter === label).click(); },
    visibleNames() { return cards.filter(card => !card.hidden).map(card => card.name); },
    pressedLabels() { return buttons.filter(button => button.attributes['aria-pressed'] === 'true').map(button => button.dataset.teamFilter); },
  };
}

const run = setup();
assert.deepEqual(run.visibleNames(), memberSpecs.map(([name]) => name));
assert.deepEqual(run.pressedLabels(), []);
assert.equal(run.summary.hidden, false);
assert.equal(run.reset.hidden, true);
assert.equal(run.empty.hidden, true);
assert.equal(run.status.textContent, 'All 6 team members');
assert.equal(run.count.textContent, '6');
assert.ok(run.buttons.every(button => !button.disabled));
assert.equal(run.deck.classList.contains('team-deck--filter-used'), false, 'Initialization must preserve the original entrance animation.');
assert.deepEqual(run.otherGroups.map(group => group.hidden), [false, false, true]);

const expected = new Map([
  ['Dry Lab', ['dry']],
  ['Wet Lab', ['wet-wiki']],
  ['Human Practices', ['hp-wiki', 'hp-long']],
  ['Design', ['designer']],
  ['Wiki', ['wet-wiki', 'hp-wiki']],
]);
for (const [label, names] of expected) {
  run.select(label);
  assert.deepEqual(run.visibleNames(), names, `${label} must match complete role labels, including secondary roles and the HP alias.`);
  assert.deepEqual(run.pressedLabels(), [label], 'Switching filters must leave exactly one selected folder.');
  assert.equal(run.status.textContent, `${label} · ${names.length} of 6 team members`);
  assert.equal(run.count.textContent, `${names.length} / 6`);
  assert.equal(run.reset.hidden, false);
  assert.equal(run.empty.hidden, true);
  assert.ok(run.otherGroups.every(group => group.hidden), 'Active filters must show formal members only.');
  assert.equal(run.advisor.hidden, false, 'Advisor cards must remain untouched inside their hidden section.');
  assert.equal(run.instructor.hidden, false);
  assert.equal(run.deck.classList.contains('team-deck--filter-used'), true, 'Filtered cards must not restart delayed entrance animations.');
}

run.select('Wiki');
assert.deepEqual(run.visibleNames(), memberSpecs.map(([name]) => name), 'Clicking the active folder again must restore all members.');
assert.deepEqual(run.pressedLabels(), []);
assert.equal(run.count.textContent, '6');
assert.equal(run.status.textContent, 'All 6 team members');
assert.equal(run.reset.hidden, true);
assert.deepEqual(run.otherGroups.map(group => group.hidden), [false, false, true], 'Reset must preserve each nonmember section’s original visibility.');

run.select('Human Practices');
run.reset.click();
assert.deepEqual(run.visibleNames(), memberSpecs.map(([name]) => name));
assert.deepEqual(run.pressedLabels(), []);
assert.equal(run.focused.dataset.teamFilter, 'Human Practices', 'Show all must return keyboard focus to the previously selected folder.');
assert.equal(run.empty.hidden, true);
assert.equal(run.reset.hidden, true);
assert.deepEqual(run.otherGroups.map(group => group.hidden), [false, false, true]);
run.select('Dry Lab');
run.select('Wiki');
assert.deepEqual(run.visibleNames(), ['wet-wiki', 'hp-wiki'], 'Filters must remain reusable after Show all.');

const noMatches = setup([['wet-only', ['Wet Lab']]]);
noMatches.select('Design');
assert.deepEqual(noMatches.visibleNames(), []);
assert.equal(noMatches.empty.hidden, false);
assert.equal(noMatches.empty.textContent, 'No team members tagged Design.');
assert.equal(noMatches.status.textContent, 'Design · 0 of 1 team members');
assert.equal(noMatches.count.textContent, '0 / 1');
noMatches.select('Wet Lab');
assert.deepEqual(noMatches.visibleNames(), ['wet-only']);
assert.equal(noMatches.empty.hidden, true);
assert.equal(noMatches.empty.textContent, '', 'A later matching filter must clear the previous empty message.');

const normalized = setup([['normalized', [' hp ', ' wIkI ']]]);
normalized.select('Human Practices');
assert.deepEqual(normalized.visibleNames(), ['normalized']);
normalized.select('Wiki');
assert.deepEqual(normalized.visibleNames(), ['normalized']);

const emptyRoster = setup([]);
assert.ok(emptyRoster.buttons.every(button => button.disabled));
assert.equal(emptyRoster.summary.hidden, true, 'An empty formal roster must not expose inactive filter feedback.');
assert.doesNotThrow(() => vm.runInNewContext(source, {
  document: { querySelector: () => null, querySelectorAll: () => [] },
}), 'Pages without a Team roster must remain unaffected.');

console.log('Team filters passed: exact roles, aliases, secondary roles, member-only results, reset, empty states and accessibility.');
