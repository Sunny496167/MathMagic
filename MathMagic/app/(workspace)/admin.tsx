import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/api";

type AdminTab = "overview" | "approvals" | "operations" | "orders";

export default function AdminWorkspace() {
  const router = useRouter();
  const { user } = useAuth();
  const api = useApi();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Action States
  const [processing, setProcessing] = useState(false);
  const [commissionInputs, setCommissionInputs] = useState<Record<string, string>>({});

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const statsRes = await api.get("/admin/stats");
      setStats(statsRes.data);

      const poolRes = await api.get("/admin/leadership/pool");
      setPoolInfo(poolRes.data);

      const vendorsRes = await api.get("/admin/vendors");
      setVendors(vendorsRes.data);

      const productsRes = await api.get("/admin/products");
      setProducts(productsRes.data);

      const commRes = await api.get("/admin/commissions");
      setCategories(commRes.data?.categories || []);

      // Seed initial commission inputs
      const initialInputs: Record<string, string> = {};
      (commRes.data?.categories || []).forEach((c: any) => {
        initialInputs[c._id] = String(c.commission || 0);
      });
      setCommissionInputs(initialInputs);

      const clientsRes = await api.get("/admin/clients");
      setUsersList(clientsRes.data || []);

      const ordersRes = await api.get("/orders").catch(() => ({ data: [] }));
      setAllOrders(ordersRes.data || []);

    } catch (err) {
      console.error("Error loading admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  // Vendor Actions
  const handleApproveVendor = async (vendorId: string) => {
    setProcessing(true);
    try {
      await api.put(`/admin/vendors/${vendorId}/approve`, { isApproved: true });
      Alert.alert("Success", "Vendor approved successfully.");
      fetchAdminData();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to approve vendor.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this vendor workspace?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setProcessing(true);
          try {
            await api.delete(`/admin/vendors/${vendorId}`);
            Alert.alert("Deleted", "Vendor workspace deleted.");
            fetchAdminData();
          } catch (err: any) {
            Alert.alert("Error", "Failed to delete vendor.");
          } finally {
            setProcessing(false);
          }
        },
      },
    ]);
  };

  // Product Actions
  const handleApproveProduct = async (productId: string) => {
    setProcessing(true);
    try {
      await api.put(`/admin/products/${productId}/approve`, { isApproved: true });
      Alert.alert("Success", "Product approved successfully.");
      fetchAdminData();
    } catch (err) {
      Alert.alert("Error", "Failed to approve product.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this product?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setProcessing(true);
          try {
            await api.delete(`/products/${productId}`);
            Alert.alert("Deleted", "Product deleted.");
            fetchAdminData();
          } catch (err) {
            Alert.alert("Error", "Failed to delete product.");
          } finally {
            setProcessing(false);
          }
        },
      },
    ]);
  };

  // User Control
  const handleToggleBlock = async (userId: string) => {
    setProcessing(true);
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      Alert.alert("Success", res.data.message || "User block state updated.");
      fetchAdminData();
    } catch (err) {
      Alert.alert("Error", "Failed to toggle user block status.");
    } finally {
      setProcessing(false);
    }
  };

  // Commission Action
  const handleUpdateCommission = async (catId: string) => {
    const val = Number(commissionInputs[catId]);
    if (isNaN(val) || val < 0 || val > 100) {
      Alert.alert("Error", "Commission must be a percentage between 0 and 100.");
      return;
    }
    setProcessing(true);
    try {
      await api.put(`/admin/commissions/category/${catId}`, { commission: val });
      Alert.alert("Success", "Category commission updated successfully.");
      fetchAdminData();
    } catch (err) {
      Alert.alert("Error", "Failed to update commission.");
    } finally {
      setProcessing(false);
    }
  };

  // Distribute Pool
  const handleDistributePool = async () => {
    if (!poolInfo || poolInfo.qualifiedLeaders?.length === 0) {
      Alert.alert("Notice", "No qualified leaders to distribute the pool to.");
      return;
    }
    Alert.alert(
      "Confirm Payout",
      `Are you sure you want to distribute ₹${poolInfo.poolAmount} among qualified leaders?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Distribute",
          onPress: async () => {
            setProcessing(true);
            try {
              const res = await api.post("/admin/leadership/distribute");
              Alert.alert("Success", res.data.message || "Leadership pool distributed successfully!");
              fetchAdminData();
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.message || "Failed to distribute pool.");
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#D4AF37" />
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
        <Text className="text-xl text-text-primary font-serif tracking-wide">
          Admin Control Center
        </Text>
      </View>
      {/* TAB SELECTORS */}
      <View className="bg-surface border-b border-surface-light py-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {(["overview", "approvals", "operations", "orders"] as AdminTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl border ${
                activeTab === tab
                  ? "bg-primary border-primary"
                  : "bg-surface border-surface-light"
              }`}
            >
              <Text
                className={`text-center font-serif text-xs capitalize ${
                  activeTab === tab ? "text-background font-bold" : "text-primary"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 bg-background px-5 py-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {processing && (
          <View className="bg-primary/10 border border-primary/20 p-3 rounded-2xl mb-4 items-center flex-row justify-center gap-2">
            <ActivityIndicator size="small" color="#D4AF37" />
            <Text className="text-primary text-xs font-sans font-bold">Processing Action...</Text>
          </View>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <View className="gap-y-4">
            {/* STATS TILES */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface border border-surface-light rounded-3xl p-4">
                <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider">Total Sales</Text>
                <Text className="text-2xl text-primary font-serif font-bold mt-1">₹{stats?.totalRevenue || 0}</Text>
              </View>
              <View className="flex-1 bg-surface border border-surface-light rounded-3xl p-4">
                <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider">Subscribed</Text>
                <Text className="text-2xl text-primary font-serif font-bold mt-1">{stats?.subscribedVendorsCount || 0}</Text>
              </View>
            </View>

            {/* POOL INFO */}
            <View className="bg-surface border border-primary/20 rounded-3xl p-5">
              <View className="flex-row items-center mb-3">
                <Ionicons name="trophy-outline" size={20} color="#D4AF37" style={{ marginRight: 8 }} />
                <Text className="text-text-primary font-serif text-base font-bold">Leadership Pool</Text>
              </View>
              <Text className="text-text-secondary text-xs">Accumulated Amount: ₹{poolInfo?.poolAmount || 0}</Text>
              <Text className="text-text-tertiary text-[10px] mt-1">Qualified Leaders: {poolInfo?.qualifiedLeaders?.length || 0}</Text>
              <TouchableOpacity
                onPress={handleDistributePool}
                className="bg-primary mt-4 py-3 rounded-xl items-center"
              >
                <Text className="text-background font-sans font-bold text-xs uppercase">Distribute Pool</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* APPROVALS TAB */}
        {activeTab === "approvals" && (
          <View className="gap-y-4">
            {/* VENDORS */}
            <View>
              <Text className="text-text-primary font-serif text-lg mb-3 pl-1 font-bold">Pending Workspace Approvals</Text>
              {vendors.filter((v) => !v.isApproved).length === 0 ? (
                <View className="bg-surface border border-surface-light rounded-3xl p-6 items-center">
                  <Text className="text-text-tertiary text-xs">No pending vendor workspaces.</Text>
                </View>
              ) : (
                vendors
                  .filter((v) => !v.isApproved)
                  .map((v) => (
                    <View
                      key={v._id}
                      className="bg-surface border border-surface-light rounded-3xl p-4 mb-3"
                    >
                      <Text className="text-text-primary font-sans font-bold text-sm">{v.businessName}</Text>
                      <Text className="text-text-tertiary text-xs mt-0.5">Workspace: {v.workspaceId}</Text>
                      <View className="flex-row gap-2 mt-3">
                        <TouchableOpacity
                          onPress={() => handleApproveVendor(v._id)}
                          className="bg-primary px-4 py-2 rounded-xl flex-1 items-center"
                        >
                          <Text className="text-background font-sans text-xs font-bold uppercase">Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteVendor(v._id)}
                          className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl items-center"
                        >
                          <Text className="text-red-400 font-sans text-xs font-bold uppercase">Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
              )}
            </View>

            {/* PRODUCTS */}
            <View>
              <Text className="text-text-primary font-serif text-lg mb-3 pl-1 font-bold">Product Audits</Text>
              {products.filter((p) => !p.isApproved).length === 0 ? (
                <View className="bg-surface border border-surface-light rounded-3xl p-6 items-center">
                  <Text className="text-text-tertiary text-xs">No pending products to audit.</Text>
                </View>
              ) : (
                products
                  .filter((p) => !p.isApproved)
                  .map((p) => (
                    <View
                      key={p._id}
                      className="bg-surface border border-surface-light rounded-3xl p-4 mb-3"
                    >
                      <Text className="text-text-primary font-sans font-bold text-sm">{p.title}</Text>
                      <Text className="text-text-secondary text-xs mt-0.5">Price: ₹{p.price} · Base: ₹{p.basePrice || p.price}</Text>
                      <View className="flex-row gap-2 mt-3">
                        <TouchableOpacity
                          onPress={() => handleApproveProduct(p._id)}
                          className="bg-primary px-4 py-2 rounded-xl flex-1 items-center"
                        >
                          <Text className="text-background font-sans text-xs font-bold uppercase">Publish</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteProduct(p._id)}
                          className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl items-center"
                        >
                          <Text className="text-red-400 font-sans text-xs font-bold uppercase">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
              )}
            </View>
          </View>
        )}

        {/* OPERATIONS TAB */}
        {activeTab === "operations" && (
          <View className="gap-y-4">
            {/* COMMISSIONS */}
            <View>
              <Text className="text-text-primary font-serif text-lg mb-3 pl-1 font-bold">Category Commissions</Text>
              {categories.length === 0 ? (
                <View className="bg-surface border border-surface-light rounded-3xl p-6 items-center">
                  <Text className="text-text-tertiary text-xs">No categories registered.</Text>
                </View>
              ) : (
                <View className="gap-3">
                  {categories.map((c) => (
                    <View
                      key={c._id}
                      className="bg-surface border border-surface-light rounded-3xl p-4 flex-row justify-between items-center"
                    >
                      <View className="flex-1 mr-3">
                        <Text className="text-text-primary font-sans font-bold text-sm">{c.name}</Text>
                        <Text className="text-text-tertiary text-xs mt-0.5">Current Rate: {c.commission || 0}%</Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <TextInput
                          value={commissionInputs[c._id] || ""}
                          onChangeText={(val) => setCommissionInputs({ ...commissionInputs, [c._id]: val })}
                          keyboardType="numeric"
                          className="bg-background px-3 py-1.5 rounded-lg border border-surface-light text-text-primary font-sans text-xs w-16 text-center"
                          placeholder="%"
                        />
                        <TouchableOpacity
                          onPress={() => handleUpdateCommission(c._id)}
                          className="bg-primary px-3 py-2 rounded-lg"
                        >
                          <Text className="text-background font-sans text-xs font-bold">Update</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* USERS BLOCK MANAGER */}
            <View className="mt-4">
              <Text className="text-text-primary font-serif text-lg mb-3 pl-1 font-bold">User Access Governance</Text>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search users by name or email..."
                className="bg-surface px-4 py-3 rounded-2xl border border-surface-light text-text-primary text-sm font-sans mb-3 h-12"
                placeholderTextColor="#555"
              />
              <View className="gap-3">
                {usersList
                  .filter(
                    (u: any) =>
                      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((u: any) => (
                    <View
                      key={u._id}
                      className="bg-surface border border-surface-light rounded-3xl p-4 flex-row justify-between items-center shadow-sm mb-3"
                    >
                      <View className="flex-1 mr-3">
                        <Text className="text-text-primary font-serif text-sm font-bold">{u.name}</Text>
                        {u.clientProfile?.companyName && (
                          <Text className="text-primary text-[11px] font-bold mt-0.5">
                            Company: {u.clientProfile.companyName}
                          </Text>
                        )}
                        <Text className="text-text-tertiary text-[10px] mt-0.5">{u.email}</Text>
                        {u.clientProfile?.address && (
                          <Text className="text-text-tertiary text-[10px] mt-0.5">
                            Address: {u.clientProfile.address}
                          </Text>
                        )}
                        <Text className="text-text-secondary text-[10px] mt-1 capitalize">Role: {u.role}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleToggleBlock(u._id)}
                        className={`px-3 py-1.5 rounded-lg border ${
                          u.role === "blocked" ? "bg-red-500 border-red-500" : "border-red-500/30 bg-red-500/10"
                        }`}
                      >
                        <Text className={`text-[10px] font-bold ${u.role === "blocked" ? "text-white" : "text-red-500"}`}>
                          {u.role === "blocked" ? "Unblock" : "Block User"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            </View>
          </View>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <View className="gap-y-4">
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-text-primary font-serif text-lg">Global Orders Pool</Text>
              <Text className="text-text-tertiary text-xs">{allOrders.length} total orders</Text>
            </View>

            {allOrders.length === 0 ? (
              <View className="bg-surface border border-surface-light rounded-3xl p-8 items-center">
                <View className="bg-primary/10 p-4 rounded-2xl mb-3">
                  <Ionicons name="cart-outline" size={32} color="#D4AF37" />
                </View>
                <Text className="text-text-primary font-serif text-base">No orders in system</Text>
                <Text className="text-text-tertiary text-xs mt-1 text-center">
                  Orders placed by customers across all vendors will appear here.
                </Text>
              </View>
            ) : (
              allOrders.map((order) => (
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
                    <View className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                      <Text className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  {/* Customer details */}
                  <View className="mb-2">
                    <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider">Customer Details</Text>
                    <Text className="text-text-secondary font-sans text-xs mt-0.5">
                      Name: {order.clientId?.name || order.shippingAddress?.fullName || "Guest Customer"}
                    </Text>
                    <Text className="text-text-secondary font-sans text-xs">
                      Email: {order.clientId?.email || "none"}
                    </Text>
                  </View>

                  {/* Items List */}
                  <View className="mb-3 gap-y-2 border-t border-b border-surface-light/40 py-2.5 my-2.5">
                    <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider mb-1">Products Ordered</Text>
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
                  <View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-text-tertiary font-sans text-xs">Total Amount:</Text>
                      <Text className="text-primary font-serif text-sm font-bold">₹{order.totalAmount}</Text>
                    </View>
                    
                    {order.shippingAddress && (
                      <View className="bg-background rounded-xl p-3 border border-surface-light mt-1">
                        <Text className="text-text-secondary font-sans text-xs font-bold mb-1">
                          Delivery Destination:
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
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
