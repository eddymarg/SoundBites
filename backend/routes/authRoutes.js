const express = require("express")
const { login, signup, checkExistingUser } = require("../controllers/authController")
const router = express.Router()

router.post("/signup", (req, res, next) => {
    console.log("Signup route hit")
    next()
}, signup)
router.post("/login", login)
router.post("/check-existing-user", checkExistingUser)

module.exports = router