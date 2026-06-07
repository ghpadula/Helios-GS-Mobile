const dark = {
  background: '#0a0e1a',
  surface: '#111827',
  surfaceElevated: '#1a2236',
  border: '#1e2d45',
  text: '#f0f4ff',
  textSecondary: '#a8b8d0',
  textMuted: '#4a6080',
  accent: '#f5c842',
  accentBlue: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
};

const light = {
  background: '#f0f4ff',
  surface: '#ffffff',
  surfaceElevated: '#e8edf8',
  border: '#cbd5e8',
  text: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#94a3b8',
  accent: '#d97706',
  accentBlue: '#2563eb',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
};

export const Colors = { dark, light };

export type AppColors = typeof dark;
