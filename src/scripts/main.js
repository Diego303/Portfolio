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

  /* Copiar email */
  const btn = document.getElementById('copy'), out = document.getElementById('copied'), mail = document.getElementById('mail');
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(mail.textContent.trim()); out.textContent = 'Email copiado.'; }
    catch (e) { const r = document.createRange(); r.selectNodeContents(mail); const s = getSelection(); s.removeAllRanges(); s.addRange(r); out.textContent = 'Seleccionado: pulsa Ctrl+C para copiarlo.'; }
  });

  /* Capacidades: en escritorio, una abierta cada vez; en móvil, acordeón */
  const capTabs = [...document.querySelectorAll('.cap-tab')];
  const wide = () => matchMedia('(min-width: 901px)').matches;
  capTabs.forEach((t, i) => {
    t.addEventListener('click', () => {
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      const open = t.getAttribute('aria-expanded') === 'true';
      if (wide()){
        if (open) return;
        capTabs.forEach(o => { o.setAttribute('aria-expanded', 'false'); document.getElementById(o.getAttribute('aria-controls')).hidden = true; });
      }
      t.setAttribute('aria-expanded', String(!open || wide()));
      panel.hidden = !( !open || wide());
      if (!panel.hidden && !reduce){ panel.classList.remove('in'); void panel.offsetWidth; panel.classList.add('in'); }
    });
    t.addEventListener('keydown', e => {
      if (!wide()) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); const n = capTabs[(i + (e.key === 'ArrowDown' ? 1 : -1) + capTabs.length) % capTabs.length]; n.focus(); n.click(); }
    });
  });
  // al pasar a escritorio, garantizar que hay exactamente un panel abierto
  matchMedia('(min-width: 901px)').addEventListener('change', ev => {
    if (!ev.matches) return;
    const openT = capTabs.filter(t => t.getAttribute('aria-expanded') === 'true');
    capTabs.forEach(o => { o.setAttribute('aria-expanded', 'false'); document.getElementById(o.getAttribute('aria-controls')).hidden = true; });
    const k = openT[0] || capTabs[0]; k.setAttribute('aria-expanded', 'true'); document.getElementById(k.getAttribute('aria-controls')).hidden = false;
  });

  /* Filtro de proyectos */
  const fb = document.querySelectorAll('.fbtn'), cards = document.querySelectorAll('.pcard');
  fb.forEach(b => b.addEventListener('click', () => {
    fb.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    cards.forEach(c => { c.hidden = !(b.dataset.f === 'all' || c.dataset.cat === b.dataset.f); });
  }));
  /* Luz que sigue al cursor en las tarjetas */
  cards.forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));

  /* Barra de lectura y volver arriba */
  const rb = document.getElementById('readbar'), tt = document.getElementById('totop');
  function onScroll(){
    const h = document.documentElement.scrollHeight - innerHeight;
    rb.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%';
    tt.classList.toggle('on', scrollY > 900);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (reduce) document.querySelectorAll('#arquitectura animateMotion').forEach(a => a.parentNode.remove());

  /* Sección activa en la navegación */
  const navl = [...document.querySelectorAll('.nav a:not(.navcv)')];
  const secs = navl.map(a => document.querySelector(a.getAttribute('href')));
  function active(){ let k = -1; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < 160) k = i; }); navl.forEach((a, i) => a.classList.toggle('on', i === k)); }
  addEventListener('scroll', active, { passive: true }); active();

  /* Nebulosa del inicio: unas pocas nubes de luz muy suaves y estrellas */
  const c = document.getElementById('sky'), x = c.getContext('2d');
  let W = 0, H = 0, dpr = 1, visible = true, raf = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clouds = [
    { x: .78, y: .36, r: .42, k: '--teal-rgb',  a: .20, s: .00006 },
    { x: .9,  y: .7,  r: .36, k: '--amber-rgb', a: .18, s: .00008 },
    { x: .62, y: .18, r: .30, k: '--c3-rgb',    a: .10, s: .00005 },
    { x: .7,  y: .58, r: .22, k: '--cream-rgb', a: .12, s: .0001 },
    { x: .98, y: .2,  r: .26, k: '--teal-rgb',  a: .12, s: .00007 }
  ].map(o => ({ ...o, p: rnd(0, 6.28) }));
  let PAL = {};
  function readPal(){
    const cs = getComputedStyle(document.documentElement), g = k => cs.getPropertyValue(k).trim();
    clouds.forEach(o => { o.c = g(o.k); });
    PAL = { cream: g('--cream-rgb'), star: g('--star-rgb'), bg: g('--bg-rgb') };
  }
  readPal();
  let stars = [];
  function size(){
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(W * H / 6500);
    stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() < .08 ? rnd(1, 1.6) : rnd(.3, .9), a: rnd(.25, .85), t: rnd(0, 6.28), k: Math.random() }));
  }
  function draw(t){
    x.clearRect(0, 0, W, H);
    const m = Math.max(W, H);
    x.globalCompositeOperation = 'lighter';
    for (const o of clouds){
      const dx = Math.sin(t * o.s + o.p) * .03, dy = Math.cos(t * o.s * .8 + o.p) * .02;
      const cx = (o.x + dx) * W, cy = (o.y + dy) * H, r = o.r * m;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${o.c},${o.a})`); g.addColorStop(.45, `rgba(${o.c},${o.a * .35})`); g.addColorStop(1, `rgba(${o.c},0)`);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    }
    for (const s of stars){
      const a = reduce ? s.a : s.a * (.7 + .3 * Math.sin(t * .0012 * (1 + s.k) + s.t));
      x.fillStyle = s.k > .82 ? `rgba(${PAL.cream},${a})` : `rgba(${PAL.star},${a})`;
      x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill();
    }
    x.globalCompositeOperation = 'source-over';
    const v = x.createLinearGradient(0, 0, W * .7, 0);
    v.addColorStop(0, `rgba(${PAL.bg},.86)`); v.addColorStop(.6, `rgba(${PAL.bg},.35)`); v.addColorStop(1, `rgba(${PAL.bg},0)`);
    x.fillStyle = v; x.fillRect(0, 0, W, H);
  }
  function loop(t){ draw(t); if (!reduce && visible) raf = requestAnimationFrame(loop); }
  size(); draw(0);
  if (!reduce){
    new IntersectionObserver(e => { visible = e[0].isIntersecting && !document.hidden; cancelAnimationFrame(raf); if (visible) raf = requestAnimationFrame(loop); }).observe(c);
    document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden && visible) raf = requestAnimationFrame(loop); });
  }
  addEventListener('resize', () => { size(); draw(performance.now()); });
  addEventListener('palettechange', () => { readPal(); draw(performance.now()); });
})();
