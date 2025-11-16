const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

router.use(authMiddleware);

router.post('/', appointmentController.create);
router.get('/user', appointmentController.getUserAppointments);

module.exports = router;