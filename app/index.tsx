// app/index.tsx
import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';


export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bienvenue sur mon app !</Text>
    </View>
  );
}
