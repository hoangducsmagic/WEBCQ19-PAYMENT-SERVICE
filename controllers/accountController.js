const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const authController=require('./authController');
const AppError = require('../utils/appError');

const getAccountInfo = catchAsync(async (req, res, next) => {
    const { authToken } = req.body;

    if (!authToken) {
        return next(new AppError("Please provide authToken!", 400));
    }

    const decoded = await authController.decodeToken(authToken);
    if (!decoded.userId) return next(decoded);

    var user = await User.getUserById(decoded.userId);
    res.status(200).json({
        status: 'success',
        data: {
            username: user.username,
            balance: user.balance,
            dept:user.dept
        }
    })
})

module.exports={getAccountInfo}