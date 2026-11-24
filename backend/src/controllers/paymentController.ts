import { Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getBankAccounts(req: Request, res: Response): Promise<void> {
  try {
    const banks = await db.query('SELECT * FROM bank_accounts WHERE is_active = 1');
    res.json({ success: true, data: banks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function initiatePayHere(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { classId } = req.body;
    const userId = req.user?.userId;

    const students = await db.query('SELECT id, full_name, registration_number FROM students WHERE user_id = ?', [userId]);
    if (students.length === 0) {
      res.status(403).json({ success: false, message: 'Student profile not found.' });
      return;
    }
    const student = students[0];

    const classes = await db.query('SELECT * FROM classes WHERE id = ?', [classId]);
    if (classes.length === 0) {
      res.status(404).json({ success: false, message: 'Class not found.' });
      return;
    }
    const cls = classes[0];

    const orderId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const amount = Number(cls.fee_lkr).toFixed(2);
    const currency = 'LKR';
    const merchantId = env.PAYHERE.MERCHANT_ID;
    const merchantSecret = env.PAYHERE.MERCHANT_SECRET;

    // PayHere MD5 Hash calculation: md5(merchant_id + order_id + amount + currency + md5(merchant_secret))
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashString = `${merchantId}${orderId}${amount}${currency}${hashedSecret}`;
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    // Create payment entry in PENDING status
    const paymentId = uuidv4();
    await db.query(
      'INSERT INTO payments (id, student_id, class_id, amount_lkr, payment_method, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [paymentId, student.id, classId, cls.fee_lkr, 'PAYHERE', 'PENDING', orderId]
    );

    res.json({
      success: true,
      data: {
        paymentId,
        orderId,
        merchantId,
        amount,
        currency,
        hash,
        items: cls.title,
        customerName: student.full_name,
        sandbox: env.PAYHERE.MODE === 'sandbox'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function submitBankSlip(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { classId, bankAccountId, referenceNumber, depositDate, slipImageUrl } = req.body;
    const userId = req.user?.userId;

    if (!classId || !referenceNumber || !depositDate) {
      res.status(400).json({ success: false, message: 'Missing required bank deposit fields.' });
      return;
    }

    const students = await db.query('SELECT id, full_name, registration_number FROM students WHERE user_id = ?', [userId]);
    if (students.length === 0) {
      res.status(403).json({ success: false, message: 'Student profile not found.' });
      return;
    }
    const student = students[0];

    const classes = await db.query('SELECT * FROM classes WHERE id = ?', [classId]);
    if (classes.length === 0) {
      res.status(404).json({ success: false, message: 'Class not found.' });
      return;
    }
    const cls = classes[0];

    const paymentId = uuidv4();
    const submissionId = uuidv4();
    const transactionId = `SLIP-${Date.now()}`;

    // Create payment
    await db.query(
      'INSERT INTO payments (id, student_id, class_id, amount_lkr, payment_method, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [paymentId, student.id, classId, cls.fee_lkr, 'BANK_TRANSFER', 'PENDING', transactionId]
    );

    // Create bank transfer submission
    await db.query(
      'INSERT INTO bank_transfer_submissions (id, payment_id, bank_account_id, reference_number, deposit_date, slip_image_url, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [submissionId, paymentId, bankAccountId, referenceNumber, depositDate, slipImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400', 'PENDING']
    );

    res.status(201).json({
      success: true,
      message: 'Bank slip submitted successfully. Verification takes 1-2 business hours.',
      data: { paymentId, transactionId, status: 'PENDING' }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyPaymentHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const students = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (students.length === 0) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    const payments = await db.query(`
      SELECT p.*, c.title as class_title, s.name as subject_name,
             t.full_name as teacher_name, r.receipt_number
      FROM payments p
      JOIN classes c ON p.class_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN payment_receipts r ON p.id = r.payment_id
      WHERE p.student_id = ?
      ORDER BY p.created_at DESC
    `, [students[0].id]);

    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getReceipt(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { receiptNumber } = req.params;
    const receipts = await db.query(`
      SELECT r.receipt_number, r.generated_at,
             p.amount_lkr, p.payment_method, p.transaction_id, p.status,
             s.full_name as student_name, s.registration_number, s.grade,
             c.title as class_name, subj.name as subject_name,
             t.full_name as teacher_name
      FROM payment_receipts r
      JOIN payments p ON r.payment_id = p.id
      JOIN students s ON p.student_id = s.id
      JOIN classes c ON p.class_id = c.id
      JOIN subjects subj ON c.subject_id = subj.id
      JOIN teachers t ON c.teacher_id = t.id
      WHERE r.receipt_number = ?
    `, [receiptNumber]);

    if (receipts.length === 0) {
      res.status(404).json({ success: false, message: 'Receipt not found.' });
      return;
    }

    res.json({ success: true, data: receipts[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
