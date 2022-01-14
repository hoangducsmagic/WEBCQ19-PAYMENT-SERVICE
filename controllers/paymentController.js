const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const authController=require('./authController');
const AppError = require('../utils/appError');
const { timestampToDatetime } = require('../utils/utils');

const pay = catchAsync(async (req, res, next) => {
    const { authToken, amount } = req.body;
    
    if (!authToken || !amount) {
        return next(new AppError("Please provide authToken and paying amount!", 400)); 
    }

    const decoded = await authController.decodeToken(authToken);
    if (!decoded.userId) return next(decoded);

    var user = await User.getUserById(decoded.userId);
    var actualAmount = 0, debt = 0;
    if (user.balance < amount) {
        //return next(new AppError("Not enough money for transaction!", 400))
        actualAmount = user.balance;
        debt = amount - user.balance;
    } else {
        actualAmount = amount;
        debt = 0;
    }

    const date = timestampToDatetime(Date.now());
    await User.paying(user.userId, actualAmount, date);
    if (debt > 0) await User.adddebt(user.userId, debt);

    res.status(200).json({
        status: 'success',
        data: {
            username: user.username,
            date,
            amount,
            balance: user.balance - actualAmount,
            debt: user.debt + debt
        }
    })
})

const payoffdebt = catchAsync(async (req, res, next) => {
    const { authToken, amount } = req.body;
    
    if (!authToken || !amount) {
        return next(new AppError("Please provide authToken and paying amount!", 400)); 
    }

    const decoded = await authController.decodeToken(authToken);
    if (!decoded.userId) return next(decoded);

    var user = await User.getUserById(decoded.userId);

    if (user.debt ==0) {
        return next(new AppError("This account have no debt to pay off!",400))
    } 

    var actualAmount = Math.min(amount, user.debt);
    if (user.balance < actualAmount) {
        return next(new AppError("Not enough money for transaction!",400))
    } 

    const date = timestampToDatetime(Date.now());
    await User.paydebt(user.userId, actualAmount,date);

    res.status(200).json({
        status: 'success',
        data: {
            username: user.username,
            date,
            amount:actualAmount,
            balance: user.balance - actualAmount,
            debt:user.debt-actualAmount
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
            balance: user.balance + amount,
            debt:user.debt
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

module.exports={pay,payoffdebt,charge,getPaymentHistory}