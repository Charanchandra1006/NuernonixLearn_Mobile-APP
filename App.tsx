import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LandingScreen } from './src/screens/LandingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CoursesScreen } from './src/screens/CoursesScreen';
import { CourseDetailScreen } from './src/screens/CourseDetailScreen';
import { LearnScreen } from './src/screens/LearnScreen';
import { MyCoursesScreen } from './src/screens/MyCoursesScreen';
import { StudyPlanScreen } from './src/screens/StudyPlanScreen';
import { ExamsScreen } from './src/screens/ExamsScreen';
import { ExamTakingScreen } from './src/screens/ExamTakingScreen';
import { DiaryScreen } from './src/screens/DiaryScreen';
import { ChatbotScreen } from './src/screens/ChatbotScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { TeacherDashboardScreen } from './src/screens/TeacherDashboardScreen';
import { CreateCourseScreen } from './src/screens/CreateCourseScreen';
import { CreateExamScreen } from './src/screens/CreateExamScreen';
import { TeacherExamsListScreen } from './src/screens/TeacherExamsListScreen';
import { AdminLoginScreen } from './src/screens/AdminLoginScreen';
import { AdminPanelScreen } from './src/screens/AdminPanelScreen';
import { theme, colors } from './src/theme/colors';
import { useAuthStore } from './src/store/authStore';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import { authAPI } from './src/services/api';
import { NetworkStatus } from './src/components/NetworkStatus';
import { SubscriptionScreen } from './src/screens/SubscriptionScreen';
import { initRevenueCat } from './src/services/revenueCatService';
import * as Updates from 'expo-updates';

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
      <Tab.Screen name="Courses" component={CoursesScreen} options={{ tabBarLabel: 'Courses' }} />
      <Tab.Screen name="StudyPlan" component={StudyPlanScreen} options={{ tabBarLabel: 'Study Plan' }} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ tabBarLabel: 'NeuroBot' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─── Teacher Bottom Tab Navigator ─────────────────────────────────────────────
function TeacherTabs() {
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
            TeacherDashboard: focused ? 'home' : 'home-outline',
            TeacherExamsList: focused ? 'school' : 'school-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'circle'} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="TeacherDashboard" component={TeacherDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="TeacherExamsList" component={TeacherExamsListScreen} options={{ tabBarLabel: 'Exams' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export default function App() {
  const { isLoading, isAuthenticated, user, loadUser } = useAuthStore();

  React.useEffect(() => {
    // OTA Update Check
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.log(`Error fetching latest Expo update: ${error}`);
      }
    }
    if (!__DEV__) {
      onFetchUpdateAsync();
    }

    loadUser().then((loadedUser) => {
      // Initialize RevenueCat with the loaded user ID (if authenticated)
      if (loadedUser && loadedUser._id) {
        initRevenueCat(loadedUser._id);
      } else {
        initRevenueCat();
      }
    });

    let notificationListener: Notifications.Subscription;
    let responseListener: Notifications.Subscription;

    const setupNotifications = async () => {
      if (isAuthenticated) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          authAPI.updatePushToken(token).catch(console.error);
        }
      }
    };
    setupNotifications();

    notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User interacted with notification:', response);
    });

    return () => {
      if (notificationListener) Notifications.removeNotificationSubscription(notificationListener);
      if (responseListener) Notifications.removeNotificationSubscription(responseListener);
    };
  }, [isAuthenticated]);

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
    if (user?.role === 'admin') return 'AdminPanel';
    if (!user?.onboardingCompleted) return 'Onboarding';
    if (user?.role === 'teacher') return 'TeacherApp';
    return 'StudentApp';
  };

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
      <StatusBar style="light" />
      <NetworkStatus />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName={getInitialRoute()}
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}
        >
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          
          <Stack.Screen name="StudentApp" component={StudentTabs} />
          
          {/* Shared Content Screens */}
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="Learn" component={LearnScreen} />
          <Stack.Screen name="MyCourses" component={MyCoursesScreen} />
          <Stack.Screen name="Exams" component={ExamsScreen} />
          <Stack.Screen name="ExamTaking" component={ExamTakingScreen} />
          <Stack.Screen name="Diary" component={DiaryScreen} />
          
          <Stack.Screen name="TeacherApp" component={TeacherTabs} />
          <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
          <Stack.Screen name="CreateExam" component={CreateExamScreen} />
          
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PersistQueryClientProvider>
  );
}
