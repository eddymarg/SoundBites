const express = require("express")
const { spotifyLogin, spotifyCallback } = require("../controllers/spotifyController")

const router = express.Router()

router.get("/spotify/login", spotifyLogin)
router.get("/spotify/callback", spotifyCallback)

module.exports = router