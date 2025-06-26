import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function PostChoiceScreen() {
  const [choiceMade, setChoiceMade] = useState(null);
  const router = useRouter();

  const handleChoice = (choice: 'anecdote' | 'sondage') => {
    setChoiceMade(choice);
    if (choice === 'anecdote') {
      router.push('/postAnecdotes');
    } else {
      router.push('/postPolls');
    }
  };

  return (
    <View style={styles.container}>
      {!choiceMade && (
        <>
          <Text style={styles.title}>Que souhaites-tu publier ?</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/postAnecdotes')}>
            <Text style={styles.buttonText}>📖 Anecdote</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/postPolls')}>
            <Text style={styles.buttonText}>📊 Sondage</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20, color: '#00235B' },
  button: {
    backgroundColor: '#00235B',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 16 },
});
