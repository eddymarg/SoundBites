const express = require("express")
const { login, signup, getCurrentUser } = require("../controllers/authController")
const router = express.Router()

router.post("/signup", (req, res, next) => {
    console.log("Signup route hit")
    next()
}, signup)
router.post("/login", login)

module.exports = router