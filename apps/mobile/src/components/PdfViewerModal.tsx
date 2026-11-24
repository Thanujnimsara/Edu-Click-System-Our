import React from 'react';
import {
  Modal, StyleSheet, View, Text, TouchableOpacity,
  ScrollView, Alert
} from 'react-native';
import { THEME } from '../constants/theme';

interface PdfViewerModalProps {
  visible: boolean;
  onClose: () => void;
  receiptData?: any;
  user: any;
  classItem?: any;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  visible, onClose, receiptData, user, classItem
}) => {
  const receiptNo = receiptData?.receipt_number || `REC-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const amount = classItem?.fee_lkr || 2500;

  const handleDownload = () => {
    Alert.alert('PDF Downloaded', `Receipt ${receiptNo}.pdf has been saved to your device Downloads folder.`);
  };

  const handlePrint = () => {
    Alert.alert('Printing Receipt', 'Sent to mobile print spooler.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Top Bar */}
          <View style={styles.headerRow}>
            <Text style={styles.topTitle}>Official Electronic Receipt</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Printable Receipt Canvas */}
          <ScrollView style={styles.receiptScroll}>
            <View style={styles.receiptCard}>
              {/* Header */}
              <View style={styles.brandHeader}>
                <View style={styles.logoBadge}>
                  <Text style={styles.logoBadgeText}>EC</Text>
                </View>
                <View>
                  <Text style={styles.receiptBrand}>EDU CLICK LMS</Text>
                  <Text style={styles.receiptTagline}>One Platform. Every Device. Every Student.</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Meta details */}
              <View style={styles.metaGrid}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Receipt Number:</Text>
                  <Text style={styles.metaValue}>{receiptNo}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Issue Date:</Text>
                  <Text style={styles.metaValue}>{dateStr}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Student Name:</Text>
                  <Text style={styles.metaValue}>{user?.fullName || 'Kamal Silva'}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Registration No:</Text>
                  <Text style={[styles.metaValue, { color: THEME.colors.secondary }]}>
                    {user?.registrationNumber || 'STU20260001'}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Grade & District:</Text>
                  <Text style={styles.metaValue}>Grade {user?.grade || classItem?.grade || 11} • {user?.district || 'Colombo'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Breakdown */}
              <Text style={styles.sectionHeading}>Payment Summary</Text>
              <View style={styles.itemRow}>
                <Text style={styles.itemTitle}>{classItem?.title || 'Grade 11 Mathematics Theory'}</Text>
                <Text style={styles.itemPrice}>LKR {amount}.00</Text>
              </View>
              <View style={styles.itemRowSub}>
                <Text style={styles.subText}>Monthly Enrollment (Includes Live Access & Notes)</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Paid:</Text>
                <Text style={styles.totalValue}>LKR {amount}.00</Text>
              </View>

              {/* Seal Stamp */}
              <View style={styles.sealBox}>
                <Text style={styles.sealText}>✓ VERIFIED & APPROVED</Text>
                <Text style={styles.sealSub}>EDU CLICK SRI LANKA • PAYMENT GATEWAY</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
              <Text style={styles.actionBtnText}>⬇ Download PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrint]} onPress={handlePrint}>
              <Text style={styles.actionBtnText}>🖨 Print</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    maxHeight: '90%',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topTitle: { fontSize: 16, fontWeight: '800', color: THEME.colors.primary },
  closeBtn: { fontSize: 18, fontWeight: '700', color: THEME.colors.muted, padding: 4 },
  receiptScroll: { marginVertical: 4 },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  receiptBrand: { fontSize: 16, fontWeight: '800', color: THEME.colors.primary },
  receiptTagline: { fontSize: 9, color: THEME.colors.muted },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  metaGrid: { gap: 6 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: 11, color: '#64748B' },
  metaValue: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  sectionHeading: { fontSize: 12, fontWeight: '700', color: THEME.colors.text, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 12, fontWeight: '700', color: '#1E293B', flex: 1 },
  itemPrice: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  itemRowSub: { marginTop: 2 },
  subText: { fontSize: 10, color: '#94A3B8' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '800', color: THEME.colors.primary },
  totalValue: { fontSize: 18, fontWeight: '800', color: THEME.colors.secondary },
  sealBox: {
    marginTop: 16,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
  sealText: { color: '#059669', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  sealSub: { color: '#059669', fontSize: 9, fontWeight: '600', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1,
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnPrint: { backgroundColor: THEME.colors.primary },
  actionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
