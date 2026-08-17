import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "@/lib/api";

interface EditProductModalProps {
  visible: boolean;
  product: any;
  categories?: any[];
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

export default function EditProductModal({
  visible,
  product,
  categories: propCategories,
  onClose,
  onSave,
}: EditProductModalProps) {
  const api = useApi();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [categoriesList, setCategoriesList] = useState<any[]>(propCategories || []);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (propCategories && propCategories.length > 0) {
        setCategoriesList(propCategories);
      } else {
        api.get("/categories")
          .then((res) => setCategoriesList(res.data))
          .catch((err) => console.error("Error fetching categories in EditProductModal", err));
      }
    }
  }, [visible, propCategories]);

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setDescription(product.description || "");
      setPrice(String(product.price || ""));
      setDiscountedPrice(
        product.discountedPrice !== undefined && product.discountedPrice !== null
          ? String(product.discountedPrice)
          : String(product.price || "")
      );
      setBasePrice(String(product.basePrice || ""));
      setStock(String(product.stock || ""));
      setCategory(product.category || "");
      setIsCustomCategory(false);
      setShowDropdown(false);
    }
  }, [product, visible]);

  const handleSave = async () => {
    if (!title.trim() || !price.trim() || !stock.trim()) {
      Alert.alert("Error", "Please fill in all mandatory fields (Title, Price, Stock).");
      return;
    }

    const finalPrice = Number(price);
    const finalDiscountedPrice = discountedPrice.trim() ? Number(discountedPrice) : finalPrice;
    const finalBasePrice = basePrice.trim() ? Number(basePrice) : finalPrice;

    if (finalBasePrice > finalPrice) {
      Alert.alert("Error", "Wholesale price cannot exceed original retail price.");
      return;
    }
    if (finalDiscountedPrice > finalPrice) {
      Alert.alert("Error", "Discounted selling price cannot exceed original retail price.");
      return;
    }
    if (finalBasePrice > finalDiscountedPrice) {
      Alert.alert("Error", "Wholesale cost cannot exceed discounted selling price.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title,
        description,
        price: finalPrice,
        discountedPrice: finalDiscountedPrice,
        basePrice: finalBasePrice,
        stock: Number(stock),
        category,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to update product details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-surface rounded-t-[32px] p-6 max-h-[90%] border-t border-surface-light">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-serif text-text-primary font-bold">Edit Listing Details</Text>
            <TouchableOpacity onPress={onClose} className="bg-surface-light p-2 rounded-full">
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View className="gap-y-4">
              {/* Product Title */}
              <View>
                <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider mb-2">Product Title</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Produce title"
                  placeholderTextColor="#555"
                  className="bg-background px-4 py-3 rounded-xl border border-surface-light text-text-primary text-sm font-sans"
                />
              </View>

              {/* Description */}
              <View>
                <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider mb-2">Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Produce description..."
                  placeholderTextColor="#555"
                  multiline
                  numberOfLines={3}
                  className="bg-background px-4 py-3 rounded-xl border border-surface-light text-text-primary text-sm font-sans"
                  style={{ textAlignVertical: "top", minHeight: 80 }}
                />
              </View>

              {/* Retail Price */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider mb-2">Original Price (₹)</Text>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#555"
                    className="bg-background px-4 py-3 rounded-xl border border-surface-light text-text-primary text-sm font-sans"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider mb-2">Discounted Price (₹)</Text>
                  <TextInput
                    value={discountedPrice}
                    onChangeText={setDiscountedPrice}
                    keyboardType="numeric"
                    placeholder="Active selling price"
                    placeholderTextColor="#555"
                    className="bg-background px-4 py-3 rounded-xl border border-surface-light text-text-primary text-sm font-sans"
                  />
                </View>
              </View>

              {/* Wholesale Cost & Stock */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider mb-2">Wholesale Price (₹)</Text>
                  <TextInput
                    value={basePrice}
                    onChangeText={setBasePrice}
                    keyboardType="numeric"
                    placeholder="Wholesale price"
                    placeholderTextColor="#555"
                    className="bg-background px-4 py-3 rounded-xl border border-surface-light text-text-primary text-sm font-sans"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider mb-2">Stock Quantity</Text>
                  <TextInput
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                    placeholder="Available stock"
                    placeholderTextColor="#555"
                    className="bg-background px-4 py-3 rounded-xl border border-surface-light text-text-primary text-sm font-sans"
                  />
                </View>
              </View>

              {/* Category Dropdown */}
              <View className="relative">
                <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider mb-2">Category</Text>
                
                <TouchableOpacity
                  onPress={() => setShowDropdown(!showDropdown)}
                  className="bg-background px-4 py-3 rounded-xl border border-surface-light flex-row justify-between items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-text-primary text-sm font-sans capitalize">
                    {category || "Select Category"}
                  </Text>
                  <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={16} color="#D4AF37" />
                </TouchableOpacity>

                {showDropdown && (
                  <View className="bg-background border border-surface-light rounded-xl mt-1.5 max-h-[160px] overflow-hidden">
                    <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                      {categoriesList.map((c) => {
                        const catName = c.name || c._id;
                        return (
                          <TouchableOpacity
                            key={c._id || catName}
                            onPress={() => {
                              setCategory(catName);
                              setIsCustomCategory(false);
                              setShowDropdown(false);
                            }}
                            className="px-4 py-3 border-b border-surface-light"
                            activeOpacity={0.7}
                          >
                            <Text className="text-text-primary text-xs font-sans capitalize">{catName}</Text>
                          </TouchableOpacity>
                        );
                      })}
                      <TouchableOpacity
                        onPress={() => {
                          setCategory("");
                          setIsCustomCategory(true);
                          setShowDropdown(false);
                        }}
                        className="px-4 py-3 bg-primary/10"
                        activeOpacity={0.7}
                      >
                        <Text className="text-primary text-xs font-sans font-bold">+ Custom Category...</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                )}

                {isCustomCategory && (
                  <TextInput
                    value={category}
                    onChangeText={setCategory}
                    placeholder="Type custom category name..."
                    placeholderTextColor="#555"
                    className="bg-background px-4 py-3 rounded-xl border border-surface-light text-text-primary text-sm font-sans mt-2"
                  />
                )}
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="bg-primary py-4 rounded-2xl items-center mt-4 shadow-lg shadow-black/40"
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#0B0B0B" />
                ) : (
                  <Text className="text-background font-serif font-bold text-base">Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
