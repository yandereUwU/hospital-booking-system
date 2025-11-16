const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', '..', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Initializing SQLite database...');

// Создание таблиц
db.serialize(async () => {
    // Таблица пользователей
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
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
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        status TEXT DEFAULT 'scheduled',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES Doctors(id) ON DELETE CASCADE
    )`);

    // Добавляем тестовых врачей
    db.get("SELECT COUNT(*) as count FROM Doctors", (err, row) => {
        if (err) {
            console.error('Error checking doctors:', err);
            return;
        }
        
        if (row.count === 0) {
            console.log('👨‍⚕️ Adding test doctors...');
            const doctors = [
                ['Иванов Петр Сергеевич', 'Терапевт', '+7-999-123-45-67', 'ivanov@clinic.ru'],
                ['Смирнова Ольга Владимировна', 'Кардиолог', '+7-999-123-45-68', 'smirnova@clinic.ru'],
                ['Петров Алексей Иванович', 'Невролог', '+7-999-123-45-69', 'petrov@clinic.ru'],
                ['Козлова Елена Михайловна', 'Офтальмолог', '+7-999-123-45-70', 'kozlova@clinic.ru'],
                ['Сидоров Дмитрий Николаевич', 'Хирург', '+7-999-123-45-71', 'sidorov@clinic.ru']
            ];
            
            const stmt = db.prepare("INSERT INTO Doctors (full_name, specialization, phone, email) VALUES (?, ?, ?, ?)");
            
            doctors.forEach(doctor => {
                stmt.run(doctor, function(err) {
                    if (err) {
                        console.error('Error inserting doctor:', err);
                    } else {
                        console.log(`✅ Added doctor: ${doctor[0]}`);
                    }
                });
            });
            
            stmt.finalize();
        } else {
            console.log(`✅ Doctors table already has ${row.count} records`);
        }
    });

    // Добавляем тестового пользователя
    const testPassword = await bcrypt.hash('password123', 10);
    db.get("SELECT COUNT(*) as count FROM Users WHERE username = 'testuser'", (err, row) => {
        if (row.count === 0) {
            db.run(
                `INSERT INTO Users (username, email, password_hash, full_name, birth_date, phone) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                ['testuser', 'test@example.com', testPassword, 'Тестовый Пользователь', '1990-01-01', '+7-999-999-99-99'],
                function(err) {
                    if (err) {
                        console.error('Error adding test user:', err);
                    } else {
                        console.log('✅ Test user added: testuser / password123');
                    }
                }
            );
        }
    });

    console.log('✅ Database initialization completed!');
    console.log(`📁 Database file: ${dbPath}`);
});

// Закрываем соединение после инициализации
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('🔒 Database connection closed');
        }
    });
}, 2000);