/**
 * Vitalia — Design Tokens (Color), versión TypeScript.
 *
 * Mismos valores que ./colors.css, en formato JS/TS para casos donde no se
 * puede usar una clase de Tailwind ni una var(--css), típicamente:
 *  - series de gráficos (Recharts `stroke` / `fill`)
 *  - canvas (react-signature-canvas, penColor)
 *  - cualquier prop que exija un string de color en vez de una clase
 *
 * Mantener sincronizado con colors.css si se agregan o cambian tonos.
 */

export const vitaliaColors = {
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    900: "#1e3a8a",
  },
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    400: "#94a3b8",
    500: "#64748b",
    700: "#334155",
    900: "#0f172a",
  },
  black: "#000000",
  white: "#ffffff",
  success: {
    50: "#ecfdf5",
    500: "#10b981",
    600: "#059669",
  },
  danger: {
    50: "#fef2f2",
    200: "#fecaca",
    600: "#dc2626",
  },
  warning: {
    50: "#fffbeb",
    500: "#f59e0b",
  },
} as const;

/** Alias semánticos — usar estos en componentes en vez de vitaliaColors.blue[600] directo. */
export const vitaliaTheme = {
  primary: vitaliaColors.blue[600],
  primaryHover: vitaliaColors.blue[700],
  bgPage: vitaliaColors.slate[50],
  bgSurface: vitaliaColors.white,
  border: vitaliaColors.slate[200],
  textHeading: vitaliaColors.slate[900],
  textBody: vitaliaColors.slate[700],
  textMuted: vitaliaColors.slate[500],
  textDisabled: vitaliaColors.slate[400],
  success: vitaliaColors.success[500],
  danger: vitaliaColors.danger[600],
  warning: vitaliaColors.warning[500],
} as const;
