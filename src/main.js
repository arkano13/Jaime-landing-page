document.documentElement.classList.add('js');

const WA = 'https://wa.me/50489826424';
const waLink = text => `${WA}?text=${encodeURIComponent(text)}`;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Enlaces de WhatsApp con mensaje según lo que se pide
document.querySelectorAll('[data-wa], [data-wa-float]').forEach(a => {
  const item = a.dataset.item;
  a.href = waLink(item
    ? `Hola, quiero información sobre ${item} para mi organización.`
    : 'Hola, quiero agendar un diagnóstico gratuito con Building Leaders Company.');
  a.target = '_blank';
  a.rel = 'noopener';
});

// Medición (Google Analytics): clics en WhatsApp, Hotmart, Amazon, Instagram y correo
const track = (name, params = {}) => { if (typeof gtag === 'function') gtag('event', name, { transport_type: 'beacon', ...params }); };
const linkEvents = [
  ['wa.me/', 'click_whatsapp'],
  ['pay.hotmart.com', 'click_hotmart'],
  ['a.co/', 'click_amazon'],
  ['amazon.', 'click_amazon'],
  ['instagram.com', 'click_instagram'],
  ['mailto:', 'click_correo']
];
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const hit = linkEvents.find(([part]) => a.href.includes(part));
  if (!hit) return;
  const ubicacion = a.matches('[data-wa-float]') ? 'flotante' : a.closest('footer') ? 'pie' : a.closest('header') ? 'encabezado' : 'contenido';
  track(hit[1], { ubicacion, boton: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 60), pagina: location.pathname });
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
  // Avanza al siguiente; al final vuelve al primero
  const advance = () => {
    const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 8;
    if (atEnd) carousel.scrollTo({ left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    else step(1);
  };
  document.querySelector('[data-carousel-prev]').addEventListener('click', () => { step(-1); restart(); });
  document.querySelector('[data-carousel-next]').addEventListener('click', () => { advance(); restart(); });

  // Giro automático (7 s por defecto, o data-carousel-interval): se detiene al pasar el mouse, con el foco dentro,
  // fuera de pantalla, con la pestaña oculta o mientras se reproduce un video
  let timer = null, visible = false, hovering = false;
  const playing = () => [...carousel.querySelectorAll('video')].some(v => !v.paused);
  const canRun = () => !reduceMotion && visible && !hovering && !carousel.contains(document.activeElement) && !document.hidden && !playing();
  function restart() {
    clearInterval(timer);
    timer = canRun() ? setInterval(() => { if (canRun()) advance(); }, Number(carousel.dataset.carouselInterval) || 7000) : null;
  }
  carousel.addEventListener('mouseenter', () => { hovering = true; restart(); });
  carousel.addEventListener('mouseleave', () => { hovering = false; restart(); });
  carousel.addEventListener('focusin', restart);
  carousel.addEventListener('focusout', () => setTimeout(restart, 0));
  carousel.addEventListener('play', restart, true);
  carousel.addEventListener('pause', restart, true);
  document.addEventListener('visibilitychange', restart);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; restart(); }, { threshold: 0.3 }).observe(carousel);
}

// Formulario único de diagnóstico: preselecciona la solución (?solucion=) y abre WhatsApp
const diag = document.getElementById('diag-form');
if (diag) {
  const f = diag.elements;
  const pre = new URLSearchParams(location.search).get('solucion');
  if (pre && [...f.interes.options].some(o => o.value === pre)) f.interes.value = pre;
  const tema = new URLSearchParams(location.search).get('tema');
  const tipos = { conferencias: 'la conferencia', programas: 'el programa', talleres: 'el taller', procesos: 'el proceso', automatizacion: 'la dimensión' };
  if (tema) f.mensaje.value = `Me interesa ${tipos[pre] || ''} "${tema}".`.replace('  ', ' ');
  const showErr = (input, bad) => {
    input.setAttribute('aria-invalid', bad);
    document.getElementById(input.getAttribute('aria-describedby')).hidden = !bad;
  };
  diag.addEventListener('submit', e => {
    e.preventDefault();
    const missing = [f.nombre, f.organizacion].filter(i => { const bad = !i.value.trim(); showErr(i, bad); return bad; });
    if (missing.length) { missing[0].focus(); return; }
    const interes = f.interes.value ? f.interes.options[f.interes.selectedIndex].text : 'Quiero una recomendación';
    const lines = [
      'Hola, quiero agendar un diagnóstico gratuito con Building Leaders Company.',
      `Nombre: ${f.nombre.value.trim()}`,
      `Organización: ${f.organizacion.value.trim()}`,
      `Me interesa: ${interes}`,
      f.mensaje.value.trim() && `Desafío: ${f.mensaje.value.trim()}`
    ].filter(Boolean);
    track('generate_lead', { solucion: f.interes.value || 'recomendacion', pagina: location.pathname });
    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });
  diag.addEventListener('input', e => {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) showErr(e.target, false);
  });
}

// Videos ilustrativos: se reproducen en silencio solo cuando están en pantalla
const autoVideos = document.querySelectorAll('.auto-video');
if (autoVideos.length) {
  if (reduceMotion) {
    autoVideos.forEach(v => v.setAttribute('controls', ''));
  } else {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.play().catch(() => e.target.setAttribute('controls', ''));
      else e.target.pause();
    }), { threshold: 0.4 });
    autoVideos.forEach(v => io.observe(v));
  }
}
