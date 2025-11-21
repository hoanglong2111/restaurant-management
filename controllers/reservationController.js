const Reservation = require('../models/reservation');
const ApiResponse = require('../utils/apiResponse');
const dayjs = require('dayjs');

/**
 * @desc    Create a new reservation
 * @route   POST /api/reservations
 * @access  Private
 */
exports.createReservation = async (req, res) => {
    const { table, reservationDate, numberOfGuests, status } = req.body;

    // Check required fields
    if (!table || !reservationDate || !numberOfGuests) {
        return ApiResponse.badRequest(res, 'Please provide all required fields.');
    }

    try {
        const reservationStart = new Date(reservationDate);
        const reservationEnd = new Date(reservationStart.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

        // Check if table is already booked
        const existingReservation = await Reservation.findOne({
            table: table,
            reservationDate: { $lt: reservationEnd },
            reservationEnd: { $gt: reservationStart },
            status: { $in: ['pending', 'confirmed'] },
        });

        if (existingReservation) {
            return ApiResponse.badRequest(res, 'Bàn này đã được đặt vào khung giờ này. Vui lòng chọn bàn khác hoặc thay đổi thời gian.');
        }

        // Check status validity
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (status && !validStatuses.includes(status.toLowerCase())) {
            return ApiResponse.badRequest(res, 'Invalid status value.');
        }

        const reservation = new Reservation({
            table,
            user: req.user._id,
            reservationDate: reservationStart,
            reservationEnd: reservationEnd,
            numberOfGuests,
            status: status ? status.toLowerCase() : 'pending',
        });

        const createdReservation = await reservation.save();
        ApiResponse.created(res, createdReservation, 'Reservation created successfully');
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Get logged in user reservations
 * @route   GET /api/reservations/my
 * @access  Private
 */
exports.getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id })
            .populate('table', 'tableNumber location')
            .sort({ reservationDate: -1 });
        ApiResponse.success(res, reservations);
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Get all reservations (Admin with filters)
 * @route   GET /api/reservations
 * @access  Private/Admin
 */
exports.getAllReservations = async (req, res) => {
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

        ApiResponse.success(res, reservations);
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Update reservation status
 * @route   PUT /api/reservations/:id
 * @access  Private/Admin
 */
exports.updateReservationStatus = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (reservation) {
            reservation.status = req.body.status.toLowerCase();
            const updatedReservation = await reservation.save();
            ApiResponse.success(res, updatedReservation, 'Reservation status updated');
        } else {
            ApiResponse.notFound(res, 'Reservation not found');
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Delete reservation
 * @route   DELETE /api/reservations/:id
 * @access  Private/Admin
 */
exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (reservation) {
            await Reservation.deleteOne({ _id: req.params.id });
            ApiResponse.success(res, null, 'Reservation removed');
        } else {
            ApiResponse.notFound(res, 'Reservation not found');
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};
