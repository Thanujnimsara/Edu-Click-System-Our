import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, Users, Award, Shield, CheckCircle, CreditCard, 
  Building, Upload, ArrowRight, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ClassDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<any | null>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'PAYHERE' | 'BANK_TRANSFER'>('PAYHERE');

  // Bank Transfer Form
  const [selectedBankId, setSelectedBankId] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [slipUrl, setSlipUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/v1/classes/${id}`).then((res) => {
      if (res.data.success) setClassData(res.data.data);
    });

    axios.get('/api/v1/payments/bank-accounts').then((res) => {
      if (res.data.success && res.data.data.length > 0) {
        setBankAccounts(res.data.data);
        setSelectedBankId(res.data.data[0].id);
      }
    });
  }, [id]);

  const handleFreeEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.post('/api/v1/enrollments', { classId: id });
      if (res.data.success) {
        alert('Enrolled in free class successfully!');
        navigate('/student');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Enrollment failed');
    }
  };

  const handlePayHereCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/v1/payments/payhere/initiate', { classId: id });
      if (res.data.success) {
        const payData = res.data.data;
        // Mock gateway completion for sandbox environment
        setTimeout(async () => {
          // Direct enrollment
          await axios.post('/api/v1/enrollments', { classId: id });
          alert(`Payment of LKR ${payData.amount} successful via PayHere Sandbox! Class added to your timetable.`);
          navigate('/student');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment initiation failed.');
      setLoading(false);
    }
  };

  const handleBankTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/v1/payments/bank-slip', {
        classId: id,
        bankAccountId: selectedBankId,
        referenceNumber,
        depositDate,
        slipImageUrl: slipUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400'
      });

      if (res.data.success) {
        alert('Bank deposit slip submitted! The Administrator will verify the slip shortly.');
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit bank slip.');
    } finally {
      setLoading(false);
    }
  };

  if (!classData) return <div className="p-12 text-center text-xs font-bold text-slate-400">Loading class details...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold">
                Grade {classData.grade}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                {classData.subject_name}
              </span>
            </div>
            <h1 className="text-3xl font-black text-[#142B4F] leading-tight">{classData.title}</h1>
            <p className="text-xs text-slate-500 max-w-2xl">{classData.description}</p>
          </div>

          <div className="sm:text-right bg-[#F5F7FB] p-5 rounded-2xl border border-slate-100 min-w-[200px]">
            <p className="text-xs text-slate-400 font-semibold uppercase">Monthly Tuition Fee</p>
            <h2 className="text-3xl font-black text-[#142B4F]">
              {classData.is_free ? 'FREE' : `LKR ${Number(classData.fee_lkr).toLocaleString()}`}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">{classData.enrolled_count} / {classData.capacity} Seats Filled</p>
          </div>
        </div>

        {/* Schedule & Medium Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F5F7FB] text-xs">
          <div>
            <span className="text-slate-400 block font-semibold text-[10px]">SCHEDULE</span>
            <strong className="text-slate-800">{classData.day_of_week} ({classData.start_time} - {classData.end_time})</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold text-[10px]">MEDIUM</span>
            <strong className="text-slate-800">{classData.medium}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold text-[10px]">PLATFORM</span>
            <strong className="text-[#14B8A6]">{classData.class_type === 'BUILT_IN' ? 'EDU CLICK WebRTC' : classData.external_platform || 'Zoom/Meet'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold text-[10px]">AVAILABILITY</span>
            <strong className="text-emerald-600">Open for Enrollment</strong>
          </div>
        </div>

        {/* Enroll Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          {classData.is_free ? (
            <button
              onClick={handleFreeEnroll}
              className="px-8 py-3.5 rounded-2xl bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs shadow-lg transition-all"
            >
              Enroll for Free
            </button>
          ) : (
            <button
              onClick={() => setCheckoutModalOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#142B4F] to-[#2563EB] hover:from-blue-900 hover:to-blue-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <span>Enroll & Pay (LKR {Number(classData.fee_lkr).toLocaleString()})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Teacher Profile Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-base font-black text-[#142B4F]">About the Instructor</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#142B4F] text-white flex items-center justify-center font-bold text-xl shadow-md">
            {classData.teacher_name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">{classData.teacher_name} ({classData.teacher_id})</h4>
            <p className="text-xs text-[#2563EB] font-semibold">{classData.qualifications}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">{classData.teacher_bio || 'Experienced educator teaching according to the national syllabus.'}</p>
          </div>
        </div>
      </div>

      {/* DUAL PAYMENT MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-100">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#142B4F]">Complete Enrollment</h3>
                <p className="text-xs text-slate-500">Amount: <strong>LKR {Number(classData.fee_lkr).toLocaleString()}</strong></p>
              </div>
              <button onClick={() => setCheckoutModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setPaymentTab('PAYHERE')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  paymentTab === 'PAYHERE' ? 'bg-white text-[#2563EB] shadow-md' : 'text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>PayHere Online</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentTab('BANK_TRANSFER')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  paymentTab === 'BANK_TRANSFER' ? 'bg-white text-[#2563EB] shadow-md' : 'text-slate-600'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Bank Deposit Slip</span>
              </button>
            </div>

            {/* PayHere Gateway */}
            {paymentTab === 'PAYHERE' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                  <p className="font-bold">Instant Online Gateway (PayHere Sri Lanka)</p>
                  <p className="text-[11px] text-blue-700">
                    Supports Visa, MasterCard, eZ Cash, mCash, and Internet Banking.
                  </p>
                </div>

                <button
                  onClick={handlePayHereCheckout}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all"
                >
                  {loading ? 'Connecting to PayHere...' : `Pay LKR ${Number(classData.fee_lkr).toLocaleString()} Online`}
                </button>
              </div>
            )}

            {/* Bank Transfer */}
            {paymentTab === 'BANK_TRANSFER' && (
              <form onSubmit={handleBankTransferSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Bank Account</label>
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bank_name} - {b.account_number} ({b.account_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deposit Reference / Slip Number</label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. BOC-19283749"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deposit Date</label>
                  <input
                    type="date"
                    required
                    value={depositDate}
                    onChange={(e) => setDepositDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upload Slip Photo / PDF URL</label>
                  <input
                    type="text"
                    value={slipUrl}
                    onChange={(e) => setSlipUrl(e.target.value)}
                    placeholder="https://... or photo URL"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-[#142B4F] hover:bg-[#2563EB] text-white font-bold text-xs shadow-lg transition-all"
                >
                  {loading ? 'Submitting...' : 'Submit Slip for Admin Approval'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
