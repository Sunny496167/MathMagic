import { useAddresses } from "@/hooks/useAddressess";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { formatPhoneNumber } from "@/lib/utils";

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: (address: Address) => void;
  isProcessing: boolean;
  selectedAddress?: Address | null;
}

const AddressSelectionModal = ({
  visible,
  onClose,
  onProceed,
  isProcessing,
  selectedAddress: initialSelectedAddress,
}: AddressSelectionModalProps) => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const { addresses, isLoading: addressesLoading } = useAddresses();

  useEffect(() => {
    if (visible) {
      setSelectedAddress(initialSelectedAddress || null);
    }
  }, [visible, initialSelectedAddress]);

  const hasAddresses = addresses && addresses.length > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-background rounded-t-3xl h-3/4 border-t border-surface-light">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-surface-light">
            <Text className="text-text-primary text-xl font-serif">Delivery Details</Text>
            <TouchableOpacity onPress={onClose} className="p-2" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#EAEAEA" />
            </TouchableOpacity>
          </View>

          {/* ADDRESSES LIST */}
          <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
            {addressesLoading ? (
              <View className="py-20">
                <ActivityIndicator size="large" color="#D4AF37" />
              </View>
            ) : !hasAddresses ? (
              <View className="py-12 items-center">
                <View className="w-16 h-16 bg-surface rounded-full items-center justify-center mb-4">
                  <Ionicons name="location-outline" size={32} color="#666" />
                </View>
                <Text className="text-text-primary text-lg font-bold mb-2">No addresses found</Text>
                <Text className="text-text-secondary text-center mb-8 px-8">
                  You need to add a delivery address before you can proceed with your order.
                </Text>
                <TouchableOpacity 
                  className="bg-primary px-8 py-4 rounded-2xl"
                  onPress={() => {
                    onClose();
                    router.push("/(profile)/addresses");
                  }}
                >
                  <Text className="text-background font-bold uppercase tracking-widest text-sm">Add New Address</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-4 pb-6">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-text-secondary text-xs uppercase tracking-[0.2em]">Saved Addresses</Text>
                  <TouchableOpacity onPress={() => {
                    onClose();
                    router.push("/(profile)/addresses");
                  }}>
                    <Text className="text-primary text-xs font-bold uppercase tracking-widest">Manage</Text>
                  </TouchableOpacity>
                </View>
                {addresses?.map((address: Address) => (
                  <TouchableOpacity
                    key={address._id}
                    className={`bg-surface p-5 border-2 ${
                      selectedAddress?._id === address._id
                        ? "border-primary"
                        : "border-surface-light"
                    } rounded-2xl`}
                    activeOpacity={0.8}
                    onPress={() => setSelectedAddress(address)}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <Text className="text-text-primary font-serif font-medium text-lg mr-2">
                            {address.label}
                          </Text>
                          {address.isDefault && (
                            <View className="bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              <Text className="text-primary text-[10px] uppercase tracking-widest font-bold">Default</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-text-secondary font-sans font-medium text-sm mb-1">
                          {address.fullName}, {address.streetAddress}
                        </Text>
                        <Text className="text-text-tertiary font-sans text-xs mb-1">
                          {address.city}, {address.state}, {address.zipCode}
                        </Text>
                        {address.phoneNumber && (
                          <Text className="text-text-tertiary font-sans text-xs">
                            Mob: {formatPhoneNumber(address.phoneNumber)}
                          </Text>
                        )}
                      </View>
                      <View className="pl-4 justify-center">
                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          selectedAddress?._id === address._id ? 'border-primary' : 'border-surface-light'
                        }`}>
                          {selectedAddress?._id === address._id && <View className="w-3 h-3 rounded-full bg-primary" />}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {hasAddresses && (
            <View className="p-6 border-t border-surface-light">
              <TouchableOpacity
                className={`h-16 flex-row items-center justify-center rounded-2xl shadow-lg shadow-black/50 ${!selectedAddress || isProcessing ? "bg-surface" : "bg-primary"}`}
                activeOpacity={0.9}
                onPress={() => {
                  if (selectedAddress) onProceed(selectedAddress);
                }}
                disabled={!selectedAddress || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text className={`font-sans font-bold text-sm uppercase tracking-widest ${!selectedAddress || isProcessing ? "text-text-tertiary" : "text-background"}`}>
                    Confirm Order
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AddressSelectionModal;
