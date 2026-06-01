const express = require("express")
const multer = require("multer")
const { login, signup, checkExistingUser, forgotPassword, resetPassword, getProfile, updateProfile, requestPasswordChange, deleteAccount } = require("../controllers/authController")
const ApiRateLimiter = require("../middleware/attemptsMiddleware")
const authMiddleware = require("../middleware/authMiddleware")
const router = express.Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.post("/login", ApiRateLimiter, login)
router.post("/signup", signup)
router.post("/check-existing-user", checkExistingUser)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)
router.get("/profile", authMiddleware, getProfile)
router.put("/profile", authMiddleware, upload.single("avatar"), updateProfile)
router.post("/request-password-change", authMiddleware, requestPasswordChange)
router.delete("/account", authMiddleware, deleteAccount)

module.exports = router