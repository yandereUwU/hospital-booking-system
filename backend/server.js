require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Простая проверка базы данных при запуске
const checkDatabase = async () => {
    try {
        const db = require('./config/database');
        // Проверяем новую таблицу Doctor (в единственном числе)
        const doctorsCount = await db.all('SELECT COUNT(*) as count FROM Doctor');
        console.log('✅ Database connected successfully');
        console.log(`📊 Total doctors: ${doctorsCount[0].count}`);
        return true;
    } catch (error) {
        console.error('❌ Database check failed:', error.message);
        return false;
    }
};

// Проверяем базу данных
checkDatabase().then(success => {
    if (success) {
        console.log('🎉 Database is ready!');
    } else {
        console.log('⚠️ Database has issues, but server will start');
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/admin', require('./routes/admin'));

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Маршрут не найден'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Frontend available at: http://localhost:${PORT}`);
    console.log(`👨‍💼 Admin panel at: http://localhost:${PORT}/admin`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔑 Тестовые данные для входа:`);
    console.log(`   👨‍💼 Админ: admin / admin123`);
    console.log(`   👤 Пациент: testuser / user123`);
    console.log(`   👤 Пациент: maria / user123`);
});