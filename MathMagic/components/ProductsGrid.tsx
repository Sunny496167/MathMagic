import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { resolveImageUrl } from "@/lib/utils";
import React, { useState, useCallback } from "react";
import CustomConfirmModal from "./CustomConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { Image } from "expo-image";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

interface ProductsGridProps {
  isLoading: boolean;
  isError: boolean;
  products: Product[];
}

// Memoized individual Product Card component
const ProductCardItem = React.memo(({
  product,
  quantity,
  isWishlisted,
  activeWishlistProductId,
  activeCartProductId,
  onToggleWishlist,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
}: {
  product: Product;
  quantity: number;
  isWishlisted: boolean;
  activeWishlistProductId: string | null;
  activeCartProductId: string | null;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveFromCart: (productId: string) => void;
}) => {
  const { user } = useAuth();
  return (
    <TouchableOpacity
      className="bg-surface rounded-xl overflow-hidden mb-4 border border-surface-light"
      style={{ width: "48%" }}
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product._id}`)}
    >
      <View className="relative">
        <Image
          source={{ uri: resolveImageUrl(product.images[0]) }}
          className="w-full h-48 bg-surface-light"
          contentFit="cover"
        />

        <TouchableOpacity
          className="absolute top-2 right-2 bg-background/50 backdrop-blur-md p-2 rounded-full border border-surface-light"
          activeOpacity={0.7}
          onPress={() => onToggleWishlist(product)}
          disabled={activeWishlistProductId === product._id}
        >
          {activeWishlistProductId === product._id ? (
            <ActivityIndicator size="small" color="#D4AF37" />
          ) : (
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={16}
              color={isWishlisted ? "#D32F2F" : "#FFFFFF"}
            />
          )}
        </TouchableOpacity>
      </View>

      <View className="p-3">
        <Text className="text-text-tertiary font-sans text-[10px] uppercase tracking-wider mb-1">
          {product.category}
        </Text>
        <Text className="text-text-primary font-serif font-medium text-sm mb-1 leading-tight" numberOfLines={2}>
          {product.title}
        </Text>

        <View className="flex-row items-center mb-2">
          <Ionicons name="star" size={10} color="#D4AF37" />
          <Text className="text-text-secondary font-sans text-[10px] ml-1">
            {(product.averageRating || 0).toFixed(1)} <Text className="text-text-tertiary">({product.totalReviews || 0})</Text>
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-1 border-t border-surface-light pt-2">
          {(() => {
            const isClient = user?.role === "client";
            if (isClient) {
              const displayPrice = product.basePrice || product.price;
              const strikePrice = product.price > displayPrice ? product.price : null;

              return (
                <View className="flex-col flex-1 mr-1">
                  <View className="flex-row items-baseline gap-1.5 flex-wrap">
                    <Text className="text-primary font-serif text-sm">₹{Math.floor(displayPrice)}</Text>
                    {strikePrice && (
                      <Text className="text-text-tertiary font-sans text-[9px] line-through font-medium">
                        ₹{Math.floor(strikePrice)}
                      </Text>
                    )}
                  </View>
                  <View className="bg-primary/10 border border-primary/20 px-1 py-0.2 rounded mt-1 self-start">
                    <Text className="text-primary text-[7px] font-sans font-bold uppercase tracking-wide">
                      B2B Rate
                    </Text>
                  </View>
                </View>
              );
            }

            const activeSellingPrice = product.discountedPrice !== undefined && product.discountedPrice !== null
              ? product.discountedPrice
              : product.price;
            const hasDiscount = product.price > activeSellingPrice;
            const discountPercent = hasDiscount
              ? Math.round(((product.price - activeSellingPrice) / product.price) * 100)
              : null;

            return (
              <View className="flex-row items-baseline gap-1 flex-wrap flex-1 mr-1">
                <Text className="text-primary font-serif text-sm">₹{Math.floor(activeSellingPrice)}</Text>
                {hasDiscount && (
                  <>
                    <Text className="text-text-tertiary font-sans text-[9px] line-through font-medium">
                      ₹{Math.floor(product.price)}
                    </Text>
                    <View className="bg-primary/10 px-1 py-0.5 rounded">
                      <Text className="text-primary text-[8px] font-sans font-bold">
                        {discountPercent}% OFF
                      </Text>
                    </View>
                  </>
                )}
              </View>
            );
          })()}

          {quantity > 0 ? (
            <View className="flex-row items-center bg-background border border-primary/25 rounded-xl px-1 py-1 gap-0.5">
              <TouchableOpacity
                className="w-7 h-7 items-center justify-center rounded-lg bg-primary/10"
                onPress={() => {
                  if (quantity > 1) {
                    onUpdateQuantity(product._id, quantity - 1);
                  } else {
                    onRemoveFromCart(product._id);
                  }
                }}
              >
                <Ionicons name="remove" size={12} color="#D4AF37" />
              </TouchableOpacity>

              <Text className="text-text-primary font-sans text-xs text-center font-bold min-w-[14px]">
                {quantity}
              </Text>

              <TouchableOpacity
                className="w-7 h-7 items-center justify-center rounded-lg bg-primary/10"
                onPress={() => onUpdateQuantity(product._id, quantity + 1)}
              >
                <Ionicons name="add" size={12} color="#D4AF37" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onAddToCart(product)}
              disabled={activeCartProductId === product._id}
              className="bg-primary px-2.5 py-2 rounded-xl items-center justify-center flex-row min-w-[50px]"
            >
              {activeCartProductId === product._id ? (
                <ActivityIndicator size="small" color="#0B0B0B" style={{ transform: [{ scale: 0.75 }] }} />
              ) : (
                <Text className="text-background font-sans text-[9px] font-bold uppercase tracking-wider">
                  + Add
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}, (prev, next) => {
  // Only re-render if key state properties have changed
  return (
    prev.product._id === next.product._id &&
    prev.quantity === next.quantity &&
    prev.isWishlisted === next.isWishlisted &&
    prev.activeWishlistProductId === next.activeWishlistProductId &&
    prev.activeCartProductId === next.activeCartProductId
  );
});
ProductCardItem.displayName = "ProductCardItem";

const ProductsGrid = ({ products, isLoading, isError }: ProductsGridProps) => {
  const { isInWishlist, toggleWishlist, activeWishlistProductId } =
    useWishlist();

  const {
    cart,
    activeCartProductId,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleAddToCart = useCallback((product: Product) => {
    addToCart(
      { product, quantity: 1 },
      {
        onError: (error: any) => {
          Alert.alert("Error", "Failed to add to cart");
        },
      }
    );
  }, [addToCart]);

  const handleConfirmDelete = useCallback(() => {
    if (productToDelete) {
      removeFromCart(productToDelete.id);
    }
    setConfirmDeleteVisible(false);
    setProductToDelete(null);
  }, [productToDelete, removeFromCart]);

  const handleRemoveFromCart = useCallback((productId: string) => {
    removeFromCart(productId);
  }, [removeFromCart]);

  const handleUpdateQuantity = useCallback((productId: string, newQty: number) => {
    updateQuantity({ productId, quantity: newQty });
  }, [updateQuantity]);

  const renderProduct = ({ item: product }: { item: Product }) => {
    const cartItem = cart?.items.find((i) => i.product._id === product._id);
    const quantity = cartItem?.quantity || 0;
    const isWishlisted = isInWishlist(product._id);

    return (
      <ProductCardItem
        product={product}
        quantity={quantity}
        isWishlisted={isWishlisted}
        activeWishlistProductId={activeWishlistProductId}
        activeCartProductId={activeCartProductId}
        onToggleWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveFromCart={handleRemoveFromCart}
      />
    );
  };

  if (isLoading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text className="text-text-secondary mt-4 font-sans text-xs uppercase tracking-widest">Discovering...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-20 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold mt-4">Failed to load products</Text>
        <Text className="text-text-secondary text-sm mt-2">Please try again later</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListEmptyComponent={NoProductsFound}
      />

      <CustomConfirmModal
        visible={confirmDeleteVisible}
        title="Remove Item"
        message={`Are you sure you want to remove ${productToDelete?.title || "this item"} from your bag?`}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setConfirmDeleteVisible(false);
          setProductToDelete(null);
        }}
      />
    </>
  );
};

export default ProductsGrid;

function NoProductsFound() {
  return (
    <View className="py-20 items-center justify-center">
      <Ionicons name="search-outline" size={48} color={"#666"} />
      <Text className="text-text-primary font-semibold mt-4">No products found</Text>
      <Text className="text-text-secondary text-sm mt-2">Try adjusting your filters</Text>
    </View>
  );
}
