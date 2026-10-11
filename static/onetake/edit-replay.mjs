// Scroll remains the story clock. This one, interruptible replay returns to
// the actual C position, holds the molecular edit, then enters the project.
export const REPLAY_TIMING = Object.freeze({ question: 2.4, rewind: 3.2, target: 1.1, edit: 8.5, return: 3.0 });
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };

export function replayFrame(seconds) {
  let t = Math.max(0, seconds);
  if (t < REPLAY_TIMING.question) return { phase: 'question', take: .803 };
  t -= REPLAY_TIMING.question;
  if (t < REPLAY_TIMING.rewind) return { phase: 'rewind', take: .803 - .253 * ease(t / REPLAY_TIMING.rewind) };
  t -= REPLAY_TIMING.rewind;
  if (t < REPLAY_TIMING.target) return { phase: 'target', take: .55, edit: 0 };
  t -= REPLAY_TIMING.target;
  if (t < REPLAY_TIMING.edit) return { phase: 'edit', take: .55, edit: clamp(t / REPLAY_TIMING.edit) };
  t -= REPLAY_TIMING.edit;
  if (t < REPLAY_TIMING.return) {
    const blend = ease(t / REPLAY_TIMING.return);
    return { phase: 'return', take: .89 + .065 * blend, cameraBlend: blend, edit: 1 };
  }
  return { phase: 'done', take: .955 };
}

export function createEditReplay({ root, story, toProgress, enabled }) {
  const skip = root.querySelector('[data-edit-skip]');
  let played = false, active = false, elapsed = 0, previous = -1, phase = '', ready = false, editingStarted = false;
  const editStart = REPLAY_TIMING.question + REPLAY_TIMING.rewind + REPLAY_TIMING.target;
  const scrollToTake = take => window.scrollTo({ top: toProgress(take) * Math.max(1, story.getBoundingClientRect().height - innerHeight), behavior: 'instant' });
  const finish = () => {
    active = false;
    delete root.dataset.editReplay;
    if (skip) skip.hidden = true;
  };
  const interrupt = () => { if (active) finish(); };
  const beginEdit = () => { editingStarted = true; elapsed = editStart; };
  window.addEventListener('wheel', event => {
    if (!active) return;
    if (phase === 'placement') {
      event.preventDefault();
      if (ready && event.deltaY > 0) beginEdit();
    } else if (phase === 'edit') event.preventDefault();
    else interrupt();
  }, { passive: false });
  let touchY = 0;
  window.addEventListener('touchstart', event => { touchY = event.touches[0]?.clientY || 0; }, { passive: true });
  window.addEventListener('touchmove', event => {
    if (!active || event.target.closest?.('[data-bio-handle], [data-bio-hit]')) return;
    if (phase === 'placement' || phase === 'edit') {
      event.preventDefault();
      if (phase === 'placement' && ready && touchY-(event.touches[0]?.clientY || touchY)>20) beginEdit();
    } else interrupt();
  }, { passive: false });
  window.addEventListener('keydown', event => {
    if (!active) return;
    if (phase === 'placement' && ready && ['ArrowDown','PageDown',' '].includes(event.key)) { event.preventDefault(); beginEdit(); }
    else if (phase === 'edit' && ['ArrowDown','PageDown',' '].includes(event.key)) event.preventDefault();
    else if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(event.key)) interrupt();
  });
  skip?.addEventListener('click', () => { scrollToTake(.955); finish(); });
  return {
    setReady(value) { ready = value; },
    update(take, dt) {
      if (enabled && !played && previous < .797 && take >= .797 && take < .94) {
        active = played = true;
        elapsed = 0;
        if (skip) skip.hidden = false;
      }
      previous = take;
      if (!active) return null;
      // A background tab must not skip the readable edit when it resumes.
      elapsed += Math.min(dt, .05);
      let frame = replayFrame(elapsed);
      if (!editingStarted && elapsed >= editStart) {
        elapsed = editStart;
        frame = { phase: 'placement', take: .55, edit: 0 };
      }
      phase = frame.phase;
      root.dataset.editReplay = frame.phase;
      scrollToTake(frame.phase === 'return' ? .55 + .405 * frame.cameraBlend : frame.take);
      if (frame.phase === 'done') finish();
      return frame;
    },
  };
}
