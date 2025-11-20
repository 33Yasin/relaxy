import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import FlowerAnimation from '../components/animations/Flower';
import SkewedAnimation from '../components/animations/Skewed';
import SnowAnimation from '../components/animations/Snow';
import WaterDropAnimation from '../components/animations/WaterDrop';
import { getExerciseSettings } from '../constants/breathingSettings';

const BUTTONS = [
  { id: 'box', label: 'Anksiyete', subtitle: '4-4-4-4', color: '#bfdbfe' },   // mavi
  { id: 'coherent', label: 'Enerji', subtitle: '4–5 sn al · 1 sn tut · 4–6 sn ver', color: '#fed7aa' }, // turuncu
  { id: '4-7-8', label: 'Uyku', subtitle: '4 sn al · 7 sn tut · 8 sn ver', color: '#bbf7d0' }, // yeşil ton
  { id: 'pursed', label: 'Odak', subtitle: '4 sn tek burun · 4 sn tut · 4 sn diğer burundan ver', color: '#fecaca' }, // kırmızı
];

const PREVIEW_COMPONENTS = {
  box: FlowerAnimation,
  '4-7-8': SnowAnimation,
  coherent: SkewedAnimation,
  pursed: WaterDropAnimation,
};

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="meditation" size={100} color="#757575" />
        </View>

        <View style={styles.grid}>
          {BUTTONS.map((b) => {
            const AnimationComponent = PREVIEW_COMPONENTS[b.id] || FlowerAnimation;
            const timings = getExerciseSettings(b.id);

            return (
              <TouchableOpacity
                key={b.id}
                activeOpacity={0.92}
                style={[styles.card, { borderColor: b.color }]}
                onPress={() => {
                  Vibration.vibrate(40);
                  navigation.navigate('Exercise', {
                    exerciseId: b.id,
                    exerciseLabel: b.label,
                  });
                }}
              >
                <View style={styles.previewWrapper}>
                  <View style={styles.previewScale}>
                    <AnimationComponent timings={timings} />
                  </View>
                </View>
                <View style={styles.textBlock}>
                  <Text style={styles.cardTitle}>{b.label}</Text>
                  <Text style={styles.cardSubtitle}>{b.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40
  },
  title: {
    fontFamily: 'DancingScript_400Regular', // el yazısı tarzı
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  grid: {
    width: '100%',
    gap: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
    marginBottom: 6,
  },
  previewWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  previewScale: {
    width: 220,
    height: 220,
    transform: [{ scale: 0.35 }],
  },
  textBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  iconContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
});