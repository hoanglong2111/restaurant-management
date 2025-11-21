const User = require('../models/user');
const ApiResponse = require('../utils/apiResponse');
const { generateToken } = require('../utils/tokenUtils');

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return ApiResponse.badRequest(res, 'User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            ApiResponse.created(res, {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user),
            });
        } else {
            ApiResponse.badRequest(res, 'Invalid user data');
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            ApiResponse.success(res, {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user),
            });
        } else {
            ApiResponse.unauthorized(res, 'Invalid email or password');
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        ApiResponse.success(res, users);
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Update user admin status
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
exports.updateUserAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isAdmin = req.body.isAdmin;
            const updatedUser = await user.save();
            ApiResponse.success(res, updatedUser);
        } else {
            ApiResponse.notFound(res, 'User not found');
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await User.deleteOne({ _id: req.params.id });
            ApiResponse.success(res, null, 'User removed');
        } else {
            ApiResponse.notFound(res, 'User not found');
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            ApiResponse.success(res, {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser),
            });
        } else {
            ApiResponse.notFound(res, 'User not found');
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Change password
 * @route   PUT /api/users/password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(req.body.currentPassword))) {
            user.password = req.body.newPassword;
            await user.save();
            ApiResponse.success(res, null, 'Password changed successfully');
        } else {
            ApiResponse.unauthorized(res, 'Invalid current password');
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};
