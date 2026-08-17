import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";
import EditProductModal from "@/components/EditProductModal";

type VendorTab = "overview" | "orders" | "products" | "artisans";

export default function VendorWorkspace() {
  const router = useRouter();
  const { user } = useAuth();
  const api = useApi();

  const [activeTab, setActiveTab] = useState<VendorTab>("overview");
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [artisans, setArtisans] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [submittingRenew, setSubmittingRenew] = useState(false);

  // Ad Campaign State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [adBudget, setAdBudget] = useState("");
  const [submittingAd, setSubmittingAd] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Product Edit State
  const [selectedEditProduct, setSelectedEditProduct] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const fetchVendorData = async () => {
    try {
      if (!user) return;
      const vendorRes = await api.get(`/vendors/user/${user._id || user.id}`);
      const vendorData = vendorRes.data;
      setVendor(vendorData);

      const [analyticsRes, productsRes, artisansRes, campaignsRes, ordersRes] = await Promise.all([
        api.get(`/vendors/${vendorData._id}/profit-analytics`).catch(() => ({ data: null })),
        api.get(`/products?vendorId=${vendorData._id}`),
        api.get(`/vendors/${vendorData._id}/artisans`).catch(() => ({ data: [] })),
        api.get(`/ads/vendor/${vendorData._id}`).catch(() => ({ data: [] })),
        api.get(`/orders?vendorId=${vendorData._id}`).catch(() => ({ data: [] })),
      ]);

      setAnalytics(analyticsRes.data);
      setProducts(productsRes.data || []);
      setArtisans(artisansRes.data || []);
      setCampaigns(campaignsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Error fetching vendor data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, [user]);

  const handleRenewSubscription = async () => {
    if (!vendor) return;
    try {
      setSubmittingRenew(true);
      const res = await api.post("/vendors/subscribe-wallet", { vendorId: vendor._id });
      Alert.alert("Success", res.data.message);
      fetchVendorData();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to renew subscription.");
    } finally {
      setSubmittingRenew(false);
    }
  };

  const handleToggleArtisan = async (artisanId: string, currentStatus: boolean) => {
    if (!vendor) return;
    try {
      await api.put(`/vendors/${vendor._id}/artisans/${artisanId}/approve`, {
        isApproved: !currentStatus,
      });
      Alert.alert("Success", `Artisan ${!currentStatus ? "Approved" : "Unapproved"} successfully.`);
      fetchVendorData();
    } catch {
      Alert.alert("Error", "Failed to update artisan status.");
    }
  };

  const handleDeleteProduct = (productId: string, title: string) => {
    Alert.alert("Remove Product", `Remove "${title}" from your catalog?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/products/${productId}`);
            fetchVendorData();
          } catch {
            Alert.alert("Error", "Could not remove product.");
          }
        },
      },
    ]);
  };

  const handleToggleProductApproval = async (productId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      await api.put(`/products/${productId}`, { isApproved: !currentStatus });
      Alert.alert("Success", `Product approval ${!currentStatus ? 'granted' : 'revoked'} successfully.`);
      fetchVendorData();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to update product approval status.");
      setLoading(false);
    }
  };

  const handleSaveProductEdit = async (updatedData: any) => {
    if (!selectedEditProduct) return;
    try {
      await api.put(`/products/${selectedEditProduct._id}`, updatedData);
      Alert.alert("Success", "Product details updated successfully.");
      fetchVendorData();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to update product.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true);
      await api.put(`/orders/${orderId}`, { status: newStatus });
      Alert.alert("Success", `Order status updated to ${newStatus} successfully.`);
      fetchVendorData();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to update order status.");
      setLoading(false);
    }
  };

  const handleLaunchAd = async () => {
    if (!vendor || !selectedProductId || !adBudget) {
      Alert.alert("Error", "Please select a product and input budget.");
      return;
    }
    const budget = Number(adBudget);
    if (isNaN(budget) || budget < 100) {
      Alert.alert("Error", "Minimum campaign budget is ₹100.");
      return;
    }
    setSubmittingAd(true);
    try {
      await api.post("/ads/create", {
        vendorId: vendor._id,
        productId: selectedProductId,
        budgetTotal: budget,
      });
      Alert.alert("Success", "CPC Ad Campaign started successfully! Product is now sponsored and will show at the top.");
      setSelectedProductId("");
      setAdBudget("");
      fetchVendorData();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Campaign Failed", err.response?.data?.message || err.response?.data?.error || "Failed to launch campaign.");
    } finally {
      setSubmittingAd(false);
    }
  };

  const handleToggleCampaign = async (campaignId: string) => {
    try {
      const res = await api.put(`/ads/${campaignId}/toggle`);
      Alert.alert("Success", res.data.message);
      fetchVendorData();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Failed to update campaign status.");
    }
  };

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

  const tabs: { key: VendorTab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "grid-outline" },
    { key: "orders", label: "Orders", icon: "cart-outline" },
    { key: "products", label: "Products", icon: "bag-outline" },
    { key: "artisans", label: "Artisans", icon: "people-outline" },
  ];

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
      {/* HEADER */}
      <View className="flex-row items-center px-5 py-4 bg-surface border-b border-surface-light">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary/10 border border-primary/20 p-2 rounded-xl mr-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#D4AF37" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl text-text-primary font-serif tracking-wide">
            Vendor Dashboard
          </Text>
          {vendor && (
            <Text className="text-text-tertiary text-[10px] uppercase tracking-wider font-bold">
              {vendor.businessName}
            </Text>
          )}
        </View>
        {vendor?.isSubscribed ? (
          <View className="bg-primary/10 border border-primary/30 px-3 py-1 rounded-full flex-row items-center">
            <Ionicons name="checkmark-circle" size={12} color="#D4AF37" style={{ marginRight: 3 }} />
            <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">Active</Text>
          </View>
        ) : (
          <View className="bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
            <Text className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Inactive</Text>
          </View>
        )}
      </View>

      {/* TAB BAR */}
      <View className="bg-surface border-b border-surface-light py-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-row items-center px-4 py-2 rounded-xl ${
                activeTab === tab.key ? "bg-primary/10 border border-primary/30" : ""
              }`}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon as any}
                size={14}
                color={activeTab === tab.key ? "#D4AF37" : "#A0A0A0"}
                style={{ marginRight: 4 }}
              />
              <Text
                className={`font-sans text-[11px] font-bold uppercase tracking-wider ${
                  activeTab === tab.key ? "text-primary" : "text-text-tertiary"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* VERIFICATION & WORKSPACE STATUS */}
            <View className="bg-surface border border-surface-light rounded-3xl p-5 mb-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-text-primary font-serif text-base font-bold">Verification Status</Text>
                  
                  <View className="flex-row items-center mt-2">
                    <Text className="text-text-secondary text-xs">Status: </Text>
                    <View className={`px-2 py-0.5 rounded border ${
                      vendor?.isApproved
                        ? "bg-primary/10 border-primary/20"
                        : "bg-orange-500/10 border-orange-500/20"
                    }`}>
                      <Text className={`font-sans text-[9px] font-bold uppercase tracking-wider ${
                        vendor?.isApproved ? "text-primary" : "text-orange-500"
                      }`}>
                        {vendor?.isApproved ? "Verified & Live" : "Awaiting Verification"}
                      </Text>
                    </View>
                  </View>

                  {vendor?.isApproved && vendor?.workspaceId ? (
                    <TouchableOpacity
                      onPress={() => {
                        Clipboard.setString(vendor.workspaceId);
                        Alert.alert("Copied", "Workspace ID copied to clipboard!");
                      }}
                      className="flex-row items-center mt-3.5 gap-1.5"
                      activeOpacity={0.7}
                    >
                      <Text className="text-primary font-sans text-xs font-extrabold">
                        Workspace ID: {vendor.workspaceId}
                      </Text>
                      <Ionicons name="copy-outline" size={14} color="#D4AF37" />
                    </TouchableOpacity>
                  ) : (
                    <Text className="text-text-tertiary font-sans text-[10px] leading-relaxed mt-3">
                      Your workspace ID will be activated once your vendor profile is approved by our audit team.
                    </Text>
                  )}
                </View>
                <View className="bg-primary/10 p-3 rounded-2xl">
                  <Ionicons
                    name={vendor?.isApproved ? "checkmark-circle-outline" : "hourglass-outline"}
                    size={24}
                    color="#D4AF37"
                  />
                </View>
              </View>
            </View>
            {/* SUBSCRIPTION STATUS */}
            <View className={`rounded-3xl p-5 mb-5 border ${
              vendor?.isSubscribed
                ? "bg-primary/5 border-primary/20"
                : "bg-red-500/5 border-red-500/20"
            }`}>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className={`p-2.5 rounded-2xl mr-3 ${vendor?.isSubscribed ? "bg-primary/10" : "bg-red-500/10"}`}>
                    <Ionicons
                      name={vendor?.isSubscribed ? "shield-checkmark" : "shield-outline"}
                      size={22}
                      color={vendor?.isSubscribed ? "#D4AF37" : "#EF4444"}
                    />
                  </View>
                  <View>
                    <Text className={`font-serif text-base font-bold ${vendor?.isSubscribed ? "text-primary" : "text-red-400"}`}>
                      {vendor?.isSubscribed ? "Subscription Active" : "Subscription Inactive"}
                    </Text>
                    <Text className="text-text-tertiary text-[10px] uppercase tracking-wider font-bold">
                      {vendor?.subscriptionStatus || "none"}
                    </Text>
                  </View>
                </View>
              </View>
              {!vendor?.isSubscribed && (
                <TouchableOpacity
                  onPress={handleRenewSubscription}
                  disabled={submittingRenew}
                  className="bg-primary py-3 rounded-2xl items-center"
                  activeOpacity={0.85}
                >
                  {submittingRenew ? (
                    <ActivityIndicator size="small" color="#0B0B0B" />
                  ) : (
                    <Text className="text-background font-bold text-xs uppercase tracking-widest">
                      Renew via Wallet
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* STATS GRID */}
            <View className="flex-row flex-wrap gap-3 mb-5">
              {[
                { label: "Total Products", value: String(products.length), icon: "bag-outline" },
                { label: "Artisans", value: String(artisans.length), icon: "people-outline" },
                { label: "Total Revenue", value: `₹${analytics?.totalRevenue || 0}`, icon: "trending-up" },
                { label: "Net Profit", value: `₹${analytics?.netProfit || 0}`, icon: "wallet-outline" },
              ].map((stat) => (
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

            {/* BUSINESS INFO */}
            {vendor && (
              <View className="bg-surface border border-surface-light rounded-3xl p-5 mb-5">
                <View className="flex-row items-center mb-4">
                  <View className="w-1 h-5 bg-primary rounded-full mr-3" />
                  <Text className="text-text-primary font-serif text-lg">Business Details</Text>
                </View>
                {[
                  { icon: "business-outline", label: vendor.businessName },
                  { icon: "mail-outline", label: vendor.email || "—" },
                  { icon: "location-outline", label: typeof vendor.location === "object" && vendor.location ? `${vendor.location.city || ""}, ${vendor.location.state || ""}`.replace(/^,\s*|\s*,\s*$/g, "") || "Location not set" : vendor.location || "Location not set" },
                  { icon: "star-outline", label: `Rating: ${vendor.rating || "N/A"}` },
                ].map((row, idx) => (
                  <View key={idx} className="flex-row items-center mb-3">
                    <Ionicons name={row.icon as any} size={15} color="#D4AF37" style={{ marginRight: 10 }} />
                    <Text className="text-text-secondary font-sans text-sm flex-1">{row.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* AD CAMPAIGN CONTROL BOARD */}
            <View className="bg-surface border border-surface-light rounded-3xl p-5 mb-5">
              <View className="flex-row items-center mb-4">
                <View className="w-1 h-5 bg-primary rounded-full mr-3" />
                <Text className="text-text-primary font-serif text-lg">CPC Sponsored Campaigns</Text>
              </View>

              {/* Active Campaigns List */}
              {campaigns.length > 0 && (
                <View className="mb-5 gap-3">
                  <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider">Active Campaigns</Text>
                  {campaigns.map((c) => {
                    const progress = c.budgetTotal > 0 ? Math.min(100, Math.round((c.budgetSpent / c.budgetTotal) * 100)) : 0;
                    const isExhausted = c.budgetSpent >= c.budgetTotal;
                    const clicks = c.clicks || 0;

                    return (
                      <View key={c._id} className="bg-background border border-surface-light rounded-2xl p-4">
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1 mr-2">
                            <Text className="text-text-primary font-sans font-bold text-sm" numberOfLines={1}>
                              {c.productId?.title || "Sponsored Item"}
                            </Text>
                            <Text className="text-text-tertiary text-[9px] mt-0.5 uppercase tracking-wide">
                              CPC Campaign
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleToggleCampaign(c._id)}
                            disabled={isExhausted}
                            className={`px-3 py-1 rounded-xl border ${
                              isExhausted
                                ? "bg-background border-surface-light"
                                : c.isActive
                                ? "bg-primary/10 border-primary/20"
                                : "bg-orange-500/10 border-orange-500/20"
                            }`}
                          >
                            <Text
                              className={`text-[10px] font-bold ${
                                isExhausted
                                  ? "text-text-tertiary"
                                  : c.isActive
                                  ? "text-primary"
                                  : "text-orange-500"
                              }`}
                            >
                              {isExhausted ? "Exhausted" : c.isActive ? "Pause Ad" : "Resume Ad"}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Progress Bar */}
                        <View className="mt-3">
                          <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-text-secondary text-[10px]">
                              Budget Spent: ₹{c.budgetSpent || 0} / ₹{c.budgetTotal}
                            </Text>
                            <Text className="text-primary text-[10px] font-bold">{clicks} Clicks ({progress}%)</Text>
                          </View>
                          <View className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                            <View
                              className={`h-full rounded-full ${isExhausted ? "bg-orange-500" : "bg-primary"}`}
                              style={{ width: `${progress}%` }}
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Create New Campaign Form */}
              <View className="pt-2 border-t border-surface-light">
                <Text className="text-text-primary font-serif text-sm font-bold mb-1">Launch New Sponsored Ads</Text>
                <Text className="text-text-tertiary text-[10px] leading-relaxed mb-4">
                  Sponsored products gain premium placement at the top of shop grids and search results.
                </Text>

                <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider mb-2">1. Select Product</Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {products.length === 0 ? (
                    <Text className="text-text-secondary text-xs italic">No catalog products to sponsor.</Text>
                  ) : (
                    products.map((p) => (
                      <TouchableOpacity
                        key={p._id}
                        onPress={() => setSelectedProductId(p._id)}
                        className={`px-3 py-2 rounded-xl border ${
                          selectedProductId === p._id
                            ? "bg-primary/10 border-primary/40"
                            : "bg-background border-surface-light"
                        }`}
                      >
                        <Text className="text-xs text-text-primary font-sans">
                          {p.title} {p.isSponsored && "⭐"}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>

                <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider mb-2">2. Set Campaign Budget</Text>
                <TextInput
                  value={adBudget}
                  onChangeText={setAdBudget}
                  keyboardType="number-pad"
                  placeholder="Enter Ad Budget in ₹ (min ₹100)"
                  placeholderTextColor="#555"
                  className="bg-background px-4 py-3 rounded-xl border border-surface-light text-text-primary text-sm font-sans mb-4 h-12"
                />

                <TouchableOpacity
                  onPress={handleLaunchAd}
                  disabled={submittingAd}
                  className="bg-primary py-3.5 rounded-2xl items-center shadow-lg shadow-black/50"
                  activeOpacity={0.8}
                >
                  {submittingAd ? (
                    <ActivityIndicator color="#0B0B0B" />
                  ) : (
                    <Text className="text-background font-serif font-bold text-sm">Launch Sponsored Campaign</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <View>
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-text-primary font-serif text-lg">Order Management</Text>
              <Text className="text-text-tertiary text-xs">{orders.length} orders</Text>
            </View>

            {orders.length === 0 ? (
              <View className="bg-surface border border-surface-light rounded-3xl p-8 items-center">
                <View className="bg-primary/10 p-4 rounded-2xl mb-3">
                  <Ionicons name="cart-outline" size={32} color="#D4AF37" />
                </View>
                <Text className="text-text-primary font-serif text-base">No orders received yet</Text>
                <Text className="text-text-tertiary text-xs mt-1 text-center">
                  Orders placed by customers for your workspace items will appear here.
                </Text>
              </View>
            ) : (
              orders.map((order) => (
                <View
                  key={order._id}
                  className="bg-surface border border-surface-light rounded-2xl p-4 mb-4"
                >
                  {/* Order Meta */}
                  <View className="flex-row justify-between items-center pb-3 border-b border-surface-light mb-3">
                    <View>
                      <Text className="text-text-primary font-sans font-semibold text-sm">
                        Order #{order.orderId || order._id.slice(-6).toUpperCase()}
                      </Text>
                      <Text className="text-text-tertiary text-[10px] mt-0.5">
                        {new Date(order.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-primary/10 border border-primary/20' : 'bg-orange-500/10 border border-orange-500/20'
                    }`}>
                      <Text className={`text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'delivered' ? 'text-primary' : 'text-orange-500'
                      }`}>
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  {/* Items List */}
                  <View className="mb-3 gap-y-2">
                    {order.items?.map((item: any, idx: number) => (
                      <View key={item._id || idx} className="flex-row justify-between items-center">
                        <Text className="text-text-secondary font-sans text-xs flex-1 mr-2" numberOfLines={1}>
                          {item.productId?.title || "Item"} x{item.quantity}
                        </Text>
                        <Text className="text-text-primary font-sans text-xs font-semibold">
                          ₹{item.price * item.quantity}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Total & Shipping Info */}
                  <View className="pt-3 border-t border-surface-light">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-text-tertiary font-sans text-xs">Total Amount:</Text>
                      <Text className="text-primary font-serif text-sm font-bold">₹{order.totalAmount}</Text>
                    </View>
                    
                    {order.shippingAddress && (
                      <View className="bg-background rounded-xl p-3 border border-surface-light mb-3">
                        <Text className="text-text-secondary font-sans text-xs font-bold mb-1">
                          Shipping Address:
                        </Text>
                        <Text className="text-text-tertiary font-sans text-[11px]">
                          {order.shippingAddress.fullName || order.shippingAddress.addressLine}
                        </Text>
                        <Text className="text-text-tertiary font-sans text-[11px]">
                          {order.shippingAddress.streetAddress || order.shippingAddress.address}
                        </Text>
                        <Text className="text-text-tertiary font-sans text-[11px]">
                          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip || order.shippingAddress.pincode}
                        </Text>
                        {(order.shippingAddress.phoneNumber || order.shippingAddress.phone) && (
                          <Text className="text-text-tertiary font-sans text-[11px] mt-0.5">
                            📞 {order.shippingAddress.phoneNumber || order.shippingAddress.phone}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Status Update Actions */}
                    <View className="flex-row gap-2 flex-wrap">
                      {order.status === 'pending' && (
                        <TouchableOpacity
                          onPress={() => handleUpdateOrderStatus(order._id, 'accepted')}
                          className="bg-primary px-3 py-1.5 rounded-lg flex-1 justify-center items-center"
                          activeOpacity={0.7}
                        >
                          <Text className="text-background font-sans text-[10px] font-bold uppercase">Accept Order</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'accepted' && (
                        <TouchableOpacity
                          onPress={() => handleUpdateOrderStatus(order._id, 'processing')}
                          className="bg-primary px-3 py-1.5 rounded-lg flex-1 justify-center items-center"
                          activeOpacity={0.7}
                        >
                          <Text className="text-background font-sans text-[10px] font-bold uppercase">Start Processing</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'processing' && (
                        <TouchableOpacity
                          onPress={() => handleUpdateOrderStatus(order._id, 'shipped')}
                          className="bg-primary px-3 py-1.5 rounded-lg flex-1 justify-center items-center"
                          activeOpacity={0.7}
                        >
                          <Text className="text-background font-sans text-[10px] font-bold uppercase">Mark Shipped</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'shipped' && (
                        <TouchableOpacity
                          onPress={() => handleUpdateOrderStatus(order._id, 'delivered')}
                          className="bg-primary px-3 py-1.5 rounded-lg flex-1 justify-center items-center"
                          activeOpacity={0.7}
                        >
                          <Text className="text-background font-sans text-[10px] font-bold uppercase">Mark Delivered</Text>
                        </TouchableOpacity>
                      )}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <TouchableOpacity
                          onPress={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                          className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg justify-center items-center"
                          activeOpacity={0.7}
                        >
                          <Text className="text-red-400 font-sans text-[10px] font-bold uppercase">Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <View>
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-text-primary font-serif text-lg">Catalog</Text>
              <Text className="text-text-tertiary text-xs">{products.length} products</Text>
            </View>

            {products.length === 0 ? (
              <View className="bg-surface border border-surface-light rounded-3xl p-8 items-center">
                <View className="bg-primary/10 p-4 rounded-2xl mb-3">
                  <Ionicons name="bag-outline" size={32} color="#D4AF37" />
                </View>
                <Text className="text-text-primary font-serif text-base">No products yet</Text>
                <Text className="text-text-tertiary text-xs mt-1">
                  Products migrated or created will appear here.
                </Text>
              </View>
            ) : (
              products.map((product) => (
                <View
                  key={product._id}
                  className="bg-surface border border-surface-light rounded-2xl flex-row items-center p-3 mb-3"
                >
                  <View className="w-16 h-16 rounded-xl overflow-hidden bg-surface-light mr-3">
                    {product.images?.[0] ? (
                      <Image
                        source={{ uri: resolveImageUrl(product.images[0]) }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="image-outline" size={24} color="#555" />
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-sans font-semibold text-sm" numberOfLines={1}>
                      {product.title}
                    </Text>
                    <View className="flex-row items-center mt-0.5 gap-1.5 flex-wrap">
                      <Text className="text-text-tertiary text-[10px] uppercase tracking-wider">
                        {product.category}
                      </Text>
                      {product.artisanId && (
                        <>
                          <Text className="text-text-tertiary text-[10px]">·</Text>
                          <View className="bg-primary/10 px-1.5 py-0.5 rounded-md">
                            <Text className="text-primary text-[8px] font-bold uppercase">Artisan</Text>
                          </View>
                          <Text className="text-text-tertiary text-[10px]">·</Text>
                          <Text className={`text-[9px] font-bold ${product.isApproved ? "text-primary" : "text-orange-500"}`}>
                            {product.isApproved ? "Live" : "Pending Approval"}
                          </Text>
                        </>
                      )}
                    </View>
                    <Text className="text-primary font-serif text-sm font-bold mt-0.5">
                      ₹{product.price}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {product.artisanId && (
                      <TouchableOpacity
                        onPress={() => handleToggleProductApproval(product._id, product.isApproved)}
                        className={`p-2 rounded-xl border mr-2 ${
                          product.isApproved ? "border-orange-500/30 bg-orange-500/10" : "border-primary/30 bg-primary/10"
                        }`}
                        activeOpacity={0.7}
                      >
                        <Ionicons name={product.isApproved ? "close-circle-outline" : "checkmark-circle-outline"} size={16} color={product.isApproved ? "#F97316" : "#D4AF37"} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedEditProduct(product);
                        setEditModalVisible(true);
                      }}
                      className="bg-primary/10 border border-primary/20 p-2 rounded-xl"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={16} color="#D4AF37" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteProduct(product._id, product.title)}
                      className="bg-red-500/10 p-2 rounded-xl ml-2"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ARTISANS TAB */}
        {activeTab === "artisans" && (
          <View>
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-text-primary font-serif text-lg">Linked Artisans</Text>
              <Text className="text-text-tertiary text-xs">{artisans.length} artisans</Text>
            </View>

            {artisans.length === 0 ? (
              <View className="bg-surface border border-surface-light rounded-3xl p-8 items-center">
                <View className="bg-primary/10 p-4 rounded-2xl mb-3">
                  <Ionicons name="people-outline" size={32} color="#D4AF37" />
                </View>
                <Text className="text-text-primary font-serif text-base">No artisans linked</Text>
                <Text className="text-text-tertiary text-xs mt-1">
                  Artisans who join your workspace will appear here.
                </Text>
              </View>
            ) : (
              artisans.map((artisan) => (
                <View
                  key={artisan._id}
                  className="bg-surface border border-surface-light rounded-2xl p-4 flex-row justify-between items-center mb-3"
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-text-primary font-sans font-semibold text-sm">
                      {artisan.name || artisan.email}
                    </Text>
                    <Text className="text-text-tertiary text-[10px] mt-0.5">{artisan.email}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleToggleArtisan(artisan._id, artisan.isApprovedByVendor)}
                    className={`px-3 py-1.5 rounded-xl ${
                      artisan.isApprovedByVendor
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-surface-light border border-surface-light"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text className={`font-sans text-[10px] font-bold uppercase tracking-wide ${
                      artisan.isApprovedByVendor ? "text-primary" : "text-text-tertiary"
                    }`}>
                      {artisan.isApprovedByVendor ? "Approved" : "Approve"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* ARTISAN PRODUCT AUDITS */}
            <View className="mt-8 pt-6 border-t border-surface-light">
              <Text className="text-text-primary font-serif text-lg mb-3 pl-1 font-bold">Artisan Product Audits</Text>
              {products.filter(p => p.artisanId).length === 0 ? (
                <View className="bg-surface border border-surface-light rounded-3xl p-6 items-center">
                  <Text className="text-text-tertiary text-xs font-sans">No artisan products submitted yet.</Text>
                </View>
              ) : (
                <View className="space-y-3">
                  {products.filter(p => p.artisanId).map((p) => (
                    <View
                      key={p._id}
                      className="bg-surface border border-surface-light rounded-3xl p-4 flex-row justify-between items-center mb-3"
                    >
                      <View className="flex-1 mr-3">
                        <Text className="text-text-primary font-sans font-semibold text-sm">{p.title}</Text>
                        <Text className="text-text-secondary text-xs mt-0.5">Price: ₹{p.price} · Stock: {p.stock}</Text>
                        <Text className="text-text-secondary text-[10px] mt-1">
                          Status:{" "}
                          <Text className={p.isApproved ? "text-primary font-bold" : "text-orange-500 font-bold"}>
                            {p.isApproved ? "Approved & Live" : "Pending Verification"}
                          </Text>
                        </Text>
                      </View>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedEditProduct(p);
                            setEditModalVisible(true);
                          }}
                          className="bg-primary/10 border border-primary/20 px-3.5 py-2 rounded-xl justify-center"
                          activeOpacity={0.7}
                        >
                          <Text className="text-[10px] font-bold text-primary">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleToggleProductApproval(p._id, p.isApproved)}
                          className={`px-3.5 py-2 rounded-xl border justify-center ${
                            p.isApproved ? "border-orange-500/30 bg-orange-500/10" : "border-primary/30 bg-primary/10"
                          }`}
                          activeOpacity={0.7}
                        >
                          <Text className={`text-[10px] font-bold ${p.isApproved ? "text-orange-400" : "text-primary"}`}>
                            {p.isApproved ? "Revoke" : "Approve"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>

      <EditProductModal
        visible={editModalVisible}
        product={selectedEditProduct}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedEditProduct(null);
        }}
        onSave={handleSaveProductEdit}
      />
    </SafeScreen>
  );
}
