// Smooth “magnet” scroll for wheel/touch + button clicks
(() => {
  const panels = [...document.querySelectorAll('.section')];
  const byId = id => document.getElementById(id);

  // Button clicks
  document.querySelectorAll('.floating-nav a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      t && t.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // Wheel “snap” (debounced)
  let ticking = false;
  window.addEventListener('wheel', e => {
    if (ticking) return;
    ticking = true;
    const y = window.scrollY, h = window.innerHeight;
    const idx = Math.round(y / h);
    const next = e.deltaY > 0 ? Math.min(idx + 1, panels.length - 1)
                              : Math.max(idx - 1, 0);
    panels[next].scrollIntoView({behavior:'smooth'});
    setTimeout(()=> ticking = false, 650);
  }, {passive:true});

  // Touch swipe
  let startY = null;
  window.addEventListener('touchstart', e => startY = e.touches[0].clientY, {passive:true});
  window.addEventListener('touchend', e => {
    if (startY === null) return;
    const dy = startY - (e.changedTouches[0].clientY);
    const y = window.scrollY, h = window.innerHeight;
    const idx = Math.round(y / h);
    const next = dy > 30 ? Math.min(idx + 1, panels.length - 1)
                         : dy < -30 ? Math.max(idx - 1, 0)
                                    : idx;
    panels[next].scrollIntoView({behavior:'smooth'});
    startY = null;
  }, {passive:true});
})();
