class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${this.statusCode}`.startsWith("4") ? "failed" : "error";
        this.isOperational = true; // to know that this is the error that we can handle
    
        Error.captureStackTrace(this, this.constructor);  // the error not appear in stack trace 
    }
}

module.exports = AppError;
