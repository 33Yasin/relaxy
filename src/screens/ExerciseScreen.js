import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, Vibration, Modal, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';

// Import animation components
import FlowerAnimation from '../components/animations/Flower';
import SkewedAnimation from '../components/animations/Skewed';
import SnowAnimation from '../components/animations/Snow';
import WaterDropAnimation from '../components/animations/WaterDrop';

import { DEFAULT_SETTINGS, getExerciseSettings } from '../constants/breathingSettings';

// Map exercise types to animation components
const ANIMATION_COMPONENTS = {
  'box': FlowerAnimation,      // Anksiyete
  '4-7-8': SnowAnimation,      // Uyku
  'coherent': SkewedAnimation, // Enerji
  'pursed': WaterDropAnimation // Odak
};

const BREATH_PHASE_LABELS = {
  inhale: 'Nefes Al',
  hold: 'Tut',
  exhale: 'Nefes Ver',
  hold2: 'Tut',
};

// Animation specific settings
const ANIMATION_SETTINGS = {
  'box': {
    containerStyle: { flex: 1, backgroundColor: '#fff' }
  },
  '4-7-8': {
    containerStyle: { flex: 1, backgroundColor: '#0f172a' },
    textColor: 'rgba(207, 250, 254, 0.7)'
  },
  'coherent': {
    containerStyle: { flex: 1, backgroundColor: '#fff' }
  },
  'pursed': {
    containerStyle: { flex: 1, backgroundColor: '#f8fafc' }
  }
};

const EXPLANATIONS = {
  '4-7-8': {
    title: '4-7-8 Nefesi',
    description: 'Derin uykuya geçmeden önce zihni yumuşatır.',
    details: [
      'Ritim: 4 saniye al • 7 saniye tut • 8 saniye ver',
      'Etki: Uzun nefes verme fazı parasempatik sistemi aktive eder.'
    ]
  },

  'box': {
    title: 'Box Breathing',
    description: 'Stresi düzene sokmak için eşit süreli nefes.',
    details: [
      'Ritim: 4 saniye al • 4 saniye tut • 4 saniye ver • 4 saniye tut',
      'Etki: Ritmik döngü panik tepkilerini yavaşlatır, kontrol hissi verir.'
    ]
  },

  'coherent': {
    title: 'Diyafram Nefesi',
    description: 'Enerjiyi tazeler, iç dengeni yeniden kurar.',
    details: [
      'Ritim: 4-5 saniye al • 1 saniye tut • 4-6 saniye ver',
      'Etki: Diyaframı aktive ederek oksijen alımını derinleştirir.'
    ]
  },

  'pursed': {
    title: 'Alternatif Burun Deliği',
    description: 'Zihin berraklığını artıran nazik dengeleme tekniği.',
    details: [
      'Ritim: 4 saniye sağdan al • 4 saniye tut • 4 saniye soldan ver',
      'Etki: Sağ-sol beyin yarıkürelerini sakinleştirici bir ritimde hizalar.'
    ]
  },
};

const SOUNDS = [
  { id: 'voice1', name: 'sound 1', uri: require('../../assets/sounds/voice1.mp3') },
  { id: 'voice2', name: 'sound 2', uri: require('../../assets/sounds/voice2.mp3') },
  { id: 'voice3', name: 'sound 3', uri: require('../../assets/sounds/voice3.mp3') },
  { id: 'voice4', name: 'sound 4', uri: require('../../assets/sounds/voice4.mp3') },
  { id: 'voice5', name: 'sound 5', uri: require('../../assets/sounds/voice5.mp3') },
  { id: 'silent', name: 'Sessiz', uri: null },
];

export default function ExerciseScreen({ route, navigation }) {
  const { exerciseId, exerciseLabel } = route.params || {};
  const [running, setRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('idle');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [selectedSound, setSelectedSound] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const cycleRef = useRef(null);
  const phaseTimeoutsRef = useRef([]);
  const runningRef = useRef(false);

  // Animation values for sound waves
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  // Wave animation settings
  const WAVE_SCALE = 0.15;
  const WAVE_TRANSLATE = -1;

  // Start/stop wave animation
  useEffect(() => {
    if (isPlaying) {
      const waveAnimation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(waveAnim1, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(waveAnim1, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(200),
            Animated.timing(waveAnim2, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(waveAnim2, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(waveAnim3, {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(waveAnim3, {
              toValue: 0,
              duration: 700,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      waveAnimation.start();
      return () => waveAnimation.stop();
    } else {
      waveAnim1.setValue(0);
      waveAnim2.setValue(0);
      waveAnim3.setValue(0);
    }
  }, [isPlaying]);

  const clearPhaseTimeouts = () => {
    phaseTimeoutsRef.current.forEach((id) => clearTimeout(id));
    phaseTimeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      if (cycleRef.current) {
        clearTimeout(cycleRef.current);
      }
      clearPhaseTimeouts();
      // Unload sound when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAndPlaySound = async (soundFile) => {
    try {
      // First, unload the current sound if it exists
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (error) {
          console.log('Error unloading sound:', error);
        }
      }

      // Create and play the new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        soundFile,
        { shouldPlay: true, isLooping: true },
        (status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      );

      // Set the new sound and update state
      setSound(newSound);
      setIsPlaying(true);

      // Handle any errors during playback
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.error) {
          console.log('Playback error:', status.error);
          setIsPlaying(false);
        }
      });

    } catch (error) {
      console.error('Error loading sound:', error);
      setIsPlaying(false);
    }
  };

  const stopSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
    } catch (error) {
      console.log('Error stopping sound:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const toggleSound = async (soundFile) => {
    try {
      // If selecting silent or toggling off current sound
      if (soundFile === null || (isPlaying && selectedSound === soundFile)) {
        await stopSound();
        setSelectedSound(null);
        setIsPlaying(false);
      } else {
        // If selecting a sound
        setSelectedSound(soundFile);
        if (soundFile !== null) {
          await loadAndPlaySound(soundFile);
          setIsPlaying(true);
        } else {
          await stopSound();
          setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error('Error toggling sound:', error);
      setIsPlaying(false);
      setSelectedSound(null);
    }
  };

  const schedulePhaseTransitions = (settings) => {
    clearPhaseTimeouts();
    if (!runningRef.current) {
      return;
    }

    setBreathPhase('inhale');

    const { inhale, hold, exhale, hold2 } = settings;
    const timers = [];
    const totalDuration = inhale + hold + exhale + hold2;

    if (hold > 0) {
      timers.push(
        setTimeout(() => {
          if (runningRef.current) setBreathPhase('hold');
        }, inhale)
      );
    }

    timers.push(
      setTimeout(() => {
        if (runningRef.current) setBreathPhase('exhale');
      }, inhale + hold)
    );

    if (hold2 > 0) {
      timers.push(
        setTimeout(() => {
          if (runningRef.current) setBreathPhase('hold2');
        }, inhale + hold + exhale)
      );
    }

    timers.push(
      setTimeout(() => {
        if (!runningRef.current) return;
        schedulePhaseTransitions(settings);
      }, totalDuration)
    );

    phaseTimeoutsRef.current = timers;
  };

  // Basit 1 döngü: inhale -> (scale up) -> hold -> exhale (scale down) -> hold
  const runCycleOnce = (settings) => {
    const { inhale, hold, exhale, hold2 } = settings;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.4, duration: inhale, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.delay(hold),
      Animated.timing(scale, { toValue: 0.8, duration: exhale, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.delay(hold2),
    ]).start(({ finished }) => {
      if (finished && running) {
        // döngüleyerek devam et
        runCycleOnce(settings);
      }
    });
  };

  const handleStart = async () => {
    runningRef.current = true;
    setRunning(true);

    const settings = getExerciseSettings(exerciseId);
    schedulePhaseTransitions(settings);
    runCycleOnce(settings);
  };

  const handleStop = async () => {
    runningRef.current = false;
    setRunning(false);
    scale.stopAnimation();
    scale.setValue(1);
    clearPhaseTimeouts();
    setBreathPhase('idle');
    await stopSound();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{exerciseLabel}</Text>
        <TouchableOpacity onPress={() => { handleStop(); navigation.goBack(); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={28} color="#333" style={styles.backIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowMusicModal(true)} style={styles.musicButton}>
          <MaterialCommunityIcons
            name={isPlaying ? 'music' : 'music-off'}
            size={24}
            color={isPlaying ? '#4a90e2' : '#666'}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.center, { flex: 1 }]}>
        <View style={styles.animationContainer}>
          <BlurView intensity={80} tint="light" style={styles.phaseBadge}>
            <View style={styles.phaseBadgeContent}>
              <Text style={styles.phaseText}>
                {breathPhase === 'idle' ? 'Hazırsan Başla' : BREATH_PHASE_LABELS[breathPhase]}
              </Text>
            </View>
          </BlurView>
          {React.createElement(
            ANIMATION_COMPONENTS[exerciseId] || FlowerAnimation,
            { timings: getExerciseSettings(exerciseId), shouldRun: running }
          )}
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>{EXPLANATIONS[exerciseId]?.title}</Text>
            <View style={styles.explanationHeader}>
              <Text style={styles.explanationSubtitle}>{EXPLANATIONS[exerciseId]?.description}</Text>
              <TouchableOpacity
                onPress={() => setShowExplanation((prev) => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Açıklama bölümünü göster veya gizle"
              >
                <View style={styles.toggleButton}>
                  <View
                    style={[
                      styles.toggleCaret,
                      showExplanation ? styles.caretDown : styles.caretUp
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {showExplanation && (
              <View style={styles.explanationBody}>
                {(EXPLANATIONS[exerciseId]?.details || []).map((line, index) => (
                  <Text key={index.toString()} style={styles.explanationDetail}>
                    {line}
                  </Text>
                ))}
              </View>
            )}
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              onPress={() => {
                Vibration.vibrate(40);
                running ? handleStop() : handleStart();
              }}
              activeOpacity={0.8}
            >
              <BlurView intensity={80} tint="light" style={styles.controlBtn}>
                <View style={styles.controlBtnContent}>
                  <Text style={[styles.controlText, { color: running ? '#111827' : '#0f172a' }]}>Başla</Text>
                </View>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Vibration.vibrate(40);
                handleStop();
              }}
              activeOpacity={0.8}
            >
              <BlurView intensity={80} tint="light" style={styles.controlBtn}>
                <View style={styles.controlBtnContent}>
                  <Text style={[styles.controlText, { color: running ? '#dc2626' : '#0f172a' }]}>Bitir</Text>
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Music Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMusicModal}
        onRequestClose={() => setShowMusicModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ses Seçin</Text>
              <TouchableOpacity onPress={() => setShowMusicModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.soundsList}>
              {SOUNDS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.soundItem,
                    selectedSound === item.uri && styles.selectedSoundItem,
                    item.id === 'silent' && styles.silentItem
                  ]}
                  onPress={() => toggleSound(item.uri)}
                >
                  <View style={styles.soundInfo}>
                    <MaterialCommunityIcons
                      name={item.id === 'silent' ? 'volume-off' : (selectedSound === item.uri && isPlaying ? 'volume-high' : 'music-note')}
                      size={20}
                      color={selectedSound === item.uri ? '#4a90e2' : (item.id === 'silent' ? '#666' : '#666')}
                      style={styles.soundIcon}
                    />
                    <Text style={[
                      styles.soundName,
                      selectedSound === item.uri && { color: '#4a90e2', fontWeight: '600' }
                    ]}>
                      {item.name}
                    </Text>
                  </View>
                  {selectedSound === item.uri && isPlaying ? (
                    <View style={styles.playingIndicator}>
                      <Animated.View
                        style={[
                          styles.playingBar,
                          {
                            height: 12,
                            transform: [
                              { scaleY: Animated.add(1, Animated.multiply(waveAnim1, WAVE_SCALE)) },
                              { translateY: Animated.multiply(waveAnim1, WAVE_TRANSLATE) }
                            ]
                          }
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.playingBar,
                          {
                            height: 16,
                            transform: [
                              { scaleY: Animated.add(1, Animated.multiply(waveAnim2, WAVE_SCALE * 1.1)) },
                              { translateY: Animated.multiply(waveAnim2, WAVE_TRANSLATE * 1.1) }
                            ]
                          }
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.playingBar,
                          {
                            height: 12,
                            transform: [
                              { scaleY: Animated.add(1, Animated.multiply(waveAnim3, WAVE_SCALE)) },
                              { translateY: Animated.multiply(waveAnim3, WAVE_TRANSLATE) }
                            ]
                          }
                        ]}
                      />
                    </View>
                  ) : selectedSound === item.uri ? (
                    <View style={styles.playingIndicator}>
                      <View style={[styles.playingBar, { height: 8 }]} />
                      <View style={[styles.playingBar, { height: 10, marginHorizontal: 1 }]} />
                      <View style={[styles.playingBar, { height: 8 }]} />
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  musicButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  soundsList: {
    paddingHorizontal: 16,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedSoundItem: {
    backgroundColor: '#f8f9ff',
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soundIcon: {
    marginRight: 12,
  },
  soundName: {
    fontSize: 16,
    color: '#333',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    justifyContent: 'center',
    width: 40,
  },
  playingBar: {
    width: 3,
    backgroundColor: '#4a90e2',
    borderRadius: 2,
    marginHorizontal: 1,
    transformOrigin: 'bottom',
    height: 10,
  },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  center: {
    flex: 1,
    alignItems: 'center',
  },
  animationContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  phaseBadge: {
    borderRadius: 32,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  phaseBadgeContent: {
    paddingVertical: 16,
    paddingHorizontal: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 30,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  phaseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  bottomSection: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 20,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 10
  },

  explanationBox: {
    padding: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.03)',
    borderRadius: 16,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 20
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  explanationSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
    lineHeight: 20,
    flex: 1
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 12
  },
  toggleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  toggleCaret: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent'
  },
  caretUp: {
    borderBottomWidth: 9,
    borderBottomColor: '#2563eb'
  },
  caretDown: {
    borderTopWidth: 9,
    borderTopColor: '#2563eb'
  },
  explanationBody: {
    marginTop: 10
  },
  explanationDetail: {
    fontSize: 13,
    color: '#1f2937',
    marginTop: 12,
    lineHeight: 20
  },

  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
    gap: 20
  },
  controlBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    minWidth: 140,
  },
  controlBtnContent: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  controlText: {
    fontWeight: '700',
    fontSize: 16
  }
});