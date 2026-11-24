import React, { useState } from 'react';
import {
  Modal, StyleSheet, View, Text, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { THEME } from '../constants/theme';
import { api } from '../services/api';
import { triggerLocalNotification } from '../services/notifications';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  classItem: any;
  user: any;
  onPaymentSuccess: (receiptData?: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible, onClose, classItem, user, onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'PAYHERE' | 'BANK_SLIP'>('PAYHERE');
  const [selectedBank, setSelectedBank] = useState<'BOC' | 'COMMERCIAL' | 'HNB'>('BOC');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [slipFileUploaded, setSlipFileUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const bankAccounts = {
    BOC: { name: 'Bank of Ceylon', acc: '8920194420', branch: 'Colombo City Campus' },
    COMMERCIAL: { name: 'Commercial Bank', acc: '1000847291', branch: 'Torrington Branch' },
    HNB: { name: 'Hatton National Bank', acc: '0482910394', branch: 'Bambalapitiya' },
  };

  const handlePayHere = async () => {
    setLoading(true);
    try {
      // 1. Get payment initialization hash
      const initRes = await api.post('/payments/payhere-init', {
        classId: classItem.id,
        amount: classItem.fee_lkr || 2500,
      });

      // 2. Direct payment completion notification simulation
      const orderId = initRes.data?.data?.orderId || `ORD-${Date.now()}`;
      const notifyRes = await api.post('/payments/payhere-notify', {
        order_id: orderId,
        payment_id: `PH-${Math.floor(Math.random() * 900000 + 100000)}`,
        payhere_amount: classItem.fee_lkr || 2500,
        payhere_currency: 'LKR',
        status_code: '2', // Success
        custom_1: user?.id,
        custom_2: classItem?.id,
      });

      await triggerLocalNotification(
        'Payment Successful',
        `Enrolled in ${classItem.title}. Official receipt issued.`
      );

      Alert.alert(
        'Payment Completed',
        `LKR ${classItem.fee_lkr || 2500} successfully processed via PayHere. Your class access is active!`,
        [{ text: 'View Receipt', onPress: () => onPaymentSuccess(notifyRes.data) }]
      );
    } catch (e: any) {
      Alert.alert('Payment Error', e.response?.data?.message || 'Failed to complete transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleSlipUpload = async () => {
    if (!referenceNumber.trim()) {
      Alert.alert('Missing Field', 'Please enter your bank deposit reference / slip number.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/payments/upload-slip', {
        classId: classItem.id,
        bankName: bankAccounts[selectedBank].name,
        referenceNumber: referenceNumber.trim(),
        amount: classItem.fee_lkr || 2500,
        slipUrl: 'https://storage.educlick.lk/slips/sample-boc-slip.jpg',
      });

      await triggerLocalNotification(
        'Bank Slip Submitted',
        'Your deposit slip is queued for Admin verification.'
      );

      Alert.alert(
        'Slip Submitted',
        'Your bank deposit slip has been received. Our administration team will verify and activate your class enrollment shortly.',
        [{ text: 'OK', onPress: () => onPaymentSuccess() }]
      );
    } catch (e: any) {
      Alert.alert('Submission Error', e.response?.data?.message || 'Failed to submit slip.');
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
            <View>
              <Text style={styles.modalTitle}>Course Enrollment</Text>
              <Text style={styles.modalSubtitle}>Grade {classItem?.grade} • {classItem?.subject_name}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Fee Card */}
          <View style={styles.feeBanner}>
            <View>
              <Text style={styles.feeLabel}>Total Monthly Fee</Text>
              <Text style={styles.feeAmount}>LKR {classItem?.fee_lkr || 2500}.00</Text>
            </View>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>Grade {classItem?.grade}</Text>
            </View>
          </View>

          {/* Payment Method Selector */}
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[styles.methodBtn, paymentMethod === 'PAYHERE' && styles.methodBtnActive]}
              onPress={() => setPaymentMethod('PAYHERE')}
            >
              <Text style={[styles.methodBtnText, paymentMethod === 'PAYHERE' && styles.methodBtnTextActive]}>
                💳 PayHere Online
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodBtn, paymentMethod === 'BANK_SLIP' && styles.methodBtnActive]}
              onPress={() => setPaymentMethod('BANK_SLIP')}
            >
              <Text style={[styles.methodBtnText, paymentMethod === 'BANK_SLIP' && styles.methodBtnTextActive]}>
                🏦 Bank Deposit Slip
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll}>
            {paymentMethod === 'PAYHERE' ? (
              <View style={styles.tabContent}>
                <Text style={styles.infoTitle}>Instant Card & Mobile Payment</Text>
                <Text style={styles.infoBody}>
                  Pay securely using Sri Lankan Visa, MasterCard, Genie, FriMi, or eZ Cash via PayHere gateway. Class enrollment activates immediately upon payment.
                </Text>

                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>✓ Instant automated receipt generation</Text>
                  <Text style={styles.bulletItem}>✓ 256-bit SSL encrypted transaction</Text>
                  <Text style={styles.bulletItem}>✓ 70% Teacher / 30% Platform split accounted</Text>
                </View>

                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={handlePayHere}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.payBtnText}>Pay LKR {classItem?.fee_lkr || 2500}.00 Now</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tabContent}>
                <Text style={styles.infoTitle}>Direct Bank Transfer / Deposit</Text>
                <Text style={styles.infoBody}>
                  Deposit the monthly fee to any EDU CLICK official bank account and upload your deposit slip.
                </Text>

                {/* Bank Tabs */}
                <View style={styles.bankTabs}>
                  {(['BOC', 'COMMERCIAL', 'HNB'] as const).map(bank => (
                    <TouchableOpacity
                      key={bank}
                      style={[styles.bankTab, selectedBank === bank && styles.bankTabActive]}
                      onPress={() => setSelectedBank(bank)}
                    >
                      <Text style={[styles.bankTabText, selectedBank === bank && styles.bankTabTextActive]}>
                        {bank}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Bank Details Card */}
                <View style={styles.bankDetailCard}>
                  <Text style={styles.bankAccName}>Account: EDU CLICK (PVT) LTD</Text>
                  <Text style={styles.bankAccNumber}>A/C: {bankAccounts[selectedBank].acc}</Text>
                  <Text style={styles.bankBranch}>{bankAccounts[selectedBank].name} - {bankAccounts[selectedBank].branch}</Text>
                </View>

                {/* Input Ref */}
                <Text style={styles.inputLabel}>Deposit Reference / Slip No *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. BOC-DEP-99482"
                  value={referenceNumber}
                  onChangeText={setReferenceNumber}
                />

                {/* Simulated Slip Attachment */}
                <TouchableOpacity
                  style={[styles.uploadBox, slipFileUploaded && styles.uploadBoxDone]}
                  onPress={() => {
                    setSlipFileUploaded(true);
                    Alert.alert('Slip Attached', 'Deposit slip photograph selected successfully.');
                  }}
                >
                  <Text style={styles.uploadBoxText}>
                    {slipFileUploaded ? '✓ Bank Slip Attached (sample-slip.jpg)' : '📷 Tap to Capture or Attach Slip'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.payBtn, { backgroundColor: THEME.colors.secondary }]}
                  onPress={handleSlipUpload}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.payBtnText}>Submit Slip For Verification</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: THEME.colors.primary },
  modalSubtitle: { fontSize: 12, color: THEME.colors.muted },
  closeBtn: { fontSize: 18, fontWeight: '700', color: THEME.colors.muted, padding: 4 },
  feeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
  },
  feeLabel: { fontSize: 11, color: '#0369A1', fontWeight: '600' },
  feeAmount: { fontSize: 20, fontWeight: '800', color: '#0284C7' },
  gradeBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gradeBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  methodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 14,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  methodBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  methodBtnText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  methodBtnTextActive: { color: THEME.colors.primary, fontWeight: '700' },
  bodyScroll: { maxHeight: 380 },
  tabContent: { paddingVertical: 4 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: THEME.colors.text, marginBottom: 4 },
  infoBody: { fontSize: 12, color: THEME.colors.muted, lineHeight: 18, marginBottom: 10 },
  bulletList: { marginVertical: 8 },
  bulletItem: { fontSize: 12, color: '#059669', marginBottom: 4, fontWeight: '500' },
  payBtn: {
    backgroundColor: THEME.colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
  },
  payBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  bankTabs: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  bankTab: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  bankTabActive: {
    borderColor: THEME.colors.secondary,
    backgroundColor: '#EFF6FF',
  },
  bankTabText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  bankTabTextActive: { color: THEME.colors.secondary, fontWeight: '700' },
  bankDetailCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  bankAccName: { fontSize: 11, fontWeight: '700', color: THEME.colors.text },
  bankAccNumber: { fontSize: 13, fontWeight: '800', color: THEME.colors.secondary, marginVertical: 2 },
  bankBranch: { fontSize: 10, color: THEME.colors.muted },
  inputLabel: { fontSize: 11, fontWeight: '600', color: THEME.colors.text, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 10,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#94A3B8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginVertical: 4,
  },
  uploadBoxDone: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  uploadBoxText: { fontSize: 12, fontWeight: '600', color: '#475569' },
});
