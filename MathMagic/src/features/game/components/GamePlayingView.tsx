import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GamePlayingViewProps {
  score: number;
  timeLeft: number;
  question: string;
  userAnswer: string;
  shake: boolean;
  onKeyPress: (num: string) => void;
  onDelete: () => void;
}

export const GamePlayingView = ({
  score,
  timeLeft,
  question,
  userAnswer,
  shake,
  onKeyPress,
  onDelete,
}: GamePlayingViewProps) => {
  return (
    <View className="flex-1 px-6 pt-4 pb-6 justify-between">
      {/* Top HUD: Score & Timer */}
      <View className="flex-row justify-between items-center bg-white border border-primary/10 rounded-2xl p-4 shadow-sm">
        <View className="flex-row items-center">
          <Ionicons name="sparkles" size={18} color="#8B5CF6" />
          <Text className="text-slate-800 font-bold text-base font-inter ml-2">
            Score: <Text className="text-primary font-extrabold">{score}</Text>
          </Text>
        </View>

        <View
          className={`flex-row items-center px-3 py-1.5 rounded-full ${
            timeLeft <= 10 ? 'bg-red-50 border border-red-200' : 'bg-slate-50'
          }`}
        >
          <Ionicons name="timer-outline" size={18} color={timeLeft <= 10 ? '#EF4444' : '#64748B'} />
          <Text
            className={`font-bold text-sm font-inter ml-1.5 ${
              timeLeft <= 10 ? 'text-red-600' : 'text-slate-700'
            }`}
          >
            {timeLeft}s
          </Text>
        </View>
      </View>

      {/* Main Question Card Area */}
      <View
        className={`bg-white border rounded-[32px] p-6 items-center justify-center my-4 shadow-sm ${
          shake ? 'border-red-400 bg-red-50/20' : 'border-primary/10'
        }`}
      >
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider font-inter mb-2">
          Calculate Quick
        </Text>
        <Text className="text-4xl font-extrabold text-slate-800 my-4 font-inter tracking-wider">
          {question} = ?
        </Text>

        <View className="min-w-[120px] h-14 bg-slate-50 border-2 border-primary/20 rounded-2xl items-center justify-center px-4">
          <Text className="text-3xl font-extrabold text-primary font-inter">
            {userAnswer || '_'}
          </Text>
        </View>
      </View>

      {/* Custom Keypad for Fast Tapping */}
      <View className="bg-white border border-primary/5 rounded-[32px] p-4 shadow-sm">
        <View className="flex-row justify-between mb-3">
          {['1', '2', '3'].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => onKeyPress(n)}
              activeOpacity={0.7}
              className="w-[30%] bg-slate-50 border border-slate-100 py-3.5 rounded-2xl items-center active:scale-95 transition-all shadow-sm"
            >
              <Text className="text-slate-800 text-xl font-bold font-inter">{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row justify-between mb-3">
          {['4', '5', '6'].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => onKeyPress(n)}
              activeOpacity={0.7}
              className="w-[30%] bg-slate-50 border border-slate-100 py-3.5 rounded-2xl items-center active:scale-95 transition-all shadow-sm"
            >
              <Text className="text-slate-800 text-xl font-bold font-inter">{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row justify-between mb-3">
          {['7', '8', '9'].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => onKeyPress(n)}
              activeOpacity={0.7}
              className="w-[30%] bg-slate-50 border border-slate-100 py-3.5 rounded-2xl items-center active:scale-95 transition-all shadow-sm"
            >
              <Text className="text-slate-800 text-xl font-bold font-inter">{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row justify-between">
          <View className="w-[30%]" />
          <TouchableOpacity
            onPress={() => onKeyPress('0')}
            activeOpacity={0.7}
            className="w-[30%] bg-slate-50 border border-slate-100 py-3.5 rounded-2xl items-center active:scale-95 transition-all shadow-sm"
          >
            <Text className="text-slate-800 text-xl font-bold font-inter">0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            activeOpacity={0.7}
            className="w-[30%] bg-red-50 border border-red-100 py-3.5 rounded-2xl items-center active:scale-95 transition-all shadow-sm"
          >
            <Ionicons name="backspace-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default GamePlayingView;
