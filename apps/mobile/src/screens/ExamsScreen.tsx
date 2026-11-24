import React from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity
} from 'react-native';
import { THEME } from '../constants/theme';
import { Language, TRANSLATIONS } from '../constants/translations';

interface ExamsScreenProps {
  currentLang: Language;
  onStartExam: (exam: any) => void;
}

export const ExamsScreen: React.FC<ExamsScreenProps> = ({
  currentLang, onStartExam
}) => {
  const t = TRANSLATIONS[currentLang];

  const exams = [
    {
      id: 'exam-1',
      title: 'Term 1 Evaluation - Mathematics',
      grade: 11,
      subject: 'Mathematics',
      durationMinutes: 30,
      totalQuestions: 5,
      passMark: 35,
      status: 'AVAILABLE',
    },
    {
      id: 'exam-2',
      title: 'Science Assessment - Biology & Genetics',
      grade: 11,
      subject: 'Science',
      durationMinutes: 30,
      totalQuestions: 5,
      passMark: 35,
      status: 'AVAILABLE',
    },
    {
      id: 'exam-3',
      title: 'ICT Model Paper 01',
      grade: 11,
      subject: 'ICT',
      durationMinutes: 45,
      totalQuestions: 10,
      passMark: 35,
      status: 'UPCOMING',
    },
  ];

  const pastResults = [
    {
      id: 'res-1',
      title: 'Unit Test 02: Geometry & Trigonometry',
      date: '18 Nov 2026',
      score: 85,
      total: 100,
      gradeLetter: 'A',
    },
    {
      id: 'res-2',
      title: 'Chemistry Principles Evaluation',
      date: '10 Nov 2026',
      score: 72,
      total: 100,
      gradeLetter: 'B',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Active Exams */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Examinations</Text>
        <Text style={styles.sectionSub}>Auto-Graded MCQ</Text>
      </View>

      {exams.map(exam => (
        <View key={exam.id} style={styles.examCard}>
          <View style={styles.examTop}>
            <View style={styles.gradeTag}>
              <Text style={styles.gradeTagText}>Grade {exam.grade} • {exam.subject}</Text>
            </View>
            <View style={[styles.statusBadge, exam.status === 'UPCOMING' && styles.statusBadgeUpcoming]}>
              <Text style={styles.statusBadgeText}>{exam.status}</Text>
            </View>
          </View>

          <Text style={styles.examTitle}>{exam.title}</Text>
          <View style={styles.examMetaRow}>
            <Text style={styles.examMeta}>⏱ {exam.durationMinutes} Minutes</Text>
            <Text style={styles.examMeta}>📝 {exam.totalQuestions} Questions</Text>
            <Text style={styles.examMeta}>🎯 Pass: {exam.passMark}%</Text>
          </View>

          <TouchableOpacity
            style={[styles.startBtn, exam.status === 'UPCOMING' && styles.startBtnDisabled]}
            disabled={exam.status === 'UPCOMING'}
            onPress={() => onStartExam(exam)}
          >
            <Text style={styles.startBtnText}>
              {exam.status === 'UPCOMING' ? 'Available Soon' : t.startExam}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Examination History & Grades */}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>My Examination Results</Text>
        <Text style={styles.sectionSub}>Graded History</Text>
      </View>

      {pastResults.map(res => (
        <View key={res.id} style={styles.resultCard}>
          <View style={styles.resultLeft}>
            <Text style={styles.resultTitle}>{res.title}</Text>
            <Text style={styles.resultDate}>{res.date} • Score: {res.score}/{res.total}</Text>
          </View>
          <View style={[styles.gradeCircle, { backgroundColor: res.gradeLetter === 'A' ? '#10B981' : '#2563EB' }]}>
            <Text style={styles.gradeLetter}>{res.gradeLetter}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  content: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: THEME.colors.text },
  sectionSub: { fontSize: 11, color: THEME.colors.muted },
  examCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  examTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  gradeTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  gradeTagText: { color: THEME.colors.secondary, fontSize: 11, fontWeight: '700' },
  statusBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusBadgeUpcoming: { backgroundColor: '#FEF3C7' },
  statusBadgeText: { fontSize: 10, fontWeight: '800', color: '#166534' },
  examTitle: { fontSize: 14, fontWeight: '700', color: THEME.colors.text, marginVertical: 4 },
  examMetaRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  examMeta: { fontSize: 11, color: '#64748B' },
  startBtn: {
    backgroundColor: THEME.colors.accent,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  startBtnDisabled: { backgroundColor: '#CBD5E1' },
  startBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  resultLeft: { flex: 1, marginRight: 10 },
  resultTitle: { fontSize: 13, fontWeight: '700', color: THEME.colors.text },
  resultDate: { fontSize: 11, color: THEME.colors.muted, marginTop: 2 },
  gradeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeLetter: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
