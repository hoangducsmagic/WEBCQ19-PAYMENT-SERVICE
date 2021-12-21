const { Pool } = require("pg");

// set up PostgreSQL database
const connectionString = process.env.PG_CONNECTION_STRING;
const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
    
});

pool.connect()
    .then(() => {
        console.log("✅ Successfully connect to PostgreSQL");
    })
    .catch((err) => {
        console.log("Connect to PostgreSQL failed: ", err);
    });

exports.getQuery = function (sqlQuery) {
    return new Promise((resolve, reject) => {
        pool.query(sqlQuery, (err, res) => {
            if (!err) resolve(res.rows);
            else {
                console.log(err);
            }
            // else reject(err);
        });
    });
};

exports.getOne = function (sqlQuery) {  // execute and get query data which have at most 1 result
    return new Promise((resolve, reject) => {
        pool.query(sqlQuery, (err, res) => {
            if (!err) resolve(res.rows[0]);
            else {
                console.log(err);
            }
            // else reject(err);
        });
    });
};

exports.executeQuery = function (sqlQuery) {
    return new Promise((resolve) => {
        pool.query(sqlQuery, (err, res) => {
            if (!err) {
                console.log("Query successfully executed");
                resolve();
            } else {
                console.log(err);
            }
            // else reject(err);
        });
    });
};

