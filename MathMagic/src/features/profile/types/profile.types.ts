import { Ionicons } from '@expo/vector-icons';

export interface ProfileMenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}
