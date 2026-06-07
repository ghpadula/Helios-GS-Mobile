import { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, DimensionValue } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';

interface Props {
  height?: number;
  borderRadius?: number;
  width?: DimensionValue;
}

export default function SkeletonCard({ height = 100, borderRadius = 14, width = '100%' }: Props) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const s = useMemo(() => styles(colors), [colors]);

  return (
    <Animated.View
      style={[s.skeleton, { height, borderRadius, width, opacity }]}
    />
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    skeleton: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
