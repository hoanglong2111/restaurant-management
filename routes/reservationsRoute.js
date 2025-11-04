const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservation');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const dayjs = require('dayjs'); // Import dayjs

// Tạo mới một đặt chỗ
router.post('/', protect, async (req, res) => {
    const { table, reservationDate, numberOfGuests, status } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!table || !reservationDate || !numberOfGuests) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const reservationStart = new Date(reservationDate);
        const reservationEnd = new Date(reservationStart.getTime() + 2 * 60 * 60 * 1000); // Thêm 2 giờ

        // Kiểm tra xem bàn đã được đặt trong khoảng thời gian này chưa
        const existingReservation = await Reservation.findOne({
            table: table,
            reservationDate: { $lt: reservationEnd },
            reservationEnd: { $gt: reservationStart },
            status: { $in: ['pending', 'confirmed'] }, // Chỉ kiểm tra những đặt chỗ còn hiệu lực
        });

        if (existingReservation) {
            return res.status(400).json({ message: 'Bàn này đã được đặt vào khung giờ này. Vui lòng chọn bàn khác hoặc thay đổi thời gian.' });
        }

        // Kiểm tra giá trị của status nếu có
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (status && !validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const reservation = new Reservation({
            table,
            user: req.user._id, // Gán người dùng từ middleware
            reservationDate: reservationStart,
            reservationEnd: reservationEnd, // Ensure reservationEnd is set
            numberOfGuests,
            status: status ? status.toLowerCase() : 'pending',
        });

        const createdReservation = await reservation.save();
        res.status(201).json(createdReservation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Lấy danh sách đặt chỗ của user hiện tại
router.get('/my', protect, async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id })
            .populate('table', 'tableNumber location')
            .sort({ reservationDate: -1 });
        res.json(reservations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Lấy danh sách các đặt chỗ với bộ lọc theo ngày, tháng, năm (Admin)
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const { date, month, year } = req.query;
        let filter = {};

        if (date) {
            const start = dayjs(date, 'YYYY-MM-DD').startOf('day').toDate();
            const end = dayjs(date, 'YYYY-MM-DD').endOf('day').toDate();
            filter.reservationDate = { $gte: start, $lte: end };
        } else if (month) {
            const start = dayjs(month, 'YYYY-MM').startOf('month').toDate();
            const end = dayjs(month, 'YYYY-MM').endOf('month').toDate();
            filter.reservationDate = { $gte: start, $lte: end };
        } else if (year) {
            const start = dayjs(year, 'YYYY').startOf('year').toDate();
            const end = dayjs(year, 'YYYY').endOf('year').toDate();
            filter.reservationDate = { $gte: start, $lte: end };
        }

        const reservations = await Reservation.find(filter)
            .populate('table')
            .populate('user', 'name email');

        res.json(reservations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Existing PUT route to update reservation status
router.put('/:id', protect, isAdmin, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (reservation) {
            reservation.status = req.body.status.toLowerCase();
            const updatedReservation = await reservation.save(); // Triggers pre-save middleware
            res.json(updatedReservation);
        } else {
            res.status(404).json({ message: 'Reservation not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Existing DELETE route to delete a reservation
router.delete('/:id', protect, isAdmin, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (reservation) {
            await reservation.remove();
            res.json({ message: 'Reservation removed' });
        } else {
            res.status(404).json({ message: 'Reservation not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;