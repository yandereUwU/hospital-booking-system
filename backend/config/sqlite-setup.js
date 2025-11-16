const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'med_appointment.db');
const db = new sqlite3.Database(dbPath);

// Создание таблиц
db.serialize(() => {
    // Таблица пользователей
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        birth_date DATE NOT NULL,
        phone TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Таблица врачей
    db.run(`CREATE TABLE IF NOT EXISTS Doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        specialization TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Таблица записей
    db.run(`CREATE TABLE IF NOT EXISTS Appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status TEXT DEFAULT 'scheduled',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id),
        FOREIGN KEY (doctor_id) REFERENCES Doctors(id)
    )`);

    // Добавляем тестовых врачей
    db.get("SELECT COUNT(*) as count FROM Doctors", (err, row) => {
        if (row.count === 0) {
            const doctors = [
                ['Иванов Петр Сергеевич', 'Терапевт', '+7-999-123-45-67', 'ivanov@clinic.ru'],
                ['Смирнова Ольга Владимировна', 'Кардиолог', '+7-999-123-45-68', 'smirnova@clinic.ru'],
                ['Петров Алексей Иванович', 'Невролог', '+7-999-123-45-69', 'petrov@clinic.ru']
            ];
            
            const stmt = db.prepare("INSERT INTO Doctors (full_name, specialization, phone, email) VALUES (?, ?, ?, ?)");
            doctors.forEach(doctor => stmt.run(doctor));
            stmt.finalize();
            
            console.log('✅ Test doctors added to SQLite');
        }
    });

    console.log('✅ SQLite database initialized');
});

module.exports = db;