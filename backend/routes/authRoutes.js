const express = require("express")
const { login, signup, checkExistingUser, forgotPassword, resetPassword } = require("../controllers/authController")
const ApiRateLimiter = require("../middleware/attemptsMiddleware")
const router = express.Router()

router.post("/login", ApiRateLimiter, login)
router.post("/signup", signup)
router.post("/check-existing-user", checkExistingUser)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)

module.exports = router