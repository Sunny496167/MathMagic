import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

interface WelcomeViewProps {
  onStart: () => void;
  onLogin: () => void;
}

export const WelcomeView = ({ onStart, onLogin }: WelcomeViewProps) => {
  return (
    <View className="flex-1 bg-transparent px-6 pt-2 pb-10 justify-between">
      {/* Top Bar with Logo & Moon icon */}
      <View className="w-full flex-row justify-between items-center px-1">
        <LinearGradient
          colors={['#8B5CF6', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text className="text-white text-base font-bold">√x</Text>
        </LinearGradient>
        <TouchableOpacity className="w-10 h-10 bg-slate-50 border border-primary/5 rounded-full justify-center items-center">
          <Ionicons name="moon-outline" size={18} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Title & Tagline */}
      <View className="items-center">
        <Text className="text-text-primary text-[28px] font-extrabold text-center tracking-tight font-sans">
          Welcome to
        </Text>
        <Text className="text-primary text-[32px] font-extrabold text-center tracking-tight font-sans">
          Math Path
        </Text>
        <Text className="text-text-secondary text-xs mt-2 text-center px-4 font-sans leading-relaxed">
          Learn math in a simple, fun and effective way.
        </Text>
      </View>

      {/* Hero Image Container with floating mathematical decorations */}
      <View className="w-full max-w-[310px] self-center my-4 items-center justify-center relative">
        <View
          className="absolute left-[-16px] top-6 bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1.5 rounded-full shadow-sm z-10"
          style={{ transform: [{ rotate: '-10deg' }] }}
        >
          <Text className="text-[#2563EB] text-xs font-extrabold font-sans">2+3=5</Text>
        </View>

        <View
          className="absolute left-[-8px] bottom-10 bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1.5 rounded-full shadow-sm z-10"
          style={{ transform: [{ rotate: '10deg' }] }}
        >
          <Text className="text-[#059669] text-xs font-extrabold font-sans">7-2=5</Text>
        </View>

        <View className="absolute right-[-10px] top-4 bg-[#FFFBEB] border border-[#FDE68A] w-9 h-9 rounded-full items-center justify-center shadow-sm z-10">
          <Ionicons name="bulb" size={18} color="#D97706" />
        </View>

        <View className="absolute right-[-8px] bottom-8 bg-[#FFF7ED] border border-[#FFEDD5] w-9 h-9 rounded-full items-center justify-center shadow-sm z-10">
          <Ionicons name="triangle" size={18} color="#EA580C" />
        </View>

        {/* Main Illustration frame */}
        <View className="w-full h-[220px] bg-white border border-primary/10 rounded-[32px] p-2 shadow-sm overflow-hidden">
          <Image
            source={require('../../../../assets/images/student_learning.jpg')}
            style={{ width: '100%', height: '100%', borderRadius: 24 }}
            contentFit="cover"
            transition={300}
          />
        </View>
      </View>

      {/* White Card Container for Features List */}
      <View
        className="w-full bg-white border border-primary/5 rounded-[32px] p-5 shadow-sm items-center"
        style={{
          shadowColor: '#8B5CF6',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.05,
          shadowRadius: 16,
          elevation: 3,
        }}
      >
        <View className="w-full mb-6">
          {[
            {
              title: 'Learn Step by Step',
              desc: 'Easy lessons from basic to advanced.',
              bg: 'bg-[#F3E8FF]',
              border: 'border-[#E9D5FF]',
              color: '#7C3AED',
              icon: 'book',
            },
            {
              title: 'Play & Learn',
              desc: 'Fun games to improve your skills.',
              bg: 'bg-[#E8F8F0]',
              border: 'border-[#D1F2E1]',
              color: '#10B981',
              icon: 'game-controller',
            },
            {
              title: 'Test & Improve',
              desc: 'Quizzes to track and boost your learning.',
              bg: 'bg-[#FEF3C7]',
              border: 'border-[#FEEB9F]',
              color: '#D97706',
              icon: 'trophy',
            },
          ].map((item, idx) => (
            <View
              key={item.title}
              className={`flex-row items-center justify-between bg-slate-50/50 border border-slate-100/60 p-2.5 rounded-2xl ${
                idx !== 2 ? 'mb-3' : ''
              }`}
            >
              <View className="flex-row items-center flex-1 pr-2">
                <View
                  className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} items-center justify-center mr-3.5 shadow-sm`}
                >
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-800 text-sm font-extrabold font-sans">{item.title}</Text>
                  <Text className="text-slate-500 text-[10px] mt-0.5 font-medium">{item.desc}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={14} color="#94A3B8" />
            </View>
          ))}
        </View>

        {/* Let's Start CTA Button */}
        <TouchableOpacity onPress={onStart} className="w-full active:scale-95 transition-all" activeOpacity={0.8}>
          <LinearGradient
            colors={['#8B5CF6', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 20,
              width: '100%',
              paddingVertical: 15,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text className="text-white font-sans font-bold text-sm tracking-wider">Let's Start →</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity onPress={onLogin} className="mt-3.5 py-1" activeOpacity={0.7}>
          <Text className="text-text-secondary font-sans text-xs tracking-wider">
            Already have an account? <Text className="text-primary font-bold underline">Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeView;
