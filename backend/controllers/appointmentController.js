const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

const appointmentController = {
    async create(req, res) {
        try {
            console.log('🔄 Начало создания записи, пользователь:', req.user);

            // Проверяем, не является ли пользователь админом
            if (req.user.role === 'admin') {
                console.log('❌ Админ пытается создать запись');
                return res.status(403).json({
                    success: false,
                    error: 'Администраторы не могут создавать записи на прием'
                });
            }

            const { doctor_id, appointment_date, appointment_time } = req.body;
            const user_id = req.user.id;

            console.log('📝 Данные записи:', { user_id, doctor_id, appointment_date, appointment_time });

            // Проверяем обязательные поля
            if (!doctor_id || !appointment_date || !appointment_time) {
                console.log('❌ Не все поля заполнены');
                return res.status(400).json({
                    success: false,
                    error: 'Все поля обязательны для заполнения'
                });
            }

            // Проверяем существование врача
            const doctor = await Doctor.findById(doctor_id);
            if (!doctor) {
                console.log('❌ Врач не найден:', doctor_id);
                return res.status(404).json({
                    success: false,
                    error: 'Врач не найден'
                });
            }

            console.log('✅ Врач найден:', doctor.name);

            // Проверяем доступность времени
            const isAvailable = await Appointment.checkAvailability(doctor_id, appointment_date, appointment_time);
            console.log('📊 Доступность времени:', isAvailable);
            
            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    error: 'Выбранное время уже занято'
                });
            }

            // Создаем запись
            const appointment = await Appointment.create({
                user_id,
                doctor_id,
                appointment_date,
                appointment_time
            });

            console.log('✅ Запись успешно создана:', appointment);

            res.status(201).json({
                success: true,
                appointment,
                message: 'Запись успешно создана!'
            });

        } catch (error) {
            console.error('❌ Create appointment error:', error);
            res.status(500).json({
                success: false,
                error: 'Ошибка при создании записи: ' + error.message
            });
        }
    },

    async getUserAppointments(req, res) {
        try {
            const user_id = req.user.id;
            console.log('🔄 Получение записей пользователя:', user_id);
            
            const appointments = await Appointment.findByUserId(user_id);

            console.log('✅ Найдено записей:', appointments.length);

            res.json({
                success: true,
                appointments
            });

        } catch (error) {
            console.error('❌ Get appointments error:', error);
            res.status(500).json({
                success: false,
                error: 'Ошибка при получении записей'
            });
        }
    }
};

module.exports = appointmentController;