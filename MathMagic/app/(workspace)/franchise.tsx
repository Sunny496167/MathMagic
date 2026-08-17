import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/api";

export default function FranchiseWorkspace() {
  const router = useRouter();
  const { user } = useAuth();
  const api = useApi();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchFranchiseData = async () => {
    try {
      if (!user) return;
      const res = await api.get("/users/franchise/dashboard");
      setDashboardData(res.data);
    } catch (err) {
      // Dashboard may not exist yet; silently fail
      console.error("Franchise dashboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFranchiseData();
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text className="text-text-tertiary font-sans text-xs uppercase tracking-widest mt-4">
          Loading Dashboard...
        </Text>
      </View>
    );
  }

  const stats = [
    { label: "Turnover Volume", value: `₹${dashboardData?.totalLogisticsTurnover || 0}`, icon: "trending-up" },
    { label: "Hub Commission", value: `₹${dashboardData?.totalLogisticsEarnings || 0}`, icon: "wallet-outline" },
    { label: "Active Orders", value: String((dashboardData?.orders || []).length), icon: "cube-outline" },
  ];

  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="flex-row items-center px-5 py-4 bg-surface border-b border-surface-light">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary/10 border border-primary/20 p-2 rounded-xl mr-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#D4AF37" />
        </TouchableOpacity>
        <Text className="text-xl text-text-primary font-serif tracking-wide flex-1">
          Franchise Hub
        </Text>
        <View className="bg-primary/10 border border-primary/30 px-3 py-1 rounded-full flex-row items-center">
          <Ionicons name="git-network-outline" size={11} color="#D4AF37" style={{ marginRight: 4 }} />
          <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">
            Partner
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HUB CARD */}
        {dashboardData?.franchise ? (
          <View className="bg-surface border border-primary/20 rounded-3xl p-5 mb-5">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-text-primary font-serif text-lg font-bold">
                  {dashboardData.franchise.hubName || "Your Hub"}
                </Text>
                <View className="flex-row items-center mt-1.5">
                  <View className="bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg mr-2">
                    <Text className="text-primary font-sans text-[9px] font-bold uppercase tracking-wide">
                      {dashboardData.franchise.tier || "Standard"} Hub
                    </Text>
                  </View>
                </View>
              </View>
              <View className="bg-primary/10 p-3 rounded-2xl">
                <Ionicons name="business-outline" size={24} color="#D4AF37" />
              </View>
            </View>
            <View className="flex-row items-start mt-3 pt-3 border-t border-surface-light">
              <Ionicons name="map-outline" size={14} color="#D4AF37" style={{ marginTop: 2, marginRight: 4 }} />
              <Text className="text-text-secondary text-xs flex-1">
                Coverage: {dashboardData.franchise.coveredArea || "Not specified"}
              </Text>
            </View>
            <View className="flex-row items-center mt-1.5">
              <Ionicons name="cash-outline" size={13} color="#A0A0A0" style={{ marginRight: 4 }} />
              <Text className="text-text-tertiary text-[11px]">
                Setup Fee Paid: ₹{dashboardData.franchise.setupFeePaid || 0}
              </Text>
            </View>
          </View>
        ) : (
          <View className="bg-surface border border-surface-light rounded-3xl p-6 mb-5 items-center">
            <View className="bg-primary/10 p-4 rounded-2xl mb-3">
              <Ionicons name="business-outline" size={32} color="#D4AF37" />
            </View>
            <Text className="text-text-primary font-serif text-lg">Welcome, Partner</Text>
            <Text className="text-text-tertiary text-xs text-center mt-1">
              Your franchise hub details will appear here once your profile is configured.
            </Text>
          </View>
        )}

        {/* STATS GRID */}
        <View className="flex-row flex-wrap gap-3 mb-5">
          {stats.map((stat) => (
            <View
              key={stat.label}
              className="bg-surface border border-surface-light rounded-2xl p-4"
              style={{ width: "47%" }}
            >
              <View className="bg-primary/10 p-2 rounded-xl self-start mb-2">
                <Ionicons name={stat.icon as any} size={16} color="#D4AF37" />
              </View>
              <Text className="text-text-tertiary text-[9px] uppercase tracking-wider font-bold mb-0.5">
                {stat.label}
              </Text>
              <Text className="text-text-primary font-serif text-lg font-bold">{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* HOW IT WORKS */}
        <View className="bg-surface border border-surface-light rounded-3xl p-5 mb-5">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-5 bg-primary rounded-full mr-3" />
            <Text className="text-text-primary font-serif text-lg">Your Benefits</Text>
          </View>
          {[
            { icon: "cash-outline", title: "Commission on Orders", desc: "Earn per order routed through your hub area." },
            { icon: "people-outline", title: "Artisan Network", desc: "Connect local artisans to the IQVenus platform." },
            { icon: "ribbon-outline", title: "Brand Recognition", desc: "Be the face of IQVenus in your territory." },
            { icon: "trending-up-outline", title: "Growth Support", desc: "Marketing & onboarding support from our team." },
          ].map((item, idx) => (
            <View key={idx} className="flex-row items-start mb-4">
              <View className="bg-primary/10 p-2.5 rounded-xl mr-3.5">
                <Ionicons name={item.icon as any} size={16} color="#D4AF37" />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-sans font-semibold text-sm">{item.title}</Text>
                <Text className="text-text-tertiary font-sans text-xs leading-relaxed mt-0.5">{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ROUTED ORDERS */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-text-primary font-serif text-lg">Routed Orders</Text>
            <Text className="text-text-tertiary text-xs">
              {(dashboardData?.orders || []).length} orders
            </Text>
          </View>

          {(!dashboardData?.orders || dashboardData.orders.length === 0) ? (
            <View className="bg-surface border border-surface-light rounded-3xl p-8 items-center">
              <View className="bg-primary/10 p-4 rounded-2xl mb-3">
                <Ionicons name="cube-outline" size={32} color="#D4AF37" />
              </View>
              <Text className="text-text-primary font-serif text-base">No orders yet</Text>
              <Text className="text-text-tertiary text-xs font-sans mt-1">
                Orders routed to your hub will appear here.
              </Text>
            </View>
          ) : (
            dashboardData.orders.map((order: any) => (
              <View
                key={order._id}
                className="bg-surface border border-surface-light rounded-2xl p-4 flex-row justify-between items-center mb-3"
              >
                <View className="flex-1 mr-3">
                  <Text className="text-text-primary font-serif text-sm">#{order.orderId}</Text>
                  <Text className="text-text-secondary text-xs mt-0.5">Amount: ₹{order.totalAmount}</Text>
                  <Text className="text-primary text-[11px] font-bold mt-0.5">
                    Earned: ₹{order.franchiseCommissionEarned || 0}
                  </Text>
                </View>
                <View className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg">
                  <Text className="text-primary font-sans text-[10px] font-bold uppercase tracking-wide">
                    {order.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
