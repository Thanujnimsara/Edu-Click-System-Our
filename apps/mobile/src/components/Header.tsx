import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { Language, TRANSLATIONS } from '../constants/translations';

interface HeaderProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  user: any | null;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentLang, onSelectLang, user, onOpenAuth }) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>EC</Text>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>EDU </Text>
              <Text style={styles.brandAccent}>CLICK</Text>
            </View>
            <Text style={styles.brandTagline}>{t.tagline}</Text>
          </View>
        </View>

        {/* Language Switcher */}
        <View style={styles.langSelector}>
          {(['en', 'si', 'ta'] as Language[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.langBtn, currentLang === lang && styles.langBtnActive]}
              onPress={() => onSelectLang(lang)}
            >
              <Text style={[styles.langText, currentLang === lang && styles.langTextActive]}>
                {lang === 'en' ? 'EN' : lang === 'si' ? 'සිං' : 'த'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {user ? (
        <View style={styles.userBar}>
          <View style={styles.userDot} />
          <Text style={styles.userGreeting}>
            {user.fullName} • <Text style={styles.regNoText}>{user.registrationNumber || user.role}</Text>
          </Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.guestBar} onPress={onOpenAuth}>
          <Text style={styles.guestText}>Tap to Sign In or Register as Student</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: THEME.colors.primary,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A66',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  titleRow: {
    flexDirection: 'row',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: THEME.colors.accent,
    fontSize: 18,
    fontWeight: '800',
  },
  brandTagline: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  langSelector: {
    flexDirection: 'row',
    backgroundColor: '#0F1E36',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#264268',
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: THEME.colors.secondary,
  },
  langText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#0F223D',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 8,
  },
  userDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.success,
  },
  userGreeting: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
  regNoText: {
    color: THEME.colors.accent,
    fontWeight: '700',
  },
  guestBar: {
    marginTop: 10,
    backgroundColor: '#1E3A66',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  guestText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
  },
});
