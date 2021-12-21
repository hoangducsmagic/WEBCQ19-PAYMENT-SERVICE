const User = require("../models/userModel");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require('../utils/catchAsync')
const utils=require('../utils/utils')

async function getTokenExpiringTime(token) {    // 1 day
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    var expiredDate=utils.timestampToDatetime(parseInt(decoded.iat*1000)+24*60*60*1000)
    return expiredDate;
}

const signToken = (id) => {
    return jwt.sign({ userId:id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const decodeToken = async (token) => {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // check if user is still existed
    var user = await User.getUserById(decoded.userId);
    if (!user) {
        return new AppError("User is not existed!", 400);
    }

    // check if the token is created before changing password
    var tokenCreatedTimestamp = parseInt(decoded.iat * 1000);
    var passwordChangedTimestamp = utils.datetimeToTimestamp(user.changePasswordAt);

    if (tokenCreatedTimestamp < passwordChangedTimestamp) {
        console.log("BEFOREEEEEEEEEEEE")
        return new AppError("Token is no longer available because user password have been changed!", 400);
    }

    return decoded;
}

const login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    // 1) Check if email and password exist
    if (!username || !password) {
        return next(new AppError("Please provide username and password!", 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.getUserByUsername(username);

    if (!user) {
        return next(new AppError("Username is not exist!", 404));
    }

    if (!(await User.checkCorrectPassword(user, password))) {
        return next(new AppError("Incorrect password!", 401));
    }

    // 4) If everything ok, send token to client
    const token = signToken(user.userId);
    const expiredDate = await getTokenExpiringTime(token);
    res.status(200).json({
        status: "success",
        data: {
            authToken: token,
            expiredAt: expiredDate,
        },
    });
});

const signup = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

     // 1) Check if email and password exist
     if (!username || !password) {
        return next(new AppError("Please provide username and password!", 400));
    }

    // 2) Check existed username
    var user = await User.getUserByUsername(username);
    if (user) {
        return next(new AppError("Username is existed!",400))
    }

    // 3) Create new user
    await User.createUser(username, password);
    
    res.status(200).json({
        status:"success"
    })
});

const changePassword = catchAsync(async (req, res, next) => {
    const { authToken, newPassword } = req.body;

     // 1) Check if email and password exist
     if (!authToken || !newPassword) {
        return next(new AppError("Please provide authToken and newPassword!", 400));
    }

    const decoded = await decodeToken(authToken);
    if (!decoded.userId) return next(decoded);
    
    // Change password
    await User.changePassword(decoded.userId, newPassword);
    
    res.status(200).json({
        status:"success"
    })
});

module.exports = { decodeToken,login,signup,changePassword };
