import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  TextInput
} from 'react-native';
import { THEME } from '../constants/theme';
import { Language, TRANSLATIONS } from '../constants/translations';

interface ClassesScreenProps {
  currentLang: Language;
  classes: any[];
  user: any;
  onEnroll: (cls: any) => void;
  onViewReceipt: (cls: any) => void;
}

export const ClassesScreen: React.FC<ClassesScreenProps> = ({
  currentLang, classes, user, onEnroll, onViewReceipt
}) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const grades = Array.from({ length: 13 }, (_, i) => i + 1);

  const filtered = classes.filter(cls => {
    const matchesGrade = selectedGrade === null || cls.grade === selectedGrade;
    const matchesSearch = !searchQuery.trim() ||
      cls.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.subject_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Grade Selector Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradeTabs}>
        <TouchableOpacity
          style={[styles.gradeTab, selectedGrade === null && styles.gradeTabActive]}
          onPress={() => setSelectedGrade(null)}
        >
          <Text style={[styles.gradeTabText, selectedGrade === null && styles.gradeTabTextActive]}>
            All Grades
          </Text>
        </TouchableOpacity>
        {grades.map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.gradeTab, selectedGrade === g && styles.gradeTabActive]}
            onPress={() => setSelectedGrade(g)}
          >
            <Text style={[styles.gradeTabText, selectedGrade === g && styles.gradeTabTextActive]}>
              Grade {g}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Class List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No Classes Found</Text>
            <Text style={styles.emptySub}>Try adjusting your grade filter or search query.</Text>
          </View>
        ) : (
          filtered.map(cls => (
            <View key={cls.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.badgeRow}>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeBadgeText}>Grade {cls.grade}</Text>
                  </View>
                  <Text style={styles.subjectText}>{cls.subject_name}</Text>
                </View>
                <Text style={styles.feeText}>
                  {cls.is_free ? t.free : `LKR ${cls.fee_lkr}.00`}
                </Text>
              </View>

              <Text style={styles.titleText}>{cls.title}</Text>
              <Text style={styles.teacherText}>👨‍🏫 {cls.teacher_name}</Text>
              <Text style={styles.timeText}>🗓 {cls.day_of_week} • {cls.start_time} - {cls.end_time}</Text>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.enrollBtn}
                  onPress={() => onEnroll(cls)}
                >
                  <Text style={styles.enrollBtnText}>{t.enrollNow}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.receiptBtn}
                  onPress={() => onViewReceipt(cls)}
                >
                  <Text style={styles.receiptBtnText}>{t.viewReceipt}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
  },
  gradeTabs: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexGrow: 0,
  },
  gradeTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gradeTabActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  gradeTabText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  gradeTabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gradeBadge: {
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gradeBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  subjectText: { color: THEME.colors.muted, fontSize: 12, fontWeight: '600' },
  feeText: { fontSize: 14, fontWeight: '800', color: THEME.colors.primary },
  titleText: { fontSize: 14, fontWeight: '700', color: THEME.colors.text, marginBottom: 4 },
  teacherText: { fontSize: 12, color: '#475569', marginBottom: 2 },
  timeText: { fontSize: 11, color: '#64748B', marginBottom: 12 },
  cardActions: { flexDirection: 'row', gap: 10 },
  enrollBtn: {
    flex: 1,
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  enrollBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  receiptBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  receiptBtnText: { color: '#475569', fontSize: 11, fontWeight: '600' },
  emptyCard: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: THEME.colors.text },
  emptySub: { fontSize: 12, color: THEME.colors.muted, marginTop: 4 },
});
