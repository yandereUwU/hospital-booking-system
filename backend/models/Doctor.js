const db = require('../config/database');

class Doctor {
    async findAll() {
        try {
            console.log('🔄 Поиск всех врачей...');
            const doctors = await db.all(
                'SELECT * FROM Doctor ORDER BY name'
            );
            console.log(`✅ Найдено врачей: ${doctors ? doctors.length : 0}`);
            return doctors || [];
        } catch (error) {
            console.error('❌ Ошибка поиска врачей:', error.message);
            throw error;
        }
    }

    async findById(id) {
        try {
            const doctor = await db.get(
                'SELECT * FROM Doctor WHERE id = ?',
                [id]
            );
            return doctor;
        } catch (error) {
            console.error('Error finding doctor by id:', error);
            throw error;
        }
    }

    // Админские методы
    async create(doctorData) {
        try {
            console.log('🔄 Создание врача:', doctorData);
            
            // Проверяем, какие колонки есть в таблице
            const result = await db.run(
                `INSERT INTO Doctor (name, specialization) 
                 VALUES (?, ?)`,
                [
                    doctorData.name, 
                    doctorData.specialization
                ]
            );
            
            console.log('✅ Врач создан, ID:', result.id);
            return await this.findById(result.id);
            
        } catch (error) {
            console.error('❌ Ошибка создания врача:', error);
            throw error;
        }
    }

    async update(id, doctorData) {
        try {
            console.log('🔄 Обновление врача:', id, doctorData);
            
            await db.run(
                `UPDATE Doctor SET 
                 name = ?, 
                 specialization = ?
                 WHERE id = ?`,
                [
                    doctorData.name, 
                    doctorData.specialization,
                    id
                ]
            );
            
            console.log('✅ Врач обновлен:', id);
            return await this.findById(id);
            
        } catch (error) {
            console.error('❌ Ошибка обновления врача:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            console.log('🔄 Удаление врача:', id);
            await db.run('DELETE FROM Doctor WHERE id = ?', [id]);
            console.log('✅ Врач удален:', id);
            return true;
        } catch (error) {
            console.error('❌ Ошибка удаления врача:', error);
            throw error;
        }
    }

    // Получить всех врачей для админки
    async findAllAdmin() {
        try {
            const doctors = await db.all(
                'SELECT * FROM Doctor ORDER BY name'
            );
            return doctors || [];
        } catch (error) {
            console.error('Error finding all doctors:', error);
            throw error;
        }
    }
}

module.exports = new Doctor();