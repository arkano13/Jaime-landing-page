document.documentElement.classList.add('js');

const WA = 'https://wa.me/50489826424';
const waLink = text => `${WA}?text=${encodeURIComponent(text)}`;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Enlaces de WhatsApp con mensaje según lo que se pide
document.querySelectorAll('[data-wa]').forEach(a => {
  const item = a.dataset.item;
  a.href = waLink(item
    ? `Hola, quiero información sobre ${item} para mi organización.`
    : 'Hola, quiero agendar un diagnóstico gratuito con Building Leaders Company.');
  a.target = '_blank';
  a.rel = 'noopener';
});

// Menú móvil
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
const setMenu = open => {
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflow = open ? 'hidden' : '';
};
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));

// Menú desplegable de soluciones
const trigger = document.querySelector('.nav-trigger');
const setMega = open => trigger.setAttribute('aria-expanded', open);
trigger.addEventListener('click', () => setMega(trigger.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('click', e => { if (!e.target.closest('.has-menu')) setMega(false); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (trigger.getAttribute('aria-expanded') === 'true') { setMega(false); trigger.focus(); }
  else if (nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
});
nav.addEventListener('click', e => {
  if (e.target.closest('a')) { setMenu(false); setMega(false); }
});

// Soluciones: lista numerada con panel (pestañas verticales)
const engine = document.querySelector('[data-tabs]');
const showSolution = key => {
  if (!engine) return false;
  const tab = engine.querySelector(`[role="tab"][aria-controls="p-${key}"]`);
  if (!tab) return false;
  engine.querySelectorAll('[role="tab"]').forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  return true;
};
if (engine) {
  const tabs = [...engine.querySelectorAll('[role="tab"]')];
  tabs.forEach(t => t.addEventListener('click', () => showSolution(t.getAttribute('aria-controls').slice(2))));
  engine.querySelector('[role="tablist"]').addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement);
    const next = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (i < 0 || next === undefined) return;
    e.preventDefault();
    const t = tabs[(next + tabs.length) % tabs.length];
    showSolution(t.getAttribute('aria-controls').slice(2));
    t.focus();
  });
  let pending = null;
  try { pending = sessionStorage.getItem('blc-solution'); sessionStorage.removeItem('blc-solution'); } catch (_) {}
  if (pending) showSolution(pending);
}

// Enlaces que abren una solución concreta (desde cualquier página)
document.addEventListener('click', e => {
  const a = e.target.closest('[data-solution]');
  if (!a) return;
  const key = a.dataset.solution;
  if (engine && showSolution(key)) {
    e.preventDefault();
    document.getElementById('soluciones').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#soluciones');
  } else {
    try { sessionStorage.setItem('blc-solution', key); } catch (_) {}
  }
});

// Autodiagnóstico de automatización: dos o más situaciones = oportunidad
const check = document.getElementById('auto-check');
if (check) {
  const boxes = check.querySelectorAll('input[type="checkbox"]');
  const n = document.getElementById('check-n');
  const msg = document.getElementById('check-msg');
  const base = msg.textContent;
  check.addEventListener('change', () => {
    const count = [...boxes].filter(b => b.checked).length;
    n.textContent = count;
    const match = count >= 2;
    check.classList.toggle('is-match', match);
    msg.textContent = match ? 'Hay una oportunidad real de automatización e inteligencia dirigida en tu organización.' : base;
  });
  check.addEventListener('submit', e => e.preventDefault());
}

// Carrusel de testimonios
const carousel = document.querySelector('[data-carousel]');
if (carousel) {
  const step = dir => {
    const card = carousel.querySelector('li');
    const gap = parseFloat(getComputedStyle(carousel).columnGap) || 0;
    carousel.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  document.querySelector('[data-carousel-prev]').addEventListener('click', () => step(-1));
  document.querySelector('[data-carousel-next]').addEventListener('click', () => step(1));
}

// Formulario de solicitud de conferencia: valida y abre WhatsApp con el mensaje armado
const request = document.getElementById('request');
if (request) {
  const showErr = (input, bad) => {
    input.setAttribute('aria-invalid', bad);
    const err = document.getElementById(input.getAttribute('aria-describedby'));
    if (err) err.hidden = !bad;
  };
  request.addEventListener('submit', e => {
    e.preventDefault();
    const f = request.elements;
    const missing = [f.nombre, f.organizacion].filter(i => { const bad = !i.value.trim(); showErr(i, bad); return bad; });
    const emailBad = f.correo.value.trim() !== '' && !f.correo.checkValidity();
    showErr(f.correo, emailBad);
    const first = missing[0] || (emailBad ? f.correo : null);
    if (first) { first.focus(); return; }
    const lines = [
      'Hola, quiero solicitar una conferencia con Building Leaders Company.',
      `Nombre: ${f.nombre.value.trim()}`,
      `Organización: ${f.organizacion.value.trim()}`,
      f.correo.value.trim() && `Correo: ${f.correo.value.trim()}`,
      f.telefono.value.trim() && `Teléfono: ${f.telefono.value.trim()}`,
      `Conferencia: ${f.conferencia.value}`,
      f.fecha.value && `Fecha del evento: ${f.fecha.value}`,
      f.lugar.value.trim() && `Lugar: ${f.lugar.value.trim()}`,
      `Modalidad: ${f.modalidad.value}`,
      f.descripcion.value.trim() && `Sobre el evento: ${f.descripcion.value.trim()}`
    ].filter(Boolean);
    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });
  request.addEventListener('input', e => {
    if (e.target.getAttribute('aria-invalid') !== 'true') return;
    const ok = e.target.type === 'email' ? (e.target.value === '' || e.target.checkValidity()) : e.target.value.trim() !== '';
    if (ok) showErr(e.target, false);
  });
}
