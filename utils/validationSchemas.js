const Joi = require('joi');

/**
 * Order Validation Schemas
 */
const orderSchemas = {
    createOrder: Joi.object({
        orderItems: Joi.array().items(
            Joi.object({
                menuItem: Joi.string().required(),
                name: Joi.string().optional(),
                quantity: Joi.number().integer().min(1).required(),
                price: Joi.number().min(0).required(),
                image: Joi.string().optional()
            })
        ).min(1).required(),
        paymentMethod: Joi.string().valid('Cash', 'PayPal', 'Stripe', 'VietQR').required(),
        totalPrice: Joi.number().min(0).required(),
        shippingAddress: Joi.object({
            address: Joi.string().optional(),
            city: Joi.string().optional(),
            postalCode: Joi.string().optional(),
            country: Joi.string().optional()
        }).optional()
    }),

    updateStatus: Joi.object({
        status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled').required()
    }),

    stripePayment: Joi.object({
        token: Joi.object().required(),
        amount: Joi.number().min(1000).required(), // Min 1000 VND
        orderItems: Joi.array().min(1).required()
    }),

    stripeCheckout: Joi.object({
        orderItems: Joi.array().min(1).required(),
        totalPrice: Joi.number().min(0).required()
    })
};

/**
 * User Validation Schemas
 */
const userSchemas = {
    register: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    updateProfile: Joi.object({
        name: Joi.string().min(2).max(50),
        email: Joi.string().email(),
        password: Joi.string().min(6),
        currentPassword: Joi.string().when('password', {
            is: Joi.exist(),
            then: Joi.required()
        })
    })
};

/**
 * Menu Item Validation Schemas
 */
const menuSchemas = {
    createItem: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().min(0).required(),
        category: Joi.string().required(),
        image: Joi.string().uri().optional(),
        isAvailable: Joi.boolean().optional()
    }),

    updateItem: Joi.object({
        name: Joi.string(),
        description: Joi.string(),
        price: Joi.number().min(0),
        category: Joi.string(),
        image: Joi.string().uri(),
        isAvailable: Joi.boolean()
    })
};

/**
 * Table Validation Schemas
 */
const tableSchemas = {
    createTable: Joi.object({
        tableNumber: Joi.string().required(),
        capacity: Joi.number().integer().min(1).required(),
        location: Joi.string().required(),
        status: Joi.string().valid('Trống', 'Đang phục vụ', 'Đã đặt').default('Trống')
    }),

    updateTable: Joi.object({
        tableNumber: Joi.string(),
        capacity: Joi.number().integer().min(1),
        location: Joi.string(),
        status: Joi.string().valid('Trống', 'Đang phục vụ', 'Đã đặt')
    })
};

/**
 * Reservation Validation Schemas
 */
const reservationSchemas = {
    createReservation: Joi.object({
        table: Joi.string().required(), // ObjectId as string
        reservationDate: Joi.date().greater('now').required(),
        numberOfGuests: Joi.number().integer().min(1).required(),
        status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed').default('pending')
    }),

    updateStatus: Joi.object({
        status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed').required()
    })
};

module.exports = {
    orderSchemas,
    userSchemas,
    menuSchemas,
    tableSchemas,
    reservationSchemas
};
