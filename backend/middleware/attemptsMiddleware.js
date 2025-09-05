const rateLimit = require("express-rate-limit")

const ApiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests
    message: { msg: "Too many attempts, please try again later."}
})

module.exports = ApiRateLimiter