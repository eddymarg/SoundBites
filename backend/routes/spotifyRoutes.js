const express = require("express")
const multer = require("multer")
const spotifyController = require("../controllers/spotifyController")

const router = express.Router()

// 5MB max
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
})

router.get("/auth/spotify/login", spotifyController.spotifyLogin)
router.get("/auth/spotify/callback", spotifyController.spotifyCallback)
router.get("/spotify-user", spotifyController.getSpotifyUserFromDB)
router.get("/top-artists", spotifyController.getTopArtists)
router.put("/update-user", upload.single("avatar"), spotifyController.updateSpotifyUser)


module.exports = router