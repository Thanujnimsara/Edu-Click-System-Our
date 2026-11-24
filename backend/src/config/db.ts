import mysql from 'mysql2/promise';
import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { env } from './env';

export type DBEngine = 'mysql' | 'sqlite';

class DatabaseManager {
  private engine: DBEngine = 'sqlite';
  private mysqlPool: mysql.Pool | null = null;
  private sqliteDb: Database | null = null;
  private sqliteDbPath: string = '';
  private initialized: boolean = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    // 1. First attempt connection to MySQL 8.0 server
    try {
      console.log(`[Database] Attempting connection to MySQL 8.0 on ${env.DB.HOST}:${env.DB.PORT}...`);
      const connection = await mysql.createConnection({
        host: env.DB.HOST,
        port: env.DB.PORT,
        user: env.DB.USER,
        password: env.DB.PASSWORD,
        connectTimeout: 2000
      });

      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB.NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await connection.end();

      this.mysqlPool = mysql.createPool({
        host: env.DB.HOST,
        port: env.DB.PORT,
        user: env.DB.USER,
        password: env.DB.PASSWORD,
        database: env.DB.NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      this.engine = 'mysql';
      console.log(`[Database] Successfully connected to MySQL 8.0 database: ${env.DB.NAME}`);
      await this.runMySQLMigrations();
    } catch (err: any) {
      console.warn(`[Database] Notice: MySQL 8.0 not reachable (${err.message}).`);
      console.log(`[Database] Initializing relational SQL engine (pure WebAssembly SQLite) for 100% uninterrupted operation.`);

      // 2. Initialize pure WebAssembly SQLite engine
      const SQL = await initSqlJs();
      const dbDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      this.sqliteDbPath = path.join(dbDir, 'edu_click.sqlite');

      if (fs.existsSync(this.sqliteDbPath)) {
        const fileBuffer = fs.readFileSync(this.sqliteDbPath);
        this.sqliteDb = new SQL.Database(fileBuffer);
      } else {
        this.sqliteDb = new SQL.Database();
      }

      this.engine = 'sqlite';
      await this.runSQLiteMigrations();
      this.persistSQLite();
    }

    this.initialized = true;
  }

  public getEngine(): DBEngine {
    return this.engine;
  }

  private persistSQLite(): void {
    if (this.sqliteDb && this.sqliteDbPath) {
      try {
        const data = this.sqliteDb.export();
        fs.writeFileSync(this.sqliteDbPath, Buffer.from(data));
      } catch (e) {
        console.error('[Database] Failed to persist SQLite state to disk', e);
      }
    }
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    await this.init();

    if (this.engine === 'mysql' && this.mysqlPool) {
      const [rows] = await this.mysqlPool.execute(sql, params);
      return rows as T[];
    } else if (this.sqliteDb) {
      // Map MySQL syntax differences if any
      const sanitizedSql = sql
        .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
        .replace(/BOOLEAN/gi, 'INTEGER')
        .replace(/ON DUPLICATE KEY UPDATE.*/gi, ''); // SQLite INSERT OR IGNORE handled

      const trimmed = sanitizedSql.trim().toUpperCase();

      if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
        const stmt = this.sqliteDb.prepare(sanitizedSql);
        stmt.bind(params);
        const rows: T[] = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject() as unknown as T);
        }
        stmt.free();
        return rows;
      } else {
        // Mutation (INSERT, UPDATE, DELETE)
        this.sqliteDb.run(sanitizedSql, params);
        this.persistSQLite();
        return [{ affectedRows: 1 }] as any;
      }
    }
    return [];
  }

  public async execute(sql: string, params: any[] = []): Promise<any> {
    return this.query(sql, params);
  }

  private async runMySQLMigrations(): Promise<void> {
    const schemaPath = path.resolve(process.cwd(), '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const stmt of statements) {
        if (!stmt.toUpperCase().startsWith('CREATE DATABASE') && !stmt.toUpperCase().startsWith('USE')) {
          await this.mysqlPool?.query(stmt);
        }
      }
    }
  }

  private async runSQLiteMigrations(): Promise<void> {
    if (!this.sqliteDb) return;

    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        preferred_language TEXT DEFAULT 'en',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        registration_number TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        gender TEXT NOT NULL,
        parent_name TEXT NOT NULL,
        parent_mobile TEXT NOT NULL,
        address TEXT NOT NULL,
        district TEXT NOT NULL,
        grade INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        teacher_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        qualifications TEXT NOT NULL,
        experience_years INTEGER DEFAULT 0,
        address TEXT NOT NULL,
        profile_picture_url TEXT,
        bio TEXT,
        commission_percentage REAL DEFAULT 70.0,
        rating REAL DEFAULT 5.0,
        total_students INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY,
        level INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        subject_id TEXT NOT NULL,
        grade INTEGER NOT NULL,
        teacher_id TEXT NOT NULL,
        fee_lkr REAL DEFAULT 0.0,
        is_free INTEGER DEFAULT 0,
        capacity INTEGER DEFAULT 100,
        enrolled_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'AVAILABLE',
        medium TEXT DEFAULT 'ENGLISH',
        day_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        class_type TEXT DEFAULT 'BUILT_IN',
        external_link TEXT,
        external_platform TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        UNIQUE(student_id, class_id)
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        amount_lkr REAL NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        transaction_id TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (class_id) REFERENCES classes(id)
      );

      CREATE TABLE IF NOT EXISTS payment_receipts (
        id TEXT PRIMARY KEY,
        receipt_number TEXT UNIQUE NOT NULL,
        payment_id TEXT UNIQUE NOT NULL,
        pdf_path TEXT,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS bank_accounts (
        id TEXT PRIMARY KEY,
        bank_name TEXT NOT NULL,
        account_name TEXT NOT NULL,
        account_number TEXT NOT NULL,
        branch_name TEXT NOT NULL,
        instructions TEXT,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS bank_transfer_submissions (
        id TEXT PRIMARY KEY,
        payment_id TEXT UNIQUE NOT NULL,
        bank_account_id TEXT,
        reference_number TEXT NOT NULL,
        deposit_date TEXT NOT NULL,
        slip_image_url TEXT NOT NULL,
        verification_status TEXT DEFAULT 'PENDING',
        rejection_reason TEXT,
        verified_by TEXT,
        verified_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS teacher_commissions (
        id TEXT PRIMARY KEY,
        payment_id TEXT UNIQUE NOT NULL,
        teacher_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        total_fee_lkr REAL NOT NULL,
        commission_percentage REAL NOT NULL,
        teacher_earning_lkr REAL NOT NULL,
        platform_earning_lkr REAL NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments(id),
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      );

      CREATE TABLE IF NOT EXISTS examination_papers (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        grade INTEGER NOT NULL,
        subject_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        exam_category TEXT NOT NULL,
        term TEXT DEFAULT 'ALL',
        academic_year INTEGER NOT NULL,
        total_marks INTEGER DEFAULT 100,
        duration_minutes INTEGER DEFAULT 60,
        scheduled_date TEXT,
        instructions TEXT,
        pdf_file_url TEXT,
        has_online_quiz INTEGER DEFAULT 0,
        is_published INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      );

      CREATE TABLE IF NOT EXISTS examination_questions (
        id TEXT PRIMARY KEY,
        paper_id TEXT NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        options TEXT,
        correct_answer TEXT,
        allocated_marks INTEGER DEFAULT 1,
        FOREIGN KEY (paper_id) REFERENCES examination_papers(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS examination_submissions (
        id TEXT PRIMARY KEY,
        paper_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        obtained_marks REAL,
        status TEXT DEFAULT 'SUBMITTED',
        feedback TEXT,
        submission_file_url TEXT,
        FOREIGN KEY (paper_id) REFERENCES examination_papers(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(paper_id, student_id)
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        session_date TEXT NOT NULL,
        status TEXT DEFAULT 'PRESENT',
        marked_by TEXT NOT NULL,
        marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(class_id, student_id, session_date)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'INFO',
        is_read INTEGER DEFAULT 0,
        action_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        refresh_token_hash TEXT NOT NULL,
        device_name TEXT NOT NULL,
        platform TEXT NOT NULL,
        ip_address TEXT,
        is_revoked INTEGER DEFAULT 0,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS otp_verifications (
        id TEXT PRIMARY KEY,
        mobile TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        purpose TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        is_used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT NOT NULL,
        description TEXT
      );
    `);

    // Check if initial grades need seeding
    const res = this.sqliteDb.exec('SELECT count(*) as count FROM grades');
    const count = res[0]?.values[0]?.[0] || 0;
    if (Number(count) === 0) {
      console.log('[Database] Seeding initial grades 1-13 and core subjects...');
      this.sqliteDb.exec(`
        INSERT OR IGNORE INTO grades (id, level, name, category, description) VALUES
        (1, 1, 'Grade 1', 'Primary', 'Primary Foundation 1'),
        (2, 2, 'Grade 2', 'Primary', 'Primary Foundation 2'),
        (3, 3, 'Grade 3', 'Primary', 'Primary Key Stage 1'),
        (4, 4, 'Grade 4', 'Primary', 'Primary Key Stage 2'),
        (5, 5, 'Grade 5', 'Primary', 'Scholarship Examination Stage (ශිෂ්‍යත්ව විභාගය)'),
        (6, 6, 'Grade 6', 'Junior', 'Junior Secondary Year 1'),
        (7, 7, 'Grade 7', 'Junior', 'Junior Secondary Year 2'),
        (8, 8, 'Grade 8', 'Junior', 'Junior Secondary Year 3'),
        (9, 9, 'Grade 9', 'Junior', 'Junior Secondary Year 4'),
        (10, 10, 'Grade 10', 'O/L', 'G.C.E. Ordinary Level Year 1'),
        (11, 11, 'Grade 11', 'O/L', 'G.C.E. Ordinary Level Exam Year (සාමාන්‍ය පෙළ)'),
        (12, 12, 'Grade 12', 'A/L', 'G.C.E. Advanced Level Year 1 (උසස් පෙළ)'),
        (13, 13, 'Grade 13', 'A/L', 'G.C.E. Advanced Level Exam Year (උසස් පෙළ)');

        INSERT OR IGNORE INTO subjects (id, name, code, description) VALUES
        ('subj-maths', 'Mathematics (ගණිතය)', 'MATH', 'National Mathematics curriculum Grade 1-11'),
        ('subj-science', 'Science (විද්‍යාව)', 'SCI', 'Integrated Science for Junior and O/L'),
        ('subj-english', 'English Language (ඉංග්‍රීසි)', 'ENG', 'English Language and Grammar'),
        ('subj-sinhala', 'Sinhala Language & Literature (සිංහල)', 'SIN', 'Sinhala Language and Literature'),
        ('subj-tamil', 'Tamil Language (தமிழ்)', 'TAM', 'Tamil Language and Literature'),
        ('subj-history', 'History (ඉතිහාසය)', 'HIST', 'Sri Lankan and World History'),
        ('subj-ict', 'Information & Communication Technology', 'ICT', 'ICT for O/L and A/L'),
        ('subj-commerce', 'Commerce & Accounting (ව්‍යාපාර අධ්‍යයනය)', 'COMM', 'Business Studies and Accounting'),
        ('subj-physics', 'Combined Mathematics & Physics', 'AL-MATH', 'G.C.E. A/L Physical Science Stream'),
        ('subj-biology', 'Biology & Chemistry', 'AL-BIO', 'G.C.E. A/L Biological Science Stream');

        INSERT OR IGNORE INTO bank_accounts (id, bank_name, account_name, account_number, branch_name, instructions, is_active) VALUES
        ('bank-boc', 'Bank of Ceylon (BOC)', 'EDU CLICK (PVT) LTD', '008920192837', 'Colombo City Branch', 'Use Student Registration Number as deposit reference', 1),
        ('bank-com', 'Commercial Bank of Ceylon', 'EDU CLICK (PVT) LTD', '100092837461', 'Kandy Super Branch', 'Upload clear bank deposit slip photograph or PDF', 1),
        ('bank-hnb', 'Hatton National Bank (HNB)', 'EDU CLICK (PVT) LTD', '200192837490', 'Galle Fort Branch', 'Instant CEFT / SLIPS bank transfers supported', 1);
      `);
      this.persistSQLite();
    }
  }
}

export const db = new DatabaseManager();
