class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", error = [], stack = "") {
        super(message);

        this.statusCode = statusCode; // ✅ Missing in your code
        this.data = null;
        this.success = false;
        this.error = error;

        // Properly assign stack trace
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
