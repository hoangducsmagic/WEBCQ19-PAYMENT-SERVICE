module.exports = (err, req, res, next) => {
    err.statusCode = err.StatusCode || 500;
    err.status = err.status || "error";

    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.error('💥 ERROR: ', err);
        res.status(500).json({
            status: 'Unhaddled error',
            message: err,
        }); 
    }
    
};
