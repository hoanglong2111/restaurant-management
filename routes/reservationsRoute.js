const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { reservationSchemas } = require('../utils/validationSchemas');

// Tạo mới một đặt chỗ
router.post('/', protect, validate(reservationSchemas.createReservation), reservationController.createReservation);

// Lấy danh sách đặt chỗ của user hiện tại
router.get('/my', protect, reservationController.getMyReservations);

// Lấy danh sách các đặt chỗ với bộ lọc theo ngày, tháng, năm (Admin)
router.get('/', protect, isAdmin, reservationController.getAllReservations);

// Update reservation status
router.put('/:id', protect, isAdmin, validate(reservationSchemas.updateStatus), reservationController.updateReservationStatus);

// Delete a reservation
router.delete('/:id', protect, isAdmin, reservationController.deleteReservation);

module.exports = router;