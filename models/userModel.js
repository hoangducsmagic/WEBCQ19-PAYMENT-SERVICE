const db = require("./db");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const utils = require("../utils/utils");

function randomUserIdGeneration() {
    return `US${Date.now().toString(16)}`;
}

function randomTransactionIdGeneration() {
    return `TS${Date.now().toString(16)}`;
}

async function getUserByUsername(username) {
    var query = `
        SELECT user_id as "userId", username, hashed_password as "hashedPassword", change_password_at as "changePasswordAt", balance
        FROM public."user"
        WHERE username='${username}'
    `;
    var data = await db.getOne(query);
    return data;
}

async function checkCorrectPassword(user, password) {
    var checkResult = await bcrypt.compare(password, user.hashedPassword);
    return checkResult;
}

async function createUser(username, password) {
    var hashedPassword = await bcrypt.hash(password, saltRounds);
    var query = `
        INSERT INTO public."user" (user_id, username, hashed_password, change_password_at, balance)
        VALUES ('${randomUserIdGeneration()}','${username}','${hashedPassword}','${utils.timestampToDatetime(
        Date.now()
    )}',0)
    `;
    await db.executeQuery(query);
}

async function getUserById(userId) {
    var query = `
        SELECT user_id as "userId", username, hashed_password as "hashedPassword", change_password_at as "changePasswordAt", balance
        FROM public."user"
        WHERE user_id='${userId}'
    `;
    var data = await db.getOne(query);
    return data;
}

async function changePassword(userId,newPassword) {
    var hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    var query = `
        UPDATE public."user" 
        SET hashed_password='${hashedPassword}',
            change_password_at='${utils.timestampToDatetime(Date.now())}'
        WHERE user_id='${userId}'
    `;
    await db.executeQuery(query);
}

async function paying(userId, amount, date) {
    var addTransactionQuery=`
        INSERT INTO transaction (transaction_id, user_id, amount, date, type)
        VALUES ('${randomTransactionIdGeneration()}','${userId}',${amount},'${date}',1)
    `

    await db.executeQuery(addTransactionQuery);

    var updateUserQuery = `
        UPDATE public."user"
        SET balance=balance-${amount}
        WHERE user_id='${userId}'
    `

    await db.executeQuery(updateUserQuery);

}

async function charging(userId, amount, date) {
    var addTransactionQuery=`
        INSERT INTO transaction (transaction_id, user_id, amount, date, type)
        VALUES ('${randomTransactionIdGeneration()}','${userId}',${amount},'${date}',2)
    `

    await db.executeQuery(addTransactionQuery);

    var updateUserQuery = `
        UPDATE public."user"
        SET balance=balance+${amount}
        WHERE user_id='${userId}'
    `

    await db.executeQuery(updateUserQuery);

}

async function getPaymentHistory(userId, dateFrom, dateTo) {
    var query = `
        SELECT transaction_id as "transactionId", to_char(date,'yyyy-mm-dd HH24:MI:SS') as date, transaction_type_converter(type) as "type", amount
        FROM transaction
        WHERE user_id='${userId}'
    `
    if (dateFrom) query += ` AND date>='${dateFrom}'`;
    if (dateTo) query += ` AND date<='${dateTo}'`;

    var data = await db.getQuery(query);
    return data;
}

module.exports = {
    getUserByUsername,
    checkCorrectPassword,
    createUser,
    getUserById,
    changePassword,
    paying,
    charging,
    getPaymentHistory
};
