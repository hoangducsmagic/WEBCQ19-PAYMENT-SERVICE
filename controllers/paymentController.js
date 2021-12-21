const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const authController=require('./authController');
const AppError = require('../utils/appError');
const { timestampToDatetime } = require('../utils/utils');
const { updateExpressionWithTypeArguments } = require('typescript');
const { user } = require('pg/lib/defaults');

const pay = catchAsync(async (req, res, next) => {
    const { authToken, amount } = req.body;
    
    if (!authToken || !amount) {
        return next(new AppError("Please provide authToken and paying amount!", 400)); 
    }

    const decoded = await authController.decodeToken(authToken);
    if (!decoded.userId) return next(decoded);

    var user = await User.getUserById(decoded.userId);
    if (user.balance < amount) {
        return next(new AppError("Not enough money for transaction!",400))
    } 

    const date = timestampToDatetime(Date.now());
    await User.paying(user.userId, amount,date);

    res.status(200).json({
        status: 'success',
        data: {
            username: user.username,
            date,
            amount,
            balance: user.balance - amount
        }
    })
})

const charge = catchAsync(async (req, res, next) => {
    const { authToken, amount } = req.body;
    
    if (!authToken || !amount) {
        return next(new AppError("Please provide authToken and paying amount!", 400)); 
    }

    const decoded = await authController.decodeToken(authToken);
    if (!decoded.userId) return next(decoded);

    var user = await User.getUserById(decoded.userId);

    const date = timestampToDatetime(Date.now());
    await User.charging(user.userId, amount,date);

    res.status(200).json({
        status: 'success',
        data: {
            username: user.username,
            date,
            amount,
            balance: user.balance + amount
        }
    })
})

const getPaymentHistory = catchAsync(async (req, res, next) => {
    const { authToken, dateFrom, dateTo } = req.body;
    const dateRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
    if (dateFrom && (!dateRegex.test(dateFrom) || isNaN(Date.parse(dateFrom)))) {
        return next(new AppError("Please provide an valid dateFrom!", 400));
    }

    if (dateTo && (!dateRegex.test(dateFrom) || isNaN(Date.parse(dateTo)))) {
        return next(new AppError("Please provide an valid dateTo!", 400));
    }
    
    
    if (!authToken) {
        return next(new AppError("Please provide authToken!", 400));
    }

    const decoded = await authController.decodeToken(authToken);
    if (!decoded.userId) return next(decoded);
    
    var user = await User.getUserById(decoded.userId);

    var transactions=await User.getPaymentHistory(decoded.userId, dateFrom, dateTo);

    res.status(200).json({
        status: "success",
        data: {
            username: user.username,
            balance:user.balance,
            transactions
        }
    })
})

module.exports={pay,charge,getPaymentHistory}