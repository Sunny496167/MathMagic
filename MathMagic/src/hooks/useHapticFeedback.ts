import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const useHapticFeedback = () => {
  const triggerLight = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  };

  const triggerSuccess = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  };

  const triggerError = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
    }
  };

  return {
    triggerLight,
    triggerSuccess,
    triggerError,
  };
};
