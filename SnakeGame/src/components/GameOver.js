import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const GameOver = ({ onRestart }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>Você Perdeu!</Text>
      <Button title="Reiniciar Jogo" onPress={onRestart} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  message: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
});

export default GameOver;