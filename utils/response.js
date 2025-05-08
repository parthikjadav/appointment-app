class AppResponse {
    constructor(res, statusCode, message, data) {
        this.res = res;
        this.statusCode = statusCode || 200;
        this.message = message;
        this.data = data || {};
    
        return res.status(statusCode).json({
            success: true,
            message,
            data
        })

    }
}

class AppError {
    constructor(res, statusCode, message, data) {
        this.res = res;
        this.statusCode = statusCode || 500;
        this.message = message;
        this.data = data || {};
    
        return res.status(statusCode).json({
            success: false,
            message,
            data
        })
    }
}

module.exports = {
    AppResponse,
    AppError
}