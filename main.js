document.documentElement.classList.add('js');

const WA = 'https://wa.me/50489826424';
const waLink = text => `${WA}?text=${encodeURIComponent(text)}`;

// Enlaces de WhatsApp con mensaje según lo que se pide
document.querySelectorAll('[data-wa]').forEach(a => {
  const item = a.dataset.item;
  a.href = waLink(item
    ? `Hola, quiero información sobre ${item} para mi organización.`
    : 'Hola, quiero agendar un diagnóstico gratuito con Building Leaders Company.');
  a.target = '_blank';
  a.rel = 'noopener';
});

// "Solicitar" en cada conferencia, programa, taller y proceso
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
document.querySelectorAll('[data-kind]').forEach(list => {
  const kind = list.dataset.kind;
  list.querySelectorAll(':scope > li').forEach(li => {
    const title = li.querySelector('h3').textContent;
    const a = document.createElement('a');
    a.className = 'ask';
    a.href = waLink(`Hola, quiero ${kind} "${title}" para mi organización.`);
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `Solicitar por WhatsApp ${arrow}`;
    a.setAttribute('aria-label', `Solicitar ${kind} ${title} por WhatsApp`);
    (li.querySelector('div') || li).appendChild(a);
  });
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
    msg.textContent = match
      ? 'Hay una oportunidad real de automatización e inteligencia dirigida en su organización.'
      : base;
  });
  check.addEventListener('submit', e => e.preventDefault());
}

// Encabezado: línea inferior al desplazarse
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

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
nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
});
