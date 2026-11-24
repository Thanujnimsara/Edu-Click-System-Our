declare var require: any;

declare module 'react-native' {
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
  };
  export const Text: any;
  export const View: any;
  export const SafeAreaView: any;
  export const ScrollView: any;
  export const TouchableOpacity: any;
  export const TextInput: any;
  export const Alert: {
    alert: (title: string, message?: string, buttons?: Array<{ text: string; onPress?: () => void; style?: string }>) => void;
  };
  export const ActivityIndicator: any;
  export const Platform: {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
    select: (obj: any) => any;
  };
  export const Modal: any;
  export const StatusBar: any;
}

declare module 'expo-status-bar' {
  export const StatusBar: any;
}

declare module 'expo-notifications' {
  export const AndroidImportance: {
    MAX: number;
    HIGH: number;
    DEFAULT: number;
    LOW: number;
    MIN: number;
  };
  export const setNotificationChannelAsync: (channelId: string, options: any) => Promise<any>;
  export const getPermissionsAsync: () => Promise<{ status: string }>;
  export const requestPermissionsAsync: () => Promise<{ status: string }>;
  export const getExpoPushTokenAsync: () => Promise<{ data: string }>;
  export const scheduleNotificationAsync: (options: any) => Promise<string>;
}

declare module 'expo-secure-store' {
  export const setItemAsync: (key: string, value: string) => Promise<void>;
  export const getItemAsync: (key: string) => Promise<string | null>;
  export const deleteItemAsync: (key: string) => Promise<void>;
}

declare module 'expo-camera' {
  export const Camera: any;
}
