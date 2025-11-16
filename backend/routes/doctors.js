const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Временно убрали аутентификацию для тестирования
router.get('/', async (req, res) => {
    try {
        console.log('🔄 Запрос на получение врачей');
        const doctors = await Doctor.findAll();
        
        console.log('✅ Отправляем врачей:', doctors.length);
        
        // Преобразуем данные для фронтенда
        const formattedDoctors = doctors.map(doctor => ({
            id: doctor.id,
            full_name: doctor.name, // Преобразуем name в full_name для фронтенда
            specialization: doctor.specialization,
            phone: doctor.phone || '',
            email: doctor.email || ''
        }));
        
        res.json({
            success: true,
            doctors: formattedDoctors
        });

    } catch (error) {
        console.error('❌ Ошибка получения врачей:', error.message);
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении списка врачей',
            details: error.message
        });
    }
});

module.exports = router;