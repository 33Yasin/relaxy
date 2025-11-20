export const DEFAULT_SETTINGS = {
  inhale: 4000,
  hold: 4000,
  exhale: 4000,
  hold2: 4000,
};

export const EXERCISE_SETTINGS = {
  box: { inhale: 4000, hold: 4000, exhale: 4000, hold2: 4000 },
  '4-7-8': { inhale: 4000, hold: 7000, exhale: 8000, hold2: 0 },
  coherent: { inhale: 4000, hold: 1000, exhale: 5000, hold2: 0 },
  pursed: { inhale: 4000, hold: 4000, exhale: 4000, hold2: 0 },
};

export const getExerciseSettings = (exerciseId) => ({
  ...DEFAULT_SETTINGS,
  ...(exerciseId && EXERCISE_SETTINGS[exerciseId] ? EXERCISE_SETTINGS[exerciseId] : {}),
});

