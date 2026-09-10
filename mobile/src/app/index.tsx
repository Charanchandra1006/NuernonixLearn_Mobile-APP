import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { router } from 'expo-router';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email && password) {
      try {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        
        // Use standard fetch or axios. Assuming standard fetch for simple form data
        const response = await fetch('http://10.0.2.2:8000/api/v1/login/access-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString()
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        const data = await response.json();
        login(data.access_token, data.user);
        router.replace("/dashboard");
      } catch (error) {
        Alert.alert("Error", "Invalid email or password");
      }
    } else {
      Alert.alert("Error", "Please enter email and password");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LearnSense</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20, borderRadius: 5 }
});
