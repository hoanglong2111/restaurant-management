const Table = require('../models/table');
const Reservation = require('../models/reservation');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all tables (admin only)
 * @route   GET /api/tables
 * @access  Private/Admin
 */
exports.getAllTables = async (req, res) => {
    const { reservationDate } = req.query;

    try {
        let tables = await Table.find({});

        if (reservationDate) {
            const desiredDate = new Date(reservationDate);
            const desiredEndDate = new Date(desiredDate.getTime() + 2 * 60 * 60 * 1000); // Assuming 2 hours

            // Find reserved tables
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

        ApiResponse.success(res, tables);
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Fetch available tables based on reservationDate
 * @route   GET /api/tables/available
 * @access  Public
 */
exports.getAvailableTables = async (req, res) => {
    const { reservationDate } = req.query;

    try {
        let tables = await Table.find({});

        if (reservationDate) {
            const desiredDate = new Date(reservationDate);
            const desiredEndDate = new Date(desiredDate.getTime() + 2 * 60 * 60 * 1000); // Assuming 2 hours

            // Find reserved tables
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

        ApiResponse.success(res, tables);
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Create a new table
 * @route   POST /api/tables/create
 * @access  Private/Admin
 */
exports.createTable = async (req, res) => {
    const { tableNumber, capacity, location, status } = req.body;

    if (!tableNumber || !capacity || !location) {
        return ApiResponse.badRequest(res, 'Please provide all required fields.');
    }

    try {
        const table = new Table({
            tableNumber,
            capacity,
            location,
            status: status || 'Trống',
        });

        const createdTable = await table.save();
        ApiResponse.created(res, createdTable, 'Table created successfully');
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Update table information
 * @route   PUT /api/tables/:id
 * @access  Private/Admin
 */
exports.updateTable = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);

        if (table) {
            table.tableNumber = req.body.tableNumber || table.tableNumber;
            table.capacity = req.body.capacity || table.capacity;
            table.location = req.body.location || table.location;
            table.status = req.body.status || table.status;

            const updatedTable = await table.save();
            ApiResponse.success(res, updatedTable, 'Table updated successfully');
        } else {
            ApiResponse.notFound(res, 'Table not found');
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Delete a table
 * @route   DELETE /api/tables/:id
 * @access  Private/Admin
 */
exports.deleteTable = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);

        if (table) {
            await Table.deleteOne({ _id: req.params.id });
            ApiResponse.success(res, null, 'Table removed');
        } else {
            ApiResponse.notFound(res, 'Table not found');
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};
