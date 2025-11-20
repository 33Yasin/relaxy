import { useEffect, useMemo, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DEFAULT_SETTINGS } from '../../constants/breathingSettings';

export default function WaterDropAnimation({ timings, shouldRun = true }) {
  const resolvedTimings = useMemo(
    () => ({ ...DEFAULT_SETTINGS, ...(timings || {}) }),
    [timings]
  );
  const { inhale, hold, exhale, hold2 } = resolvedTimings;
  const progress = useSharedValue(0);
  const timeoutsRef = useRef([]);

  const clearScheduled = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearScheduled, [clearScheduled]);

  useEffect(() => {
    clearScheduled();
    progress.value = 0;

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
        easing: Easing.out(Easing.ease) 
      });

      schedule(() => {
        progress.value = withTiming(1.05, { duration: hold });
      }, inhale);

      schedule(() => {
        progress.value = withTiming(0, { 
          duration: exhale, 
          easing: Easing.inOut(Easing.ease) 
        });
      }, inhale + hold);

      schedule(runAnimation, cycleDuration);
    };

    runAnimation();

    return clearScheduled;
  }, [shouldRun, inhale, hold, exhale, hold2, clearScheduled, progress]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContainer}>
        {[...Array(4)].map((_, index) => (
          <RippleRing 
            key={index} 
            index={index} 
            progress={progress} 
          />
        ))}
        <CenterDrop progress={progress} />
      </View>
    </View>
  );
}

const RippleRing = ({ index, progress }) => {
  const i = index + 1;

  const animatedStyle = useAnimatedStyle(() => {
    const maxScale = 1 + (i * 0.6);
    const minScale = 0.5;
    const currentScale = interpolate(progress.value, [0, 1], [minScale, maxScale]);
    const maxOpacity = 1 - (i * 0.2);
    const currentOpacity = interpolate(progress.value, [0, 1], [0, maxOpacity]);

    return {
      transform: [{ scale: currentScale }],
      opacity: currentOpacity,
      zIndex: 10 - i,
    };
  });

  return <Animated.View style={[styles.ripple, animatedStyle]} />;
};

const CenterDrop = ({ progress }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.2]) }]
  }));

  return (
    <Animated.View style={[styles.dropWrapper, animatedStyle]}>
      <LinearGradient
        colors={['#f87171', '#ef4444']}
        style={styles.drop}
      >
        <View style={styles.shine} />
      </LinearGradient>
    </Animated.View>
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
  centerContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: '#f87171',
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
  },
  dropWrapper: {
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  drop: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shine: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});