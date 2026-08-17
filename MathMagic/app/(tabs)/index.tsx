import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import { statsStorage, UserStats } from "@/lib/statsStorage";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Category = "Addition" | "Subtraction" | "Multiplication" | "Division" | "Fractions";
type Difficulty = "Easy" | "Medium" | "Hard";

interface Question {
  text: string;
  answer: number;
}

export default function PracticeScreen() {
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    streak: 0,
    highScore: 0,
    completedLessons: [],
    lastActiveDate: null,
  });

  const [activeTopic, setActiveTopic] = useState<Category | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    loadUserStats();
  }, []);

  useEffect(() => {
    if (activeTopic) {
      generateQuestion();
    }
  }, [activeTopic, difficulty]);

  const loadUserStats = async () => {
    const data = await statsStorage.getStats();
    setStats(data);
  };

  const generateQuestion = () => {
    setUserAnswer("");
    setFeedback(null);

    let text = "";
    let answer = 0;

    let num1 = 0;
    let num2 = 0;

    if (difficulty === "Easy") {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
    } else if (difficulty === "Medium") {
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 20) + 5;
    } else {
      num1 = Math.floor(Math.random() * 100) + 20;
      num2 = Math.floor(Math.random() * 50) + 10;
    }

    if (activeTopic === "Addition") {
      text = `${num1} + ${num2}`;
      answer = num1 + num2;
    } else if (activeTopic === "Subtraction") {
      if (num1 < num2) {
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }
      text = `${num1} - ${num2}`;
      answer = num1 - num2;
    } else if (activeTopic === "Multiplication") {
      if (difficulty === "Hard") {
        num1 = Math.floor(Math.random() * 20) + 5;
        num2 = Math.floor(Math.random() * 12) + 2;
      } else {
        num1 = Math.floor(Math.random() * 10) + 2;
        num2 = Math.floor(Math.random() * 10) + 2;
      }
      text = `${num1} × ${num2}`;
      answer = num1 * num2;
    } else if (activeTopic === "Division") {
      // Division question: num1 * num2 / num2 = num1
      if (difficulty === "Easy") {
        num2 = Math.floor(Math.random() * 5) + 2; // Divisor
        num1 = Math.floor(Math.random() * 10) + 1; // Answer
      } else {
        num2 = Math.floor(Math.random() * 10) + 2; // Divisor
        num1 = Math.floor(Math.random() * 15) + 3; // Answer
      }
      text = `${num1 * num2} ÷ ${num2}`;
      answer = num1;
    } else {
      // Fractions
      if (difficulty === "Easy") {
        const den = [2, 4, 5, 10][Math.floor(Math.random() * 4)];
        const mult = Math.floor(Math.random() * 8) + 2;
        text = `What is 1/${den} of ${den * mult}?`;
        answer = mult;
      } else {
        const den = Math.floor(Math.random() * 5) + 3;
        const val = Math.floor(Math.random() * 5) + 2;
        text = `If x / ${den} = ${val}, what is x?`;
        answer = den * val;
      }
    }

    setQuestion({ text, answer });
  };

  const handleVerify = async () => {
    if (!question) return;

    const numericAnswer = parseFloat(userAnswer.trim());
    if (isNaN(numericAnswer)) {
      Alert.alert("Error", "Please enter a valid number");
      return;
    }

    if (numericAnswer === question.answer) {
      setFeedback("correct");
      setSolvedCount((c) => c + 1);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}

      let xpReward = 10;
      if (difficulty === "Medium") xpReward = 25;
      if (difficulty === "Hard") xpReward = 50;

      const updated = await statsStorage.addXp(xpReward);
      setStats(updated);
    } else {
      setFeedback("incorrect");
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {}
    }
  };

  // Mock progress tracker based on XP to make it look premium & interactive
  const getProgressVal = (topic: Category) => {
    const totalXP = stats.xp;
    if (topic === "Addition") return Math.min(Math.floor(totalXP / 10), 20);
    if (topic === "Subtraction") return Math.min(Math.floor(totalXP / 20), 20);
    if (topic === "Multiplication") return Math.min(Math.floor(totalXP / 35), 20);
    if (topic === "Division") return Math.min(Math.floor(totalXP / 50), 20);
    return Math.min(Math.floor(totalXP / 75), 20);
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-background"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          
          {activeTopic === null ? (
            // ================= TOPICS LIST VIEW =================
            <View className="flex-1">
              
              {/* Header Stats Bar */}
              <View className="px-6 py-5 flex-row justify-between items-center border-b border-primary/5 bg-white">
                <View>
                  <Text className="text-text-primary text-2xl font-bold tracking-tight">Let's Practice!</Text>
                  <Text className="text-text-secondary text-xs mt-1">Strengthen your math skills step by step.</Text>
                </View>

                {/* Streak Badge */}
                <View className="flex-row items-center bg-[#FEF3C7] border border-[#FEEB9F] px-4 py-2.5 rounded-2xl">
                  <Ionicons name="flame" size={18} color="#D97706" />
                  <Text className="text-[#D97706] font-bold ml-1.5 font-inter text-sm">
                    {stats.streak}
                  </Text>
                </View>
              </View>

              {/* Topics Header */}
              <View className="px-6 pt-6">
                <Text className="text-text-secondary text-[11px] font-bold uppercase tracking-wider mb-4 font-inter">
                  Topics
                </Text>

                {/* Topics Container */}
                {[
                  { id: "Addition", icon: "add", bg: "bg-[#E8F8F0]", border: "border-[#D1F2E1]", color: "#10B981" },
                  { id: "Subtraction", icon: "remove", bg: "bg-[#F0F9FF]", border: "border-[#E0F2FE]", color: "#0284C7" },
                  { id: "Multiplication", icon: "close", bg: "bg-[#F3E8FF]", border: "border-[#E9D5FF]", color: "#7C3AED" },
                  { id: "Division", icon: "git-commit-outline", bg: "bg-[#FFF7ED]", border: "border-[#FFEDD5]", color: "#F97316" },
                  { id: "Fractions", icon: "pie-chart-outline", bg: "bg-[#FFF1F2]", border: "border-[#FFE4E6]", color: "#F43F5E" }
                ].map((topic) => {
                  const currentProg = getProgressVal(topic.id as Category);
                  const progPercent = (currentProg / 20) * 100;
                  return (
                    <TouchableOpacity
                      key={topic.id}
                      onPress={() => setActiveTopic(topic.id as Category)}
                      activeOpacity={0.8}
                      className="bg-white border border-primary/5 rounded-[24px] p-4.5 mb-4 flex-row items-center justify-between shadow-sm"
                    >
                      <View className="flex-1 flex-row items-center">
                        {/* Circle logo */}
                        <View className={`w-12 h-12 rounded-full ${topic.bg} border ${topic.border} items-center justify-center mr-4`}>
                          <Ionicons name={topic.icon as any} size={22} color={topic.color} />
                        </View>
                        <View className="flex-1 pr-4">
                          <Text className="text-text-primary text-base font-bold font-sans">{topic.id}</Text>
                          {/* Progress bar info */}
                          <View className="flex-row items-center mt-2.5">
                            <View className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden mr-3">
                              <View 
                                style={{ width: `${progPercent}%`, backgroundColor: topic.color }} 
                                className="h-full rounded-full"
                              />
                            </View>
                            <Text className="text-text-secondary text-[10px] font-bold font-inter">{currentProg}/20</Text>
                          </View>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            // ================= INTERACTIVE PRACTICE GAMEPLAY =================
            <View className="flex-1 px-6 py-6 justify-between">
              
              {/* Game Header */}
              <View className="flex-row items-center justify-between h-10 mb-4">
                <TouchableOpacity
                  className="w-10 h-10 rounded-full border border-primary/20 bg-white justify-center items-center active:scale-95"
                  onPress={() => setActiveTopic(null)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={20} color="#8B5CF6" />
                </TouchableOpacity>

                <Text className="text-primary text-lg font-bold font-serif">
                  {activeTopic}
                </Text>

                <View className="w-10 h-10" />
              </View>

              {/* Difficulty Level */}
              <View className="mb-4">
                <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-2.5 font-inter text-center">
                  Difficulty Level
                </Text>
                <View className="flex-row justify-between">
                  {(["Easy", "Medium", "Hard"] as Difficulty[]).map((diff) => (
                    <TouchableOpacity
                      key={diff}
                      onPress={() => setDifficulty(diff)}
                      activeOpacity={0.8}
                      style={{ width: `${31}%` }}
                      className={`py-3 rounded-full items-center border ${
                        difficulty === diff
                          ? "bg-primary border-primary"
                          : "bg-white border-primary/10"
                      }`}
                    >
                      <Text
                        className={`font-bold text-xs tracking-wider uppercase font-inter ${
                          difficulty === diff ? "text-white" : "text-text-secondary"
                        }`}
                      >
                        {diff}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Question bubble */}
              <View className="bg-white border-2 border-primary/10 rounded-[32px] p-6 shadow-sm items-center justify-center min-h-[200px] my-4">
                <Text className="text-text-tertiary text-xs font-bold uppercase tracking-widest mb-4 font-inter">
                  Level {difficulty} Question
                </Text>
                <Text className="text-text-primary text-4xl font-sans text-center font-bold tracking-wide leading-relaxed px-4">
                  {question?.text || "Generating..."}
                </Text>
              </View>

              {/* Input & verification actions */}
              <View className="mt-4">
                {feedback === "correct" && (
                  <View className="bg-card-green border border-green-300 rounded-2xl py-4 px-6 mb-6 flex-row items-center">
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    <Text className="text-green-800 font-bold ml-3 font-inter">
                      Correct! +{difficulty === "Easy" ? 10 : difficulty === "Medium" ? 25 : 50} XP earned.
                    </Text>
                  </View>
                )}

                {feedback === "incorrect" && (
                  <View className="bg-card-pink border border-red-300 rounded-2xl py-4 px-6 mb-6 flex-row items-center">
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                    <Text className="text-red-800 font-bold ml-3 font-inter">
                      Incorrect. Try again!
                    </Text>
                  </View>
                )}

                <TextInput
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="Enter your answer"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  editable={feedback !== "correct"}
                  className="bg-white text-text-primary text-xl text-center font-inter font-bold py-4 border border-primary/20 rounded-2xl mb-4 focus:border-primary"
                />

                {feedback === "correct" ? (
                  <TouchableOpacity
                    onPress={generateQuestion}
                    activeOpacity={0.8}
                    className="bg-primary py-4 rounded-2xl items-center shadow-md"
                  >
                    <Text className="text-white font-bold text-base tracking-wider font-inter">
                      NEXT QUESTION ✨
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleVerify}
                    activeOpacity={0.8}
                    className="bg-primary py-4 rounded-2xl items-center shadow-md"
                  >
                    <Text className="text-white font-bold text-base tracking-wider font-inter">
                      VERIFY ANSWER 🔮
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
