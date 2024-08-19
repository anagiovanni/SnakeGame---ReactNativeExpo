import React, { useEffect, useMemo, useState, useRef } from 'react';
import { SafeAreaView, StyleSheet, Dimensions, View, Button } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import Header from './Header';
import Board from './Board';
import Snake from './Snake';
import Food from './Food';
import GameOver from './GameOver'; // Importar o componente GameOver

import { Direction } from '../types';
import {
  COLS,
  FOOD_START,
  HEADER_HEIGHT,
  INCREMENT,
  PIXEL,
  SNAKE_START,
  INITIAL_SPEED, // Definir a velocidade inicial
} from '../consts';
import { colors } from '../styles/theme';

const { height } = Dimensions.get('window');

const Game = () => {
  const [direction, setDirection] = useState(Direction.Right);
  const [nextDirection, setNextDirection] = useState(Direction.Right);
  const [snake, setSnake] = useState(SNAKE_START);
  const [food, setFood] = useState(FOOD_START);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED); // Adicione o estado para a velocidade

  const insets = useSafeAreaInsets();
  const ROWS = Math.floor(
    (height - insets.top - insets.bottom - HEADER_HEIGHT) / PIXEL
  );
  const limits = {
    minX: 0,
    maxX: COLS - 1,
    minY: 0,
    maxY: ROWS - 1,
  };

  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const snakeRef = useRef(snake);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  function resetGame() {
    setSnake(SNAKE_START);
    setDirection(Direction.Right);
    setNextDirection(Direction.Right);
    setFood(FOOD_START);
    setScore(0);
    setIsGameOver(false);
  }

  function moveSnake() {
    const head = { ...snakeRef.current[0] };

    // Atualize a direção apenas se não for a direção oposta
    if (nextDirection === Direction.Right && direction !== Direction.Left) {
      head.x += 1;
    } else if (nextDirection === Direction.Left && direction !== Direction.Right) {
      head.x -= 1;
    } else if (nextDirection === Direction.Down && direction !== Direction.Up) {
      head.y += 1;
    } else if (nextDirection === Direction.Up && direction !== Direction.Down) {
      head.y -= 1;
    }

    if (testGameOver(head)) {
      setIsGameOver(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (testEatsFood(head, food)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFood(newFoodPosition(limits));
      setSnake([head, ...snakeRef.current]);
      setScore((prevScore) => prevScore + INCREMENT);
    } else {
      setSnake([head, ...snakeRef.current.slice(0, -1)]);
    }
    setDirection(nextDirection); // Atualiza a direção atual após o movimento
  }

  function testGameOver(snakeHead) {
    return (
      snakeHead.x < limits.minX ||
      snakeHead.x > limits.maxX ||
      snakeHead.y < limits.minY ||
      snakeHead.y > limits.maxY
    );
  }

  function testEatsFood(snakeHead, foodLocation) {
    return snakeHead.x === foodLocation.x && snakeHead.y === foodLocation.y;
  }

  function newFoodPosition() {
    return {
      x: Math.floor(Math.random() * limits.maxX),
      y: Math.floor(Math.random() * limits.maxY),
    };
  }

  function handleGesture(event) {
    const { translationX, translationY } = event.nativeEvent;
    if (Math.abs(translationX) > Math.abs(translationY)) {
      setNextDirection(translationX > 0 ? Direction.Right : Direction.Left);
    } else {
      setNextDirection(translationY > 0 ? Direction.Down : Direction.Up);
    }
  }

  function gameLoop(timestamp) {
    if (!isGameOver && !isGamePaused) {
      // Controlar o tempo entre atualizações
      if (timestamp - lastUpdateRef.current >= speed) {
        moveSnake();
        lastUpdateRef.current = timestamp;
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }

  useEffect(() => {
    if (!isGameOver) {
      lastUpdateRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return () => cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isGameOver, isGamePaused, direction, nextDirection, speed]);

  const RandomFood = useMemo(() => {
    return <Food coords={{ x: food.x, y: food.y }} top={insets.top} />;
  }, [food]);

  return (
    <PanGestureHandler onGestureEvent={handleGesture}>
      <SafeAreaView style={styles.container}>
        {isGameOver ? (
          <GameOver onRestart={resetGame} />
        ) : (
          <>
            <Header
              top={insets.top}
              score={score}
              paused={isGamePaused}
              pause={() => setIsGamePaused((prev) => !prev)}
              reload={() => setIsGameOver((prev) => !prev)}
            />
            <Board rows={ROWS} cols={COLS} top={insets.top} />
            <Snake snake={snake} top={insets.top} />
            {RandomFood}
            <View style={styles.controls}>
              <Button title="Increase Speed" onPress={() => setSpeed((prevSpeed) => Math.max(prevSpeed - 50, 100))} />
              <Button title="Decrease Speed" onPress={() => setSpeed((prevSpeed) => prevSpeed + 50)} />
            </View>
          </>
        )}
      </SafeAreaView>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.p6,
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Game;