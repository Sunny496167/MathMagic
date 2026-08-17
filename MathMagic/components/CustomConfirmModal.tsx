import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface CustomConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const CustomConfirmModal = ({
  visible,
  title,
  message,
  confirmText = "Remove",
  cancelText = "Cancel",
  onConfirm,
  onClose
}: CustomConfirmModalProps) => {
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
          {/* WARNING ICON */}
          <View className="w-24 h-24 bg-red-500/5 rounded-full items-center justify-center mb-8 border border-red-500/20">
            <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center border border-red-500/30">
              <Ionicons name="trash-outline" size={36} color="#FF4545" />
            </View>
          </View>

          {/* TEXT SECTION */}
          <Text className="text-text-primary text-2xl font-serif text-center mb-4 tracking-tight">
            {title}
          </Text>
          <Text className="text-text-tertiary text-[14px] font-sans text-center leading-6 mb-10 px-4 opacity-80">
            {message}
          </Text>

          {/* ACTIONS SECTION */}
          <View className="w-full gap-4">
            <TouchableOpacity
              onPress={onConfirm}
              className="w-full bg-red-500 rounded-3xl py-5 items-center shadow-2xl shadow-red-500/20"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-xs uppercase tracking-[0.2em]">
                {confirmText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-text-secondary font-bold text-xs uppercase tracking-[0.2em]">
                {cancelText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomConfirmModal;
