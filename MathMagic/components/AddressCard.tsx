import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Address } from "@/types";
import { formatPhoneNumber } from "@/lib/utils";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string, label: string) => void;
  isUpdatingAddress: boolean;
  isDeletingAddress: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  isUpdatingAddress,
  isDeletingAddress,
}: AddressCardProps) {
  const getIconName = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("home")) return "home";
    if (l.includes("work") || l.includes("office")) return "briefcase";
    return "location";
  };

  return (
    <View className="bg-surface border border-surface-light rounded-3xl p-5 mb-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="bg-primary/10 border border-primary/15 rounded-2xl w-10 h-10 items-center justify-center mr-3">
            <Ionicons name={getIconName(address.label) as any} size={20} color="#D4AF37" />
          </View>
          <Text className="text-text-primary font-serif font-bold text-base">{address.label}</Text>
        </View>
        {address.isDefault && (
          <View className="bg-primary px-3 py-1 rounded-full shadow-sm">
            <Text className="text-background text-[10px] font-sans font-bold uppercase tracking-wider">Default</Text>
          </View>
        )}
      </View>

      <View className="pl-1">
        <Text className="text-text-primary font-sans font-bold text-sm mb-1">
          {address.fullName}
        </Text>
        <Text className="text-text-secondary font-sans text-xs mb-1 leading-relaxed">
          {address.streetAddress}, {address.city}, {address.state} - {address.zipCode}
        </Text>
        {address.phoneNumber && (
          <Text className="text-text-tertiary font-sans text-xs">
            Phone: {formatPhoneNumber(address.phoneNumber)}
          </Text>
        )}
      </View>

      <View className="flex-row mt-4 gap-2 pt-3 border-t border-surface-light">
        <TouchableOpacity
          className="flex-1 bg-primary/10 border border-primary/20 py-2.5 rounded-xl items-center flex-row justify-center"
          activeOpacity={0.7}
          onPress={() => onEdit(address)}
          disabled={isUpdatingAddress}
        >
          <Ionicons name="create-outline" size={16} color="#D4AF37" className="mr-1" />
          <Text className="text-primary font-sans font-bold text-xs">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-red-500/10 border border-red-500/20 py-2.5 rounded-xl items-center flex-row justify-center"
          activeOpacity={0.7}
          onPress={() => onDelete(address._id, address.label)}
          disabled={isDeletingAddress}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" className="mr-1" />
          <Text className="text-red-500 font-sans font-bold text-xs">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
