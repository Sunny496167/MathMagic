import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';

interface GameCountdownProps {
  onComplete: () => void;
}

export const GameCountdown: React.FC<GameCountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);
  const { triggerLight, triggerSuccess } = useHapticFeedback();

  useEffect(() => {
    triggerLight();
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerSuccess();
          setTimeout(() => {
            onComplete();
          }, 400);
          return 0;
        }
        triggerLight();
        return prev - 1;
      });
    }, 850);

    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white/95">
      <View className="w-32 h-32 rounded-full bg-purple-50 items-center justify-center border-4 border-purple-200 shadow-lg">
        <Text className="text-primary text-6xl font-black font-inter">
          {count > 0 ? count : 'GO!'}
        </Text>
      </View>
      <Text className="text-slate-400 text-sm font-bold font-inter mt-6 tracking-widest uppercase">
        Get Ready!
      </Text>
    </View>
  );
};

export default GameCountdown;
