import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/api";

export default function ClientWorkspace() {
  const router = useRouter();
  const { user } = useAuth();
  const api = useApi();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchClientData = async () => {
    try {
      if (!user) return;
      const profRes = await api.get(`/auth/profile/${user._id || user.id}`);
      setProfile(profRes.data);
      const currentUserId = user._id || user.id;
      const orderRes = await api.get(`/orders?userId=${currentUserId}`);
      setOrders(orderRes.data || []);
    } catch (err) {
      console.error("Error fetching client dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [user]);

  const handleOpenInvoice = (order: any) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text className="text-text-tertiary font-sans text-xs uppercase tracking-widest mt-4">
          Loading Portal...
        </Text>
      </View>
    );
  }

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
          Client Portal
        </Text>
        <View className="bg-primary/10 border border-primary/30 px-3 py-1 rounded-full flex-row items-center">
          <Ionicons name="checkmark-circle" size={13} color="#D4AF37" style={{ marginRight: 4 }} />
          <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">
            Verified
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-background px-5 py-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE CARD */}
        {profile && (
          <View className="bg-surface border border-surface-light rounded-3xl p-5 mb-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-text-primary font-serif text-lg flex-1 mr-2">
                {profile.clientProfile?.companyName || `${profile.name} Account`}
              </Text>
              <View className="bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                <Text className="text-primary font-sans text-[9px] font-bold uppercase tracking-wide">
                  B2B Client
                </Text>
              </View>
            </View>
            <View className="flex-row items-start mt-1">
              <Ionicons name="location-outline" size={14} color="#D4AF37" style={{ marginTop: 2, marginRight: 4 }} />
              <Text className="text-text-secondary text-xs font-sans flex-1">
                {profile.clientProfile?.address || "No registered address"}
              </Text>
            </View>
            <View className="flex-row items-center mt-2 pt-2 border-t border-surface-light">
              <Ionicons name="mail-outline" size={13} color="#A0A0A0" style={{ marginRight: 4 }} />
              <Text className="text-text-tertiary text-[11px] font-sans">
                {profile.email}
              </Text>
            </View>
          </View>
        )}

        {/* EXCLUSIVE PRICING CARD */}
        <View className="bg-surface border border-primary/20 rounded-3xl p-5 mb-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-primary/10 p-2.5 rounded-xl mr-3">
              <Ionicons name="pricetags" size={20} color="#D4AF37" />
            </View>
            <View className="flex-1">
              <Text className="text-primary font-serif text-base font-bold">Exclusive Pricing Active</Text>
              <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider">
                Artisan Direct — Up to 25% Off
              </Text>
            </View>
          </View>
          <Text className="text-text-secondary text-xs leading-5">
            Your account unlocks direct artisan-sourced rates across all IQVenus collections including jewelry, sarees, crafts and more.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            activeOpacity={0.8}
            className="bg-primary mt-4 py-3 px-4 rounded-2xl flex-row items-center justify-center"
          >
            <Ionicons name="bag-outline" size={17} color="#0B0B0B" style={{ marginRight: 6 }} />
            <Text className="text-background font-bold text-xs uppercase tracking-widest">
              Browse Exclusive Catalog
            </Text>
          </TouchableOpacity>
        </View>

        {/* STATS ROW */}
        <View className="flex-row gap-3 mb-5">
          {[
            { label: "Total Orders", value: String(orders.length), icon: "receipt-outline" },
            { label: "Total Spent", value: `₹${orders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0)}`, icon: "wallet-outline" },
          ].map((stat) => (
            <View key={stat.label} className="flex-1 bg-surface border border-surface-light rounded-2xl p-4">
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

        {/* INVOICES */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-text-primary font-serif text-lg">Purchase History</Text>
            <Text className="text-text-tertiary text-xs font-sans">{orders.length} orders</Text>
          </View>

          {orders.length === 0 ? (
            <View className="bg-surface border border-surface-light rounded-3xl p-8 items-center">
              <View className="bg-primary/10 p-4 rounded-2xl mb-3">
                <Ionicons name="document-text-outline" size={32} color="#D4AF37" />
              </View>
              <Text className="text-text-primary font-serif text-base">No purchases yet</Text>
              <Text className="text-text-tertiary text-xs font-sans mt-1">
                Start exploring the exclusive catalog.
              </Text>
            </View>
          ) : (
            orders.map((order) => (
              <TouchableOpacity
                key={order._id}
                onPress={() => handleOpenInvoice(order)}
                activeOpacity={0.7}
                className="bg-surface border border-surface-light rounded-3xl p-4 flex-row justify-between items-center mb-3"
              >
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="receipt-outline" size={14} color="#D4AF37" style={{ marginRight: 4 }} />
                    <Text className="text-text-primary font-serif text-sm">
                      #{order.orderId || order._id?.substring(0, 8)}
                    </Text>
                  </View>
                  <Text className="text-text-secondary text-xs font-bold">₹{order.totalAmount}</Text>
                  <Text className="text-text-tertiary text-[10px] mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View className="items-end">
                  <View className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg mb-1">
                    <Text className="text-primary font-sans text-[10px] font-bold uppercase tracking-wide">
                      {order.status}
                    </Text>
                  </View>
                  <Text className="text-text-tertiary text-[10px]">View ›</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* INVOICE MODAL */}
      <Modal
        visible={showInvoiceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInvoiceModal(false)}
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-surface rounded-t-3xl p-6 max-h-[85%]">
            <View className="flex-row justify-between items-center pb-4 border-b border-surface-light mb-4">
              <View>
                <Text className="text-text-primary font-serif text-lg">
                  Order #{selectedOrder?.orderId || selectedOrder?._id?.substring(0, 8)}
                </Text>
                <Text className="text-text-tertiary text-xs">
                  {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleString() : ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowInvoiceModal(false)}
                className="bg-surface-light p-2 rounded-full"
              >
                <Ionicons name="close" size={20} color="#EAEAEA" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-primary text-xs font-bold uppercase mb-2">Billed To</Text>
                <Text className="text-text-primary font-bold text-sm">
                  {profile?.clientProfile?.companyName || profile?.name}
                </Text>
                <Text className="text-text-secondary text-xs mt-0.5">{profile?.email}</Text>
              </View>

              <View className="mb-4">
                <Text className="text-text-primary font-bold text-sm mb-2">Items</Text>
                {(selectedOrder?.items || []).map((item: any, idx: number) => (
                  <View key={idx} className="flex-row justify-between items-center py-2 border-b border-surface-light">
                    <View className="flex-1 mr-2">
                      <Text className="text-text-primary font-bold text-xs">
                        {item.name || item.product?.title || `Item #${idx + 1}`}
                      </Text>
                      <Text className="text-text-tertiary text-[10px]">
                        Qty: {item.quantity} × ₹{item.price}
                      </Text>
                    </View>
                    <Text className="text-text-primary font-bold text-xs">
                      ₹{item.price * item.quantity}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="bg-surface-light rounded-2xl p-4 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-text-secondary text-xs">Subtotal</Text>
                  <Text className="text-text-primary font-bold text-xs">₹{selectedOrder?.totalAmount || 0}</Text>
                </View>
                <View className="flex-row justify-between pt-2 border-t border-surface-light">
                  <Text className="text-text-primary font-bold text-sm">Total Paid</Text>
                  <Text className="text-primary font-serif font-bold text-base">₹{selectedOrder?.totalAmount || 0}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}
