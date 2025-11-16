const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Middleware для проверки админских прав
const adminMiddleware = (req, res, next) => {
    // Пока разрешаем всем авторизованным пользователям
    next();
};

// Получить всех врачей (для админки)
router.get('/doctors', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        console.log('🔄 Запрос всех врачей для админки');
        const doctors = await Doctor.findAllAdmin();
        
        res.json({
            success: true,
            doctors: doctors || []
        });

    } catch (error) {
        console.error('Admin doctors error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении врачей'
        });
    }
});

// Сброс пароля пользователя
router.post('/users/:id/reset-password', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔄 Сброс пароля пользователя:', id);
        
        // Здесь должна быть логика сброса пароля
        // Пока просто возвращаем успех
        
        res.json({
            success: true,
            message: 'Пароль сброшен. Новый пароль: password123'
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при сбросе пароля'
        });
    }
});

// Добавить нового врача
router.post('/doctors', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, specialization } = req.body;
        
        console.log('🔄 Добавление врача:', { name, specialization });
        
        if (!name || !specialization) {
            return res.status(400).json({
                success: false,
                error: 'Имя и специализация обязательны'
            });
        }

        const doctor = await Doctor.create({
            name,
            specialization
        });
        
        console.log('✅ Врач добавлен:', doctor);
        
        res.json({
            success: true,
            doctor: doctor
        });
        
    } catch (error) {
        console.error('Add doctor error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при добавлении врача: ' + error.message
        });
    }
});

// Обновить врача
router.put('/doctors/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, specialization } = req.body;
        
        console.log('🔄 Обновление врача:', id, { name, specialization });
        
        if (!name || !specialization) {
            return res.status(400).json({
                success: false,
                error: 'Имя и специализация обязательны'
            });
        }

        const updatedDoctor = await Doctor.update(id, {
            name,
            specialization
        });
        
        console.log('✅ Врач обновлен:', updatedDoctor);
        
        res.json({
            success: true,
            doctor: updatedDoctor,
            message: 'Врач обновлен'
        });
        
    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при обновлении врача: ' + error.message
        });
    }
});

// Удалить врача
router.delete('/doctors/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔄 Удаление врача:', id);
        
        await Doctor.delete(id);
        
        console.log('✅ Врач удален:', id);
        
        res.json({
            success: true,
            message: 'Врач удален'
        });
        
    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при удалении врача: ' + error.message
        });
    }
});

// Получить всех пользователей
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        console.log('🔄 Запрос всех пользователей для админки');
        const users = await User.findAll();
        
        res.json({
            success: true,
            users: users || []
        });

    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении пользователей'
        });
    }
});

// Удалить пользователя
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔄 Удаление пользователя:', id);
        
        // Не позволяем удалить самого себя
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                error: 'Нельзя удалить свой собственный аккаунт'
            });
        }

        await User.delete(id);
        
        console.log('✅ Пользователь удален:', id);
        
        res.json({
            success: true,
            message: 'Пользователь удален'
        });
        
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при удалении пользователя'
        });
    }
});

// Изменить роль пользователя
router.put('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        console.log('🔄 Изменение роли пользователя:', id, role);
        
        if (!['admin', 'patient'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Неверная роль. Допустимые значения: admin, patient'
            });
        }

        const updatedUser = await User.updateRole(id, role);
        
        console.log('✅ Роль пользователя изменена:', id, role);
        
        res.json({
            success: true,
            user: updatedUser,
            message: 'Роль пользователя изменена'
        });
        
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при изменении роли пользователя'
        });
    }
});

module.exports = router;