const express = require("express")
const spotifyController = require("../controllers/spotifyController")

const router = express.Router()

router.get("/auth/spotify/login", spotifyController.spotifyLogin)
router.get("/auth/spotify/callback", spotifyController.spotifyCallback)
router.get("/top-artists", spotifyController.getTopArtists)


module.exports = router