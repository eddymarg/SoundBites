const express = require("express")
const { login, checkExistingUser } = require("../controllers/authController")
const router = express.Router()

router.post("/login", login)
router.post("/check-existing-user", checkExistingUser)

module.exports = router