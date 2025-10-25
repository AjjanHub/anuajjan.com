/* ===== Navigation + snap scrolling ===== */
const buttons = Array.from(document.querySelectorAll('.dock button'));
const sections = Array.from(document.querySelectorAll('main > section'));
const ids = sections.map(s => '#' + s.id);

// map buttons -> sections
buttons.forEach((b, i) => b.dataset.target = ids[i] || '#home');

// click -> smooth scroll
buttons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const t = document.querySelector(btn.dataset.target);
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// highlight current section
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = '#' + e.target.id;
      buttons.forEach(b => b.classList.toggle('active', b.dataset.target === id));
    }
  });
}, { threshold: 0.6 });

sections.forEach(sec => io.observe(sec));

// wheel / touch “magnet” scroll (skip when typing)
let busy = false;
function indexAtTop() {
  let best = 0, bestDist = Infinity, top = window.scrollY + 1;
  sections.forEach((s, i) => {
    const d = Math.abs(s.offsetTop - top);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}
function goto(i) {
  if (i < 0 || i >= sections.length) return;
  busy = true;
  sections[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => busy = false, 700);
}
function isFormElement(el) {
  const tag = (el && el.tagName || '').toLowerCase();
  return ['input','textarea','select','button','label'].includes(tag);
}
window.addEventListener('wheel', (e) => {
  if (busy || isFormElement(e.target) || Math.abs(e.deltaY) < 20) return;
  e.preventDefault();
  const idx = indexAtTop();
  goto(idx + (e.deltaY > 0 ? 1 : -1));
}, { passive: false });

let touchStartY = null;
window.addEventListener('touchstart', (e) => {
  if (e.touches && e.touches.length) touchStartY = e.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchend', (e) => {
  if (touchStartY === null) return;
  const endY = (e.changedTouches && e.changedTouches[0].clientY) || touchStartY;
  const d = touchStartY - endY;
  touchStartY = null;
  if (busy || Math.abs(d) < 40 || isFormElement(e.target)) return;
  const idx = indexAtTop();
  goto(idx + (d > 0 ? 1 : -1));
}, { passive: true });

/* ===== Contact form (AJAX with graceful fallback) ===== */
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', async (e) => {
    // if fetch is available, do AJAX; otherwise let the form submit normally
    if (!window.fetch) return;

    e.preventDefault();
    statusEl.textContent = 'Sending…';

    const data = new FormData(form);
    const endpoint = form.getAttribute('action') || '/api/contact';

    try {
      const res = await fetch(endpoint, { method: 'POST', body: data });
      if (res.ok) {
        statusEl.textContent = 'Thanks — your message was sent.';
        form.reset();
      } else {
        statusEl.textContent = 'Sorry, something went wrong. Please email directly.';
      }
    } catch {
      statusEl.textContent = 'Network error. Please try again or email directly.';
    }
  });
}
