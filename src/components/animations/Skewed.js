import { useEffect, useMemo, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DEFAULT_SETTINGS } from '../../constants/breathingSettings';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export default function SkewedAnimation({ timings, shouldRun = true }) {
  const resolvedTimings = useMemo(
    () => ({ ...DEFAULT_SETTINGS, ...(timings || {}) }),
    [timings]
  );
  const { inhale, hold, exhale, hold2 } = resolvedTimings;
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
      progress.value = withTiming(1, { duration: inhale, easing: Easing.inOut(Easing.ease) });
      globalRotation.value = withTiming(30, { duration: inhale });

      schedule(() => {
        progress.value = withTiming(1.1, { duration: hold });
      }, inhale);

      schedule(() => {
        progress.value = withTiming(0, { duration: exhale, easing: Easing.inOut(Easing.ease) });
        globalRotation.value = withTiming(-30, { duration: exhale });
      }, inhale + hold);

      schedule(runAnimation, cycleDuration);
    };

    runAnimation();

    return clearScheduled;
  }, [shouldRun, inhale, hold, exhale, hold2, clearScheduled, progress, globalRotation]);

  return (
    <View style={styles.container}>
      {[...Array(4)].map((_, index) => (
        <BlobLayer 
          key={index}
          index={index}
          progress={progress}
          globalRotation={globalRotation}
          shouldRun={shouldRun}
        />
      ))}
    </View>
  );
}

// Tekil Blob Katmanı
const BlobLayer = ({ index, progress, globalRotation, shouldRun }) => {
  const rotation = useSharedValue(0);
  const layer = [
    { colors: ['#fdba74', '#fb7185'], size: 320, z: 10 },
    { colors: ['#fed7aa', '#f9a8d4'], size: 260, z: 20 },
    { colors: ['#fef3c7', '#fbcfe8'], size: 200, z: 30 },
    { colors: ['#ffffff', '#fff1f2'], size: 140, z: 40 },
  ][index];

  useEffect(() => {
    const duration = 6000 + (index * 2000);
    const direction = index % 2 === 0 ? 1 : -1;
    
    if (!shouldRun) {
      cancelAnimation(rotation);
      rotation.value = 0;
      return;
    }

    rotation.value = withRepeat(
      withTiming(360 * direction, { duration, easing: Easing.linear }),
      -1,
      false
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, [shouldRun, index, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    // Ölçeklenme: Dıştaki katmanlar daha çok büyür
    const scaleBase = 0.8;
    const scaleMax = 1.1 + (index * 0.05);
    
    const currentScale = scaleBase + (progress.value * (scaleMax - scaleBase));

    // "Blob" hissi vermek için X ve Y ölçeğini hafifçe bozuyoruz
    // Nefes alırken şekil biraz daha düzleşir veya uzar
    const distortion = progress.value * 0.05; 

    return {
      width: layer.size,
      height: layer.size,
      borderRadius: layer.size / 2, // Tam daireden başlıyoruz
      opacity: 0.9,
      transform: [
        { scale: currentScale },
        { rotate: `${rotation.value}deg` },
        // Hafif elipsleşme (Blob efekti için hile)
        { scaleX: 1 + (index % 2 === 0 ? distortion : -distortion) },
        { scaleY: 1 + (index % 2 !== 0 ? distortion : -distortion) }
      ],
      zIndex: layer.z,
    };
  });

  return (
    <AnimatedGradient
      colors={layer.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.blob, animatedStyle]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Gradient üstüne bineceği için fark etmez
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    position: 'absolute',
    top: 100,
    fontSize: 20,
    fontWeight: '300',
    color: '#94a3b8', // slate-400
    letterSpacing: 4,
    textTransform: 'uppercase',
    zIndex: 100,
  },
  blobContainer: {
    width: 400,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // Android gölge
  },
  instructionText: {
    position: 'absolute',
    bottom: 150,
    fontSize: 32,
    fontWeight: '500',
    color: '#64748b', // slate-500
    zIndex: 100,
  },
});