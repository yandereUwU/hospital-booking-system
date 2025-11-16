const Doctor = require('../models/Doctor');

const doctorController = {
    async getAll(req, res) {
        try {
            const doctors = await Doctor.findAll();
            
            res.json({
                success: true,
                doctors
            });

        } catch (error) {
            console.error('Get doctors error:', error);
            res.status(500).json({
                success: false,
                error: 'Ошибка при получении списка врачей'
            });
        }
    }
};

module.exports = doctorController;