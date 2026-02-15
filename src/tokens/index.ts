export const colors = {
  background: '#F7F6F3',
  textPrimary: '#111111',
  accent: '#8B0000',
  success: '#3A5A40',
  warning: '#B8860B',
  border: '#D4D2CC',
  cardBg: '#FFFFFF',
} as const;

export const spacing = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '40px',
  xl: '64px',
} as const;

export const typography = {
  fontSerif: "'Playfair Display', Georgia, serif",
  fontSans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif",
  
  sizes: {
    body: '16px',
    bodyLg: '18px',
    h1: '48px',
    h2: '36px',
    h3: '24px',
    small: '14px',
  },
  
  lineHeights: {
    tight: '1.2',
    body: '1.6',
    loose: '1.8',
  },
  
  maxWidth: '720px',
} as const;

export const layout = {
  topBarHeight: '64px',
  secondaryPanelWidth: '30%',
  primaryWorkspaceWidth: '70%',
} as const;

export const effects = {
  radius: '4px',
  transitionNormal: '150ms ease-in-out',
  transitionSlow: '200ms ease-in-out',
} as const;
