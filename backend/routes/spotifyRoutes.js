const express = require("express")
const multer = require("multer")
const spotifyController = require("../controllers/spotifyController")
const authMiddleware = require("../middleware/authMiddleware")
const router = express.Router()

// 5MB max
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
})

router.get("/auth/spotify/login", spotifyController.spotifyLogin)
router.get("/auth/spotify/callback", spotifyController.spotifyCallback)
router.get("/spotify-user", authMiddleware, spotifyController.getSpotifyUserFromDB)
router.get("/top-artists", authMiddleware, spotifyController.getTopArtists)
router.put("/update-user", authMiddleware, upload.single("avatar"), spotifyController.updateSpotifyUser)
router.get("/check-for-password", authMiddleware, spotifyController.checkForPassword)
router.put("/set-spotify-user-password", authMiddleware, spotifyController.setSpotifyUserPassword)


module.exports = router