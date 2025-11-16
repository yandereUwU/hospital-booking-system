const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Доступ запрещен. Токен не предоставлен.'
            });
        }

        console.log('🔐 Проверка токена:', token.substring(0, 20) + '...');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Токен расшифрован:', decoded);
        
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Пользователь не найден'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Неверный токен. Пожалуйста, войдите снова.'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Токен истек. Пожалуйста, войдите снова.'
            });
        }
        
        res.status(401).json({
            success: false,
            error: 'Ошибка аутентификации'
        });
    }
};

module.exports = authMiddleware;