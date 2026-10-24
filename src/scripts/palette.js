// Selector de paleta para las páginas de los posts: el mismo bloque que src/scripts/main.js,
// que no se puede cargar aquí porque espera los elementos del portfolio.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Paleta de colores */
  const root = document.documentElement, pal = document.getElementById('pal'), palBtn = document.getElementById('pal-btn');
  const opts = [...pal.querySelectorAll('.pal-opt')];
  function paintPal(){ const cur = root.getAttribute('data-palette') || 'nebulosa'; opts.forEach(o => o.setAttribute('aria-checked', String(o.dataset.p === cur))); }
  function setPal(p){
    if (!reduce){ root.classList.add('pal-swap'); clearTimeout(setPal.t); setPal.t = setTimeout(() => root.classList.remove('pal-swap'), 650); }
    if (p === 'nebulosa') root.removeAttribute('data-palette'); else root.setAttribute('data-palette', p);
    try { localStorage.setItem('diego-palette', p); } catch (e) {}
    paintPal(); dispatchEvent(new Event('palettechange'));
  }
  function openPal(v){ pal.classList.toggle('open', v); palBtn.setAttribute('aria-expanded', String(v)); }
  palBtn.addEventListener('click', e => { e.stopPropagation(); const v = !pal.classList.contains('open'); openPal(v); if (v) (opts.find(o => o.getAttribute('aria-checked') === 'true') || opts[0]).focus(); });
  opts.forEach((o, i) => {
    o.addEventListener('click', () => { setPal(o.dataset.p); });
    o.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); opts[(i + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length].focus(); }
      else if (e.key === 'Escape'){ openPal(false); palBtn.focus(); }
    });
  });
  document.addEventListener('click', e => { if (!pal.contains(e.target)) openPal(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && pal.classList.contains('open')){ openPal(false); palBtn.focus(); } });
  paintPal();
})();
