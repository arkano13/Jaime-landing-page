# Sitio web · Building Leaders Company

Sitio de BLC hecho con HTML, CSS y JavaScript propios: sin WordPress, sin plugins y sin licencias de pago. La organización visual toma como referencia el sitio de Margarita Pasos y respeta el *Manual de Identidad Visual BLC v1.0*.

## Páginas

| Ruta | Archivo | Contenido |
|---|---|---|
| `/` | `src/index.html` | Inicio: portada, credenciales, soluciones, ruta, cómo trabajamos, automatización, testimonios, fundador |
| `/conferencias` | `src/conferencias.html` | Las 8 conferencias y formulario de solicitud (abre WhatsApp) |
| `/fundador` | `src/fundador.html` | ¿Quién es Jaime Corrales? |

Encabezado y pie se editan una sola vez en `src/partials/`. Estilos en `src/styles.css`, interacción en `src/main.js`.

## Verlo en tu computadora

Requiere [Node.js](https://nodejs.org) 18 o superior (gratis).

```bash
npm start
```

Abre `http://localhost:3000`. El comando arma el sitio en `dist/` y lo sirve.

## Publicar en Railway

1. En Railway: **New Project → Deploy from GitHub repo** y elige este repositorio y la rama.
2. Railway detecta Node.js y ejecuta `npm start` solo. No hace falta configurar nada más: el servidor usa el puerto que Railway asigna (`PORT`).
3. En **Settings → Networking → Generate Domain** obtienes la dirección pública. Ahí mismo se conecta el dominio propio.

## Fotos

Coloca los archivos en `src/assets/fotos/` con estos nombres y aparecen solos:

- `jaime-ceo.jpg` (inicio, conferencias y fundador)
- `jaime-escenario.jpg` (conferencias y fundador)
- `conferencia-publico.jpg` (conferencias)
- `libro-lider-intencional.jpg` (tarjeta del libro en el inicio)

Videos en `src/assets/videos/` (MP4 H.264 con su póster `.jpg`).

Mientras no existan, se ve un recuadro que indica qué foto va.

## Pendiente

Testimonios adicionales, link de compra de conferencias y dominio.
