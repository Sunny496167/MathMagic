import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";
import * as ImagePicker from "expo-image-picker";
import EditProductModal from "@/components/EditProductModal";

export default function ArtisanWorkspace() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const api = useApi();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Edit State
  const [selectedEditProduct, setSelectedEditProduct] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const fetchArtisanData = async () => {
    try {
      if (!user) return;
      const userRes = await api.get("/auth/check").catch(() => null);
      if (userRes && userRes.data) {
        setUser(userRes.data);
      }
      const catRes = await api.get("/categories");
      setCategories(catRes.data || []);
      if (catRes.data?.length > 0) {
        setCategory((prevCategory) => prevCategory || catRes.data[0].name || catRes.data[0]._id);
      }
      const prodRes = await api.get(`/products?artisanId=${user._id || user.id}`);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error("Error fetching artisan data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisanData();
  }, [user]);

  const handleListProduct = async () => {
    if (!title.trim() || !price.trim() || !category) {
      Alert.alert("Missing Fields", "Please fill in all mandatory fields (Title, Original Price, Category).");
      return;
    }
    const finalPrice = Number(price);
    const finalDiscountedPrice = discountedPrice.trim() ? Number(discountedPrice) : finalPrice;
    const finalBasePrice = basePrice.trim() ? Number(basePrice) : finalPrice;

    if (finalBasePrice > finalPrice) {
      Alert.alert("Error", "Wholesale price cannot exceed original price.");
      return;
    }
    if (finalDiscountedPrice > finalPrice) {
      Alert.alert("Error", "Discounted price cannot exceed original price.");
      return;
    }
    if (finalBasePrice > finalDiscountedPrice) {
      Alert.alert("Error", "Wholesale price cannot exceed discounted price.");
      return;
    }

    try {
      setSubmitting(true);

      let imageUrls = ["https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500&auto=format&fit=crop"];

      if (imageUri) {
        if (imageUri.startsWith("http")) {
          imageUrls = [imageUri];
        } else {
          const formData = new FormData();
          const filename = imageUri.split("/").pop() || "product.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;

          formData.append("image", {
            uri: imageUri,
            name: filename,
            type,
          } as any);

          const uploadRes = await api.post("/cloudinary/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (uploadRes.data?.url) {
            imageUrls = [uploadRes.data.url];
          }
        }
      }

      await api.post("/products", {
        title,
        description,
        price: finalPrice,
        basePrice: finalBasePrice,
        discountedPrice: finalDiscountedPrice,
        category,
        stock: Number(stock) || 1,
        type: "product",
        artisanId: user?._id || user?.id,
        vendorId: user?.vendorId, // Artisan's sponsor vendor
        images: imageUrls,
      });
      Alert.alert("Success", "Product listed successfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setDiscountedPrice("");
      setBasePrice("");
      setStock("");
      setImageUri(null);
      fetchArtisanData();
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || err?.response?.data || err?.message || "Could not list product.";
      Alert.alert("Error", typeof serverMessage === "object" ? JSON.stringify(serverMessage) : String(serverMessage));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = (productId: string, productTitle: string) => {
    Alert.alert("Remove Listing", `Remove "${productTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/products/${productId}`);
            fetchArtisanData();
          } catch {
            Alert.alert("Error", "Could not remove product.");
          }
        },
      },
    ]);
  };

  const handleSaveProductEdit = async (updatedData: any) => {
    if (!selectedEditProduct) return;
    try {
      await api.put(`/products/${selectedEditProduct._id}`, updatedData);
      Alert.alert("Success", "Listing updated successfully!");
      fetchArtisanData();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to update listing.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text className="text-text-tertiary font-sans text-xs uppercase tracking-widest mt-4">
          Loading Studio...
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
          Artisan Studio
        </Text>
        <View className="bg-primary/10 border border-primary/30 px-3 py-1 rounded-full flex-row items-center">
          <Ionicons name="brush" size={11} color="#D4AF37" style={{ marginRight: 4 }} />
          <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">
            Artisan
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* APPROVAL STATUS CARD */}
        {!user?.isApprovedByVendor ? (
          <View className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-5 mb-5">
            <View className="flex-row items-center mb-2">
              <Ionicons name="warning-outline" size={20} color="#F97316" style={{ marginRight: 8 }} />
              <Text className="text-orange-500 font-serif font-bold text-sm">Awaiting Verification</Text>
            </View>
            <Text className="text-text-secondary font-sans text-xs leading-relaxed">
              You are currently linked to Vendor ID: {user?.vendorId || "none"}. Your profile must be approved by the vendor sponsor before your craft listings can go live.
            </Text>
          </View>
        ) : (
          <View className="bg-primary/10 border border-primary/20 rounded-3xl p-5 mb-5 flex-row items-center">
            <Ionicons name="checkmark-circle-outline" size={20} color="#D4AF37" style={{ marginRight: 8 }} />
            <Text className="text-primary font-serif font-bold text-sm">Verified Studio Partner</Text>
          </View>
        )}

        {/* STUDIO INFO CARD */}
        <View className="bg-surface border border-primary/20 rounded-3xl p-5 mb-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-primary/10 p-3 rounded-2xl mr-3">
              <Ionicons name="sparkles" size={22} color="#D4AF37" />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-serif text-base">
                {user?.name || "Artisan"}'s Studio
              </Text>
              <Text className="text-text-tertiary text-[10px] uppercase tracking-wider font-bold">
                {products.length} active listing{products.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-background rounded-2xl p-3 items-center border border-surface-light">
              <Text className="text-primary font-serif text-xl font-bold">{products.length}</Text>
              <Text className="text-text-tertiary font-sans text-[9px] uppercase tracking-widest">
                Listings
              </Text>
            </View>
            <View className="flex-1 bg-background rounded-2xl p-3 items-center border border-surface-light">
              <Text className="text-primary font-serif text-xl font-bold">
                ₹{products.reduce((acc, p) => acc + (p.price || 0), 0)}
              </Text>
              <Text className="text-text-tertiary font-sans text-[9px] uppercase tracking-widest">
                Catalog Value
              </Text>
            </View>
          </View>
        </View>

        {/* LIST A NEW PRODUCT */}
        <View className="bg-surface border border-surface-light rounded-3xl p-5 mb-5">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-5 bg-primary rounded-full mr-3" />
            <Text className="text-text-primary font-serif text-lg">List New Craft</Text>
          </View>

          {/* Image Picker */}
          <View className="mb-4">
            <Text className="text-text-tertiary font-sans text-[10px] uppercase tracking-wider mb-2 font-bold">Product Image</Text>
            {imageUri ? (
              <View className="relative w-full h-40 rounded-2xl overflow-hidden border border-primary/20 bg-background mb-2">
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
                <TouchableOpacity
                  onPress={() => setImageUri(null)}
                  className="absolute top-2 right-2 bg-red-500 p-2 rounded-full shadow"
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                className="w-full h-24 border border-dashed border-primary/30 rounded-2xl justify-center items-center bg-background mb-2"
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={24} color="#D4AF37" />
                <Text className="text-primary text-xs font-sans mt-1.5 font-bold">Select Craft Image</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-text-tertiary font-sans text-[10px] uppercase tracking-wider mb-1">Product Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Hand-woven Silk Saree"
            placeholderTextColor="#555"
            className="bg-background border border-surface-light rounded-xl px-4 py-3 text-text-primary font-sans text-sm mb-3"
          />

          <Text className="text-text-tertiary font-sans text-[10px] uppercase tracking-wider mb-1">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your craft..."
            placeholderTextColor="#555"
            multiline
            numberOfLines={3}
            className="bg-background border border-surface-light rounded-xl px-4 py-3 text-text-primary font-sans text-sm mb-3"
            style={{ textAlignVertical: "top", minHeight: 80 }}
          />

          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-text-tertiary font-sans text-[10px] uppercase tracking-wider mb-1">Original Price (₹)</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#555"
                className="bg-background border border-surface-light rounded-xl px-4 py-3 text-text-primary font-sans text-sm"
              />
            </View>
            <View className="flex-1">
              <Text className="text-text-tertiary font-sans text-[10px] uppercase tracking-wider mb-1">Discounted Price (₹)</Text>
              <TextInput
                value={discountedPrice}
                onChangeText={setDiscountedPrice}
                keyboardType="numeric"
                placeholder="Active selling price"
                placeholderTextColor="#555"
                className="bg-background border border-surface-light rounded-xl px-4 py-3 text-text-primary font-sans text-sm"
              />
            </View>
          </View>

          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-text-tertiary font-sans text-[10px] uppercase tracking-wider mb-1">Wholesale Price (₹)</Text>
              <TextInput
                value={basePrice}
                onChangeText={setBasePrice}
                keyboardType="numeric"
                placeholder="Production cost"
                placeholderTextColor="#555"
                className="bg-background border border-surface-light rounded-xl px-4 py-3 text-text-primary font-sans text-sm"
              />
            </View>
            <View className="flex-1">
              <Text className="text-text-tertiary font-sans text-[10px] uppercase tracking-wider mb-1">Stock Qty</Text>
              <TextInput
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor="#555"
                className="bg-background border border-surface-light rounded-xl px-4 py-3 text-text-primary font-sans text-sm"
              />
            </View>
          </View>

          <Text className="text-text-tertiary font-sans text-[10px] uppercase tracking-wider mb-1">Category</Text>
          <TouchableOpacity
            onPress={() => setShowDropdown(!showDropdown)}
            className="bg-background border border-surface-light rounded-xl px-4 py-3 flex-row justify-between items-center mb-1"
          >
            <Text className="text-text-primary font-sans text-sm">{category || "Select category"}</Text>
            <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={16} color="#A0A0A0" />
          </TouchableOpacity>
          {showDropdown && (
            <View className="bg-background border border-surface-light rounded-xl mb-3 overflow-hidden">
              {categories.map((cat, idx) => (
                <TouchableOpacity
                  key={cat._id || idx}
                  onPress={() => { setCategory(cat.name || cat._id); setShowDropdown(false); }}
                  className="px-4 py-3 border-b border-surface-light"
                  activeOpacity={0.7}
                >
                  <Text className="text-text-primary font-sans text-sm">{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={handleListProduct}
            disabled={submitting}
            className="bg-primary mt-2 py-4 rounded-2xl flex-row items-center justify-center"
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#0B0B0B" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={18} color="#0B0B0B" style={{ marginRight: 6 }} />
                <Text className="text-background font-bold text-xs uppercase tracking-widest">
                  List This Craft
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* MY LISTINGS */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-text-primary font-serif text-lg">My Listings</Text>
            <Text className="text-text-tertiary text-xs font-sans">{products.length} items</Text>
          </View>

          {products.length === 0 ? (
            <View className="bg-surface border border-surface-light rounded-3xl p-8 items-center">
              <View className="bg-primary/10 p-4 rounded-2xl mb-3">
                <Ionicons name="brush-outline" size={32} color="#D4AF37" />
              </View>
              <Text className="text-text-primary font-serif text-base">No listings yet</Text>
              <Text className="text-text-tertiary text-xs font-sans mt-1">
                Add your first craft above.
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
                    <Text className="text-text-tertiary text-[10px]">·</Text>
                    <Text className={`text-[9px] font-bold ${product.isApproved ? "text-primary" : "text-orange-500"}`}>
                      {product.isApproved ? "Approved & Live" : "Pending Verification"}
                    </Text>
                  </View>
                  <Text className="text-primary font-serif text-sm font-bold mt-0.5">
                    ₹{product.price}
                  </Text>
                </View>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedEditProduct(product);
                      setEditModalVisible(true);
                    }}
                    className="bg-primary/10 border border-primary/20 p-2.5 rounded-xl"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={16} color="#D4AF37" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteProduct(product._id, product.title)}
                    className="bg-red-500/10 p-2.5 rounded-xl ml-2"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <EditProductModal
        visible={editModalVisible}
        product={selectedEditProduct}
        categories={categories}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedEditProduct(null);
        }}
        onSave={handleSaveProductEdit}
      />
    </SafeScreen>
  );
}
