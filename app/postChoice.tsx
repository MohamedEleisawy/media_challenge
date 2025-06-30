import { useTheme } from '@/components/ui/Theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PostChoiceScreen() {
  const [choiceMade, setChoiceMade] = useState(null);
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!choiceMade && (
        <>
          <Text style={[styles.title, { color: theme.text }]}>Que souhaites-tu publier ?</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => router.push('/postAnecdotes')}>
            <Text style={styles.buttonText}>📖 Anecdote</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => router.push('/postPolls')}>
            <Text style={styles.buttonText}>📊 Sondage</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  button: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 16 },
});
