document.documentElement.classList.add('js');

const WA = 'https://wa.me/50489826424';
const waLink = text => `${WA}?text=${encodeURIComponent(text)}`;
const DIAG = 'Hola, quiero agendar un diagnóstico gratuito con Building Leaders Company.';

// Enlaces de WhatsApp con mensaje según lo que se pide
document.querySelectorAll('[data-wa]').forEach(a => {
  const item = a.dataset.item;
  a.href = waLink(item ? `Hola, quiero información sobre ${item} para mi organización.` : DIAG);
  a.target = '_blank';
  a.rel = 'noopener';
});

// "Solicitar" en cada conferencia, programa, taller y proceso
document.querySelectorAll('[data-kind]').forEach(list => {
  const kind = list.dataset.kind;
  list.querySelectorAll(':scope > li').forEach(li => {
    const title = li.querySelector('h3').textContent;
    const a = document.createElement('a');
    a.className = 'ask';
    a.href = waLink(`Hola, quiero ${kind} "${title}" para mi organización.`);
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Solicitar por WhatsApp';
    a.setAttribute('aria-label', `Solicitar ${kind} ${title} por WhatsApp`);
    (li.querySelector(':scope > div') || li).appendChild(a);
  });
});

// Selector de necesidad: recomienda la solución según el desafío
const SOLUTIONS = {
  conferencias: {
    name: 'Conferencias de Alto Impacto',
    text: 'Experiencias diseñadas para inspirar decisiones, fortalecer el liderazgo y generar resultados sostenibles. 8 conferencias disponibles.',
    link: 'Ver las conferencias', ask: 'una Conferencia de Alto Impacto'
  },
  programas: {
    name: 'Programas de Desarrollo Ejecutivo',
    text: 'Experiencias de aprendizaje que desarrollan una competencia concreta, con aplicación desde el primer día. 9 programas disponibles.',
    link: 'Ver los programas', ask: 'un Programa de Desarrollo Ejecutivo'
  },
  talleres: {
    name: 'Talleres de Transformación',
    text: 'Experiencias de desarrollo ejecutivo diseñadas para instalar capacidades, no solo transmitir ideas. 5 talleres disponibles.',
    link: 'Ver los talleres', ask: 'un Taller de Transformación'
  },
  procesos: {
    name: 'Procesos de Transformación Organizacional',
    text: 'Un recorrido sostenido que transforma la forma en que la organización piensa, decide y crece. 4 procesos disponibles.',
    link: 'Ver los procesos', ask: 'un Proceso de Transformación Organizacional'
  },
  automatizacion: {
    name: 'Automatización e Inteligencia Dirigida®',
    text: 'Automatización, asistentes de IA y análisis integrados dentro de un proceso, programa o taller, cuando el diagnóstico lo determina.',
    link: 'Ver cómo funciona', ask: 'Automatización e Inteligencia Dirigida®'
  }
};
const finder = document.getElementById('finder');
const result = document.getElementById('finder-result');
if (finder) {
  finder.addEventListener('change', e => {
    const key = e.target.value;
    const s = SOLUTIONS[key];
    if (!s) return;
    result.innerHTML = `
      <div class="finder-pick">
        <h3>${s.name}</h3>
        <p>${s.text}</p>
        <div class="finder-links">
          <a class="text-link" href="#${key}">${s.link}</a>
          <a class="text-link" href="${waLink(`Hola, me interesa ${s.ask} para mi organización. Quiero agendar un diagnóstico.`)}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
        </div>
      </div>`;
    const box = result.getBoundingClientRect();
    if (box.bottom > window.innerHeight) result.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  finder.addEventListener('submit', e => e.preventDefault());
}

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
    msg.textContent = match ? 'Hay una oportunidad real de automatización e inteligencia dirigida en su organización.' : base;
  });
  check.addEventListener('submit', e => e.preventDefault());
}

// Línea inferior del encabezado al salir de la parte superior (sin escuchar el scroll)
const header = document.querySelector('.site-header');
new IntersectionObserver(([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting))
  .observe(document.getElementById('top-sentinel'));

// Menú móvil
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
const setMenu = open => {
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) nav.querySelector('a').focus();
};
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
});
