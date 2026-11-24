import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView,
  StatusBar, Alert, Platform
} from 'react-native';
import { THEME } from '../constants/theme';
import { Language, TRANSLATIONS } from '../constants/translations';
import { api, setAuthToken } from '../services/api';
import { getSecureItem, logoutUser } from '../services/auth';
import { setupNotificationChannels } from '../services/notifications';

// Components
import { Header } from '../components/Header';
import { LiveClassModal } from '../components/LiveClassModal';
import { PaymentModal } from '../components/PaymentModal';
import { PdfViewerModal } from '../components/PdfViewerModal';
import { ExamRunnerModal } from '../components/ExamRunnerModal';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ClassesScreen } from '../screens/ClassesScreen';
import { TimetableScreen } from '../screens/TimetableScreen';
import { ExamsScreen } from '../screens/ExamsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AuthScreen } from '../screens/AuthScreen';

type Tab = 'HOME' | 'CLASSES' | 'TIMETABLE' | 'EXAMS' | 'PROFILE';

export const AppNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('HOME');
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [user, setUser] = useState<any | null>(null);

  // Data states
  const [classes, setClasses] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);

  // Modal overlays
  const [authVisible, setAuthVisible] = useState(false);
  const [liveVisible, setLiveVisible] = useState(false);
  const [activeLiveClass, setActiveLiveClass] = useState<any | null>(null);

  const [paymentVisible, setPaymentVisible] = useState(false);
  const [activePaymentClass, setActivePaymentClass] = useState<any | null>(null);

  const [pdfVisible, setPdfVisible] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  const [examVisible, setExamVisible] = useState(false);
  const [activeExam, setActiveExam] = useState<any | null>(null);

  const t = TRANSLATIONS[currentLang];

  // Bootstrap app state
  useEffect(() => {
    setupNotificationChannels();
    restoreSession();
    fetchClasses();
  }, []);

  const restoreSession = async () => {
    try {
      const savedToken = await getSecureItem('accessToken');
      const savedUserStr = await getSecureItem('user');
      if (savedToken && savedUserStr) {
        setAuthToken(savedToken);
        const parsed = JSON.parse(savedUserStr);
        setUser(parsed);
        fetchTimetable();
      }
    } catch (e) {}
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes?status=AVAILABLE');
      if (res.data.success && res.data.data.length > 0) {
        setClasses(res.data.data);
      } else {
        // Fallback default Grade 1-13 classes if backend is bootstrapping
        setClasses([
          {
            id: 'cls-1',
            title: 'Grade 11 Mathematics Theory & Revision',
            grade: 11,
            subject_name: 'Mathematics',
            teacher_name: 'Kasun Bandara (B.Sc. Eng)',
            day_of_week: 'Monday',
            start_time: '16:00',
            end_time: '18:00',
            fee_lkr: 2500,
            is_free: false,
          },
          {
            id: 'cls-2',
            title: 'Grade 11 Science - Chemistry & Physics Units',
            grade: 11,
            subject_name: 'Science',
            teacher_name: 'Dr. Nimal Perera',
            day_of_week: 'Tuesday',
            start_time: '17:30',
            end_time: '19:30',
            fee_lkr: 2500,
            is_free: false,
          },
          {
            id: 'cls-3',
            title: 'Grade 10 ICT - Computer Hardware & Python Basics',
            grade: 10,
            subject_name: 'ICT',
            teacher_name: 'Saman Jayasinghe',
            day_of_week: 'Wednesday',
            start_time: '15:00',
            end_time: '17:00',
            fee_lkr: 2200,
            is_free: false,
          },
          {
            id: 'cls-4',
            title: 'Grade 12 Combined Mathematics - Integration Masterclass',
            grade: 12,
            subject_name: 'Combined Mathematics',
            teacher_name: 'Sunil Weerakkody',
            day_of_week: 'Thursday',
            start_time: '18:00',
            end_time: '21:00',
            fee_lkr: 3000,
            is_free: false,
          },
        ]);
      }
    } catch (e) {
      setClasses([
        {
          id: 'cls-1',
          title: 'Grade 11 Mathematics Theory & Revision',
          grade: 11,
          subject_name: 'Mathematics',
          teacher_name: 'Kasun Bandara (B.Sc. Eng)',
          day_of_week: 'Monday',
          start_time: '16:00',
          end_time: '18:00',
          fee_lkr: 2500,
          is_free: false,
        },
      ]);
    }
  };

  const fetchTimetable = async () => {
    try {
      const res = await api.get('/timetable/my');
      if (res.data.success && res.data.data.length > 0) {
        setTimetable(res.data.data);
      } else {
        setTimetable([
          { id: 'tt-1', day_of_week: 'Monday', title: 'Grade 11 Mathematics', start_time: '16:00', end_time: '18:00', teacher_name: 'Kasun Bandara', grade: 11 },
          { id: 'tt-2', day_of_week: 'Wednesday', title: 'Grade 11 Science Laboratory', start_time: '17:30', end_time: '19:30', teacher_name: 'Dr. Nimal Perera', grade: 11 },
          { id: 'tt-3', day_of_week: 'Saturday', title: 'Grade 11 English Revision', start_time: '09:00', end_time: '11:00', teacher_name: 'Anoma Gunasekara', grade: 11 },
        ]);
      }
    } catch (e) {
      setTimetable([
        { id: 'tt-1', day_of_week: 'Monday', title: 'Grade 11 Mathematics', start_time: '16:00', end_time: '18:00', teacher_name: 'Kasun Bandara', grade: 11 },
      ]);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
            setUser(null);
            setTimetable([]);
          },
        },
      ]
    );
  };

  // Actions
  const handleOpenLiveClass = (cls?: any) => {
    setActiveLiveClass(cls || classes[0]);
    setLiveVisible(true);
  };

  const handleOpenEnrollment = (cls: any) => {
    if (!user) {
      setAuthVisible(true);
      return;
    }
    setActivePaymentClass(cls);
    setPaymentVisible(true);
  };

  const handleOpenReceipt = (cls?: any) => {
    setActiveReceipt({
      receipt_number: `REC-2026-${Math.floor(Math.random() * 90000 + 10000)}`,
      amount: cls?.fee_lkr || 2500,
    });
    setActivePaymentClass(cls || classes[0]);
    setPdfVisible(true);
  };

  const handleStartExam = (exam: any) => {
    if (!user) {
      setAuthVisible(true);
      return;
    }
    setActiveExam(exam);
    setExamVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />

      {/* Persistent Header */}
      <Header
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        user={user}
        onOpenAuth={() => setAuthVisible(true)}
      />

      {/* Screen Routing */}
      <View style={styles.screenContainer}>
        {activeTab === 'HOME' && (
          <HomeScreen
            currentLang={currentLang}
            user={user}
            classes={classes}
            onSelectGrade={() => setActiveTab('CLASSES')}
            onOpenClass={handleOpenEnrollment}
            onJoinLive={handleOpenLiveClass}
            onNavigateTab={tab => setActiveTab(tab as Tab)}
          />
        )}

        {activeTab === 'CLASSES' && (
          <ClassesScreen
            currentLang={currentLang}
            classes={classes}
            user={user}
            onEnroll={handleOpenEnrollment}
            onViewReceipt={handleOpenReceipt}
          />
        )}

        {activeTab === 'TIMETABLE' && (
          <TimetableScreen
            currentLang={currentLang}
            timetable={timetable}
            onJoinLive={handleOpenLiveClass}
          />
        )}

        {activeTab === 'EXAMS' && (
          <ExamsScreen
            currentLang={currentLang}
            onStartExam={handleStartExam}
          />
        )}

        {activeTab === 'PROFILE' && (
          <ProfileScreen
            currentLang={currentLang}
            onSelectLang={setCurrentLang}
            user={user}
            onSignOut={handleSignOut}
            onOpenAuth={() => setAuthVisible(true)}
          />
        )}
      </View>

      {/* Native Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('HOME')}
        >
          <Text style={[styles.navIcon, activeTab === 'HOME' && styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, activeTab === 'HOME' && styles.navLabelActive]}>{t.home}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('CLASSES')}
        >
          <Text style={[styles.navIcon, activeTab === 'CLASSES' && styles.navIconActive]}>📚</Text>
          <Text style={[styles.navLabel, activeTab === 'CLASSES' && styles.navLabelActive]}>{t.classes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('TIMETABLE')}
        >
          <Text style={[styles.navIcon, activeTab === 'TIMETABLE' && styles.navIconActive]}>📅</Text>
          <Text style={[styles.navLabel, activeTab === 'TIMETABLE' && styles.navLabelActive]}>{t.timetable}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('EXAMS')}
        >
          <Text style={[styles.navIcon, activeTab === 'EXAMS' && styles.navIconActive]}>📝</Text>
          <Text style={[styles.navLabel, activeTab === 'EXAMS' && styles.navLabelActive]}>{t.exams}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('PROFILE')}
        >
          <Text style={[styles.navIcon, activeTab === 'PROFILE' && styles.navIconActive]}>👤</Text>
          <Text style={[styles.navLabel, activeTab === 'PROFILE' && styles.navLabelActive]}>{t.profile}</Text>
        </TouchableOpacity>
      </View>

      {/* Global Modals */}
      <AuthScreen
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
        onAuthSuccess={(authUser) => {
          setUser(authUser);
          fetchTimetable();
        }}
      />

      <LiveClassModal
        visible={liveVisible}
        onClose={() => setLiveVisible(false)}
        classItem={activeLiveClass}
        user={user}
      />

      <PaymentModal
        visible={paymentVisible}
        onClose={() => setPaymentVisible(false)}
        classItem={activePaymentClass}
        user={user}
        onPaymentSuccess={(recData) => {
          setPaymentVisible(false);
          setActiveReceipt(recData);
          setPdfVisible(true);
          fetchTimetable();
        }}
      />

      <PdfViewerModal
        visible={pdfVisible}
        onClose={() => setPdfVisible(false)}
        receiptData={activeReceipt}
        user={user}
        classItem={activePaymentClass}
      />

      <ExamRunnerModal
        visible={examVisible}
        onClose={() => setExamVisible(false)}
        exam={activeExam}
        user={user}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME.colors.primary },
  screenContainer: { flex: 1, backgroundColor: THEME.colors.background },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 18, marginBottom: 2, opacity: 0.6 },
  navIconActive: { opacity: 1 },
  navLabel: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  navLabelActive: { color: THEME.colors.secondary, fontWeight: '800' },
});
