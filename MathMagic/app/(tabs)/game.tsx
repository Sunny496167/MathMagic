import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import { statsStorage, UserStats } from "@/lib/statsStorage";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function GameScreen() {
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    streak: 0,
    highScore: 0,
    completedLessons: [],
    lastActiveDate: null,
  });

  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [shake, setShake] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadStats();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadStats = async () => {
    const s = await statsStorage.getStats();
    setStats(s);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setUserAnswer("");
    setGameState("playing");
    nextQuestion();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("gameover");
    
    // Gain XP equal to score * 2
    const xpGained = score * 2;
    if (xpGained > 0) {
      await statsStorage.addXp(xpGained);
    }
    
    // Save high score
    const updatedStats = await statsStorage.updateHighScore(score);
    setStats(updatedStats);
  };

  const nextQuestion = () => {
    setUserAnswer("");
    const num1 = Math.floor(Math.random() * 12) + 1;
    const num2 = Math.floor(Math.random() * 12) + 1;
    const isAddition = Math.random() > 0.5;

    if (isAddition) {
      setQuestion(`${num1} + ${num2}`);
      setCorrectAnswer(num1 + num2);
    } else {
      // subtraction
      const maxVal = Math.max(num1, num2);
      const minVal = Math.min(num1, num2);
      setQuestion(`${maxVal} - ${minVal}`);
      setCorrectAnswer(maxVal - minVal);
    }
  };

  const handleInputChange = (text: string) => {
    setUserAnswer(text);
    const numericInput = parseInt(text.trim());
    
    if (numericInput === correctAnswer) {
      setScore((s) => s + 1);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      nextQuestion();
    }
  };

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        
        {gameState === "idle" ? (
          // ================= POPULAR GAMES LIST VIEW =================
          <View className="flex-1">
            
            {/* Header info */}
            <View className="px-6 py-5 flex-row justify-between items-center border-b border-primary/5 bg-white">
              <View>
                <Text className="text-text-primary text-2xl font-bold tracking-tight">Play & Learn</Text>
                <Text className="text-text-secondary text-xs mt-1">Fun games to make math exciting!</Text>
              </View>

              {/* Coins Badge */}
              <View className="flex-row items-center bg-[#FEF3C7] border border-[#FEEB9F] px-4 py-2.5 rounded-2xl">
                <Ionicons name="logo-yen" size={16} color="#D97706" />
                <Text className="text-[#D97706] font-bold ml-1.5 font-inter text-sm">
                  {stats.highScore * 10 || 250}
                </Text>
              </View>
            </View>

            {/* Popular Games list */}
            <View className="px-6 pt-6">
              <Text className="text-text-secondary text-[11px] font-bold uppercase tracking-wider mb-4 font-inter">
                Popular Games
              </Text>

              {[
                { title: "Math Master", desc: "Solve questions and earn points", icon: "ribbon", color: "#D97706", bg: "bg-[#FEF3C7]", border: "border-[#FEEB9F]", btnBg: "bg-[#F97316]" },
                { title: "Number Rush", desc: "Catch the correct answer", icon: "flash", color: "#10B981", bg: "bg-[#E8F8F0]", border: "border-[#D1F2E1]", btnBg: "bg-[#10B981]" },
                { title: "Math Basket", desc: "Drop the right answer", icon: "basket", color: "#F43F5E", bg: "bg-[#FFF1F2]", border: "border-[#FFE4E6]", btnBg: "bg-[#F43F5E]" },
              ].map((game) => (
                <View 
                  key={game.title}
                  className="bg-white border border-primary/5 rounded-[24px] p-4.5 mb-4 flex-row items-center justify-between shadow-sm"
                >
                  <View className="flex-row items-center flex-1 pr-4">
                    <View className={`w-12 h-12 rounded-2xl ${game.bg} border ${game.border} items-center justify-center mr-4`}>
                      <Ionicons name={game.icon as any} size={22} color={game.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-text-primary text-base font-bold font-sans">{game.title}</Text>
                      <Text className="text-text-secondary text-xs mt-1" numberOfLines={1}>{game.desc}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={startGame}
                    activeOpacity={0.8}
                    className={`${game.btnBg} px-5 py-2.5 rounded-full active:scale-95 transition-all shadow-sm`}
                  >
                    <Text className="text-white font-bold text-xs tracking-wider">Play</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ) : (
          // ================= ACTIVE GAMEPLAY / GAMEOVER VIEW =================
          <View className="flex-1 px-6 py-6 justify-between">
            {/* Top Info Bar */}
            <View className="flex-row justify-between items-center h-10 mb-4">
              <TouchableOpacity
                className="w-10 h-10 rounded-full border border-primary/20 bg-white justify-center items-center active:scale-95"
                onPress={endGame}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#8B5CF6" />
              </TouchableOpacity>

              <Text className="text-primary text-lg font-bold font-serif">
                Math Rush
              </Text>

              <View className="flex-row items-center bg-card-pink px-4 py-2 rounded-full border border-primary/10">
                <Ionicons name="time" size={18} color="#F87171" />
                <Text className="text-text-primary font-bold ml-2 font-inter text-sm">
                  {timeLeft}s
                </Text>
              </View>
            </View>

            {gameState === "playing" && (
              <View className="flex-1 justify-center items-center">
                {/* Round info & Score */}
                <View className="mb-6 items-center">
                  <Text className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-1 font-inter">
                    SCORE
                  </Text>
                  <Text className="text-text-primary text-5xl font-bold font-sans">{score}</Text>
                </View>

                {/* Question card */}
                <View className="bg-white border-2 border-primary/10 rounded-[32px] p-8 w-full shadow-sm items-center justify-center min-h-[160px] mb-8">
                  <Text className="text-primary text-4xl font-sans font-bold tracking-wider">
                    {question}
                  </Text>
                </View>

                {/* Answer Field */}
                <TextInput
                  autoFocus
                  value={userAnswer}
                  onChangeText={handleInputChange}
                  placeholder="Your answer"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="bg-white w-full text-text-primary text-3xl text-center font-inter font-bold py-4 border border-primary/20 rounded-2xl mb-4 focus:border-primary"
                />
              </View>
            )}

            {gameState === "gameover" && (
              <View className="flex-1 justify-center items-center">
                <View className="bg-white border-2 border-primary/10 rounded-[32px] p-8 items-center w-full max-w-[340px] shadow-sm">
                  <Text className="text-accent-red text-xs font-bold uppercase tracking-widest mb-2 font-inter">
                    TIME'S UP!
                  </Text>
                  <Text className="text-text-primary text-3xl font-sans font-bold text-center mb-6">
                    Score: {score}
                  </Text>
                  <Text className="text-green-800 font-bold text-center text-sm mb-8 font-inter bg-card-green px-4 py-2 rounded-full border border-green-300">
                    +{score * 2} XP rewarded! 🎉
                  </Text>
                  <TouchableOpacity
                    onPress={startGame}
                    activeOpacity={0.8}
                    className="bg-primary w-full py-4 rounded-2xl items-center shadow-md mb-3 active:scale-95 transition-all"
                  >
                    <Text className="text-white font-bold text-base tracking-wider font-inter">
                      PLAY AGAIN 🌟
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setGameState("idle")}
                    activeOpacity={0.8}
                    className="border border-primary/20 bg-white w-full py-4 rounded-2xl items-center active:scale-95 transition-all"
                  >
                    <Text className="text-text-secondary font-bold text-sm tracking-wider font-inter">
                      GO HOME
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

      </View>
    </SafeScreen>
  );
}
