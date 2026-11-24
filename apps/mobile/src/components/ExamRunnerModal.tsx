import React, { useState, useEffect } from 'react';
import {
  Modal, StyleSheet, View, Text, TouchableOpacity,
  ScrollView, Alert
} from 'react-native';
import { THEME } from '../constants/theme';
import { api } from '../services/api';

interface ExamRunnerModalProps {
  visible: boolean;
  onClose: () => void;
  exam: any;
  user: any;
}

export const ExamRunnerModal: React.FC<ExamRunnerModalProps> = ({
  visible, onClose, exam, user
}) => {
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins in seconds
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<any | null>(null);

  const sampleQuestions = [
    {
      id: 1,
      text: 'What is the solution to the quadratic equation x² - 5x + 6 = 0?',
      options: ['x = 2 or x = 3', 'x = -2 or x = -3', 'x = 1 or x = 6', 'x = -1 or x = -6'],
      correctIndex: 0,
    },
    {
      id: 2,
      text: 'In the Cartesian plane, what is the gradient of a line passing through (2, 3) and (4, 7)?',
      options: ['1', '2', '3', '4'],
      correctIndex: 1,
    },
    {
      id: 3,
      text: 'Which organelle is known as the powerhouse of the cell?',
      options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic Reticulum'],
      correctIndex: 2,
    },
    {
      id: 4,
      text: 'What is the chemical formula for photosynthesis glucose production?',
      options: ['C6H12O6', 'C12H22O11', 'CH4', 'H2SO4'],
      correctIndex: 0,
    },
    {
      id: 5,
      text: 'What is the SI unit of electrical resistance?',
      options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
      correctIndex: 2,
    },
  ];

  // Countdown timer
  useEffect(() => {
    if (!visible || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, submitted]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = async () => {
    let score = 0;
    sampleQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        score += 20; // 5 questions x 20 = 100 max
      }
    });

    let gradeLetter = 'F';
    if (score >= 75) gradeLetter = 'A';
    else if (score >= 65) gradeLetter = 'B';
    else if (score >= 50) gradeLetter = 'C';
    else if (score >= 35) gradeLetter = 'S';

    const result = {
      score,
      total: 100,
      gradeLetter,
      passed: score >= 35,
    };

    setScoreResult(result);
    setSubmitted(true);

    try {
      await api.post(`/exams/${exam?.id || 'sample-exam-1'}/submit`, {
        answers,
        score,
        gradeLetter,
      });
    } catch (e) {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.examTitle}>{exam?.title || 'Term 1 Evaluation - Mathematics'}</Text>
            <Text style={styles.examSub}>Grade {exam?.grade || 11} • Multiple Choice Questions</Text>
          </View>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>⏱ {formatTimer(timeLeft)}</Text>
          </View>
        </View>

        {submitted && scoreResult ? (
          <View style={styles.resultContainer}>
            <View style={styles.resultCard}>
              <Text style={styles.resultHeader}>Examination Completed</Text>
              <Text style={styles.scoreText}>{scoreResult.score} / {scoreResult.total}</Text>
              <View style={[styles.gradeBadge, { backgroundColor: scoreResult.passed ? '#10B981' : '#EF4444' }]}>
                <Text style={styles.gradeBadgeText}>Grade {scoreResult.gradeLetter}</Text>
              </View>
              <Text style={styles.feedbackText}>
                {scoreResult.passed
                  ? 'Congratulations! You passed this examination.'
                  : 'Keep practicing! Review your revision notes and try again.'}
              </Text>
              <TouchableOpacity style={styles.finishBtn} onPress={onClose}>
                <Text style={styles.finishBtnText}>Return to LMS</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView style={styles.questionScroll}>
            {/* Question Navigation Bubbles */}
            <View style={styles.navBubbles}>
              {sampleQuestions.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.bubble,
                    currentIndex === idx && styles.bubbleActive,
                    answers[idx] !== undefined && styles.bubbleAnswered,
                  ]}
                  onPress={() => setCurrentIndex(idx)}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      currentIndex === idx && styles.bubbleTextActive,
                    ]}
                  >
                    {idx + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Current Question */}
            <View style={styles.card}>
              <Text style={styles.qIndex}>Question {currentIndex + 1} of {sampleQuestions.length}</Text>
              <Text style={styles.qText}>{sampleQuestions[currentIndex].text}</Text>

              {/* Options */}
              <View style={styles.optionsList}>
                {sampleQuestions[currentIndex].options.map((opt, oIdx) => {
                  const isSelected = answers[currentIndex] === oIdx;
                  return (
                    <TouchableOpacity
                      key={oIdx}
                      style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                      onPress={() => handleSelectOption(currentIndex, oIdx)}
                    >
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]} />
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Navigation buttons */}
            <View style={styles.navButtonsRow}>
              <TouchableOpacity
                style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
                disabled={currentIndex === 0}
                onPress={() => setCurrentIndex(prev => prev - 1)}
              >
                <Text style={styles.navBtnText}>← Previous</Text>
              </TouchableOpacity>

              {currentIndex < sampleQuestions.length - 1 ? (
                <TouchableOpacity
                  style={[styles.navBtn, styles.navBtnPrimary]}
                  onPress={() => setCurrentIndex(prev => prev + 1)}
                >
                  <Text style={styles.navBtnTextPrimary}>Next →</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.navBtn, styles.submitBtn]}
                  onPress={() => {
                    Alert.alert(
                      'Submit Exam',
                      'Are you sure you want to finalize your exam answers?',
                      [
                        { text: 'Review', style: 'cancel' },
                        { text: 'Submit', onPress: handleSubmit },
                      ]
                    );
                  }}
                >
                  <Text style={styles.submitBtnText}>Submit Answers</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  topBar: {
    backgroundColor: THEME.colors.primary,
    paddingTop: 44,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  examSub: { color: '#94A3B8', fontSize: 11 },
  timerBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  timerText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  questionScroll: { padding: 16 },
  navBubbles: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  bubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleActive: { borderWidth: 2, borderColor: THEME.colors.secondary },
  bubbleAnswered: { backgroundColor: '#BBF7D0' },
  bubbleText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  bubbleTextActive: { color: THEME.colors.secondary },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  qIndex: { fontSize: 11, fontWeight: '700', color: THEME.colors.secondary, marginBottom: 6 },
  qText: { fontSize: 15, fontWeight: '600', color: THEME.colors.text, lineHeight: 22, marginBottom: 16 },
  optionsList: { gap: 10 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  optionItemSelected: {
    borderColor: THEME.colors.secondary,
    backgroundColor: '#EFF6FF',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: THEME.colors.secondary,
    backgroundColor: THEME.colors.secondary,
  },
  optionText: { fontSize: 13, color: '#334155' },
  optionTextSelected: { color: THEME.colors.primary, fontWeight: '700' },
  navButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnPrimary: { backgroundColor: THEME.colors.secondary },
  submitBtn: { backgroundColor: THEME.colors.accent },
  navBtnText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  navBtnTextPrimary: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  submitBtnText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  resultContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: { fontSize: 18, fontWeight: '800', color: THEME.colors.primary, marginBottom: 12 },
  scoreText: { fontSize: 36, fontWeight: '900', color: THEME.colors.secondary, marginVertical: 8 },
  gradeBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginVertical: 8 },
  gradeBadgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  feedbackText: { textAlign: 'center', color: '#64748B', fontSize: 13, marginVertical: 12 },
  finishBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  finishBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
