const jwt = require("jsonwebtoken")
const axios = require("axios")
const SpotifyUser = require("../models/SpotifyUser")
const { refreshAccessToken } = require("../controllers/spotifyController")

const verifySpotifyToken = async (accessToken) => {
    const profileRes = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    })
    const spotifyId = profileRes.data.id
    const user = await SpotifyUser.findOne({ spotifyId })
    if (!user) {
        const err = new Error("Spotify user not found in DB")
        err.notFound = true
        throw err
    }
    return user
}

const authMiddleware = async (req, res, next) => {
    const cookieToken = req.cookies.token
    const headerToken = req.header("Authorization")?.replace("Bearer ", "")

    // 1) Try cookie JWT — skip it if expired so we don't block a valid header token
    if (cookieToken) {
        try {
            const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET)
            req.user = decoded
            return next()
        } catch {
            // expired or invalid cookie — fall through to header token
        }
    }

    if (!headerToken) return res.status(401).json({ msg: "No token, authorization denied" })

    // 2) Try header token as JWT (handles app_token from Spotify OAuth redirect)
    try {
        const decoded = jwt.verify(headerToken, process.env.JWT_SECRET)
        req.user = decoded
        return next()
    } catch {
        // Not a JWT — try as Spotify access token
    }

    // 3) Treat header token as a Spotify access token and verify with Spotify
    try {
        const user = await verifySpotifyToken(headerToken)
        req.user = { id: user._id }
        return next()
    } catch (err) {
        if (err.notFound) return res.status(401).json({ msg: "Spotify user not found in DB" })

        // If Spotify returned 401 (expired token), try refreshing with the refresh token
        if (err.response?.status === 401) {
            const refresh_token = req.header("x-refresh-token")
            if (refresh_token) {
                try {
                    const newAccessToken = await refreshAccessToken(refresh_token)
                    const user = await verifySpotifyToken(newAccessToken)
                    req.user = { id: user._id }
                    // Update both headers so downstream controllers always see the fresh token
                    req.headers.authorization = `Bearer ${newAccessToken}`
                    req.headers['x-spotify-token'] = newAccessToken
                    // Tell the frontend to save the new token
                    res.setHeader("x-new-access-token", newAccessToken)
                    return next()
                } catch {
                    return res.status(401).json({ msg: "Token refresh failed" })
                }
            }
        }

        return res.status(401).json({ msg: "Invalid token" })
    }
}

module.exports = authMiddleware
