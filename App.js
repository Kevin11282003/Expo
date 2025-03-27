import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  SafeAreaView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const { width, height } = Dimensions.get('window');

const App = () => {
  const [target, setTarget] = useState({ x: 100, y: 100 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [topScores, setTopScores] = useState([]);

  const getRandomPosition = () => {
    const x = Math.floor(Math.random() * (width - 80));
    const y = Math.floor(Math.random() * (height - 180));
    return { x, y };
  };

  const moveTarget = () => {
    setTarget(getRandomPosition());
  };

  const handleClick = () => {
    setScore(score + 1);
    moveTarget();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      moveTarget();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setGameOver(true);
      saveScore(score);
      fetchTopScores();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const saveScore = async (score) => {
    try {
      await firestore().collection('scores').add({
        score,
        timestamp: new Date(),
      });
    } catch (e) {
      console.error('Error al guardar el puntaje: ', e);
    }
  };

  const fetchTopScores = async () => {
    const snapshot = await firestore()
      .collection('scores')
      .orderBy('score', 'desc')
      .limit(5)
      .get();

    const scoresArray = snapshot.docs.map(doc => doc.data());
    setTopScores(scoresArray);
  };

  const restartGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    moveTarget();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎯 Caza el Círculo</Text>
      <Text style={styles.text}>Puntaje: {score}</Text>
      <Text style={styles.text}>Tiempo: {timeLeft}s</Text>

      {gameOver ? (
        <View style={styles.messageBox}>
          <Text style={styles.text}>¡Tiempo agotado!</Text>
          <Text style={styles.text}>Puntaje final: {score}</Text>
          <TouchableOpacity style={styles.button} onPress={restartGame}>
            <Text style={styles.buttonText}>Jugar de nuevo</Text>
          </TouchableOpacity>

          <Text style={styles.text}>🏆 Mejores Puntajes</Text>
          <FlatList
            data={topScores}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.text}>Puntaje: {item.score}</Text>
            )}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.target, { top: target.y, left: target.x }]}
          onPress={handleClick}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    marginTop: 40,
    fontSize: 28,
    color: '#f8fafc',
    fontWeight: 'bold',
  },
  text: {
    color: '#f8fafc',
    fontSize: 18,
    marginVertical: 4,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  target: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ef4444',
  },
  messageBox: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default App;
