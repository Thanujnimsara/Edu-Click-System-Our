import React, { useState } from 'react';
import {
  Modal, StyleSheet, View, Text, TouchableOpacity,
  TextInput, ScrollView, Alert, Platform
} from 'react-native';
import { THEME } from '../constants/theme';

interface LiveClassModalProps {
  visible: boolean;
  onClose: () => void;
  classItem: any;
  user: any;
}

export const LiveClassModal: React.FC<LiveClassModalProps> = ({
  visible, onClose, classItem, user
}) => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Kasun Bandara (Teacher)', text: 'Welcome everyone! Today we cover advanced algebraic factorizations.' },
    { id: '2', sender: 'Kamal Silva', text: 'Good afternoon Sir, audio is crystal clear.' },
  ]);
  const [messageText, setMessageText] = useState('');

  const toggleHandRaise = () => {
    const nextState = !handRaised;
    setHandRaised(nextState);
    if (nextState) {
      Alert.alert('Hand Raised', 'Your teacher has been notified that you have a question.');
      setChatMessages(prev => [
        ...prev,
        { id: Date.now().toString(), sender: user?.fullName || 'Student', text: '✋ Raised hand with a question.' }
      ]);
    }
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: user?.fullName || 'Student', text: messageText.trim() }
    ]);
    setMessageText('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Control Bar */}
        <View style={styles.topBar}>
          <View style={styles.titleArea}>
            <View style={styles.liveIndicator}>
              <View style={styles.redDot} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
            <Text style={styles.classTitle} numberOfLines={1}>
              {classItem?.title || 'Interactive WebRTC Live Classroom'}
            </Text>
          </View>
          <TouchableOpacity style={styles.leaveBtn} onPress={onClose}>
            <Text style={styles.leaveBtnText}>Leave</Text>
          </TouchableOpacity>
        </View>

        {/* Video Viewport */}
        <View style={styles.videoStage}>
          {/* Main Teacher Stream Simulation */}
          <View style={styles.teacherFeed}>
            <View style={styles.whiteboardArea}>
              <Text style={styles.boardHeader}>EDU CLICK Digital Whiteboard</Text>
              <Text style={styles.boardMath}>f(x) = ax² + bx + c</Text>
              <Text style={styles.boardMath}>Δ = b² - 4ac ≥ 0</Text>
              <Text style={styles.boardSub}>Real-time Low Latency Classroom</Text>
            </View>

            <View style={styles.instructorTag}>
              <Text style={styles.instructorName}>
                {classItem?.teacher_name || 'Instructor Kasun Bandara'}
              </Text>
            </View>
          </View>

          {/* Student PIP Tile */}
          <View style={styles.pipTile}>
            {camOn ? (
              <View style={styles.pipVideo}>
                <Text style={styles.pipText}>You ({user?.fullName?.split(' ')[0] || 'Me'})</Text>
                {!micOn && <Text style={styles.pipMuted}>Muted</Text>}
              </View>
            ) : (
              <View style={[styles.pipVideo, { backgroundColor: '#1E293B' }]}>
                <Text style={styles.pipText}>Camera Off</Text>
              </View>
            )}
          </View>

          {handRaised && (
            <View style={styles.handBadge}>
              <Text style={styles.handText}>✋ Hand Raised</Text>
            </View>
          )}
        </View>

        {/* Controls Toolbar */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={[styles.controlBtn, !micOn && styles.controlBtnMuted]}
            onPress={() => setMicOn(!micOn)}
          >
            <Text style={styles.controlIcon}>{micOn ? '🎤' : '🔇'}</Text>
            <Text style={styles.controlLabel}>{micOn ? 'Mute' : 'Unmute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, !camOn && styles.controlBtnMuted]}
            onPress={() => setCamOn(!camOn)}
          >
            <Text style={styles.controlIcon}>{camOn ? '📹' : '🚫'}</Text>
            <Text style={styles.controlLabel}>{camOn ? 'Cam Off' : 'Cam On'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, handRaised && styles.controlBtnAccent]}
            onPress={toggleHandRaise}
          >
            <Text style={styles.controlIcon}>✋</Text>
            <Text style={styles.controlLabel}>Raise Hand</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, showChat && styles.controlBtnActive]}
            onPress={() => setShowChat(!showChat)}
          >
            <Text style={styles.controlIcon}>💬</Text>
            <Text style={styles.controlLabel}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Live Chat Drawer */}
        {showChat && (
          <View style={styles.chatDrawer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatHeaderText}>Live Classroom Discussion</Text>
              <TouchableOpacity onPress={() => setShowChat(false)}>
                <Text style={styles.closeChatText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatList}>
              {chatMessages.map((msg) => (
                <View key={msg.id} style={styles.chatBubble}>
                  <Text style={styles.chatSender}>{msg.sender}</Text>
                  <Text style={styles.chatMessage}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Ask teacher a question..."
                value={messageText}
                onChangeText={setMessageText}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                <Text style={styles.sendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1220' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0F1E36',
  },
  titleArea: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  redDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', marginRight: 4 },
  liveBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  classTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  leaveBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  leaveBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  videoStage: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#050B14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherFeed: {
    width: '94%',
    height: '80%',
    backgroundColor: '#142B4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  whiteboardArea: {
    alignItems: 'center',
    padding: 20,
  },
  boardHeader: { color: '#14B8A6', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  boardMath: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginVertical: 4 },
  boardSub: { color: '#94A3B8', fontSize: 11, marginTop: 16 },
  instructorTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  instructorName: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  pipTile: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 90,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  pipVideo: {
    flex: 1,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  pipText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  pipMuted: { color: '#FCA5A5', fontSize: 9, marginTop: 2 },
  handBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  handText: { color: '#172033', fontWeight: '800', fontSize: 12 },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: '#0F1E36',
    borderTopWidth: 1,
    borderTopColor: '#1E3A66',
  },
  controlBtn: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  controlBtnMuted: { backgroundColor: '#EF444433' },
  controlBtnAccent: { backgroundColor: '#F59E0B44' },
  controlBtnActive: { backgroundColor: '#2563EB44' },
  controlIcon: { fontSize: 20, marginBottom: 2 },
  controlLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '600' },
  chatDrawer: {
    height: 240,
    backgroundColor: '#0F223D',
    borderTopWidth: 1,
    borderTopColor: '#2563EB',
    padding: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatHeaderText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  closeChatText: { color: '#94A3B8', fontSize: 16, fontWeight: '700' },
  chatList: { flex: 1, marginBottom: 8 },
  chatBubble: {
    backgroundColor: '#1E3A66',
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  chatSender: { color: '#14B8A6', fontSize: 10, fontWeight: '700' },
  chatMessage: { color: '#F8FAFC', fontSize: 11 },
  chatInputRow: { flexDirection: 'row', gap: 8 },
  chatInput: {
    flex: 1,
    backgroundColor: '#0A1424',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 12,
  },
  sendBtn: {
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 14,
    borderRadius: 6,
    justifyContent: 'center',
  },
  sendBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
});
