import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

interface AddressFormData {
  label: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  isDefault: boolean;
}

interface AddressFormModalProps {
  visible: boolean;
  isEditing: boolean;
  addressForm: AddressFormData;
  isAddingAddress: boolean;
  isUpdatingAddress: boolean;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (form: AddressFormData) => void;
}

const LABEL_OPTIONS = [
  { id: "Home", icon: "home-outline", name: "Home" },
  { id: "Work", icon: "briefcase-outline", name: "Work" },
  { id: "Office", icon: "business-outline", name: "Office" },
  { id: "Other", icon: "location-outline", name: "Other" },
];

const AddressFormModal = ({
  addressForm,
  isAddingAddress,
  isEditing,
  isUpdatingAddress,
  onClose,
  onFormChange,
  onSave,
  visible,
}: AddressFormModalProps) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/75 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="w-full max-h-[92%]"
        >
          <View className="bg-surface rounded-t-[36px] p-6 border-t border-surface-light shadow-2xl">
            {/* DRAG INDICATOR & HEADER */}
            <View className="items-center mb-4">
              <View className="w-12 h-1.5 bg-surface-light rounded-full mb-3" />
              <View className="w-full flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-primary/10 rounded-2xl items-center justify-center mr-3">
                    <Ionicons name="location" size={20} color="#D4AF37" />
                  </View>
                  <Text className="text-text-primary text-xl font-serif font-bold">
                    {isEditing ? "Edit Delivery Address" : "Add Delivery Address"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-background-light p-2 rounded-full border border-surface-light"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ADDRESS TYPE CHIPS */}
              <View className="mb-4 mt-2">
                <Text className="text-text-tertiary text-[10px] uppercase tracking-wider mb-2.5 font-bold">
                  Address Type
                </Text>
                <View className="flex-row gap-2 flex-wrap">
                  {LABEL_OPTIONS.map((opt) => {
                    const selected = addressForm.label.toLowerCase() === opt.id.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => onFormChange({ ...addressForm, label: opt.id })}
                        className={`flex-row items-center px-4 py-2.5 rounded-2xl border ${
                          selected
                            ? "bg-primary border-primary"
                            : "bg-background border-surface-light"
                        }`}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={opt.icon as any}
                          size={16}
                          color={selected ? "#0B0B0B" : "#D4AF37"}
                        />
                        <Text
                          className={`text-xs font-bold ml-1.5 ${
                            selected ? "text-background" : "text-text-primary"
                          }`}
                        >
                          {opt.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* FULL NAME */}
              <View className="mb-4">
                <Text className="text-text-tertiary text-[10px] uppercase tracking-wider mb-1.5 font-bold">
                  Full Name
                </Text>
                <View className="bg-background border border-surface-light rounded-2xl flex-row items-center px-4 py-3.5">
                  <Ionicons name="person-outline" size={18} color="#D4AF37" style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-text-primary font-sans text-sm p-0"
                    placeholder="Receiver's full name"
                    placeholderTextColor="#555"
                    value={addressForm.fullName}
                    onChangeText={(text) => onFormChange({ ...addressForm, fullName: text })}
                  />
                </View>
              </View>

              {/* PHONE NUMBER */}
              <View className="mb-4">
                <Text className="text-text-tertiary text-[10px] uppercase tracking-wider mb-1.5 font-bold">
                  Contact Phone Number
                </Text>
                <View className="bg-background border border-surface-light rounded-2xl flex-row items-center px-4 py-3.5">
                  <Ionicons name="call-outline" size={18} color="#D4AF37" style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-text-primary font-sans text-sm p-0"
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#555"
                    value={addressForm.phoneNumber}
                    onChangeText={(text) => onFormChange({ ...addressForm, phoneNumber: text })}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* STREET ADDRESS */}
              <View className="mb-4">
                <Text className="text-text-tertiary text-[10px] uppercase tracking-wider mb-1.5 font-bold">
                  Street Address & Flat / House No.
                </Text>
                <View className="bg-background border border-surface-light rounded-2xl flex-row items-start px-4 py-3">
                  <Ionicons name="home-outline" size={18} color="#D4AF37" style={{ marginRight: 10, marginTop: 4 }} />
                  <TextInput
                    className="flex-1 text-text-primary font-sans text-sm p-0"
                    placeholder="House/Flat No., Building Name, Street"
                    placeholderTextColor="#555"
                    value={addressForm.streetAddress}
                    onChangeText={(text) => onFormChange({ ...addressForm, streetAddress: text })}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>

              {/* CITY & STATE SIDE BY SIDE */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-text-tertiary text-[10px] uppercase tracking-wider mb-1.5 font-bold">
                    City
                  </Text>
                  <View className="bg-background border border-surface-light rounded-2xl px-4 py-3.5">
                    <TextInput
                      className="text-text-primary font-sans text-sm p-0"
                      placeholder="e.g. New Delhi"
                      placeholderTextColor="#555"
                      value={addressForm.city}
                      onChangeText={(text) => onFormChange({ ...addressForm, city: text })}
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-text-tertiary text-[10px] uppercase tracking-wider mb-1.5 font-bold">
                    State
                  </Text>
                  <View className="bg-background border border-surface-light rounded-2xl px-4 py-3.5">
                    <TextInput
                      className="text-text-primary font-sans text-sm p-0"
                      placeholder="e.g. Delhi"
                      placeholderTextColor="#555"
                      value={addressForm.state}
                      onChangeText={(text) => onFormChange({ ...addressForm, state: text })}
                    />
                  </View>
                </View>
              </View>

              {/* ZIP CODE */}
              <View className="mb-5">
                <Text className="text-text-tertiary text-[10px] uppercase tracking-wider mb-1.5 font-bold">
                  Pincode / ZIP Code
                </Text>
                <View className="bg-background border border-surface-light rounded-2xl flex-row items-center px-4 py-3.5">
                  <Ionicons name="pin-outline" size={18} color="#D4AF37" style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-text-primary font-sans text-sm p-0"
                    placeholder="e.g. 110001"
                    placeholderTextColor="#555"
                    value={addressForm.zipCode}
                    onChangeText={(text) => onFormChange({ ...addressForm, zipCode: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* DEFAULT ADDRESS TOGGLE */}
              <View className="bg-background border border-surface-light rounded-2xl p-4 flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle-outline" size={20} color="#D4AF37" style={{ marginRight: 8 }} />
                  <Text className="text-text-primary font-sans font-bold text-sm">
                    Set as default delivery address
                  </Text>
                </View>
                <Switch
                  value={addressForm.isDefault}
                  onValueChange={(value) => onFormChange({ ...addressForm, isDefault: value })}
                  thumbColor="white"
                  trackColor={{ true: "#D4AF37", false: "#222" }}
                />
              </View>

              {/* SAVE BUTTON */}
              <TouchableOpacity
                className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-black/50"
                activeOpacity={0.8}
                onPress={onSave}
                disabled={isAddingAddress || isUpdatingAddress}
              >
                {isAddingAddress || isUpdatingAddress ? (
                  <ActivityIndicator size="small" color="#0B0B0B" />
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="save-outline" size={18} color="#0B0B0B" style={{ marginRight: 8 }} />
                    <Text className="text-background font-serif font-bold text-base">
                      {isEditing ? "Save Changes" : "Save Address"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddressFormModal;
