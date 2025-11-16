const db = require('../config/database');

class Appointment {
    async create(appointmentData) {
        try {
            console.log('🔄 Создание записи:', appointmentData);
            
            const result = await db.run(
                `INSERT INTO Appointment (user_id, doctor_id, date, time_slot, status) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    appointmentData.user_id, 
                    appointmentData.doctor_id, 
                    appointmentData.appointment_date, // Используем appointment_date но сохраняем в date
                    appointmentData.appointment_time, // Используем appointment_time но сохраняем в time_slot
                    'scheduled'
                ]
            );
            
            console.log('✅ Запись создана, ID:', result.id);
            const appointment = await this.findById(result.id);
            return appointment;
            
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const appointment = await db.get(
                `SELECT a.*, d.name as doctor_name, d.specialization, u.full_name as user_name
                 FROM Appointment a
                 JOIN Doctor d ON a.doctor_id = d.id
                 JOIN User u ON a.user_id = u.id
                 WHERE a.id = ?`,
                [id]
            );
            return appointment;
        } catch (error) {
            console.error('Error finding appointment by id:', error);
            throw error;
        }
    }

    async findByUserId(userId) {
        try {
            const appointments = await db.all(
                `SELECT a.*, d.name as doctor_name, d.specialization
                 FROM Appointment a
                 JOIN Doctor d ON a.doctor_id = d.id
                 WHERE a.user_id = ?
                 ORDER BY a.date DESC, a.time_slot DESC`,
                [userId]
            );
            
            // Преобразуем названия колонок для фронтенда
            const formattedAppointments = appointments.map(apt => ({
                id: apt.id,
                user_id: apt.user_id,
                doctor_id: apt.doctor_id,
                appointment_date: apt.date, // Преобразуем date в appointment_date
                appointment_time: apt.time_slot, // Преобразуем time_slot в appointment_time
                status: apt.status,
                created_at: apt.created_at,
                doctor_name: apt.doctor_name,
                doctor_specialization: apt.specialization
            }));
            
            return formattedAppointments;
        } catch (error) {
            console.error('Error finding appointments by user id:', error);
            throw error;
        }
    }

    async checkAvailability(doctorId, date, timeSlot) {
        try {
            console.log('🔍 Проверка доступности:', { doctorId, date, timeSlot });
            
            // Используем правильные названия колонок: date и time_slot
            const existing = await db.get(
                `SELECT COUNT(*) as count
                 FROM Appointment 
                 WHERE doctor_id = ? 
                 AND date = ? 
                 AND time_slot = ?
                 AND status != 'cancelled'`,
                [doctorId, date, timeSlot]
            );
            
            console.log('📊 Результат проверки:', { count: existing.count });
            
            return existing.count === 0;
        } catch (error) {
            console.error('Error checking availability:', error);
            throw error;
        }
    }
}

module.exports = new Appointment();