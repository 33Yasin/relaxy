import { useEffect, useMemo, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing
} from 'react-native-reanimated';
import { DEFAULT_SETTINGS } from '../../constants/breathingSettings';

const PETAL_COUNT = 6;

export default function FlowerAnimation({ timings, shouldRun = true }) {
  const resolvedTimings = useMemo(
    () => ({ ...DEFAULT_SETTINGS, ...(timings || {}) }),
    [timings]
  );
  const { inhale, hold, exhale, hold2 } = resolvedTimings;
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);
  const timeoutsRef = useRef([]);

  const clearScheduled = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return clearScheduled;
  }, [clearScheduled]);

  useEffect(() => {
    clearScheduled();
    progress.value = 0;
    rotation.value = 0;

    if (!shouldRun) {
      return;
    }

    const totalDuration = inhale + hold + exhale + hold2;
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
      rotation.value = withTiming(0, { duration: inhale });

      schedule(() => {
        rotation.value = withTiming(10, { duration: hold });
      }, inhale);

      schedule(() => {
        progress.value = withTiming(0, { 
          duration: exhale, 
          easing: Easing.inOut(Easing.ease) 
        });
        rotation.value = withTiming(0, { duration: exhale });
      }, inhale + hold);

      schedule(runAnimation, totalDuration);
    };

    runAnimation();

    return clearScheduled;
  }, [shouldRun, inhale, hold, exhale, hold2, clearScheduled, progress, rotation]);

  return (
    <View style={styles.container}>
      <View style={styles.flowerContainer}>
        {[...Array(PETAL_COUNT)].map((_, index) => (
          <Petal 
            key={index} 
            index={index} 
            progress={progress} 
            rotation={rotation}
          />
        ))}
        <CenterCore progress={progress} />
      </View>
    </View>
  );
}

const Petal = ({ index, progress, rotation }) => {
  const angle = (index * 60) * (Math.PI / 180);

  const animatedStyle = useAnimatedStyle(() => {
    const radius = 80 * progress.value;
    const translateX = Math.cos(angle) * radius;
    const translateY = Math.sin(angle) * radius;
    const scale = 0.2 + (progress.value * 1.3);
    const opacity = 0.2 + (progress.value * 0.6);

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
        { rotate: `${rotation.value}deg` }
      ],
      opacity,
    };
  });

  return <Animated.View style={[styles.petal, animatedStyle]} />;
};

const CenterCore = ({ progress }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (progress.value * 0.4) }],
    opacity: 0.5 + (progress.value * 0.5)
  }));

  return <Animated.View style={[styles.centerCore, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  flowerContainer: {
    width: 360,
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petal: {
    position: 'absolute',
    width: 100, 
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(100, 200, 255, 0.6)',
  },
  centerCore: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(219, 234, 254, 0.9)',
    zIndex: 10,
  },
});