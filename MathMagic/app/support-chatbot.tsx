import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Keyboard
} from "react-native";
import { SafeScreen } from "@/src/components/common/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useApi } from "@/src/api/client";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: Date;
}

const ChatbotScreen = () => {
  const router = useRouter();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I am Venus AI, your personal assistant at IQVenus. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/v1/chatbot/categories');
        if (response.data && response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (err) {
        console.error("Failed to load chatbot categories in mobile app:", err);
        // Fallback categories
        setCategories([
          "General & Brand Intro",
          "Jewelry & Accessories",
          "Luxury Sarees & Apparel",
          "Artisan Crafts & Furniture",
          "Shopping, Payments & Returns",
          "Sell on IQVenus (Vendors)"
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSelectCategory = (cat: string) => {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(cat);
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          role: "system",
          text: `Switched context to: ${cat}`,
          timestamp: new Date()
        }
      ]);
      scrollToBottom();
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setMessage("");
    setIsLoading(true);
    scrollToBottom();

    try {
      // Filter conversational history to match backend expectations
      const chatHistory = messages
        .filter(msg => msg.role === "user" || msg.role === "assistant")
        .map(msg => ({
          role: msg.role,
          text: msg.text
        }));

      const payload = {
        message: trimmedMessage,
        category: selectedCategory,
        history: chatHistory
      };

      const response = await api.post('/v1/chatbot/query', payload);

      if (response.data && response.data.success) {
        const replyMsg: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          text: response.data.answer,
          timestamp: new Date()
        };

        if (response.data.category && response.data.category !== selectedCategory) {
          setSelectedCategory(response.data.category);
        }

        setMessages(prev => [...prev, replyMsg]);
      } else {
        throw new Error(response.data.message || "Failed to generate reply");
      }
    } catch (err) {
      console.error("Chatbot query failed:", err);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        text: "Sorry, I am having trouble connecting to support. Please verify your connection and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-4 border-b border-surface-light bg-surface justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <View className="ml-3">
            <Text className="text-lg text-text-primary font-serif">Venus AI Support</Text>
            <View className="flex-row items-center mt-0.5">
              <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />
              <Text className="text-[10px] text-text-tertiary">Online</Text>
            </View>
          </View>
        </View>
        <Ionicons name="planet-outline" size={24} color="#D4AF37" />
      </View>

      {/* CATEGORIES CHIPS */}
      <View className="bg-surface border-b border-surface-light py-2">
        {loadingCategories ? (
          <ActivityIndicator size="small" color="#D4AF37" />
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            className="flex-row"
          >
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelectCategory(cat)}
                  className={`px-3 py-1.5 rounded-full mr-2 border ${
                    isActive 
                      ? 'bg-primary border-primary' 
                      : 'bg-surface-light/35 border-surface-light'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-xs font-sans font-medium ${
                    isActive ? 'text-background' : 'text-text-primary'
                  }`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* CHAT MESSAGES PANEL */}
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 bg-background px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((msg) => {
            if (msg.role === "system") {
              return (
                <View key={msg.id} className="align-self-center my-3 bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-4 py-1.5 rounded-full self-center">
                  <Text className="text-primary text-[10px] font-sans font-semibold uppercase tracking-widest">{msg.text}</Text>
                </View>
              );
            }

            const isUser = msg.role === "user";
            return (
              <View 
                key={msg.id} 
                className={`mb-4 max-w-[82%] ${
                  isUser ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <View 
                  className={`p-3.5 shadow-sm ${
                    isUser 
                      ? 'bg-primary rounded-2xl rounded-tr-none' 
                      : 'bg-surface border border-surface-light rounded-2xl rounded-tl-none'
                  }`}
                  style={isUser ? {} : { borderLeftWidth: 3, borderLeftColor: '#D4AF37' }}
                >
                  <Text className={`text-sm font-sans leading-relaxed ${
                    isUser ? 'text-background font-medium' : 'text-text-primary'
                  }`}>
                    {msg.text}
                  </Text>
                </View>
                <Text className="text-[9px] text-text-tertiary mt-1 px-2">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <View className="self-start items-start mb-4 max-w-[80%]">
              <View className="p-3.5 bg-surface border border-surface-light rounded-2xl rounded-tl-none" style={{ borderLeftWidth: 3, borderLeftColor: '#D4AF37' }}>
                <View className="flex-row items-center gap-1">
                  <ActivityIndicator size="small" color="#D4AF37" style={{ transform: [{ scale: 0.65 }] }} />
                  <Text className="text-xs font-sans text-text-tertiary italic">Venus AI is typing...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* INPUT FOOTER SECTION */}
        <View 
          className="flex-row items-center px-4 py-3 bg-surface border-t border-surface-light"
          style={{ paddingBottom: isKeyboardVisible ? 12 : Math.max(insets.bottom, 16) }}
        >
          <TextInput
            className="flex-1 bg-background border border-surface-light rounded-3xl px-4 py-3 text-text-primary text-sm font-sans"
            placeholder="Ask Venus AI about jewelry, shipping..."
            placeholderTextColor="#888"
            value={message}
            onChangeText={setMessage}
            multiline
            {...({ showsVerticalScrollIndicator: false } as any)}
            maxLength={300}
            style={{ maxHeight: 90, overflow: "hidden" }}
          />
          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={message.trim() === "" || isLoading}
            className={`ml-3 w-11 h-11 rounded-full items-center justify-center shadow-md ${
              message.trim() === "" ? 'bg-surface-light opacity-60' : 'bg-primary'
            }`}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={16} color={message.trim() === "" ? "#A0A0A0" : "#000"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default ChatbotScreen;
