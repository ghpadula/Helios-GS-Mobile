import { useEffect, useRef, useState } from 'react';
import { Text, TextStyle, StyleProp, Animated } from 'react-native';

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
}

export default function AnimatedNumber({
  value,
  duration = 1200,
  decimals = 1,
  prefix = '',
  suffix = '',
  style,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const listener = anim.addListener(({ value: v }) => {
      setDisplay(parseFloat(v.toFixed(decimals)));
    });
    Animated.timing(anim, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(listener);
  }, [value, duration, decimals]);

  return (
    <Text style={style}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </Text>
  );
}
