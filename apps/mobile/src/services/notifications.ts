import { Platform, Alert } from 'react-native';

export const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    try {
      const Notifications = require('expo-notifications');
      if (Notifications.setNotificationChannelAsync) {
        await Notifications.setNotificationChannelAsync('classes', {
          name: 'Class Reminders & Live Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
        });
        await Notifications.setNotificationChannelAsync('payments', {
          name: 'Payment & Receipt Confirmations',
          importance: Notifications.AndroidImportance.HIGH,
          lightColor: '#10B981',
        });
      }
    } catch (e) {
      // Safe fallback if notifications native module is mocked
    }
  }
};

export const registerPushToken = async (): Promise<string | null> => {
  try {
    const Notifications = require('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (e) {
    return 'expo-push-token-educlick-mobile-sample';
  }
};

export const triggerLocalNotification = async (title: string, body: string) => {
  try {
    const Notifications = require('expo-notifications');
    if (Notifications.scheduleNotificationAsync) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { timestamp: new Date().toISOString() },
        },
        trigger: null, // deliver immediately
      });
      return;
    }
  } catch (e) {}
  Alert.alert(title, body);
};
