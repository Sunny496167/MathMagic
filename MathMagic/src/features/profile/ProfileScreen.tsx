import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import SafeScreen from '../../components/common/SafeScreen';
import { ProfileHeaderCard } from './components/ProfileHeaderCard';
import { ProfileStatsGrid } from './components/ProfileStatsGrid';
import { GradeSelectorCard } from './components/GradeSelectorCard';
import { GradePickerModal } from './components/GradePickerModal';
import { ProgressTreeView } from './components/ProgressTreeView';
import { AdminEntryButton } from './components/AdminEntryButton';
import { AdminPortalModal } from './components/AdminPortalModal';
import { ProfileMenuSection } from './components/ProfileMenuSection';
import { useProfileData } from './hooks/useProfileData';

export const ProfileScreen = () => {
  const {
    user,
    loading,
    enabledGrades,
    selectedGrade,
    topics,
    stats,
    gradeModalVisible,
    setGradeModalVisible,
    adminModalVisible,
    setAdminModalVisible,
    loadAllProfileData,
    handleSelectGrade,
    signOut,
  } = useProfileData();

  useFocusEffect(
    React.useCallback(() => {
      loadAllProfileData();
    }, [loadAllProfileData])
  );

  const isAdmin = user?.role === 'admin';

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-6 py-5 border-b border-primary/5 bg-white flex-row justify-between items-center">
          <View>
            <Text className="text-text-primary text-2xl font-bold tracking-tight">
              My Profile
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              Account, Grade & Curriculum Progress
            </Text>
          </View>

          <TouchableOpacity
            onPress={loadAllProfileData}
            disabled={loading}
            className="w-10 h-10 bg-slate-50 border border-primary/5 rounded-full justify-center items-center"
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={loading ? '#94A3B8' : '#8B5CF6'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6 py-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadAllProfileData}
              tintColor="#8B5CF6"
            />
          }
        >
          {/* User Profile Header Card */}
          <ProfileHeaderCard
            user={user}
            selectedGrade={selectedGrade}
            onOpenGradePicker={() => setGradeModalVisible(true)}
          />

          {/* Admin Entry Portal (Visible for Staff / Admins) */}
          {isAdmin && (
            <AdminEntryButton onPress={() => setAdminModalVisible(true)} />
          )}

          {/* Grade Selector Card */}
          <GradeSelectorCard
            currentGrade={selectedGrade}
            onOpenModal={() => setGradeModalVisible(true)}
          />

          {/* 8-Metric Statistics Grid */}
          <ProfileStatsGrid stats={stats} />

          {/* Hierarchical Progress Tree View */}
          <ProgressTreeView
            topics={topics}
            gradeName={selectedGrade?.name || 'Grade 1'}
          />

          {/* Menu & Sign Out */}
          <ProfileMenuSection
            onResetProgress={loadAllProfileData}
            onLogout={signOut}
          />
        </ScrollView>

        {/* Grade Selection Modal */}
        <GradePickerModal
          visible={gradeModalVisible}
          onClose={() => setGradeModalVisible(false)}
          grades={enabledGrades}
          selectedGradeId={selectedGrade?._id || null}
          onSelectGrade={handleSelectGrade}
          isLoading={loading}
        />

        {/* Admin Portal Modal */}
        <AdminPortalModal
          visible={adminModalVisible}
          onClose={() => setAdminModalVisible(false)}
          onRefreshCurriculum={loadAllProfileData}
        />
      </View>
    </SafeScreen>
  );
};

export default ProfileScreen;
