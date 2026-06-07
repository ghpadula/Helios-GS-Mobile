import { ReactNode } from 'react';
import { MotiView } from 'moti';

interface Props {
  children: ReactNode;
  delay?: number;
  distance?: number;
}

export default function FadeInView({ children, delay = 0, distance = 14 }: Props) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: distance }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay }}
    >
      {children}
    </MotiView>
  );
}
