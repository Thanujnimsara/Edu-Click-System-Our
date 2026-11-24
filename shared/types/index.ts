import {
  UserRole,
  Language,
  PaymentMethod,
  PaymentStatus,
  ClassStatus,
  ExamCategory,
  QuestionType,
  AttendanceStatus,
  LiveClassType,
  ExternalPlatform
} from '../constants';

export interface User {
  id: string;
  username: string;
  email: string;
  mobile: string;
  role: UserRole;
  isActive: boolean;
  preferredLanguage: Language;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  registrationNumber: string; // e.g. STU20260001
  fullName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  parentName: string;
  parentMobile: string;
  address: string;
  district: string;
  grade: number; // 1 - 13
}

export interface TeacherProfile {
  id: string;
  userId: string;
  teacherId: string; // e.g. TCH20260001
  fullName: string;
  qualifications: string;
  experienceYears: number;
  address: string;
  profilePictureUrl?: string;
  commissionPercentage: number; // e.g. 70 for 70%
  bio?: string;
  rating: number;
  totalStudents: number;
}

export interface AdminProfile {
  id: string;
  userId: string;
  fullName: string;
  department: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  grades: number[]; // e.g. [6, 7, 8, 9]
}

export interface ClassRoom {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  grade: number;
  teacherId: string;
  teacherName: string;
  teacherProfilePic?: string;
  feeLkr: number;
  isFree: boolean;
  capacity: number;
  enrolledCount: number;
  status: ClassStatus;
  medium: 'SINHALA' | 'TAMIL' | 'ENGLISH';
  scheduleDescription: string;
  dayOfWeek: string;
  startTime: string; // 'HH:mm'
  endTime: string;   // 'HH:mm'
  classType: LiveClassType;
  externalLink?: string;
  externalPlatform?: ExternalPlatform;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentRegNo: string;
  classId: string;
  classTitle: string;
  subjectName: string;
  grade: number;
  teacherName: string;
  enrolledAt: string;
  isActive: boolean;
  paymentStatus: PaymentStatus;
}

export interface PaymentReceipt {
  receiptNumber: string;
  paymentId: string;
  studentName: string;
  registrationNumber: string;
  grade: number;
  subject: string;
  teacherName: string;
  className: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  amountLkr: number;
  transactionId: string;
  status: PaymentStatus;
}

export interface BankTransferSubmission {
  id: string;
  paymentId: string;
  studentId: string;
  classId: string;
  bankName: string;
  accountNumber: string;
  depositDate: string;
  referenceNumber: string;
  slipFileUrl: string;
  submittedAt: string;
  verificationStatus: PaymentStatus;
  adminNotes?: string;
}

export interface ExaminationPaper {
  id: string;
  title: string;
  grade: number;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  examCategory: ExamCategory;
  term: 'FIRST' | 'SECOND' | 'THIRD' | 'ALL';
  academicYear: number;
  totalMarks: number;
  durationMinutes: number;
  scheduledDate: string;
  instructions: string;
  pdfFileUrl?: string;
  hasOnlineQuiz: boolean;
  questions?: ExaminationQuestion[];
  isPublished: boolean;
}

export interface ExaminationQuestion {
  id: string;
  paperId: string;
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  options?: string[]; // for MCQ
  correctAnswer?: string; // hidden from student during quiz
  allocatedMarks: number;
}

export interface ExamSubmission {
  id: string;
  paperId: string;
  paperTitle: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  obtainedMarks?: number;
  totalMarks: number;
  status: 'SUBMITTED' | 'MARKED' | 'PENDING';
  feedback?: string;
  submissionFileUrl?: string;
  answers?: Record<string, string>;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  classTitle: string;
  sessionDate: string;
  studentId: string;
  studentName: string;
  studentRegNo: string;
  status: AttendanceStatus;
  markedBy: string;
  markedAt: string;
}

export interface TeacherCommission {
  id: string;
  paymentId: string;
  teacherId: string;
  classId: string;
  totalClassFeeLkr: number;
  commissionPercentage: number;
  teacherEarningLkr: number;
  platformEarningLkr: number;
  status: 'PENDING' | 'PAID';
  createdAt: string;
}

export interface UserDeviceSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  platform: 'ANDROID' | 'IOS' | 'WINDOWS' | 'MACOS' | 'LINUX' | 'WEB';
  browser?: string;
  ipAddress: string;
  lastActive: string;
  isCurrentSession?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'PAYMENT' | 'CLASS' | 'EXAM' | 'SECURITY';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
