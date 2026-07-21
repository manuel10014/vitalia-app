# Branding — Vitalia

Guía de marca para el panel de Vitalia (ensayos eléctricos/ingeniería). Paleta sobria: azul, grises y negro para texto. Nace de dos cosas: (1) los colores que ya se venían usando de forma dispersa en las pantallas existentes, formalizados aquí para que no sigan siendo implícitos, y (2) la revisión del dashboard de referencia de Figma ["Dashboard (Community)"](https://www.figma.com/design/HkUklppl2DnTvdIkmUrzmG), del que se rescatan patrones de layout pero **no** su paleta multicolor.

## Archivos

- `colors.css` — variables CSS (`--vitalia-*`), para usar con `var()` o importarlas en un módulo CSS.
- `colors.ts` — los mismos tokens en TypeScript, para gráficos (Recharts), `react-signature-canvas`, o cualquier prop que necesite un string de color en vez de una clase.

Nota: `app/globals.css` ya tiene su propio set de variables (`--primary`, `--chart-1`, etc.) del theme por defecto de shadcn/ui, en escala de grises sin personalizar. Estas nuevas variables son un capa de referencia de marca separada — no se tocó `globals.css` para no arriesgar romper componentes `components/ui/*` existentes. Conectarlas es un paso aparte, opcional.

## Paleta

### Azul — primario / marca

| Token | Hex | Uso |
|---|---|---|
| `blue-50` | `#eff6ff` | Fondos muy claros (badges, hover) |
| `blue-100` | `#dbeafe` | Fills sutiles |
| `blue-500` | `#3b82f6` | Acentos, íconos activos |
| `blue-600` | `#2563eb` | **Primario** — botones, estados activos, links |
| `blue-700` | `#1d4ed8` | Hover / pressed |
| `blue-900` | `#1e3a8a` | Uso puntual, alto contraste |

### Gris (slate) — estructura y texto

| Token | Hex | Uso |
|---|---|---|
| `slate-50` | `#f8fafc` | Fondo de página / secciones |
| `slate-100` | `#f1f5f9` | Fills sutiles, hover |
| `slate-200` | `#e2e8f0` | Bordes, separadores |
| `slate-400` | `#94a3b8` | Placeholder, texto deshabilitado |
| `slate-500` | `#64748b` | Texto secundario, labels |
| `slate-700` | `#334155` | Texto de cuerpo |
| `slate-900` | `#0f172a` | Texto de alto énfasis, headers oscuros (ej. header de tarjetas en la matriz de ensayo) |

### Negro / blanco

Uso mínimo y deliberado: `#000000` prácticamente no aparece directo en el código — `slate-900` cumple el rol de "negro" en casi todos los casos, y da un negro con algo de temperatura en vez de negro puro. Mantener esa convención.

### Semánticos (estado de ensayos — no decorativos)

| Token | Hex | Uso |
|---|---|---|
| `success-500/600` | `#10b981` / `#059669` | Ensayo **aprobado / PASSED** |
| `danger-600` | `#dc2626` | Ensayo **rechazado**, acciones de borrar |
| `warning-500` | `#f59e0b` | Pendiente / alerta |

Regla: estos tres colores se reservan **solo** para comunicar estado (aprobado/rechazado/pendiente). No usarlos como color decorativo de gráficos o íconos genéricos — para eso, usar la escala de azul en distintos tonos.

## Tipografía

- Familia: **Inter** (`next/font/google`, aplicada en `app/layout.tsx`). El `--font-geist-sans` que aparece en `globals.css` es remanente del boilerplate de Next.js y no está en uso real — no confundir.
- Voz tipográfica ya establecida en el código: peso `font-black` (900) para casi todo lo que lleva énfasis — títulos, números de KPI, botones, labels — y `uppercase tracking-wide/widest` para textos pequeños tipo "eyebrow" (`text-[10px]`/`text-[11px]`). Mantener esta convención en pantallas nuevas en vez de introducir pesos intermedios (`font-medium`, `font-semibold`) que rompan la consistencia.
- Números grandes (KPI): `text-2xl`/`text-3xl` + `font-black` + `text-slate-900`.

## Radios y forma

La app usa esquinas muy redondeadas de forma consistente (`rounded-xl` a `rounded-[2.5rem]` en tarjetas grandes) — es parte del lenguaje visual tanto como el color. Mantenerlo al construir componentes nuevos.

## Patrones a reutilizar del dashboard de referencia (Figma)

Válidos para una futura pantalla de resumen/KPIs en Vitalia (ensayos por estado, tiempo promedio de revisión, protocolos más usados):

1. **Bloque de KPI**: número grande en negro (`slate-900`) + label arriba en gris (`slate-500`, uppercase) + badge de variación (verde ↑ / rojo ↓). Directamente aplicable a métricas de ensayos.
2. **Leyenda de dos series reutilizada**: punto de color + texto (`● Últimos 6 días` / `● Semana pasada`) repetido igual en más de un gráfico — da consistencia entre gráficos distintos. Adaptar con azul (serie actual) + gris (serie de comparación), nunca dos colores no relacionados.

## Qué NO copiar del dashboard de referencia

1. **Círculos de "Your Rating" con tamaño inconsistente con su valor** (85%, 85%, 92% con tamaños visualmente distintos) — es un error de encoding, no un estilo a imitar. Si Vitalia necesita algo similar (ej. % de cumplimiento por protocolo), usar un solo hue (azul) en variantes de tono/opacidad según el valor, con tamaño fijo o genuinamente proporcional.
2. **Paleta multicolor decorativa** (violeta, naranja, turquesa) — no tiene lugar en un sistema sobrio de azul/gris/negro. Cualquier necesidad de "distinguir categorías" debe resolverse con tonos de azul, no con hues nuevos.
3. Botones de acción secundaria solo con borde y sin relleno, poco perceptibles como clickeables — si se reutiliza el patrón "Ver Reporte", darle más peso visual (fondo `blue-50` + texto `blue-600`, como ya se usa en varios badges del código actual) en vez de solo un borde fino.
