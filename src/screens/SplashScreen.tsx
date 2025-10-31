// src/screens/SplashScreen.tsx (lub .js)
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Text style={styles.text}>Kalkulator</Text>
      <Text style={styles.subText}>Ładowanie...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Czarny kolor tła
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#ffffff', // Biały tekst
    marginBottom: 10,
  },
  subText: {
    fontSize: 20,
    color: '#ff9f1c', // Pomarańczowy kolor akcentu
  },
});

export default SplashScreen;