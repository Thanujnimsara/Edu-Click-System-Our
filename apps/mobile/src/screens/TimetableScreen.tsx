import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity
} from 'react-native';
import { THEME } from '../constants/theme';
import { Language, TRANSLATIONS } from '../constants/translations';

interface TimetableScreenProps {
  currentLang: Language;
  timetable: any[];
  onJoinLive: (classItem: any) => void;
}

export const TimetableScreen: React.FC<TimetableScreenProps> = ({
  currentLang, timetable, onJoinLive
}) => {
  const t = TRANSLATIONS[currentLang];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDay, setSelectedDay] = useState('Monday');

  const filtered = timetable.filter(item =>
    item.day_of_week?.toLowerCase() === selectedDay.toLowerCase()
  );

  return (
    <View style={styles.container}>
      {/* Day Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabs}>
        {days.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.dayTab, selectedDay === d && styles.dayTabActive]}
            onPress={() => setSelectedDay(d)}
          >
            <Text style={[styles.dayTabText, selectedDay === d && styles.dayTabTextActive]}>
              {d.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Day Schedule */}
      <ScrollView contentContainerStyle={styles.scheduleContent}>
        <View style={styles.dayHeadingRow}>
          <Text style={styles.dayHeading}>{selectedDay}'s Classes</Text>
          <Text style={styles.dayCount}>{filtered.length} Sessions</Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>☕</Text>
            <Text style={styles.emptyTitle}>No Sessions Scheduled</Text>
            <Text style={styles.emptySub}>Enjoy your revision day or review previous recordings.</Text>
          </View>
        ) : (
          filtered.map((item, idx) => (
            <View key={item.id || idx} style={styles.timelineItem}>
              {/* Time Pillar */}
              <View style={styles.timePillar}>
                <Text style={styles.timeStart}>{item.start_time || '16:00'}</Text>
                <View style={styles.timeLine} />
                <Text style={styles.timeEnd}>{item.end_time || '18:00'}</Text>
              </View>

              {/* Class Box */}
              <View style={styles.classBox}>
                <View style={styles.boxTop}>
                  <Text style={styles.gradeLabel}>Grade {item.grade || 11}</Text>
                  <TouchableOpacity
                    style={styles.joinBtn}
                    onPress={() => onJoinLive(item)}
                  >
                    <Text style={styles.joinBtnText}>{t.joinLive}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.classTitle}>{item.title || 'Advanced Mathematics'}</Text>
                <Text style={styles.instructor}>{item.teacher_name || 'Kasun Bandara'}</Text>
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
  dayTabs: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexGrow: 0,
  },
  dayTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayTabActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  dayTabText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  dayTabTextActive: { color: '#FFFFFF' },
  scheduleContent: { padding: 16 },
  dayHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  dayHeading: { fontSize: 16, fontWeight: '800', color: THEME.colors.text },
  dayCount: { fontSize: 12, color: THEME.colors.muted },
  emptyCard: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: THEME.colors.text },
  emptySub: { fontSize: 12, color: THEME.colors.muted, marginTop: 4, textAlign: 'center' },
  timelineItem: { flexDirection: 'row', marginBottom: 14 },
  timePillar: {
    width: 60,
    alignItems: 'center',
    marginRight: 10,
    paddingVertical: 4,
  },
  timeStart: { fontSize: 11, fontWeight: '800', color: THEME.colors.secondary },
  timeLine: { flex: 1, width: 2, backgroundColor: '#CBD5E1', marginVertical: 4 },
  timeEnd: { fontSize: 10, color: '#94A3B8' },
  classBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  boxTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  gradeLabel: { fontSize: 11, fontWeight: '700', color: THEME.colors.accent },
  joinBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  joinBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  classTitle: { fontSize: 14, fontWeight: '700', color: THEME.colors.text },
  instructor: { fontSize: 11, color: THEME.colors.muted, marginTop: 2 },
});
