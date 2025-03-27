// App.js
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView
} from 'react-native';
import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [target, setTarget] = useState({ x: 100, y: 100 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [topScores, setTopScores] = useState([]);

  const getRandomPosition = () => {
    const x = Math.floor(Math.random() * (width - 80));
    const y = Math.floor(Math.random() * (height - 200)); // Evita solaparse con los encabezados
    return { x, y };
  };

  const moveTarget = () => {
    setTarget(getRandomPosition());
  };

  const handleClick = () => {
    setScore(prev => prev + 1);
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
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎯 Caza el Círculo</Text>
      <Text style={styles.text}>Puntaje: {score}</Text>
      <Text style={styles.text}>Tiempo restante: {timeLeft}s</Text>

      {gameOver ? (
        <View style={styles.message}>
          <Text style={styles.text}>¡Tiempo agotado!</Text>
          <Text style={styles.text}>Puntaje final: {score}</Text>
          <TouchableOpacity style={styles.button} onPress={restartGame}>
            <Text style={styles.buttonText}>Jugar de nuevo</Text>
          </TouchableOpacity>
          <Text style={[styles.text, { marginTop: 20 }]}>🏆 Mejores Puntajes</Text>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    color: '#f8fafc',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: '#f8fafc',
    fontSize: 18,
    marginVertical: 4,
  },
  target: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#ef4444',
    borderRadius: 30,
    elevation: 5,
  },
  message: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
