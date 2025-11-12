const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const cors = require('cors');
const cron = require('node-cron');
const { protect, isAdmin } = require('./middleware/authMiddleware');
const Reservation = require('./models/reservation');
const Table = require('./models/table');

dotenv.config();
connectDB();

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET is not defined in .env file');
    process.exit(1);
} else {
    console.log('JWT_SECRET loaded successfully');
}

const app = express();

// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://restaurant-management-pink-fifthcens.vercel.app',
    'https://www.paypal.com',
    'https://www.sandbox.paypal.com',
    process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests, or PayPal)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow all origins temporarily for debugging
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Restaurant Management API',
        status: 'running',
        version: '1.0.0'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use('/api/menu', protect, require('./routes/menuRoute'));
app.use('/api/orders', protect, require('./routes/ordersRoute')); // Stripe & PayPal routes here
app.use('/api/reservations', protect, require('./routes/reservationsRoute'));
app.use('/api/tables', protect, require('./routes/tablesRoute'));
app.use('/api/users', require('./routes/usersRoute'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Cron Job để cập nhật trạng thái bàn mỗi phút
cron.schedule('* * * * *', async () => {
    const now = new Date();

    try {
        // Tìm tất cả các đặt chỗ đã hoàn thành
        const completedReservations = await Reservation.find({
            reservationEnd: { $lt: now },
            status: { $in: ['pending', 'confirmed'] },
        });

        for (let reservation of completedReservations) {
            // Cập nhật trạng thái đặt chỗ
            reservation.status = 'completed';
            await reservation.save();

            // Tìm bàn tương ứng
            const table = await Table.findById(reservation.table);
            if (table) {
                // Kiểm tra xem có đặt chỗ nào khác cho bàn này trong tương lai không
                const futureReservations = await Reservation.find({
                    table: reservation.table,
                    reservationDate: { $gt: now },
                    status: { $in: ['pending', 'confirmed'] },
                });

                if (futureReservations.length === 0) {
                    table.status = 'Trống';
                    await table.save();
                    emitTableUpdate(table); // Phát sự kiện cập nhật
                }
            }
        }

        console.log('Cron job executed: Updated reservation and table statuses.');
    } catch (error) {
        console.error('Error executing cron job:', error.message);
    }
});