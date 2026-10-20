// Datos de ejemplo: reemplazar por las conferencias reales.
const TALKS = [
  { tag: 'liderazgo', label: 'Liderazgo', title: '[Nombre de la conferencia]', event: '[Evento]', place: '[Ciudad, País]', year: '[Año]', desc: '[Resumen de la conferencia: tema central, público y resultado para la organización.]' },
  { tag: 'organizacional', label: 'Desarrollo organizacional', title: '[Nombre de la conferencia]', event: '[Evento]', place: '[Ciudad, País]', year: '[Año]', desc: '[Resumen de la conferencia: tema central, público y resultado para la organización.]' },
  { tag: 'talento', label: 'Talento humano', title: '[Nombre de la conferencia]', event: '[Evento]', place: '[Ciudad, País]', year: '[Año]', desc: '[Resumen de la conferencia: tema central, público y resultado para la organización.]' },
  { tag: 'liderazgo', label: 'Liderazgo', title: '[Nombre de la conferencia]', event: '[Evento]', place: '[Ciudad, País]', year: '[Año]', desc: '[Resumen de la conferencia: tema central, público y resultado para la organización.]' },
  { tag: 'talento', label: 'Talento humano', title: '[Nombre de la conferencia]', event: '[Evento]', place: '[Ciudad, País]', year: '[Año]', desc: '[Resumen de la conferencia: tema central, público y resultado para la organización.]' },
  { tag: 'organizacional', label: 'Desarrollo organizacional', title: '[Nombre de la conferencia]', event: '[Evento]', place: '[Ciudad, País]', year: '[Año]', desc: '[Resumen de la conferencia: tema central, público y resultado para la organización.]' },
];

const grid = document.getElementById('talks');
grid.innerHTML = TALKS.map((t, i) => `
  <article class="talk reveal" data-tag="${t.tag}">
    <div class="placeholder"><span>Foto de la conferencia</span></div>
    <div class="talk-body">
      <p class="talk-tag">${t.label}</p>
      <h3>${t.title}</h3>
      <p class="meta">${t.event} · ${t.place} · ${t.year}</p>
      <button class="talk-more" data-index="${i}">Ver detalle</button>
    </div>
  </article>`).join('');

// Filtros
const chips = document.querySelectorAll('.chip');
chips.forEach(chip => chip.addEventListener('click', () => {
  chips.forEach(c => { c.classList.toggle('is-active', c === chip); c.setAttribute('aria-pressed', c === chip); });
  const f = chip.dataset.filter;
  grid.querySelectorAll('.talk').forEach(card => { card.hidden = f !== 'todas' && card.dataset.tag !== f; });
}));

// Detalle
const dlg = document.getElementById('talk-dialog');
grid.addEventListener('click', e => {
  const btn = e.target.closest('.talk-more');
  if (!btn) return;
  const t = TALKS[btn.dataset.index];
  dlg.querySelector('#dlg-tag').textContent = t.label;
  dlg.querySelector('#dlg-title').textContent = t.title;
  dlg.querySelector('#dlg-meta').textContent = `${t.event} · ${t.place} · ${t.year}`;
  dlg.querySelector('#dlg-desc').textContent = t.desc;
  dlg.showModal();
});
dlg.querySelector('.dlg-close').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

// Menú móvil
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});
nav.addEventListener('click', e => {
  if (e.target.matches('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', false); }
});

// Formulario (maqueta: sin envío real)
const form = document.querySelector('.form');
form.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll('[required]').forEach(input => {
    const valid = input.checkValidity();
    input.setAttribute('aria-invalid', !valid);
    if (!valid) ok = false;
  });
  form.querySelector('.form-status').textContent = ok
    ? 'Gracias. Esta es una maqueta: el envío se conectará en la siguiente fase.'
    : 'Revisa nombre y correo.';
});

// Revelado suave
document.querySelectorAll('.section-head, .topics li, .flow li, .auto-card, .grid-quotes blockquote').forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
