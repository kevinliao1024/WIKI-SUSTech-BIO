(() => {
  const workspace = document.querySelector('[data-engineering-workspace]');
  if (!workspace) return;
  const groups = JSON.parse(workspace.querySelector('[data-engineering-map-data]').textContent);
  const headings = [...workspace.querySelectorAll('.markdown-content :is(h2,h3,h4,h5,h6)[id]')];
  // The authored cycle headings are the single source for both navigation views.
  for (const part of groups.flatMap(group => group.parts)) {
    const prefix = `${part.id}-cycle-`;
    part.cycles = headings.filter(heading => heading.id.startsWith(prefix) && /^\d{2}$/.test(heading.id.slice(prefix.length)))
      .map(heading => heading.id.slice(prefix.length));
    part.cycleLabels = Object.fromEntries(part.cycles.map(number => [number,
      document.getElementById(`${prefix}${number}`).dataset.cycleLabel || `Cycle ${Number(number)}`]));
    part.cycleSubtitles = Object.fromEntries(part.cycles.map(number => {
      const heading = document.getElementById(`${prefix}${number}`);
      const full = heading.textContent.trim();
      const label = part.cycleLabels[number];
      return [number, (full.startsWith(label) ? full.slice(label.length) : full.replace(/^Cycle\s+\d+/i, '')).replace(/^\s*[:—–-]\s*/, '').trim()];
    }));
    part.stages = Object.fromEntries(part.cycles.map(number => [number,
      ['design', 'build', 'test', 'learn'].filter(stage => document.getElementById(`${prefix}${number}-${stage}`))]));
  }
  window.ORCAEngineering = Object.freeze({ groups });
})();
