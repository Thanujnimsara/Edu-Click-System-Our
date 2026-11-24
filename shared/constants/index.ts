// Official Brand Constants for EDU CLICK
export const BRAND = {
  name: 'EDU CLICK',
  tagline: 'One Platform. Every Device. Every Student.',
  industry: 'Education Technology',
  colors: {
    primary: '#142B4F',
    secondary: '#2563EB',
    accent: '#14B8A6',
    background: '#F5F7FB',
    cards: '#FFFFFF',
    text: '#172033',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#E2E8F0',
    muted: '#64748B'
  }
} as const;

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export enum Language {
  ENGLISH = 'en',
  SINHALA = 'si',
  TAMIL = 'ta'
}

export const SUPPORTED_LANGUAGES = [
  { code: Language.ENGLISH, name: 'English', nativeName: 'English' },
  { code: Language.SINHALA, name: 'Sinhala', nativeName: 'සිංහල' },
  { code: Language.TAMIL, name: 'Tamil', nativeName: 'தமிழ்' }
] as const;

export const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
] as const;

export interface GradeDefinition {
  id: number;
  level: number;
  name: string;
  category: 'Primary' | 'Junior' | 'O/L' | 'A/L';
  description: string;
}

export const GRADES: GradeDefinition[] = [
  { id: 1, level: 1, name: 'Grade 1', category: 'Primary', description: 'Primary Education - Foundation Stage 1' },
  { id: 2, level: 2, name: 'Grade 2', category: 'Primary', description: 'Primary Education - Foundation Stage 2' },
  { id: 3, level: 3, name: 'Grade 3', category: 'Primary', description: 'Primary Education - Key Stage 1' },
  { id: 4, level: 4, name: 'Grade 4', category: 'Primary', description: 'Primary Education - Key Stage 2' },
  { id: 5, level: 5, name: 'Grade 5', category: 'Primary', description: 'Scholarship Examination Stage' },
  { id: 6, level: 6, name: 'Grade 6', category: 'Junior', description: 'Junior Secondary Stage 1' },
  { id: 7, level: 7, name: 'Grade 7', category: 'Junior', description: 'Junior Secondary Stage 2' },
  { id: 8, level: 8, name: 'Grade 8', category: 'Junior', description: 'Junior Secondary Stage 3' },
  { id: 9, level: 9, name: 'Grade 9', category: 'Junior', description: 'Junior Secondary Stage 4' },
  { id: 10, level: 10, name: 'Grade 10', category: 'O/L', description: 'G.C.E. Ordinary Level Year 1' },
  { id: 11, level: 11, name: 'Grade 11', category: 'O/L', description: 'G.C.E. Ordinary Level Exam Year' },
  { id: 12, level: 12, name: 'Grade 12', category: 'A/L', description: 'G.C.E. Advanced Level Year 1' },
  { id: 13, level: 13, name: 'Grade 13', category: 'A/L', description: 'G.C.E. Advanced Level Exam Year' }
];

export enum PaymentMethod {
  PAYHERE = 'PAYHERE',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED'
}

export enum ClassStatus {
  AVAILABLE = 'AVAILABLE',
  FULLY_BOOKED = 'FULLY_BOOKED',
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED'
}

export enum ExamCategory {
  FIRST_TERM = 'FIRST_TERM',
  SECOND_TERM = 'SECOND_TERM',
  THIRD_TERM = 'THIRD_TERM',
  MODEL_PAPERS = 'MODEL_PAPERS',
  MONTHLY_TESTS = 'MONTHLY_TESTS',
  REVISION_PAPERS = 'REVISION_PAPERS',
  PAST_PAPERS = 'PAST_PAPERS'
}

export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE'
}

export enum LiveClassType {
  BUILT_IN = 'BUILT_IN',
  EXTERNAL = 'EXTERNAL'
}

export enum ExternalPlatform {
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
  MS_TEAMS = 'MS_TEAMS'
}
