import React, { useState } from 'react';
import {
  Modal, StyleSheet, View, Text, TextInput,
  TouchableOpacity, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { THEME } from '../constants/theme';
import { api } from '../services/api';
import { loginUser } from '../services/auth';

interface AuthScreenProps {
  visible: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  visible, onClose, onAuthSuccess
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState(false);

  // Login inputs
  const [identifier, setIdentifier] = useState('student_kamal');
  const [password, setPassword] = useState('Student@1234');

  // Register inputs (All 11 Sri Lanka LMS Student Fields)
  const [fullName, setFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [dob, setDob] = useState('2009-05-14');
  const [gender, setGender] = useState('Male');
  const [guardianName, setGuardianName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [grade, setGrade] = useState(11);

  // OTP Verification state
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [generatedRegNo, setGeneratedRegNo] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your username/registration number and password.');
      return;
    }
    setLoading(true);
    try {
      const { user } = await loginUser(identifier.trim(), password.trim());
      Alert.alert('Welcome', `Signed in successfully as ${user.fullName}`);
      onAuthSuccess(user);
      onClose();
    } catch (e: any) {
      Alert.alert('Authentication Failed', e.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !regUsername || !mobile || !email || !regPassword) {
      Alert.alert('Missing Fields', 'Please fill in all required registration fields.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        fullName,
        username: regUsername,
        dateOfBirth: dob,
        gender,
        guardianName: guardianName || 'Parent / Guardian',
        mobile,
        email,
        password: regPassword,
        address: address || 'No. 12, Temple Road',
        district,
        grade,
      });

      if (res.data.success) {
        setPendingUserId(res.data.data.userId);
        setGeneratedRegNo(res.data.data.registrationNumber);
        setOtpCode(res.data.data.otp || '123456'); // pre-fill demo OTP
        setOtpModalVisible(true);
      }
    } catch (e: any) {
      Alert.alert('Registration Error', e.response?.data?.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || !pendingUserId) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        userId: pendingUserId,
        otp: otpCode.trim(),
      });

      if (res.data.success) {
        Alert.alert(
          'Account Activated!',
          `Registration successful. Your permanent Registration Number is ${generatedRegNo}. You can now sign in on any phone, tablet, or computer.`,
          [{
            text: 'Sign In Now',
            onPress: () => {
              setOtpModalVisible(false);
              setMode('LOGIN');
              setIdentifier(generatedRegNo || regUsername);
              setPassword(regPassword);
            }
          }]
        );
      }
    } catch (e: any) {
      Alert.alert('OTP Error', e.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>EC</Text>
              </View>
              <Text style={styles.brandTitle}>EDU CLICK</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Switcher */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'LOGIN' && styles.modeTabActive]}
              onPress={() => setMode('LOGIN')}
            >
              <Text style={[styles.modeTabText, mode === 'LOGIN' && styles.modeTabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'REGISTER' && styles.modeTabActive]}
              onPress={() => setMode('REGISTER')}
            >
              <Text style={[styles.modeTabText, mode === 'REGISTER' && styles.modeTabTextActive]}>
                Student Register
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody}>
            {mode === 'LOGIN' ? (
              <View style={styles.formArea}>
                <Text style={styles.label}>Username or Registration Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. STU20260001 or student_kamal"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.demoBox}>
                  <Text style={styles.demoTitle}>Quick Demo Credentials:</Text>
                  <Text style={styles.demoText}>Student: student_kamal / Student@1234</Text>
                  <Text style={styles.demoText}>Teacher: teacher_kasun / Teacher@1234</Text>
                </View>
              </View>
            ) : (
              <View style={styles.formArea}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Kamal Silva"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <Text style={styles.label}>Desired Username *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. kamal_2026"
                  value={regUsername}
                  onChangeText={setRegUsername}
                  autoCapitalize="none"
                />

                <View style={styles.rowTwo}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Grade (1–13) *</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={grade.toString()}
                      onChangeText={val => setGrade(parseInt(val, 10) || 1)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>District *</Text>
                    <TextInput
                      style={styles.input}
                      value={district}
                      onChangeText={setDistrict}
                    />
                  </View>
                </View>

                <Text style={styles.label}>Mobile Number (for SMS OTP) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0771234567"
                  keyboardType="phone-pad"
                  value={mobile}
                  onChangeText={setMobile}
                />

                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="kamal@example.com"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="At least 8 characters"
                  secureTextEntry
                  value={regPassword}
                  onChangeText={setRegPassword}
                />

                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repeat password"
                  secureTextEntry
                  value={regConfirmPassword}
                  onChangeText={setRegConfirmPassword}
                />

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Create Account & Send OTP</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* OTP Verification Modal */}
          {otpModalVisible && (
            <View style={styles.otpOverlay}>
              <View style={styles.otpCard}>
                <Text style={styles.otpHeader}>Verify Mobile OTP</Text>
                <Text style={styles.otpSub}>
                  Enter the 6-digit verification code sent to your registered mobile number.
                </Text>

                <TextInput
                  style={styles.otpInput}
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />

                <TouchableOpacity
                  style={styles.verifyBtn}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  <Text style={styles.verifyBtnText}>Activate Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '90%',
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  brandTitle: { fontSize: 16, fontWeight: '800', color: THEME.colors.primary },
  closeBtn: { fontSize: 18, fontWeight: '700', color: THEME.colors.muted, padding: 4 },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 14,
  },
  modeTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  modeTabActive: { backgroundColor: '#FFFFFF' },
  modeTabText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  modeTabTextActive: { color: THEME.colors.primary, fontWeight: '700' },
  scrollBody: { maxHeight: 420 },
  formArea: { paddingVertical: 4 },
  label: { fontSize: 11, fontWeight: '700', color: THEME.colors.text, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  rowTwo: { flexDirection: 'row', gap: 10 },
  submitBtn: {
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  demoBox: {
    marginTop: 14,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  demoTitle: { fontSize: 11, fontWeight: '700', color: THEME.colors.secondary, marginBottom: 2 },
  demoText: { fontSize: 11, color: '#1E40AF' },
  otpOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
  },
  otpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  otpHeader: { fontSize: 16, fontWeight: '800', color: THEME.colors.primary, marginBottom: 6 },
  otpSub: { fontSize: 11, color: THEME.colors.muted, textAlign: 'center', marginBottom: 14 },
  otpInput: {
    borderWidth: 1.5,
    borderColor: THEME.colors.secondary,
    borderRadius: 8,
    width: 140,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 4,
    paddingVertical: 8,
    marginBottom: 14,
  },
  verifyBtn: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  verifyBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});
