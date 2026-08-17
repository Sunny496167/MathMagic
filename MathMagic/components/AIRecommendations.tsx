import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import useCart from '@/hooks/useCart';
import useWishlist from '@/hooks/useWishlist';
import useProducts from '@/hooks/useProducts';
import { resolveImageUrl } from '@/lib/utils';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface AIRecommendationsProps {
  onPressSeeAll?: () => void;
}

export default function AIRecommendations({ onPressSeeAll }: AIRecommendationsProps) {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { data: products = [], isLoading } = useProducts();
  const { user } = useAuth();

  // Compute recommended products based on cart and wishlist categories
  const { recommendations, userCategories } = useMemo(() => {
    if (!products || products.length === 0) {
      return { recommendations: [], userCategories: [] };
    }

    // 1. Collect product IDs currently in cart and wishlist to filter them out
    const cartProductIds = new Set(cart?.items?.map(item => item.product._id) || []);
    const wishlistProductIds = new Set(wishlist?.map(product => product._id) || []);
    const excludedIds = new Set([...cartProductIds, ...wishlistProductIds]);

    // 2. Extract categories present in cart and wishlist
    const cartCategories = cart?.items?.map(item => item.product.category) || [];
    const wishlistCategories = wishlist?.map(product => product.category) || [];
    const collectedCategories = Array.from(new Set([...cartCategories, ...wishlistCategories])).filter(Boolean);

    let candidates: Product[] = [];

    if (collectedCategories.length > 0) {
      // Find products in catalog matching user's favorite categories (excluding already selected items)
      candidates = products.filter(
        product => collectedCategories.includes(product.category) && !excludedIds.has(product._id)
      );

      // If we don't have enough category-matching recommendations, fill remaining slots with others
      if (candidates.length < 4) {
        const remaining = products.filter(
          product => !excludedIds.has(product._id) && !candidates.some(c => c._id === product._id)
        );
        // Shuffle remaining and append
        const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
        candidates = [...candidates, ...shuffledRemaining];
      }
    } else {
      // If cart and wishlist are empty, recommend random catalog products (excluding already selected items)
      candidates = products.filter(product => !excludedIds.has(product._id));
      candidates = [...candidates].sort(() => 0.5 - Math.random());
    }

    // Return first 6 recommendations
    return {
      recommendations: candidates.slice(0, 6),
      userCategories: collectedCategories
    };
  }, [products, cart, wishlist]);

  // Helper to determine match percentage based on category matching
  const getMatchPercent = (productCategory: string, index: number) => {
    const isMatchedCategory = userCategories.includes(productCategory);
    if (isMatchedCategory) {
      return `${95 + (index % 5)}% Match`;
    }
    return `${85 + (index % 6)}% Match`;
  };

  if (isLoading) {
    return (
      <View className="my-8 py-10 items-center justify-center">
        <ActivityIndicator size="small" color="#D4AF37" />
        <Text className="text-text-tertiary font-sans text-[10px] uppercase tracking-widest mt-3">
          Analyzing preferences...
        </Text>
      </View>
    );
  }

  // If no recommendations are available, hide this section
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View className="mt-2 mb-8">
      <View className="px-6 flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons name="sparkles" size={20} color="#D4AF37" className="mr-2" />
          <Text className="text-text-primary font-serif text-2xl ml-2">Tailored for You</Text>
        </View>
        <TouchableOpacity onPress={onPressSeeAll} activeOpacity={0.7}>
          <Text className="text-text-tertiary font-sans text-xs">See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
      >
        {recommendations.map((product, index) => (
          <TouchableOpacity 
            key={product._id} 
            activeOpacity={0.9} 
            className="w-48 relative rounded-2xl overflow-hidden bg-surface border border-surface-light"
            onPress={() => router.push(`/product/${product._id}`)}
          >
            <Image 
              source={{ uri: resolveImageUrl(product.images[0]) }} 
              style={{ width: '100%', height: 224 }}
              className="bg-surface-light"
              contentFit="cover"
              transition={200}
            />
            
            {/* Subtle Glassmorphism tag for AI Match */}
            <View className="absolute top-2 left-2 rounded-full overflow-hidden">
              <BlurView intensity={20} tint="light" className="px-2 py-1 flex-row items-center">
                <Text className="text-white text-[10px] uppercase tracking-wider font-bold">
                  {getMatchPercent(product.category, index)}
                </Text>
              </BlurView>
            </View>

            <View className="p-4 bg-background/90 absolute bottom-0 w-full backdrop-blur-md border-t border-surface">
              <Text className="text-text-primary font-sans font-medium text-sm mb-1 truncate" numberOfLines={1}>
                {product.title}
              </Text>
              {(() => {
                const isClient = user?.role === "client";
                if (isClient) {
                  const displayPrice = product.basePrice || product.price;
                  const strikePrice = product.price > displayPrice ? product.price : null;
                  return (
                    <View className="flex-row items-baseline gap-1.5 flex-wrap">
                      <Text className="text-primary font-serif text-base">₹{displayPrice.toFixed(2)}</Text>
                      {strikePrice && (
                        <Text className="text-text-tertiary font-sans text-xs line-through">₹{strikePrice.toFixed(2)}</Text>
                      )}
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
                  <View className="flex-row items-baseline gap-1.5 flex-wrap">
                    <Text className="text-primary font-serif text-base">₹{activeSellingPrice.toFixed(2)}</Text>
                    {hasDiscount && (
                      <>
                        <Text className="text-text-tertiary font-sans text-xs line-through">₹{product.price.toFixed(2)}</Text>
                        <View className="bg-primary/10 px-1 py-0.5 rounded">
                          <Text className="text-primary text-[8px] font-bold">{discountPercent}% OFF</Text>
                        </View>
                      </>
                    )}
                  </View>
                );
              })()}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
