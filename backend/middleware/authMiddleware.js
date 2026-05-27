const jwt = require("jsonwebtoken")
const axios = require("axios")
const SpotifyUser = require("../models/SpotifyUser")

const authMiddleware = async (req, res, next) => {
    const token =
        req.cookies.token ||
        req.header("Authorization")?.replace("Bearer ", "")

    if (!token) return res.status(401).json({ msg: "No token, authorization denied" })

    // 1) Try JWT first (email/password login, or Spotify users who have re-authenticated)
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        return next()
    } catch {
        // Not a JWT — fall through and try Spotify token
    }

    // 2) Treat token as a Spotify access token and verify with Spotify
    try {
        const profileRes = await axios.get("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
        const spotifyId = profileRes.data.id
        const user = await SpotifyUser.findOne({ spotifyId })
        if (!user) return res.status(401).json({ msg: "Spotify user not found in DB" })
        req.user = { id: user._id }
        return next()
    } catch {
        return res.status(401).json({ msg: "Invalid token" })
    }
}

module.exports = authMiddleware
