const express = require("express")
const { login, checkExistingUser } = require("../controllers/authController")
const ApiRateLimiter = require("../middleware/attemptsMiddleware")
const router = express.Router()

router.post("/login", ApiRateLimiter, login)
router.post("/check-existing-user", checkExistingUser)

module.exports = router