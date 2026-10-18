/* One gesture reveals the chapter drawer; a separate gesture confirms it.
 * This state machine is independent of layout and shared by every chapter. */
(() => {
  // WheelEvent has no standard finger-up/momentum phase. Recognize a renewed
  // impulse as well as a quiet gap; a long, decaying tail stays one gesture.
  class WheelGestures {
    constructor() {
      this.id = 0;
      this.lastAt = -Infinity;
      this.direction = 0;
      this.lastMagnitude = 0;
      this.peak = 0;
      this.trough = Infinity;
      this.falling = 0;
      this.tail = false;
      this.started = -Infinity;
    }
    next(delta, now) {
      const magnitude = Math.abs(delta);
      if (magnitude < 2) return `wheel-${this.id}`;
      const direction = Math.sign(delta);
      const gap = now - this.lastAt;
      const renewed = this.tail && now - this.started >= 80 &&
        magnitude >= Math.max(6, this.trough * 1.8, this.trough + 4);
      const quiet = gap >= 100 && (!this.tail || magnitude >= this.lastMagnitude * 1.5 || gap >= 240);
      if (!this.id || direction !== this.direction || quiet || renewed) {
        this.id++;
        this.started = now;
        this.peak = magnitude;
        this.trough = magnitude;
        this.falling = 0;
        this.tail = false;
      } else {
        this.peak = Math.max(this.peak, magnitude);
        if (magnitude < this.lastMagnitude) {
          this.falling++;
          this.trough = Math.min(this.trough, magnitude);
        } else if (!this.tail) {
          this.falling = 0;
          this.trough = magnitude;
        }
        if (this.falling >= 3 || (this.falling >= 2 && magnitude < this.peak * .45)) this.tail = true;
      }
      this.lastAt = now;
      this.lastMagnitude = magnitude;
      this.direction = direction;
      return `wheel-${this.id}`;
    }
  }
  class ChapterBoundary {
    constructor() { this.clear(); }
    clear(resetGesture = true) {
      this.preview = null;
      if (resetGesture) this.consumed = null;
    }
    offer(direction, chapter, gesture, distance = 0) {
      if (!chapter) { this.preview = null; return { action: 'read' }; }
      if (!this.preview || this.preview.direction !== direction || this.preview.chapter !== chapter) {
        this.preview = { direction, chapter, gesture, distance: 0, confirmation: null, amount: 0 };
      }
      this.preview.distance = Math.min(100, this.preview.distance + distance);
      return { action: 'hint', direction, chapter, pull: Math.min(1, .55 + this.preview.distance / 100) };
    }
    input({ direction, chapter, edge, gesture, distance, threshold = 32 }) {
      // Absorb only the completed gesture's outward tail, never a reversal.
      if (this.consumed?.gesture === gesture && this.consumed.direction === direction) return { action: 'absorb' };
      this.consumed = null;
      if (!edge || !chapter) { this.preview = null; return { action: 'read' }; }
      const p = this.preview;
      if (!p || p.direction !== direction || p.chapter !== chapter || p.gesture === gesture) {
        return this.offer(direction, chapter, gesture, distance);
      }
      if (p.confirmation !== gesture) { p.confirmation = gesture; p.amount = 0; }
      p.amount += distance;
      if (p.amount < threshold) return this.offer(direction, chapter, p.gesture, distance);
      this.preview = null;
      this.consumed = { gesture, direction };
      return { action: 'turn', direction, chapter };
    }
  }
  globalThis.ORCAWheelGestures = WheelGestures;
  globalThis.ORCAChapterBoundary = ChapterBoundary;
})();
