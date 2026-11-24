import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Clock, Award, CheckCircle, AlertCircle, ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ExamsPage: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [examResult, setExamResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get('/api/v1/exams').then((res) => {
      if (res.data.success) setExams(res.data.data);
    });
  }, []);

  const handleStartExam = async (examId: string) => {
    try {
      const res = await axios.get(`/api/v1/exams/${examId}`);
      if (res.data.success) {
        setActiveExam(res.data.data);
        setAnswers({});
        setExamResult(null);
        setTimeLeft(res.data.data.duration_minutes * 60);
      }
    } catch (e) {
      alert('Failed to load exam questions');
    }
  };

  // Timer Countdown
  useEffect(() => {
    if (!activeExam || examResult) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeExam, examResult]);

  const handleSubmitExam = async () => {
    if (!activeExam) return;
    setSubmitting(true);
    try {
      const res = await axios.post('/api/v1/exams/submit', {
        paperId: activeExam.id,
        answers
      });
      if (res.data.success) {
        setExamResult(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl flex justify-between items-center">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold">
            National Evaluation System
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#142B4F] mt-2">
            Online Examinations & Model Papers
          </h1>
          <p className="text-xs text-slate-500">Grade 1–13 First Term, Second Term, Model Papers, and Revision Quizzes</p>
        </div>
      </div>

      {/* Active Exam Runner Modal / View */}
      {activeExam ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-6">
          
          {/* Quiz Header & Timer */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-[#142B4F]">{activeExam.title}</h2>
              <p className="text-xs text-slate-500">Total Marks: {activeExam.total_marks} • Questions: {activeExam.questions?.length}</p>
            </div>

            {!examResult && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-mono font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Exam Result View */}
          {examResult ? (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-2xl">
                {examResult.gradeLetter}
              </div>
              <h3 className="text-xl font-black text-[#142B4F]">Examination Completed!</h3>
              <p className="text-xs text-slate-600">
                You scored <strong>{examResult.obtainedMarks} / {examResult.totalMarks}</strong> ({examResult.percentage}%)
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setActiveExam(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#142B4F] text-white font-bold text-xs"
                >
                  Return to Exams Catalog
                </button>
              </div>
            </div>
          ) : (
            /* Questions List */
            <div className="space-y-6">
              {activeExam.questions?.map((q: any) => (
                <div key={q.id} className="p-5 rounded-2xl bg-[#F5F7FB] border border-slate-200 space-y-3">
                  <p className="font-bold text-xs text-slate-800">
                    Question {q.question_number}: {q.question_text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options?.map((opt: string, idx: number) => (
                      <label
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          answers[q.id] === opt
                            ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB] font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                          className="accent-[#2563EB]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveExam(null)}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-lg"
                >
                  {submitting ? 'Submitting...' : 'Submit & Grade Exam'}
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Exams Catalog Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-bold">
                    Grade {exam.grade} • {exam.subject_name}
                  </span>
                  <span className="text-[10px] font-bold text-[#14B8A6]">{exam.exam_category}</span>
                </div>

                <h3 className="font-bold text-sm text-[#142B4F] leading-snug">{exam.title}</h3>
                <p className="text-xs text-slate-500">{exam.instructions}</p>

                <div className="flex items-center gap-4 text-xs text-slate-600 pt-2">
                  <span>Duration: <strong>{exam.duration_minutes} Mins</strong></span>
                  <span>Marks: <strong>{exam.total_marks}</strong></span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleStartExam(exam.id)}
                  className="px-5 py-2.5 rounded-xl bg-[#142B4F] hover:bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Online Exam</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
