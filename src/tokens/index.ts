/**
 * KodNest Premium Build System — Design Tokens
 *
 * STRICT RULES:
 * - Maximum 4 core colors (background, text, accent + functional)
 * - 5-value spacing scale only
 * - Serif headings, sans body
 * - 150–200ms transitions only
 * - No gradients, no glassmorphism, no neon
 */

export const colors = {
  /* Core 4 colors */
  background: '#F7F6F3',
  textPrimary: '#111111',
  textSecondary: '#555555',
  accent: '#8B0000',

  /* Derived from core */
  accentHover: '#6B0000',
  accentLight: 'rgba(139, 0, 0, 0.08)',

  /* Functional (muted, not primary) */
  success: '#3A5A40',
  warning: '#8B6914',

  /* Surface & borders */
  surface: '#FFFFFF',
  border: '#D4D2CC',
  borderLight: '#E8E6E1',
} as const;

export const spacing = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '40px',
  xl: '64px',
} as const;

export const typography = {
  fontHeading: "'Playfair Display', Georgia, 'Times New Roman', serif",
  fontBody: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",

  sizes: {
    body: '17px',
    bodyLg: '18px',
    h1: '40px',
    h2: '32px',
    h3: '24px',
    small: '14px',
  },

  lineHeights: {
    heading: '1.3',
    body: '1.7',
  },

  letterSpacing: {
    heading: '-0.02em',
    body: '0.01em',
  },

  maxWidth: '720px',
} as const;

export const layout = {
  topBarHeight: '56px',
  maxWidth: '1200px',
  secondaryPanelWidth: '30%',
  primaryWorkspaceWidth: '70%',
} as const;

export const effects = {
  radius: '4px',
  radiusMd: '6px',
  transitionFast: '150ms ease-in-out',
  transitionBase: '200ms ease-in-out',
} as const;
