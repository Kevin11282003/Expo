import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, FlatList, Button } from 'react-native';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const App = () => {
  const [target, setTarget] = useState({ x: 100, y: 100 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [topScores, setTopScores] = useState([]);

  const getRandomPosition = () => {
    const { width, height } = Dimensions.get('window');
    const x = Math.floor(Math.random() * (width - 100));
    const y = Math.floor(Math.random() * (height - 200));
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
      await addDoc(collection(db, 'scores'), {
        score,
        timestamp: new Date()
      });
    } catch (e) {
      console.error('Error al guardar el puntaje: ', e);
    }
  };

  const fetchTopScores = async () => {
    const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(5));
    const querySnapshot = await getDocs(q);
    const scoresArray = querySnapshot.docs.map(doc => doc.data());
    setTopScores(scoresArray);
  };

  const restartGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    moveTarget();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Caza el Círculo</Text>
      <Text style={styles.info}>Puntaje: {score}</Text>
      <Text style={styles.info}>Tiempo restante: {timeLeft}s</Text>
      {gameOver ? (
        <View style={styles.messageBox}>
          <Text style={styles.final}>¡Tiempo agotado!</Text>
          <Text style={styles.final}>Puntaje final: {score}</Text>
          <Button title="Jugar de nuevo" onPress={restartGame} />
          <Text style={styles.leaderTitle}>🏆 Mejores Puntajes</Text>
          <FlatList
            data={topScores}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <Text style={styles.scoreItem}>Puntaje: {item.score}</Text>}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.target, { top: target.y, left: target.x }]}
          onPress={handleClick}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#f8fafc',
    marginBottom: 10,
  },
  info: {
    fontSize: 18,
    color: '#f8fafc',
  },
  messageBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  final: {
    fontSize: 20,
    color: '#f8fafc',
    marginBottom: 10,
  },
  target: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#ef4444',
    borderRadius: 30,
  },
  leaderTitle: {
    fontSize: 20,
    marginTop: 20,
    color: '#f8fafc',
  },
  scoreItem: {
    fontSize: 16,
    color: '#f8fafc',
  },
});

export default App;