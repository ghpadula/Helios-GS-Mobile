import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  heading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  mono: {
    fontSize: 13,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
};
