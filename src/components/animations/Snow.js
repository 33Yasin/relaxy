import { useEffect, useMemo, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  Easing
} from 'react-native-reanimated';
import { DEFAULT_SETTINGS } from '../../constants/breathingSettings';

// Ayarlar
const TOTAL_DOTS = 80;
const GOLDEN_ANGLE = 137.5 * (Math.PI / 180);
export default function SnowAnimation({ timings, shouldRun = true }) {
  const resolvedTimings = useMemo(
    () => ({ ...DEFAULT_SETTINGS, ...(timings || {}) }),
    [timings]
  );
  const { inhale, hold, exhale, hold2 } = resolvedTimings;
  // Animasyon değerleri
  const progress = useSharedValue(0);
  const globalRotation = useSharedValue(0);
  const timeoutsRef = useRef([]);

  const clearScheduled = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearScheduled, [clearScheduled]);

  useEffect(() => {
    clearScheduled();
    progress.value = 0;
    globalRotation.value = 0;

    if (!shouldRun) {
      return;
    }

    const cycleDuration = inhale + hold + exhale + hold2;
    const schedule = (cb, delay) => {
      const id = setTimeout(cb, delay);
      timeoutsRef.current.push(id);
      return id;
    };

    const runAnimation = () => {
      progress.value = withTiming(1, { 
        duration: inhale, 
        easing: Easing.inOut(Easing.ease) 
      });
      globalRotation.value = withTiming(30, { duration: inhale });

      schedule(() => {
        progress.value = withTiming(1.1, { duration: hold });
      }, inhale);

      schedule(() => {
        progress.value = withTiming(0, { 
          duration: exhale, 
          easing: Easing.inOut(Easing.ease) 
        });
        globalRotation.value = withTiming(-30, { duration: exhale });
      }, inhale + hold);

      schedule(runAnimation, cycleDuration);
    };

    runAnimation();

    return clearScheduled;
  }, [shouldRun, inhale, hold, exhale, hold2, clearScheduled, progress, globalRotation]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${globalRotation.value}deg` }]
  }));

  return (
    <View style={styles.container}>
      <View style={styles.spiralContainer}>
        <Animated.View style={[styles.dotsWrapper, containerStyle]}>
          {[...Array(TOTAL_DOTS)].map((_, index) => (
            <FibonacciDot 
              key={index} 
              index={index} 
              progress={progress}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const FibonacciDot = ({ index, progress }) => {
  const size = index > 60 ? 8 : index > 30 ? 12 : 16;
  const angle = index * GOLDEN_ANGLE;

  const animatedStyle = useAnimatedStyle(() => {
    const radiusFactor = interpolate(progress.value, [0, 1.1], [2, 7.5]);
    const r = radiusFactor * Math.sqrt(index);
    const twist = interpolate(progress.value, [1, 1.1], [0, 0.5]);
    const currentAngle = angle + twist;
    const x = r * Math.cos(currentAngle);
    const y = r * Math.sin(currentAngle);
    const opacity = interpolate(progress.value, [0, 1], [0.3, 1 - (index / 100)]);
    const scale = interpolate(progress.value, [0, 1], [0.5, 1]);

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale }
      ],
      opacity,
    };
  });

  return (
    <Animated.View 
      style={[
        styles.dot, 
        { width: size, height: size, borderRadius: size / 2 }, 
        animatedStyle
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  spiralContainer: {
    width: 460,
    height: 460,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsWrapper: {
    width: 460,
    height: 460,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    backgroundColor: '#10b981',
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
});