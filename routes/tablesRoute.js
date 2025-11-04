const express = require('express');
const router = express.Router();
const Table = require('../models/table');
const Reservation = require('../models/reservation');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Get all tables (admin only)
router.get('/', protect, isAdmin, async (req, res) => {
    const { reservationDate } = req.query;

    try {
        let tables = await Table.find({});

        if (reservationDate) {
            const desiredDate = new Date(reservationDate);
            const desiredEndDate = new Date(desiredDate.getTime() + 2 * 60 * 60 * 1000); // Giả sử đặt mỗi lần 2 giờ

            // Tìm các bàn đã được đặt trong khoảng thời gian này
            const reservedTableIds = await Reservation.find({
                table: { $in: tables.map(table => table._id) },
                reservationDate: { $lt: desiredEndDate },
                reservationEnd: { $gt: desiredDate },
                status: { $in: ['pending', 'confirmed'] },
            }).select('table');

            const reservedTables = reservedTableIds.map(res => res.table.toString());

            // Loại bỏ các bàn đã đặt
            tables = tables.filter(table => !reservedTables.includes(table._id.toString()));
        }

        res.json(tables);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Public route to fetch available tables based on reservationDate
router.get('/available', async (req, res) => {
    const { reservationDate } = req.query;

    try {
        let tables = await Table.find({});

        if (reservationDate) {
            const desiredDate = new Date(reservationDate);
            const desiredEndDate = new Date(desiredDate.getTime() + 2 * 60 * 60 * 1000); // Assuming each reservation is 2 hours

            // Find tables that are already booked for the desired time
            const reservedTableIds = await Reservation.find({
                table: { $in: tables.map(table => table._id) },
                reservationDate: { $lt: desiredEndDate },
                reservationEnd: { $gt: desiredDate },
                status: { $in: ['pending', 'confirmed'] },
            }).select('table');

            const reservedTables = reservedTableIds.map(res => res.table.toString());

            // Filter out reserved tables
            tables = tables.filter(table => !reservedTables.includes(table._id.toString()));
        }

        res.json(tables);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create a new table
router.post('/create', protect, isAdmin, async (req, res) => {
    const { tableNumber, capacity, location, status } = req.body;

    if (!tableNumber || !capacity || !location) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const table = new Table({
            tableNumber,
            capacity,
            location,
            status: status || 'Trống',
        });

        const createdTable = await table.save();
        res.status(201).json(createdTable);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update table information
router.put('/:id', protect, isAdmin, async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);

        if (table) {
            table.tableNumber = req.body.tableNumber || table.tableNumber;
            table.capacity = req.body.capacity || table.capacity;
            table.location = req.body.location || table.location;
            table.status = req.body.status || table.status;

            const updatedTable = await table.save();
            res.json(updatedTable);
        } else {
            res.status(404).json({ message: 'Table not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a table using deleteOne
router.delete('/:id', protect, isAdmin, async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);

        if (table) {
            await table.deleteOne(); // Correct method
            res.json({ message: 'Table removed' });
        } else {
            res.status(404).json({ message: 'Table not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;