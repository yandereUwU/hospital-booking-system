const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    async create(userData) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            const result = await db.run(
                `INSERT INTO User (username, email, password_hash, full_name, birth_date, phone, role) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userData.username,
                    userData.email,
                    hashedPassword,
                    userData.full_name,
                    userData.birth_date,
                    userData.phone,
                    userData.role || 'patient'
                ]
            );
            
            const user = await this.findById(result.id);
            return user;
            
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async findByUsername(username) {
        try {
            const user = await db.get(
                'SELECT * FROM User WHERE username = ?',
                [username]
            );
            return user;
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const user = await db.get(
                'SELECT id, username, email, full_name, birth_date, phone, role, created_at FROM User WHERE id = ?',
                [id]
            );
            return user;
        } catch (error) {
            console.error('Error finding user by id:', error);
            throw error;
        }
    }

    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Админские методы
    async findAll() {
        try {
            console.log('🔄 Поиск всех пользователей...');
            const users = await db.all(
                'SELECT id, username, email, full_name, phone, role, created_at FROM User ORDER BY created_at DESC'
            );
            console.log(`✅ Найдено пользователей: ${users.length}`);
            return users;
        } catch (error) {
            console.error('❌ Ошибка поиска пользователей:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            console.log('🔄 Удаление пользователя:', id);
            // Сначала удаляем связанные записи
            await db.run('DELETE FROM Appointment WHERE user_id = ?', [id]);
            // Затем пользователя
            await db.run('DELETE FROM User WHERE id = ?', [id]);
            console.log('✅ Пользователь удален:', id);
            return true;
        } catch (error) {
            console.error('❌ Ошибка удаления пользователя:', error);
            throw error;
        }
    }

    async updateRole(id, role) {
        try {
            console.log('🔄 Изменение роли пользователя:', id, role);
            await db.run(
                'UPDATE User SET role = ? WHERE id = ?',
                [role, id]
            );
            console.log('✅ Роль пользователя изменена:', id, role);
            return await this.findById(id);
        } catch (error) {
            console.error('❌ Ошибка изменения роли:', error);
            throw error;
        }
    }
}

module.exports = new User();