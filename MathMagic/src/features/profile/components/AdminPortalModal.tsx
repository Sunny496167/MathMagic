import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

interface AdminPortalModalProps {
  visible: boolean;
  onClose: () => void;
  onRefreshCurriculum: () => void;
}

type AdminViewLevel = 'grades' | 'topics' | 'exercises' | 'levels' | 'questions';

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  visible,
  onClose,
  onRefreshCurriculum,
}) => {
  const [loading, setLoading] = useState(false);
  const [viewLevel, setViewLevel] = useState<AdminViewLevel>('grades');

  // Selected Breadcrumb Entities
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [selectedPracticeLevel, setSelectedPracticeLevel] = useState<any>(null);

  // Entity Lists
  const [grades, setGrades] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [practiceLevels, setPracticeLevels] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Active Creation Form State
  const [creatingType, setCreatingType] = useState<
    'grade' | 'topic' | 'exercise' | 'level' | 'question' | null
  >(null);

  // Form Fields
  // 1. Grade Form
  const [gradeNumber, setGradeNumber] = useState('');
  const [gradeName, setGradeName] = useState('');
  const [gradeDesc, setGradeDesc] = useState('');
  const [gradeEnabled, setGradeEnabled] = useState(true);

  // 2. Topic Form (with Introduction!)
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [topicIntroSummary, setTopicIntroSummary] = useState('');
  const [topicKeyTakeaway, setTopicKeyTakeaway] = useState('');
  const [topicIntroExample, setTopicIntroExample] = useState('');

  // 3. Exercise / Subtopic Form (with Learning Content!)
  const [subtopicNum, setSubtopicNum] = useState('1');
  const [exerciseTitle, setExerciseTitle] = useState('');
  const [exerciseDesc, setExerciseDesc] = useState('');
  const [contentHeading, setContentHeading] = useState('');
  const [contentText, setContentText] = useState('');
  const [contentExample, setContentExample] = useState('');
  const [contentTip, setContentTip] = useState('');
  const [minPassScore, setMinPassScore] = useState('80');

  // 4. Practice Level Form
  const [levelNum, setLevelNum] = useState('1');
  const [levelTitle, setLevelTitle] = useState('');
  const [levelQuestionCount, setLevelQuestionCount] = useState('30');
  const [levelPassScore, setLevelPassScore] = useState('70');
  const [levelDifficulty, setLevelDifficulty] = useState('easy');

  // 5. Question Ingestion JSON
  const [questionContext, setQuestionContext] = useState<'learn' | 'practice'>('practice');
  const [jsonText, setJsonText] = useState('');
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadGradesAndStats();
    }
  }, [visible]);

  const loadGradesAndStats = async () => {
    setLoading(true);
    try {
      const [gradesRes, statsRes] = await Promise.all([
        apiClient.get(ENDPOINTS.ADMIN.GRADES),
        apiClient.get(ENDPOINTS.ADMIN.DASHBOARD),
      ]);
      setGrades(gradesRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (err: any) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopicsForGrade = async (grade: any) => {
    setSelectedGrade(grade);
    setViewLevel('topics');
    setLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.ADMIN.TOPICS(grade._id));
      setTopics(res.data?.data || []);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load topics for ' + grade.name);
    } finally {
      setLoading(false);
    }
  };

  const loadExercisesForTopic = async (topic: any) => {
    setSelectedTopic(topic);
    setViewLevel('exercises');
    setLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.ADMIN.EXERCISES(topic._id));
      setExercises(res.data?.data || []);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load exercises for ' + topic.title);
    } finally {
      setLoading(false);
    }
  };

  const loadPracticeLevelsForExercise = async (exercise: any) => {
    setSelectedExercise(exercise);
    setViewLevel('levels');
    setLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.ADMIN.PRACTICE_LEVELS(exercise._id));
      setPracticeLevels(res.data?.data || []);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load practice levels for ' + exercise.title);
    } finally {
      setLoading(false);
    }
  };

  const openQuestionBuilder = (levelOrEx: any, context: 'learn' | 'practice') => {
    setQuestionContext(context);
    if (context === 'practice') {
      setSelectedPracticeLevel(levelOrEx);
    }
    setViewLevel('questions');

    // Pre-populate sample template for convenience
    setJsonText(
      JSON.stringify(
        [
          {
            type: 'mcq',
            text: 'What is 5 + 3?',
            options: ['6', '7', '8', '9'],
            correctAnswer: '8',
            explanation: '5 + 3 = 8.',
            difficulty: 'easy',
            xpReward: 5,
            order: 1,
          },
          {
            type: 'numeric',
            text: 'Calculate: 10 - 4 = ?',
            correctAnswer: 6,
            explanation: '10 - 4 = 6.',
            difficulty: 'easy',
            xpReward: 5,
            order: 2,
          },
          {
            type: 'true_false',
            text: '7 is smaller than 2.',
            correctAnswer: 'false',
            explanation: '7 is greater than 2.',
            difficulty: 'easy',
            xpReward: 5,
            order: 3,
          },
          {
            type: 'fill_blank',
            text: 'Four plus four is ____.',
            correctAnswer: 'eight',
            acceptableAnswers: ['8', 'eight', 'Eight'],
            explanation: '4 + 4 = 8 (eight).',
            difficulty: 'easy',
            xpReward: 5,
            order: 4,
          },
        ],
        null,
        2
      )
    );
  };

  // --- ACTIONS ---
  // 1. Toggle Grade Enabled
  const handleToggleGrade = async (gradeId: string) => {
    try {
      const res = await apiClient.patch(ENDPOINTS.ADMIN.GRADE_TOGGLE(gradeId));
      const updated = res.data?.data;
      setGrades((prev) =>
        prev.map((g) => (g._id === gradeId ? { ...g, isEnabled: updated.isEnabled } : g))
      );
      onRefreshCurriculum();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to toggle grade');
    }
  };

  // 2. Create Grade
  const handleCreateGrade = async () => {
    if (!gradeNumber.trim() || !gradeName.trim()) {
      Alert.alert('Missing Fields', 'Please enter Grade Number and Grade Name');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.ADMIN.GRADES, {
        number: parseInt(gradeNumber, 10),
        name: gradeName.trim(),
        description: gradeDesc.trim(),
        isEnabled: gradeEnabled,
        order: parseInt(gradeNumber, 10),
      });
      setCreatingType(null);
      setGradeNumber('');
      setGradeName('');
      setGradeDesc('');
      await loadGradesAndStats();
      onRefreshCurriculum();
      Alert.alert('Success', 'Grade created successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create grade');
    } finally {
      setLoading(false);
    }
  };

  // 3. Create Topic with Introduction
  const handleCreateTopic = async () => {
    if (!topicTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter Topic Title');
      return;
    }
    setLoading(true);
    try {
      const blocks: any[] = [];
      if (topicIntroExample.trim()) {
        blocks.push({
          type: 'example',
          content: topicIntroExample.trim(),
          order: 1,
        });
      }

      await apiClient.post(ENDPOINTS.ADMIN.TOPIC_CREATE, {
        gradeId: selectedGrade._id,
        title: topicTitle.trim(),
        description: topicDesc.trim(),
        introduction: {
          summary: topicIntroSummary.trim(),
          keyTakeaways: topicKeyTakeaway ? [topicKeyTakeaway.trim()] : [],
          blocks,
        },
        order: topics.length + 1,
        isPublished: true,
      });

      setCreatingType(null);
      setTopicTitle('');
      setTopicDesc('');
      setTopicIntroSummary('');
      setTopicKeyTakeaway('');
      setTopicIntroExample('');
      await loadTopicsForGrade(selectedGrade);
      onRefreshCurriculum();
      Alert.alert('Success', 'Topic & Introduction created successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  // 4. Create Subtopic / Exercise with Learning Content
  const handleCreateExercise = async () => {
    if (!exerciseTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter Subtopic Title');
      return;
    }
    setLoading(true);
    try {
      const blocks: any[] = [];
      if (contentHeading.trim()) {
        blocks.push({ type: 'heading', content: contentHeading.trim(), order: 1 });
      }
      if (contentText.trim()) {
        blocks.push({ type: 'text', content: contentText.trim(), order: 2 });
      }
      if (contentExample.trim()) {
        blocks.push({ type: 'example', content: contentExample.trim(), order: 3 });
      }
      if (contentTip.trim()) {
        blocks.push({ type: 'tip', content: contentTip.trim(), order: 4 });
      }

      await apiClient.post(ENDPOINTS.ADMIN.EXERCISE_CREATE, {
        topicId: selectedTopic._id,
        subtopicNumber: parseInt(subtopicNum, 10) || exercises.length + 1,
        title: exerciseTitle.trim(),
        description: exerciseDesc.trim(),
        order: exercises.length + 1,
        learningContent: {
          blocks,
        },
        completionRequirement: {
          minScore: parseInt(minPassScore, 10) || 80,
          mustAnswerAll: true,
        },
        isPublished: true,
      });

      setCreatingType(null);
      setExerciseTitle('');
      setExerciseDesc('');
      setContentHeading('');
      setContentText('');
      setContentExample('');
      setContentTip('');
      await loadExercisesForTopic(selectedTopic);
      onRefreshCurriculum();
      Alert.alert('Success', 'Subtopic & Learning Content created successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create subtopic');
    } finally {
      setLoading(false);
    }
  };

  // 5. Create Practice Level
  const handleCreatePracticeLevel = async () => {
    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.ADMIN.PRACTICE_LEVEL_CREATE, {
        exerciseId: selectedExercise._id,
        number: parseInt(levelNum, 10) || practiceLevels.length + 1,
        title: levelTitle.trim() || `Level ${levelNum}`,
        questionCount: parseInt(levelQuestionCount, 10) || 30,
        passingScore: parseInt(levelPassScore, 10) || 70,
        difficulty: levelDifficulty,
        order: practiceLevels.length + 1,
        isPublished: true,
      });

      setCreatingType(null);
      setLevelTitle('');
      await loadPracticeLevelsForExercise(selectedExercise);
      onRefreshCurriculum();
      Alert.alert('Success', 'Practice Level created successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create practice level');
    } finally {
      setLoading(false);
    }
  };

  // 6. Ingest Questions JSON
  const handleIngestQuestions = async () => {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) parsed = [parsed];
    } catch (e: any) {
      Alert.alert('Invalid JSON Syntax', e.message);
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        context: questionContext,
        questions: parsed,
      };
      if (questionContext === 'learn') {
        payload.exerciseId = selectedExercise._id;
      } else {
        payload.practiceLevelId = selectedPracticeLevel._id;
      }

      const res = await apiClient.post(ENDPOINTS.ADMIN.QUESTIONS_BULK, payload);
      const count = res.data?.data?.count || parsed.length;
      setIngestStatus(`✅ Successfully added ${count} questions to Question Bank!`);
      Alert.alert('Success', `Added ${count} questions!`);
      onRefreshCurriculum();
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/75 justify-end">
        <View className="bg-white rounded-t-[36px] h-[90%] p-6 flex-col">
          {/* Top Bar */}
          <View className="flex-row justify-between items-center pb-3 border-b border-slate-100">
            <View className="flex-row items-center gap-2">
              <View className="w-10 h-10 rounded-xl bg-amber-400/20 items-center justify-center">
                <Ionicons name="shield-checkmark" size={22} color="#D97706" />
              </View>
              <View>
                <Text className="text-text-primary text-base font-bold font-inter">
                  Admin Curriculum Suite
                </Text>
                <Text className="text-text-secondary text-xs">
                  Create Grades, Topics, Subtopics & Questions
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Breadcrumb Bar */}
          <View className="flex-row items-center py-2.5 flex-wrap gap-1 border-b border-slate-100 mb-3">
            <TouchableOpacity
              onPress={() => {
                setViewLevel('grades');
                setCreatingType(null);
              }}
              className={`px-2.5 py-1 rounded-lg flex-row items-center gap-1 ${
                viewLevel === 'grades' ? 'bg-primary' : 'bg-slate-100'
              }`}
            >
              <Ionicons
                name="school-outline"
                size={12}
                color={viewLevel === 'grades' ? '#FFFFFF' : '#64748B'}
              />
              <Text
                className={`text-xs font-bold ${
                  viewLevel === 'grades' ? 'text-white' : 'text-slate-600'
                }`}
              >
                Grades
              </Text>
            </TouchableOpacity>

            {selectedGrade && (
              <>
                <Ionicons name="chevron-forward" size={12} color="#94A3B8" />
                <TouchableOpacity
                  onPress={() => {
                    setViewLevel('topics');
                    setCreatingType(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg flex-row items-center gap-1 ${
                    viewLevel === 'topics' ? 'bg-primary' : 'bg-slate-100'
                  }`}
                >
                  <Ionicons
                    name="book-outline"
                    size={12}
                    color={viewLevel === 'topics' ? '#FFFFFF' : '#64748B'}
                  />
                  <Text
                    className={`text-xs font-bold ${
                      viewLevel === 'topics' ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {selectedGrade.name}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {selectedTopic && viewLevel !== 'topics' && (
              <>
                <Ionicons name="chevron-forward" size={12} color="#94A3B8" />
                <TouchableOpacity
                  onPress={() => {
                    setViewLevel('exercises');
                    setCreatingType(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg flex-row items-center gap-1 ${
                    viewLevel === 'exercises' ? 'bg-primary' : 'bg-slate-100'
                  }`}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={12}
                    color={viewLevel === 'exercises' ? '#FFFFFF' : '#64748B'}
                  />
                  <Text
                    className={`text-xs font-bold ${
                      viewLevel === 'exercises' ? 'text-white' : 'text-slate-600'
                    }`}
                    numberOfLines={1}
                  >
                    {selectedTopic.title}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {selectedExercise && (viewLevel === 'levels' || viewLevel === 'questions') && (
              <>
                <Ionicons name="chevron-forward" size={12} color="#94A3B8" />
                <TouchableOpacity
                  onPress={() => {
                    setViewLevel('levels');
                    setCreatingType(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg flex-row items-center gap-1 ${
                    viewLevel === 'levels' ? 'bg-primary' : 'bg-slate-100'
                  }`}
                >
                  <Ionicons
                    name="trophy-outline"
                    size={12}
                    color={viewLevel === 'levels' ? '#FFFFFF' : '#64748B'}
                  />
                  <Text
                    className={`text-xs font-bold ${
                      viewLevel === 'levels' ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    Practice Levels
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Main Scrollable Body */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {loading && (
              <View className="py-4 items-center">
                <ActivityIndicator color="#8B5CF6" />
              </View>
            )}

            {/* ======================================================== */}
            {/* LEVEL 0: GRADES VIEW */}
            {/* ======================================================== */}
            {viewLevel === 'grades' && (
              <View className="gap-y-3 pb-8">
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-primary text-sm font-bold font-inter">
                    Curriculum Grades (1 to 5+)
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCreatingType(creatingType === 'grade' ? null : 'grade')}
                    className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl flex-row items-center gap-1"
                  >
                    <Ionicons name="add-circle" size={16} color="#8B5CF6" />
                    <Text className="text-primary text-xs font-bold font-inter">
                      {creatingType === 'grade' ? 'Cancel' : '+ Add Grade'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Grade Creator Form */}
                {creatingType === 'grade' && (
                  <View className="bg-purple-50/70 p-4 rounded-2xl border border-primary/20 gap-y-3">
                    <Text className="text-primary font-bold text-xs uppercase tracking-wider">
                      Create New Grade
                    </Text>
                    <TextInput
                      value={gradeNumber}
                      onChangeText={setGradeNumber}
                      placeholder="Grade Number (e.g. 2, 3, 4, 5)"
                      keyboardType="numeric"
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />
                    <TextInput
                      value={gradeName}
                      onChangeText={setGradeName}
                      placeholder="Grade Name (e.g. Grade 2)"
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />
                    <TextInput
                      value={gradeDesc}
                      onChangeText={setGradeDesc}
                      placeholder="Description / Focus Areas"
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />
                    <View className="flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                      <Text className="text-xs font-bold text-text-primary">
                        Enable Immediately for Students?
                      </Text>
                      <Switch value={gradeEnabled} onValueChange={setGradeEnabled} />
                    </View>
                    <TouchableOpacity
                      onPress={handleCreateGrade}
                      className="bg-primary py-3 rounded-xl items-center shadow-xs"
                    >
                      <Text className="text-white font-bold text-xs">Save & Create Grade</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Grades List */}
                {grades.map((grade) => (
                  <View
                    key={grade._id}
                    className="p-4 rounded-2xl border border-slate-100 bg-white shadow-xs flex-row items-center justify-between"
                  >
                    <TouchableOpacity
                      onPress={() => loadTopicsForGrade(grade)}
                      activeOpacity={0.7}
                      className="flex-row items-center gap-3 flex-1 mr-2"
                    >
                      <View className="w-11 h-11 rounded-xl bg-purple-50 items-center justify-center">
                        <Ionicons name="school" size={22} color="#8B5CF6" />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-text-primary text-sm font-bold font-inter">
                            {grade.name}
                          </Text>
                          <View
                            className={`px-2 py-0.5 rounded-full ${
                              grade.isEnabled ? 'bg-emerald-100' : 'bg-slate-100'
                            }`}
                          >
                            <Text
                              className={`text-[9px] font-bold uppercase ${
                                grade.isEnabled ? 'text-emerald-700' : 'text-slate-500'
                              }`}
                            >
                              {grade.isEnabled ? 'Enabled' : 'Disabled'}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-text-secondary text-xs mt-0.5" numberOfLines={1}>
                          {grade.description || 'Tap to manage topics & content'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <View className="flex-row items-center gap-2">
                      <Switch
                        value={grade.isEnabled}
                        onValueChange={() => handleToggleGrade(grade._id)}
                        trackColor={{ false: '#CBD5E1', true: '#8B5CF6' }}
                      />
                      <TouchableOpacity
                        onPress={() => loadTopicsForGrade(grade)}
                        className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center border border-slate-200"
                      >
                        <Ionicons name="arrow-forward" size={14} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* ======================================================== */}
            {/* LEVEL 1: TOPICS VIEW (IN SELECTED GRADE) */}
            {/* ======================================================== */}
            {viewLevel === 'topics' && (
              <View className="gap-y-3 pb-8">
                <View className="flex-row justify-between items-center gap-2 mb-1">
                  <Text className="text-text-primary text-sm font-bold font-inter flex-1 mr-2" numberOfLines={1}>
                    Topics in {selectedGrade?.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCreatingType(creatingType === 'topic' ? null : 'topic')}
                    className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex-row items-center gap-1 shrink-0"
                  >
                    <Ionicons name="add-circle" size={16} color="#10B981" />
                    <Text className="text-emerald-700 text-xs font-bold font-inter">
                      {creatingType === 'topic' ? 'Cancel' : '+ Add Topic'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Topic Creator Form with Introduction! */}
                {creatingType === 'topic' && (
                  <View className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 gap-y-3">
                    <Text className="text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      Add Topic & Topic Introduction / Overview
                    </Text>
                    <TextInput
                      value={topicTitle}
                      onChangeText={setTopicTitle}
                      placeholder="Topic Title (e.g. Addition, Multiplication)"
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />
                    <TextInput
                      value={topicDesc}
                      onChangeText={setTopicDesc}
                      placeholder="Short Subtitle / Description"
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />
                    
                    <Text className="text-slate-700 text-[11px] font-bold mt-1">
                      📖 Topic Introduction / Overview Content:
                    </Text>
                    <TextInput
                      value={topicIntroSummary}
                      onChangeText={setTopicIntroSummary}
                      placeholder="Introduction Summary (e.g. Why addition is important in daily life...)"
                      multiline
                      numberOfLines={3}
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />
                    <TextInput
                      value={topicKeyTakeaway}
                      onChangeText={setTopicKeyTakeaway}
                      placeholder="Key Concept / Rule (e.g. Combining groups together = plus symbol)"
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />
                    <TextInput
                      value={topicIntroExample}
                      onChangeText={setTopicIntroExample}
                      placeholder="Visual Example (e.g. 2 Apples + 3 Apples = 5 Apples)"
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />

                    <TouchableOpacity
                      onPress={handleCreateTopic}
                      className="bg-emerald-600 py-3 rounded-xl items-center shadow-xs"
                    >
                      <Text className="text-white font-bold text-xs">Save & Create Topic</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Topics List */}
                {topics.length === 0 ? (
                  <View className="py-8 items-center justify-center bg-slate-50 rounded-2xl">
                    <Ionicons name="book-outline" size={32} color="#94A3B8" />
                    <Text className="text-text-secondary text-xs mt-2 font-inter">
                      No topics created yet for {selectedGrade?.name}.
                    </Text>
                    <Text className="text-primary text-xs font-bold mt-1">
                      Tap "+ Add Topic" above to create one!
                    </Text>
                  </View>
                ) : (
                  topics.map((topic, idx) => (
                    <TouchableOpacity
                      key={topic._id}
                      onPress={() => loadExercisesForTopic(topic)}
                      activeOpacity={0.8}
                      className="p-4 rounded-2xl border border-slate-100 bg-white shadow-xs flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-3 flex-1 mr-2">
                        <View
                          className="w-10 h-10 rounded-xl items-center justify-center"
                          style={{ backgroundColor: `${topic.color || '#10B981'}15` }}
                        >
                          <Ionicons
                            name={(topic.icon as any) || 'calculator-outline'}
                            size={20}
                            color={topic.color || '#10B981'}
                          />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-1.5">
                            <Text className="text-text-secondary font-bold text-xs">#{idx + 1}</Text>
                            <Text className="text-text-primary text-sm font-bold font-inter">
                              {topic.title}
                            </Text>
                          </View>
                          <Text className="text-text-secondary text-xs mt-0.5" numberOfLines={1}>
                            {topic.introduction?.summary || topic.description || 'Tap to view Subtopics & Content'}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl">
                        <Text className="text-[11px] font-bold text-slate-700">Subtopics</Text>
                        <Ionicons name="chevron-forward" size={14} color="#64748B" />
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* ======================================================== */}
            {/* LEVEL 2: SUBTOPICS & EXERCISES VIEW (IN SELECTED TOPIC) */}
            {/* ======================================================== */}
            {viewLevel === 'exercises' && (
              <View className="gap-y-3 pb-8">
                <View className="flex-row justify-between items-center gap-2 mb-1">
                  <Text className="text-text-primary text-sm font-bold font-inter flex-1 mr-2" numberOfLines={1}>
                    Subtopics in {selectedTopic?.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCreatingType(creatingType === 'exercise' ? null : 'exercise')}
                    className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl flex-row items-center gap-1 shrink-0"
                  >
                    <Ionicons name="add-circle" size={16} color="#3B82F6" />
                    <Text className="text-blue-700 text-xs font-bold font-inter">
                      {creatingType === 'exercise' ? 'Cancel' : '+ Add Subtopic'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Subtopic & Exercise Creator Form */}
                {creatingType === 'exercise' && (
                  <View className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 gap-y-3">
                    <Text className="text-blue-900 font-bold text-xs uppercase tracking-wider">
                      Create Subtopic & Learning Content
                    </Text>
                    <View className="flex-row gap-2">
                      <TextInput
                        value={subtopicNum}
                        onChangeText={setSubtopicNum}
                        placeholder="Subtopic #"
                        keyboardType="numeric"
                        className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary w-24"
                      />
                      <TextInput
                        value={exerciseTitle}
                        onChangeText={setExerciseTitle}
                        placeholder="Subtopic Title (e.g. Adding Without Regrouping)"
                        className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary flex-1"
                      />
                    </View>

                    <Text className="text-slate-700 text-[11px] font-bold mt-1">
                      Learning Content Blocks:
                    </Text>
                    <TextInput
                      value={contentHeading}
                      onChangeText={setContentHeading}
                      placeholder="Concept Heading (e.g. Tens & Ones Rule)"
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />
                    <TextInput
                      value={contentText}
                      onChangeText={setContentText}
                      placeholder="Lesson Text / Explanation"
                      multiline
                      numberOfLines={3}
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />
                    <TextInput
                      value={contentExample}
                      onChangeText={setContentExample}
                      placeholder="Worked Example (e.g. 24 + 13 = 37)"
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />
                    <TextInput
                      value={contentTip}
                      onChangeText={setContentTip}
                      placeholder="Helpful Tip for students"
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />
                    <TextInput
                      value={minPassScore}
                      onChangeText={setMinPassScore}
                      placeholder="Min Pass % (default 80)"
                      keyboardType="numeric"
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary"
                    />

                    <TouchableOpacity
                      onPress={handleCreateExercise}
                      className="bg-blue-600 py-3 rounded-xl items-center shadow-xs"
                    >
                      <Text className="text-white font-bold text-xs">Save Subtopic & Content</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Subtopics List */}
                {exercises.length === 0 ? (
                  <View className="py-8 items-center justify-center bg-slate-50 rounded-2xl">
                    <Ionicons name="folder-open-outline" size={32} color="#94A3B8" />
                    <Text className="text-text-secondary text-xs mt-2 font-inter">
                      No subtopics created for this topic.
                    </Text>
                    <Text className="text-primary text-xs font-bold mt-1">
                      Tap "+ Add Subtopic" to add Subtopic 1!
                    </Text>
                  </View>
                ) : (
                  exercises.map((ex, idx) => (
                    <View
                      key={ex._id}
                      className="p-4 rounded-2xl border border-slate-100 bg-white shadow-xs gap-y-3"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2 flex-1 mr-2">
                          <View className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center">
                            <Text className="text-blue-700 font-black text-xs">S{ex.subtopicNumber || idx + 1}</Text>
                          </View>
                          <Text className="text-text-primary text-sm font-bold font-inter flex-1" numberOfLines={1}>
                            {ex.title}
                          </Text>
                        </View>
                      </View>

                      {/* Content Blocks summary */}
                      <View className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-row items-center gap-2">
                        <Ionicons name="book-outline" size={14} color="#64748B" />
                        <Text className="text-text-secondary text-[11px]" numberOfLines={2}>
                          {ex.learningContent?.blocks?.length || 0} Content Blocks • Pass Score: {ex.completionRequirement?.minScore || 80}%
                        </Text>
                      </View>

                      {/* Action buttons */}
                      <View className="flex-row gap-2 pt-1">
                        <TouchableOpacity
                          onPress={() => loadPracticeLevelsForExercise(ex)}
                          className="flex-1 bg-purple-50 border border-purple-200 py-2 rounded-xl flex-row items-center justify-center gap-1.5"
                        >
                          <Ionicons name="trophy-outline" size={14} color="#8B5CF6" />
                          <Text className="text-purple-700 text-xs font-bold">Practice Levels</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setSelectedExercise(ex);
                            openQuestionBuilder(ex, 'learn');
                          }}
                          className="flex-1 bg-slate-900 py-2 rounded-xl flex-row items-center justify-center gap-1.5"
                        >
                          <Ionicons name="help-circle-outline" size={14} color="#FBBF24" />
                          <Text className="text-white text-xs font-bold">Learn Questions</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ======================================================== */}
            {/* LEVEL 3: PRACTICE LEVELS VIEW */}
            {/* ======================================================== */}
            {viewLevel === 'levels' && (
              <View className="gap-y-3 pb-8">
                <View className="flex-row justify-between items-center gap-2 mb-1">
                  <Text className="text-text-primary text-sm font-bold font-inter flex-1 mr-2" numberOfLines={1}>
                    Practice Levels in {selectedExercise?.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCreatingType(creatingType === 'level' ? null : 'level')}
                    className="bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl flex-row items-center gap-1 shrink-0"
                  >
                    <Ionicons name="add-circle" size={16} color="#8B5CF6" />
                    <Text className="text-purple-700 text-xs font-bold font-inter">
                      {creatingType === 'level' ? 'Cancel' : '+ Add Level'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Practice Level Creator Form */}
                {creatingType === 'level' && (
                  <View className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 gap-y-3">
                    <Text className="text-purple-900 font-bold text-xs uppercase tracking-wider">
                      Add Practice Level (Level 1, 2, 3...)
                    </Text>
                    <View className="flex-row gap-2">
                      <TextInput
                        value={levelNum}
                        onChangeText={setLevelNum}
                        placeholder="Level #"
                        keyboardType="numeric"
                        className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary w-24"
                      />
                      <TextInput
                        value={levelTitle}
                        onChangeText={setLevelTitle}
                        placeholder="Level Title (e.g. Speed Drills)"
                        className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary flex-1"
                      />
                    </View>
                    <View className="flex-row gap-2">
                      <TextInput
                        value={levelQuestionCount}
                        onChangeText={setLevelQuestionCount}
                        placeholder="Question Count (30-50)"
                        keyboardType="numeric"
                        className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary flex-1"
                      />
                      <TextInput
                        value={levelPassScore}
                        onChangeText={setLevelPassScore}
                        placeholder="Passing % (e.g. 70)"
                        keyboardType="numeric"
                        className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-text-primary flex-1"
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleCreatePracticeLevel}
                      className="bg-primary py-3 rounded-xl items-center shadow-xs"
                    >
                      <Text className="text-white font-bold text-xs">Save Practice Level</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Practice Levels List */}
                {practiceLevels.length === 0 ? (
                  <View className="py-8 items-center justify-center bg-slate-50 rounded-2xl">
                    <Ionicons name="trophy-outline" size={32} color="#94A3B8" />
                    <Text className="text-text-secondary text-xs mt-2 font-inter">
                      No practice levels created for this subtopic.
                    </Text>
                    <Text className="text-primary text-xs font-bold mt-1">
                      Tap "+ Add Level" to configure Level 1!
                    </Text>
                  </View>
                ) : (
                  practiceLevels.map((lvl) => (
                    <View
                      key={lvl._id}
                      className="p-4 rounded-2xl border border-slate-100 bg-white shadow-xs flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-3 flex-1 mr-2">
                        <View className="w-10 h-10 rounded-xl bg-pink-50 items-center justify-center">
                          <Text className="text-pink-600 font-black text-sm">L{lvl.number}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-text-primary text-sm font-bold font-inter">
                            {lvl.title || `Level ${lvl.number}`}
                          </Text>
                          <Text className="text-text-secondary text-xs mt-0.5">
                            Target: {lvl.questionCount} Questions • Pass: {lvl.passingScore}%
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => openQuestionBuilder(lvl, 'practice')}
                        className="bg-slate-900 px-3.5 py-2 rounded-xl flex-row items-center gap-1.5"
                      >
                        <Ionicons name="cloud-upload-outline" size={14} color="#FBBF24" />
                        <Text className="text-white text-xs font-bold">Add Qs (JSON)</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ======================================================== */}
            {/* LEVEL 4: QUESTION JSON INGESTER */}
            {/* ======================================================== */}
            {viewLevel === 'questions' && (
              <View className="gap-y-4 pb-8">
                <View className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-row items-start gap-2.5">
                  <Ionicons name="locate-outline" size={18} color="#8B5CF6" />
                  <View className="flex-1">
                    <Text className="text-text-primary text-xs font-bold font-inter">
                      Target: {questionContext === 'learn' ? `Learn Questions for "${selectedExercise?.title}"` : `Practice Level ${selectedPracticeLevel?.number} for "${selectedExercise?.title}"`}
                    </Text>
                    <Text className="text-text-secondary text-[11px] mt-0.5">
                      Paste raw JSON array below. All 7 question types are validated automatically.
                    </Text>
                  </View>
                </View>

                {/* JSON Code Input */}
                <View>
                  <TextInput
                    value={jsonText}
                    onChangeText={setJsonText}
                    multiline
                    numberOfLines={12}
                    className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-3.5 rounded-xl border border-slate-800 h-72"
                    style={{ textAlignVertical: 'top' }}
                  />
                </View>

                {ingestStatus && (
                  <View className="bg-slate-100 p-3 rounded-xl">
                    <Text className="text-xs font-mono font-bold text-slate-800">{ingestStatus}</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleIngestQuestions}
                  disabled={loading}
                  className="bg-primary py-3.5 rounded-2xl items-center shadow-md flex-row justify-center gap-2"
                >
                  <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                  <Text className="text-white font-bold text-sm font-inter">
                    Upload Questions to Bank
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AdminPortalModal;
