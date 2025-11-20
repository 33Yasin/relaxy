import React, { useCallback, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

import * as Font from 'expo-font';
import { useFonts as useDancingScript, DancingScript_400Regular } from '@expo-google-fonts/dancing-script';

export default function App() {
  // @expo-google-fonts hook kullanımı
  let [fontsLoaded] = useDancingScript({
    DancingScript_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}