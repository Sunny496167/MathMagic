import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GameHUDProps {
  score: number;
  combo: number;
  lives?: number;
  maxLives?: number;
  timeRemaining?: number;
  totalTimeLimit?: number;
  elapsedSeconds?: number;
  onPause?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  combo,
  lives = 3,
  maxLives = 3,
  timeRemaining,
  totalTimeLimit,
  elapsedSeconds,
  onPause,
}) => {
  const formatTime = (seconds?: number) => {
    if (seconds === undefined) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timePercent =
    totalTimeLimit && timeRemaining !== undefined
      ? (timeRemaining / totalTimeLimit) * 100
      : 100;

  return (
    <View className="mb-4">
      {/* Top Status Bar */}
      <View className="flex-row items-center justify-between mb-2">
        {/* Score & Combo */}
        <View className="flex-row items-center gap-2">
          <View className="bg-purple-100 px-3 py-1.5 rounded-2xl flex-row items-center gap-1.5 border border-purple-200">
            <Ionicons name="sparkles" size={13} color="#8B5CF6" />
            <Text className="text-primary font-black text-sm font-inter">
              {score}
            </Text>
          </View>

          {combo > 1 && (
            <View className="bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-300">
              <Text className="text-amber-800 font-black text-xs font-inter">
                {combo}x Combo!
              </Text>
            </View>
          )}
        </View>

        {/* Lives / Timer */}
        <View className="flex-row items-center gap-2">
          {timeRemaining !== undefined ? (
            <View className="bg-slate-100 px-3 py-1.5 rounded-2xl flex-row items-center gap-1.5">
              <Ionicons name="timer-outline" size={14} color="#64748B" />
              <Text
                className={`text-xs font-black font-inter ${
                  timeRemaining <= 10 ? 'text-rose-600' : 'text-slate-800'
                }`}
              >
                {formatTime(timeRemaining)}
              </Text>
            </View>
          ) : elapsedSeconds !== undefined ? (
            <View className="bg-slate-100 px-3 py-1.5 rounded-2xl flex-row items-center gap-1.5">
              <Ionicons name="stopwatch-outline" size={14} color="#64748B" />
              <Text className="text-xs font-black font-inter text-slate-800">
                {formatTime(elapsedSeconds)}
              </Text>
            </View>
          ) : null}

          {/* Heart Lives */}
          {lives !== undefined && (
            <View className="flex-row items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-2xl border border-rose-200">
              {Array.from({ length: maxLives }).map((_, idx) => (
                <Ionicons
                  key={idx}
                  name={idx < lives ? 'heart' : 'heart-outline'}
                  size={14}
                  color={idx < lives ? '#E11D48' : '#FDA4AF'}
                />
              ))}
            </View>
          )}

          {onPause && (
            <TouchableOpacity
              onPress={onPause}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <Ionicons name="pause" size={14} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Timer Bar */}
      {totalTimeLimit && timeRemaining !== undefined && (
        <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <View
            style={{ width: `${Math.max(timePercent, 0)}%` }}
            className={`h-full rounded-full ${
              timeRemaining <= 10 ? 'bg-rose-500' : 'bg-primary'
            }`}
          />
        </View>
      )}
    </View>
  );
};

export default GameHUD;
