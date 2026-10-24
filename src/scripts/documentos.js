// Buscador de documentos.html: filtra las tarjetas por su data-search (código, título, resumen,
// etiquetas y cuerpo) sin distinguir mayúsculas ni tildes. Todas las palabras tienen que aparecer.
// La búsqueda se refleja en ?q= para poder enlazarla.
(() => {
  const input = document.getElementById('doc-q'), count = document.getElementById('doc-count'), empty = document.getElementById('doc-empty');
  const items = [...document.querySelectorAll('.dl-item')];
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const docs = n => n + (n === 1 ? ' documento' : ' documentos');

  function apply(){
    const q = input.value.trim(), terms = norm(q).split(/\s+/).filter(Boolean);
    let n = 0;
    items.forEach(it => { const hit = terms.every(t => it.dataset.search.includes(t)); it.hidden = !hit; if (hit) n++; });
    count.textContent = terms.length ? `${n} de ${docs(items.length)}` : docs(items.length);
    empty.hidden = n > 0;
    const u = new URL(location.href);
    if (q) u.searchParams.set('q', q); else u.searchParams.delete('q');
    history.replaceState(null, '', u);
  }

  input.value = new URLSearchParams(location.search).get('q') || '';
  input.addEventListener('input', apply);
  if (input.value) apply();
})();
