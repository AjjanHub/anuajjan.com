// Section buttons click → smooth scroll
const buttons = Array.from(document.querySelectorAll('.dock button'));
const sections = Array.from(document.querySelectorAll('main > section'));
const ids = sections.map(s => '#' + s.id);
buttons.forEach((b, i) => (b.dataset.target = ids[i]));
buttons.forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(btn.dataset.target);
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Highlight current section + reveal animation
const io = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = '#' + e.target.id;
        buttons.forEach(b => b.classList.toggle('active', b.dataset.target === id));
        const rev = e.target.querySelector('.reveal');
        if (rev) rev.classList.add('in');
      }
    });
  },
  { threshold: 0.6 }
);
sections.forEach(sec => io.observe(sec));

// “Magnet” snap: one section per wheel/touch gesture
let isScrolling = false;
function currentSectionIndex() {
  let best = 0, bestDist = Infinity, top = window.scrollY;
  sections.forEach((s, i) => {
    const d = Math.abs(s.offsetTop - top);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}
function scrollToIndex(idx) {
  if (idx < 0 || idx >= sections.length) return;
  isScrolling = true;
  sections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => (isScrolling = false), 700);
}

// Mouse wheel
window.addEventListener(
  'wheel',
  e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input', 'textarea', 'select', 'button', 'label'].includes(tag)) return;
    if (isScrolling) return;
    if (Math.abs(e.deltaY) < 20) return;
    e.preventDefault();
    const idx = currentSectionIndex();
    scrollToIndex(idx + (e.deltaY > 0 ? 1 : -1));
  },
  { passive: false }
);

// Touch swipe
let touchStartY = null;
window.addEventListener('touchstart', e => {
  if (e.touches && e.touches.length) touchStartY = e.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchend', e => {
  if (touchStartY === null) return;
  const endY = (e.changedTouches && e.changedTouches[0].clientY) || touchStartY;
  const d = touchStartY - endY;
  touchStartY = null;
  if (Math.abs(d) < 40 || isScrolling) return;
  const tag = (e.target && e.target.tagName || '').toLowerCase();
  if (['input','textarea','select','button','label'].includes(tag)) return;
  const idx = currentSectionIndex();
  scrollToIndex(idx + (d > 0 ? 1 : -1));
}, { passive: true });
