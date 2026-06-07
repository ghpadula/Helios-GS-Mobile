import { useEffect, useRef, useState, useMemo } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');
const PATH_LENGTH = 380;
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface StarData {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  baseOpacity: number;
}

interface Props {
  count?: number;
  opacity?: number;
  shootingStars?: boolean;
}

function generateStars(count: number): StarData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * SW,
    y: Math.random() * SH,
    size: Math.random() < 0.12 ? 2.5 : Math.random() < 0.35 ? 1.5 : 1,
    delay: Math.random() * 4000,
    duration: 2500 + Math.random() * 3500,
    baseOpacity: Math.random() * 0.55 + 0.25,
  }));
}

function Star({ star, globalOpacity }: { star: StarData; globalOpacity: number }) {
  const anim = useRef(new Animated.Value(star.baseOpacity)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(star.delay),
        Animated.timing(anim, { toValue: star.baseOpacity * 0.08, duration: star.duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: star.baseOpacity, duration: star.duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: star.x,
        top: star.y,
        width: star.size,
        height: star.size,
        borderRadius: star.size / 2,
        backgroundColor: '#fff',
        opacity: Animated.multiply(anim, globalOpacity),
      }}
    />
  );
}

function generatePath(): string {
  const x0 = SW * 0.05 + Math.random() * SW * 0.35;
  const y0 = SH * 0.55  + Math.random() * SH * 0.2;

  const x3 = x0 + 160 + Math.random() * 60;
  const y3 = y0 - 180 - Math.random() * 60;

  const x1 = x0 + (x3 - x0) * 0.15;
  const y1 = y0 - (y0 - y3) * 0.55;

  const x2 = x0 + (x3 - x0) * 0.75;
  const y2 = y3 + (y0 - y3) * 0.18;

  return `M ${x0} ${y0} C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`;
}

function ShootingStar() {
  const dashOffset  = useRef(new Animated.Value(PATH_LENGTH)).current;
  const viewOpacity = useRef(new Animated.Value(0)).current;
  const [pathD, setPathD] = useState<string>(generatePath);
  const alive = useRef(true);

  useEffect(() => {
    function run() {
      if (!alive.current) return;

      const delay = 5000 + Math.random() * 9000;

      const t1 = setTimeout(() => {
        setPathD(generatePath());
      }, delay * 0.4);

      const t2 = setTimeout(() => {
        if (!alive.current) return;
        dashOffset.setValue(PATH_LENGTH);
        viewOpacity.setValue(0);

        Animated.sequence([
          Animated.parallel([
            Animated.timing(viewOpacity, { toValue: 1, duration: 90, useNativeDriver: false }),
            Animated.timing(dashOffset,  { toValue: 0, duration: 620, useNativeDriver: false }),
          ]),
          Animated.delay(60),
          Animated.timing(viewOpacity, { toValue: 0, duration: 320, useNativeDriver: false }),
        ]).start(() => run());
      }, delay);

      return () => { clearTimeout(t1); clearTimeout(t2); };
    }

    const cleanup = run();
    return () => {
      alive.current = false;
      cleanup?.();
    };
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: viewOpacity }]} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill}>
        <AnimatedPath
          d={pathD}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={5}
          strokeDasharray={[PATH_LENGTH, PATH_LENGTH]}
          strokeDashoffset={dashOffset}
          fill="none"
          strokeLinecap="round"
        />
        <AnimatedPath
          d={pathD}
          stroke="white"
          strokeWidth={1.3}
          strokeDasharray={[PATH_LENGTH, PATH_LENGTH]}
          strokeDashoffset={dashOffset}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

export default function StarfieldBackground({ count = 60, opacity = 1, shootingStars = false }: Props) {
  const stars = useMemo(() => generateStars(count), [count]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star) => (
        <Star key={star.id} star={star} globalOpacity={opacity} />
      ))}
      {shootingStars && <ShootingStar />}
      {shootingStars && <ShootingStar />}
    </View>
  );
}
