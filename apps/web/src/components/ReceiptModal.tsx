import React, { useState } from 'react';
import { Download, Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { saveFileToDesktop, sendDesktopNotification } from '../services/desktop';

interface ReceiptModalProps {
  receipt: {
    receiptNumber: string;
    studentName: string;
    registrationNumber: string;
    grade: number;
    subjectName: string;
    className: string;
    teacherName: string;
    paymentDate: string;
    paymentMethod: string;
    amountLkr: number;
    transactionId: string;
  };
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const receiptText = `
============================================================
              EDU CLICK – OFFICIAL RECEIPT
      One Platform. Every Device. Every Student.
============================================================
Receipt Number:   ${receipt.receiptNumber}
Date:             ${receipt.paymentDate}
Student Name:     ${receipt.studentName}
Registration No:  ${receipt.registrationNumber}
Grade & Subject:  Grade ${receipt.grade} • ${receipt.subjectName}
Class:            ${receipt.className}
Teacher:          ${receipt.teacherName}
Payment Method:   ${receipt.paymentMethod}
Transaction ID:   ${receipt.transactionId}
------------------------------------------------------------
Total Paid:       LKR ${Number(receipt.amountLkr).toLocaleString()}.00
Status:           VERIFIED & APPROVED
============================================================
  Issued by EDU CLICK LMS (Pvt) Ltd. Valid electronic document.
============================================================
      `;

      const filename = `EDUCLICK-RECEIPT-${receipt.receiptNumber}.txt`;
      const savedPath = await saveFileToDesktop(filename, receiptText);

      await sendDesktopNotification(
        'Receipt Downloaded',
        `Receipt ${receipt.receiptNumber} saved to: ${savedPath}`
      );

      alert(`Official Receipt ${receipt.receiptNumber} has been saved to:\n${savedPath}`);
    } catch (e: any) {
      console.error('File saving error', e);
      alert('Unable to save receipt automatically. Please use the Print option.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 flex flex-col">
        
        {/* Receipt Header Bar */}
        <div className="bg-[#142B4F] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-blue-950/80 hover:bg-blue-900 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center">
              <img src="/brand/icon.svg" alt="EDU CLICK" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">EDU <span className="text-[#38BDF8]">CLICK</span></h2>
              <p className="text-[11px] text-[#14B8A6] font-semibold tracking-wider uppercase">
                Official Electronic Payment Receipt
              </p>
            </div>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-8 space-y-6 text-slate-800">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Receipt Number</p>
              <h3 className="text-lg font-black text-[#142B4F]">{receipt.receiptNumber}</h3>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-slate-500 font-semibold">Payment Status</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> VERIFIED & ACTIVE
              </span>
            </div>
          </div>

          {/* Student & Class Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-slate-400 font-medium">Student Full Name</p>
              <p className="font-bold text-slate-800 text-sm">{receipt.studentName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-medium">Student Registration Number</p>
              <p className="font-bold text-[#2563EB] text-sm">{receipt.registrationNumber}</p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-400 font-medium">Class & Subject</p>
              <p className="font-bold text-slate-800">{receipt.className} ({receipt.subjectName})</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-medium">Assigned Teacher</p>
              <p className="font-bold text-slate-800">{receipt.teacherName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-400 font-medium">Payment Method</p>
              <p className="font-bold text-slate-800">{receipt.paymentMethod}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-medium">Transaction Reference</p>
              <p className="font-bold text-slate-800 font-mono">{receipt.transactionId}</p>
            </div>
          </div>

          {/* Amount Paid Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Amount Paid</p>
              <p className="text-xs text-slate-400">Class Fee & Platform Access</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-[#142B4F]">LKR {Number(receipt.amountLkr).toLocaleString()}</h2>
              <p className="text-[10px] text-emerald-600 font-bold">100% Securely Processed</p>
            </div>
          </div>

          {/* Security Seal */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
              <span>Certified by EDU CLICK LMS Sri Lanka</span>
            </div>
            <span>Valid without physical signature</span>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-5 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Saving File...' : 'Save to Downloads'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>

      </div>
    </div>
  );
};
