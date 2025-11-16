const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const authController = {
    async register(req, res) {
        try {
            const { username, email, password, full_name, birth_date, phone, role } = req.body;

            // Проверяем, существует ли пользователь
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Пользователь с таким именем уже существует'
                });
            }

            // Создаем пользователя
            const user = await User.create({
                username,
                email,
                password,
                full_name,
                birth_date,
                phone,
                role: role || 'patient'
            });

            // Убираем пароль из ответа
            const { password_hash, ...userWithoutPassword } = user;

            res.status(201).json({
                success: true,
                message: 'Пользователь успешно зарегистрирован',
                user: userWithoutPassword
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                error: 'Ошибка при регистрации пользователя'
            });
        }
    },

    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Находим пользователя
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Неверное имя пользователя или пароль'
                });
            }

            // Проверяем пароль
            const isPasswordValid = await User.verifyPassword(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Неверное имя пользователя или пароль'
                });
            }

            // Генерируем токен
            const token = generateToken(user);

            // Убираем пароль из ответа
            const { password_hash, ...userWithoutPassword } = user;

            res.json({
                success: true,
                token,
                user: userWithoutPassword
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Ошибка при входе в систему'
            });
        }
    }
};

module.exports = authController;