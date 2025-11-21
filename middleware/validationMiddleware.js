const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Middleware to validate request data against a Joi schema
 * @param {Object} schema - Joi schema object
 * @param {String} property - Request property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            logger.warn(`Validation error: ${errors.join(', ')}`);
            return ApiResponse.badRequest(res, 'Validation Error', errors);
        }

        next();
    };
};

module.exports = validate;
