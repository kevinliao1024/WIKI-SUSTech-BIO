// Projected particles can meet at the codon. Keep their explanatory labels in
// separate lanes and connect each label back to its own moving particle.
export function positionCallout(el, line, anchor, codon, opacity, right, bottom) {
  const visible = opacity > .02 && anchor.z > -1 && anchor.z < 1;
  el.style.opacity = visible ? opacity.toFixed(3) : '0';
  el.style.visibility = visible ? 'visible' : 'hidden';
  if (line) line.style.opacity = visible ? (opacity * .38).toFixed(3) : '0';
  if (!visible) return;
  const width = el.offsetWidth, height = el.offsetHeight, margin = 20;
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  let x, y;
  if (innerWidth < 900) {
    x = right ? innerWidth - margin - width : margin;
    y = clamp(Math.max(codon.bottom + 24, innerHeight * .61), 140, bottom - height - 20);
  } else {
    x = right
      ? clamp(Math.max(anchor.x - width / 2, codon.right + 32), margin, innerWidth - margin - width)
      : clamp(Math.min(anchor.x - width / 2, codon.left - width - 32), margin, innerWidth - margin - width);
    y = clamp(anchor.y + 28, 150, Math.min(innerHeight * .73, bottom - 20) - height);
  }
  el.style.transform = `translate3d(${x}px,${y}px,0)`;
  const endX = clamp(anchor.x, x, x + width), endY = clamp(anchor.y, y, y + height);
  if (line) {
    // A docked particle can sit behind the codon. Do not draw a leader through
    // its letters; the adjacent named callout remains visible.
    const behindCodon = anchor.x >= codon.left - 8 && anchor.x <= codon.right + 8
      && anchor.y >= codon.top - 8 && anchor.y <= codon.bottom + 8;
    line.style.opacity = visible && !behindCodon ? (opacity * .38).toFixed(3) : '0';
    line.setAttribute('d', `M${anchor.x},${anchor.y} L${endX},${endY}`);
  }
}
