import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import { statsStorage, UserStats } from "@/lib/statsStorage";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Lesson {
  id: string;
  title: string;
  category: string;
  formula: string;
  description: string;
  exampleProblem: string;
  exampleStep: string;
  quizQuestion: string;
  quizAnswer: string;
}

const LESSONS: Lesson[] = [
  {
    id: "pemdas",
    title: "Basic Arithmetic",
    category: "Basics",
    formula: "P.E.M.D.A.S.",
    description: "Parentheses, Exponents, Multiplication & Division (left to right), Addition & Subtraction (left to right).",
    exampleProblem: "Solve 10 - 2 × 3 + (4 + 2)",
    exampleStep: "1. Parentheses: 4 + 2 = 6.\n2. Multiplication: 2 × 3 = 6.\n3. Left-to-right math: 10 - 6 + 6 = 10.",
    quizQuestion: "What is 8 + 3 × (6 - 4)?",
    quizAnswer: "14",
  },
  {
    id: "quad",
    title: "Algebra Basics",
    category: "Algebra",
    formula: "x = (-b ± √(b² - 4ac)) / 2a",
    description: "Finds the solutions (roots) of any quadratic equation of the form ax² + bx + c = 0.",
    exampleProblem: "Solve x² - 5x + 6 = 0",
    exampleStep: "Here, a=1, b=-5, c=6.\nx = (5 ± √((-5)² - 4(1)(6))) / 2(1)\nx = (5 ± √(25 - 24)) / 2\nx = (5 ± 1) / 2 -> x = 3 or x = 2.",
    quizQuestion: "What is the positive root of x² - 4 = 0?",
    quizAnswer: "2",
  },
  {
    id: "fractions",
    title: "Fractions",
    category: "Fractions",
    formula: "a/b + c/d = (ad + bc)/bd",
    description: "Add fractions by finding a common denominator and adding the numerators.",
    exampleProblem: "Solve 1/2 + 1/3",
    exampleStep: "1. Find common denominator: 2 × 3 = 6.\n2. Convert: 1/2 = 3/6, 1/3 = 2/6.\n3. Add: 3/6 + 2/6 = 5/6.",
    quizQuestion: "What is the numerator of 1/3 + 1/4?",
    quizAnswer: "7",
  },
  {
    id: "pythag",
    title: "Geometry",
    category: "Geometry",
    formula: "a² + b² = c²",
    description: "In any right-angled triangle, the area of the square whose side is the hypotenuse (c) is equal to the sum of the areas of the squares on the other two sides (a and b).",
    exampleProblem: "Find hypotenuse c if a = 3 and b = 4.",
    exampleStep: "3² + 4² = c²\n9 + 16 = c²\n25 = c²\nc = √25 = 5.",
    quizQuestion: "Find c if a = 6, b = 8:",
    quizAnswer: "10",
  },
  {
    id: "mensuration",
    title: "Mensuration",
    category: "Mensuration",
    formula: "Area = Length × Width",
    description: "Calculate space inside 2D shapes like rectangles, triangles, and circles.",
    exampleProblem: "Find area of rectangle with length 8 and width 5.",
    exampleStep: "Area = 8 × 5 = 40 square units.",
    quizQuestion: "What is the perimeter of a square with side length 5?",
    quizAnswer: "20",
  },
];

export default function LearnScreen() {
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    streak: 0,
    highScore: 0,
    completedLessons: [],
    lastActiveDate: null,
  });

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "incorrect" | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const s = await statsStorage.getStats();
    setStats(s);
  };

  const handleLessonOpen = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setQuizAnswer("");
    setQuizFeedback(null);
  };

  const verifyQuizAnswer = async () => {
    if (!selectedLesson) return;

    if (quizAnswer.trim() === selectedLesson.quizAnswer) {
      setQuizFeedback("correct");
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
      
      const updated = await statsStorage.completeLesson(selectedLesson.id);
      setStats(updated);
    } else {
      setQuizFeedback("incorrect");
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {}
    }
  };

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-6 py-5 flex-row justify-between items-center border-b border-primary/5 bg-white">
          <View>
            <Text className="text-text-primary text-2xl font-bold tracking-tight">Learn Concepts</Text>
            <Text className="text-text-secondary text-xs mt-1">Understand math with easy explanations.</Text>
          </View>

          {/* Search Icon Decor */}
          <TouchableOpacity className="w-10 h-10 bg-slate-50 border border-primary/5 rounded-full justify-center items-center">
            <Ionicons name="search" size={18} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Content list */}
        <ScrollView className="flex-1 px-6 pt-6 pb-4">
          <Text className="text-text-secondary text-[11px] font-bold uppercase tracking-wider mb-4 font-inter">
            Topics
          </Text>

          {[
            { id: "pemdas", icon: "calculator-outline", bg: "bg-[#E8F8F0]", border: "border-[#D1F2E1]", color: "#10B981" },
            { id: "quad", icon: "pulse-outline", bg: "bg-[#F3E8FF]", border: "border-[#E9D5FF]", color: "#7C3AED" },
            { id: "fractions", icon: "pie-chart-outline", bg: "bg-[#FEF3C7]", border: "border-[#FEEB9F]", color: "#D97706" },
            { id: "pythag", icon: "triangle-outline", bg: "bg-[#F0F9FF]", border: "border-[#E0F2FE]", color: "#0284C7" },
            { id: "mensuration", icon: "grid-outline", bg: "bg-[#FFF1F2]", border: "border-[#FFE4E6]", color: "#F43F5E" }
          ].map((theme) => {
            const lesson = LESSONS.find((l) => l.id === theme.id)!;
            const isCompleted = stats.completedLessons.includes(lesson.id);
            return (
              <TouchableOpacity
                key={lesson.id}
                onPress={() => handleLessonOpen(lesson)}
                activeOpacity={0.8}
                className="bg-white border border-primary/5 rounded-[24px] p-4.5 mb-4 flex-row justify-between items-center shadow-sm"
              >
                <View className="flex-row items-center flex-1 pr-4">
                  {/* Category icon */}
                  <View className={`w-12 h-12 rounded-full ${theme.bg} border ${theme.border} items-center justify-center mr-4`}>
                    <Ionicons name={theme.icon as any} size={22} color={theme.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary text-base font-bold font-sans">{lesson.title}</Text>
                    <Text className="text-text-secondary text-xs mt-1">{isCompleted ? "15/15" : "0/15"} Solved</Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Modal for Lesson view */}
        <Modal
          visible={!!selectedLesson}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedLesson(null)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-background rounded-t-[32px] border-t border-primary/20 p-6 max-h-[85%]">
              {/* Modal header */}
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-primary text-xs font-bold uppercase tracking-wider font-inter">
                  {selectedLesson?.category}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedLesson(null)}
                  className="bg-white border border-primary/20 p-2 rounded-full active:scale-95"
                >
                  <Ionicons name="close" size={20} color="#8B5CF6" />
                </TouchableOpacity>
              </View>

              <ScrollView className="space-y-6 mb-4" showsVerticalScrollIndicator={false}>
                {/* Title and formula */}
                <View>
                  <Text className="text-text-primary text-2xl font-bold tracking-wide mb-2.5">
                    {selectedLesson?.title}
                  </Text>
                  <Text className="text-primary text-lg font-mono font-bold mt-2 bg-white p-4 rounded-xl border border-primary/10">
                    {selectedLesson?.formula}
                  </Text>
                </View>

                {/* Description */}
                <View className="mt-4">
                  <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-1 font-inter">
                    Concept Explanation
                  </Text>
                  <Text className="text-text-primary text-sm font-inter leading-relaxed">
                    {selectedLesson?.description}
                  </Text>
                </View>

                {/* Step-by-Step Example */}
                <View className="mt-4 bg-white border border-primary/10 p-4 rounded-xl">
                  <Text className="text-text-primary text-sm font-bold font-inter mb-1">
                    Example: {selectedLesson?.exampleProblem}
                  </Text>
                  <Text className="text-text-secondary text-xs font-inter leading-relaxed mt-2 whitespace-pre-line">
                    {selectedLesson?.exampleStep}
                  </Text>
                </View>

                {/* Quiz Check */}
                <View className="mt-4 pt-4 border-t border-primary/10">
                  <Text className="text-primary text-xs font-bold uppercase tracking-wider mb-2 font-inter">
                    Quick Quiz (Gain +30 XP!)
                  </Text>
                  <Text className="text-text-primary text-base font-sans font-semibold mb-3">
                    {selectedLesson?.quizQuestion}
                  </Text>

                  {quizFeedback === "correct" ? (
                    <View className="bg-card-green border border-green-300 rounded-xl py-3 px-4 flex-row items-center mb-3">
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text className="text-green-800 font-bold ml-2 text-xs font-inter">
                        Correct! Lesson Completed & XP Gained.
                      </Text>
                    </View>
                  ) : (
                    <>
                      {quizFeedback === "incorrect" && (
                        <View className="bg-card-pink border border-red-300 rounded-xl py-3 px-4 flex-row items-center mb-3">
                          <Ionicons name="close-circle" size={20} color="#EF4444" />
                          <Text className="text-red-800 font-bold ml-2 text-xs font-inter">
                            Incorrect answer. Double check calculations!
                          </Text>
                        </View>
                      )}

                      <TextInput
                        value={quizAnswer}
                        onChangeText={setQuizAnswer}
                        placeholder="Your answer"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        className="bg-white text-text-primary py-3 px-4 border border-primary/20 rounded-xl mb-3 focus:border-primary"
                      />

                      <TouchableOpacity
                        onPress={verifyQuizAnswer}
                        activeOpacity={0.8}
                        className="bg-primary py-3.5 rounded-xl items-center shadow-md active:scale-95 transition-all"
                      >
                        <Text className="text-white font-bold text-sm tracking-wider font-inter">
                          SUBMIT QUIZ ✨
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeScreen>
  );
}
