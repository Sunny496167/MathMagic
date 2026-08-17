import React from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onAction?: () => void;
  onClose: () => void;
}

const CustomAlert = ({
  visible,
  title,
  message,
  buttonText = "View Details",
  onAction,
  onClose
}: CustomAlertProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center px-8">
        <BlurView intensity={40} tint="dark" className="absolute inset-0" />
        
        <View className="w-full bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 items-center shadow-2xl">
          {/* ICON SECTION */}
          <View className="w-24 h-24 bg-primary/5 rounded-full items-center justify-center mb-8 border border-primary/20">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center border border-primary/30">
              <Ionicons name="shield-checkmark" size={40} color="#D4AF37" />
            </View>
          </View>

          {/* TEXT SECTION */}
          <Text className="text-text-primary text-3xl font-serif text-center mb-4 tracking-tight">
            {title}
          </Text>
          <Text className="text-text-tertiary text-[15px] font-sans text-center leading-6 mb-10 px-4 opacity-80">
            {message}
          </Text>

          {/* ACTIONS SECTION */}
          <View className="w-full gap-4">
            <TouchableOpacity
              onPress={onAction || onClose}
              className="w-full bg-primary rounded-3xl py-5 items-center shadow-2xl shadow-primary/40"
              activeOpacity={0.8}
            >
              <Text className="text-background font-bold text-xs uppercase tracking-[0.2em]">
                {buttonText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-text-secondary font-bold text-xs uppercase tracking-[0.2em]">
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
