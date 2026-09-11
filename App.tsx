import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';

import { LandingScreen } from './src/screens/LandingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { theme, colors } from './src/theme/colors';
import { useAuthStore } from './src/store/authStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Student Bottom Tab Navigator ─────────────────────────────────────────────
function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#1a1a1a',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#555',
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, any> = {
            Dashboard: focused ? 'home' : 'home-outline',
            Courses: focused ? 'book' : 'book-outline',
            StudyPlan: focused ? 'map' : 'map-outline',
            Chatbot: focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'circle'} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Courses" component={DashboardScreen} options={{ tabBarLabel: 'Courses' }} />
      <Tab.Screen name="StudyPlan" component={DashboardScreen} options={{ tabBarLabel: 'Study Plan' }} />
      <Tab.Screen name="Chatbot" component={DashboardScreen} options={{ tabBarLabel: 'NeuroBot' }} />
      <Tab.Screen name="Profile" component={DashboardScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { isLoading, isAuthenticated, user, loadUser } = useAuthStore();

  React.useEffect(() => {
    loadUser();
  }, []);

  const navTheme = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: '#000', card: '#0A0A0A', text: '#fff', border: '#1a1a1a', primary: colors.primary },
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Determine initial route based on auth state
  const getInitialRoute = () => {
    if (!isAuthenticated) return 'Landing';
    if (!user?.onboardingCompleted) return 'Onboarding';
    if (user?.role === 'teacher') return 'TeacherApp';
    return 'StudentApp';
  };

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName={getInitialRoute()}
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}
        >
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="StudentApp" component={StudentTabs} />
          {/* Teacher and Admin screens will be added as we build them */}
          <Stack.Screen name="TeacherApp" component={DashboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
