import { View, Text } from "react-native";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;
  finalTotal?: number;
}

export default function OrderSummary({ subtotal, shipping, tax, total, discount = 0, finalTotal }: OrderSummaryProps) {
  const displayTotal = finalTotal !== undefined ? finalTotal : total;

  return (
    <View className="px-6 mt-8 mb-4">
      <View className="border border-surface-light rounded-xl p-5 bg-background">
        <Text className="text-text-primary text-lg font-serif mb-5">Order Summary</Text>

        <View className="space-y-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-text-secondary font-sans text-sm">Subtotal</Text>
            <Text className="text-text-primary font-sans text-sm">
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mt-3">
            <Text className="text-text-secondary font-sans text-sm">Shipping</Text>
            <Text className="text-text-primary font-sans text-sm uppercase tracking-widest text-right">
              {shipping === 0 ? "Complimentary" : `₹${shipping.toFixed(2)}`}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mt-3">
            <Text className="text-text-secondary font-sans text-sm">Estimated Tax</Text>
            <Text className="text-text-primary font-sans text-sm">₹{tax.toFixed(2)}</Text>
          </View>

          {discount > 0 && (
            <View className="flex-row justify-between items-center mt-3">
              <Text className="text-[#D4AF37] font-sans text-sm">Coins Discount</Text>
              <Text className="text-[#D4AF37] font-sans text-sm font-bold">-₹{discount.toFixed(2)}</Text>
            </View>
          )}

          {/* Divider */}
          <View className="border-t border-surface-light pt-4 mt-4 flex-row justify-between items-center">
            <Text className="text-text-primary font-serif text-lg">Total</Text>
            <Text className="text-primary font-serif text-xl">₹{displayTotal.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
