import React from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import { THEME } from '../constants/theme';
import { Language, TRANSLATIONS } from '../constants/translations';

interface HomeScreenProps {
  currentLang: Language;
  user: any;
  classes: any[];
  onSelectGrade: (grade: number) => void;
  onOpenClass: (cls: any) => void;
  onJoinLive: (cls?: any) => void;
  onNavigateTab: (tab: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentLang, user, classes, onSelectGrade, onOpenClass, onJoinLive, onNavigateTab
}) => {
  const t = TRANSLATIONS[currentLang];
  const grades = Array.from({ length: 13 }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Welcome Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>NATIONAL CURRICULUM • SRI LANKA</Text>
        </View>
        <Text style={styles.heroTitle}>
          {user ? `Welcome back, ${user.fullName.split(' ')[0]}!` : 'Sri Lanka\'s Complete Grade 1–13 LMS'}
        </Text>
        <Text style={styles.heroSub}>
          One account across your phone, tablet, and computer. Fully synchronized learning.
        </Text>
      </View>

      {/* Live Class Spotlight Banner */}
      <View style={styles.liveBanner}>
        <View style={styles.liveBannerLeft}>
          <View style={styles.pulseTag}>
            <View style={styles.pulseDot} />
            <Text style={styles.pulseText}>NOW BROADCASTING</Text>
          </View>
          <Text style={styles.liveBannerTitle}>Grade 11 Mathematics Theory</Text>
          <Text style={styles.liveBannerSub}>With Kasun Bandara • WebRTC Room</Text>
        </View>
        <TouchableOpacity style={styles.liveJoinBtn} onPress={() => onJoinLive(classes[0])}>
          <Text style={styles.liveJoinText}>Join</Text>
        </TouchableOpacity>
      </View>

      {/* Grade Selector (Grade 1–13) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Browse By Grade</Text>
        <Text style={styles.sectionSub}>Select 1 to 13</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradeScroll}>
        {grades.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.gradeChip, user?.grade === g && styles.gradeChipActive]}
            onPress={() => onSelectGrade(g)}
          >
            <Text style={[styles.gradeChipText, user?.grade === g && styles.gradeChipTextActive]}>
              Grade {g}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Navigation Cards */}
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCard} onPress={() => onNavigateTab('CLASSES')}>
          <Text style={styles.quickIcon}>📚</Text>
          <Text style={styles.quickTitle}>{t.classes}</Text>
          <Text style={styles.quickCount}>{classes.length} Available</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => onNavigateTab('TIMETABLE')}>
          <Text style={styles.quickIcon}>📅</Text>
          <Text style={styles.quickTitle}>{t.timetable}</Text>
          <Text style={styles.quickCount}>Mon–Sun</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => onNavigateTab('EXAMS')}>
          <Text style={styles.quickIcon}>📝</Text>
          <Text style={styles.quickTitle}>{t.exams}</Text>
          <Text style={styles.quickCount}>MCQ Grader</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Classes */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.featuredClasses}</Text>
        <TouchableOpacity onPress={() => onNavigateTab('CLASSES')}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {classes.slice(0, 3).map((cls) => (
        <TouchableOpacity
          key={cls.id}
          style={styles.classCard}
          onPress={() => onOpenClass(cls)}
        >
          <View style={styles.classCardTop}>
            <View style={styles.gradePill}>
              <Text style={styles.gradePillText}>Grade {cls.grade} • {cls.subject_name}</Text>
            </View>
            <Text style={styles.classFee}>
              {cls.is_free ? t.free : `LKR ${cls.fee_lkr}.00`}
            </Text>
          </View>
          <Text style={styles.className}>{cls.title}</Text>
          <Text style={styles.classTeacher}>Instructor: {cls.teacher_name}</Text>
          <View style={styles.classCardBottom}>
            <Text style={styles.classTime}>⏰ {cls.day_of_week} ({cls.start_time} - {cls.end_time})</Text>
            <TouchableOpacity style={styles.enrollBtn} onPress={() => onOpenClass(cls)}>
              <Text style={styles.enrollBtnText}>{t.enrollNow}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  content: { padding: 16 },
  heroCard: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  heroBadge: {
    backgroundColor: '#1E3A66',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  heroBadgeText: { color: THEME.colors.accent, fontSize: 10, fontWeight: '800' },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: '#CBD5E1', fontSize: 12, lineHeight: 18 },
  liveBanner: {
    backgroundColor: '#0F223D',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveBannerLeft: { flex: 1, marginRight: 8 },
  pulseTag: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444', marginRight: 6 },
  pulseText: { color: '#EF4444', fontSize: 10, fontWeight: '800' },
  liveBannerTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  liveBannerSub: { color: '#94A3B8', fontSize: 11 },
  liveJoinBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  liveJoinText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: THEME.colors.text },
  sectionSub: { fontSize: 11, color: THEME.colors.muted },
  viewAllText: { fontSize: 12, fontWeight: '700', color: THEME.colors.secondary },
  gradeScroll: { flexDirection: 'row', marginBottom: 16 },
  gradeChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  gradeChipActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.secondary,
  },
  gradeChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  gradeChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  quickGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickIcon: { fontSize: 24, marginBottom: 4 },
  quickTitle: { fontSize: 12, fontWeight: '700', color: THEME.colors.text },
  quickCount: { fontSize: 10, color: THEME.colors.muted, marginTop: 2 },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  classCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  gradePill: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  gradePillText: { color: THEME.colors.secondary, fontSize: 11, fontWeight: '700' },
  classFee: { fontSize: 13, fontWeight: '800', color: THEME.colors.primary },
  className: { fontSize: 14, fontWeight: '700', color: THEME.colors.text, marginVertical: 2 },
  classTeacher: { fontSize: 11, color: THEME.colors.muted },
  classCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  classTime: { fontSize: 11, color: '#64748B' },
  enrollBtn: {
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  enrollBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
