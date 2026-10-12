import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { isRunningInExpoGo } from 'expo';

// Lazily load expo-notifications only outside Expo Go to prevent SDK 53+ Android push crash
let NotificationsModule: typeof import('expo-notifications') | null = null;

export function getNotificationsModule() {
  if (isRunningInExpoGo()) {
    return null;
  }
  if (!NotificationsModule) {
    try {
      NotificationsModule = require('expo-notifications');
      NotificationsModule?.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (e) {
      console.warn('Failed to load expo-notifications:', e);
      return null;
    }
  }
  return NotificationsModule;
}

export function addNotificationReceivedListener(
  listener: (notification: any) => void
): { remove: () => void } {
  const mod = getNotificationsModule();
  if (!mod) {
    return { remove: () => {} };
  }
  return mod.addNotificationReceivedListener(listener);
}

export function addNotificationResponseReceivedListener(
  listener: (response: any) => void
): { remove: () => void } {
  const mod = getNotificationsModule();
  if (!mod) {
    return { remove: () => {} };
  }
  return mod.addNotificationResponseReceivedListener(listener);
}

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (isRunningInExpoGo()) {
    console.log('Push notifications are not supported in Expo Go on Android. Use a development build to test remote notifications.');
    return undefined;
  }

  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return undefined;
  }

  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32', // Our primary green color
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return undefined;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
    } catch (e) {
      console.log('Error getting push token: ', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
