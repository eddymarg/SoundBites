const querystring = require("querystring")
const axios = require("axios")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const SpotifyUser = require("../models/SpotifyUser")
const bcrypt = require("bcryptjs")
const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI

// exchanges a refresh token for a new access token
const refreshAccessToken = async (refresh_token) => {
    const refreshResponse = await axios.post(
        'https://accounts.spotify.com/api/token',
        querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
            },
        }
    )
    return refreshResponse.data.access_token
}

// for OAuth state param
// prevents CSRF(Cross-Site Request Forgery) attacks
const generateRandomString = (length) => {
    let text = ""
    const possible = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

// login with spotify
exports.spotifyLogin = (req, res) => {
    const state = generateRandomString(16)
    res.cookie("spotify_auth_state", state) // stores state in cookies for later verification
    const scope = "user-read-private user-read-email user-top-read playlist-read-private playlist-read-collaborative"

    res.redirect(
        "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
            response_type: "code",
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state,
            show_dialog: true,
        })
    )
}

// auth code to get access to spotify user data
exports.spotifyCallback = async (req, res) => {
    const { code, state } = req.query

    if(!code) {
        return res.status(400).json({ error: "Authorization code missing" })
    }

    try {
        const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        querystring.stringify({
            grant_type: "authorization_code",
            code,
            redirect_uri,
        }),
        {
            headers: { 
                "Content-type": "application/x-www-form-urlencoded",
                "Authorization" : "Basic " + Buffer.from(`${client_id}:${client_secret}`).toString("base64")
            },
        }
        )

        const { access_token, refresh_token } = response.data
        if (!access_token || !refresh_token) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=spotify_token_missing`)
        }

        const profileRes = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })

        const { id: spotifyId, display_name, email, images } = profileRes.data
        const avatar = images?.[0]?.url || ""

        console.log("Saving user with:", { spotifyId, display_name, email, avatar })

        // save to DB
        let user = await SpotifyUser.findOne({ spotifyId })
        if (!user) {
            user = new SpotifyUser({ spotifyId, display_name, email, avatar })
            await user.save()
        }

        // Issue a JWT so the user can access protected API routes (same as regular login)
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        })

        const params = new URLSearchParams({
            access_token,
            refresh_token,
            spotify_id: spotifyId
        })

        res.redirect(`${process.env.FRONTEND_URL}/userHome?${params.toString()}`)
    } catch (error) {
        console.error("Error fetching token:", error.response?.data || error.message)
        res.status(500).json({ error: "Failed to get tokens", details: error.message })
    }
}

// helps return spotify user info
exports.getSpotifyUserFromDB = async (req, res) => {
    try {
        let access_token = req.headers.authorization?.replace('Bearer ', '')
        const refresh_token = req.headers['x-refresh-token']

        if (!access_token) {
            access_token = req.cookies.spotify_access_token
        }

        let profileRes
        try {
            profileRes = await axios.get("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${access_token}` },
            })
        } catch (err) {
            if (err.response?.status === 401 && refresh_token) {
                access_token = await refreshAccessToken(refresh_token)
                res.setHeader('x-new-access-token', access_token)
                profileRes = await axios.get("https://api.spotify.com/v1/me", {
                    headers: { Authorization: `Bearer ${access_token}` },
                })
            } else {
                throw err
            }
        }

        const spotifyId = profileRes.data.id
        const user = await SpotifyUser.findOne({ spotifyId })

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json({
            display_name: user.display_name,
            email: user.email,
            avatar: user.avatar,
        })
    } catch (error) {
        console.error("Error fetching Spotify user from DB:", error.message)
        res.status(500).json({ error: "Server error fetching user from DB" })
    }
}

// updates the user info
exports.updateSpotifyUser = async (req, res) => {
    try {
        const access_token = req.headers.authorization?.replace('Bearer ', '')

        const profileRes = await axios.get("https://api.spotify.com/v1/me", {
            headers: {Authorization: `Bearer ${access_token}` }
        })

        const spotifyId = profileRes.data.id
        const { display_name, email } = req.body
        let avatar = req.body.avatar // fallback if no file

        if (req.file) {
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
            avatar = base64Image
        }

        const user = await SpotifyUser.findOneAndUpdate(
            { spotifyId },
            { display_name, email, avatar },
            { new: true }
        )

        if(!user) return res.status(404).json({ error: "User not found" })

        res.json({ message: "User updated" })
    } catch (err) {
        console.error("Failed to update user:", err.message)
        res.status(500).json({ error: "Server error"})
    }
}

// Checks for user password
exports.checkForPassword = async (req, res) => {
    try {
        let access_token = req.headers.authorization?.replace('Bearer ', '')
        const refresh_token = req.headers['x-refresh-token']

        let profileRes
        try {
            profileRes = await axios.get("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${access_token}` },
            })
        } catch (err) {
            if (err.response?.status === 401 && refresh_token) {
                access_token = await refreshAccessToken(refresh_token)
                res.setHeader('x-new-access-token', access_token)
                profileRes = await axios.get("https://api.spotify.com/v1/me", {
                    headers: { Authorization: `Bearer ${access_token}` },
                })
            } else {
                throw err
            }
        }

        const spotifyId = profileRes.data.id
        const user = await SpotifyUser.findOne({ spotifyId })

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json({
            isNewUser: !user.password,
            spotifyId,
        })
    } catch (error) {
        console.error("Error checking password:", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
}

// updates password
exports.setSpotifyUserPassword = async (req, res) => {
    try {
        const { password } = req.body
        if (!password) return res.status(400).json({ error: "Password is required" })

        // Verify identity via Spotify — never trust spotifyId from the request body
        const access_token = req.headers.authorization?.replace('Bearer ', '')
        if (!access_token) return res.status(401).json({ error: "Authorization token required" })

        const profileRes = await axios.get("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${access_token}` }
        })
        const spotifyId = profileRes.data.id
        if (!spotifyId) return res.status(401).json({ error: "Could not verify Spotify identity" })

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await SpotifyUser.findOneAndUpdate(
            { spotifyId },
            { password: hashedPassword },
            { new: true }
        )

        if (!user) return res.status(404).json({ error: "User not found" })

        res.json({ message: "Password set successfully" })
    } catch (error) {
        console.error("Error setting password:", error.message)
        res.status(500).json({ error: "Server error" })
    }
}

// retrieve top artist data
exports.getTopArtists = async(req, res) => {
    let access_token = req.headers.authorization?.replace('Bearer ', '')
    if(!access_token) {
        access_token = req.cookies.spotify_access_token
    }

    let refresh_token = req.headers['x-refresh-token']
    if (!refresh_token) {
        refresh_token = req.cookies.spotify_refresh_token
    }

    if(!access_token || !refresh_token) {
        return res.status(400).json({error: 'Tokens are required'})
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
            headers: {
                Authorization: `Bearer ${access_token}`
            },
            params: {
                limit: 10,
                time_range: 'short_term'
            }
        })

        const items = Array.isArray(response.data?.items) ? response.data.items : []
        const topArtists = items.map(artist => ({
            name: artist.name,
            genres: artist.genres,
            image: (Array.isArray(artist.images) && artist.images.length > 0) ? artist.images[0].url : null,
            id: artist.id,
            url: artist.external_urls?.spotify
        }))

        res.status(200).json(topArtists)
    } catch (err) {
        if (err.response?.status === 401) {
            try {
                access_token = await refreshAccessToken(refresh_token)
                res.setHeader('x-new-access-token', access_token)

                const retryResponse = await axios.get(
                    'https://api.spotify.com/v1/me/top/artists',
                    {
                        headers: { Authorization: `Bearer ${access_token}` },
                        params: { limit: 10, time_range: 'short_term' },
                    }
                )

                const retryItems = Array.isArray(retryResponse.data?.items) ? retryResponse.data.items : []
                const topArtists = retryItems.map(artist => ({
                    name: artist.name,
                    genres: artist.genres,
                    image: (Array.isArray(artist.images) && artist.images.length > 0) ? artist.images[0].url : null,
                    id: artist.id,
                    url: artist.external_urls?.spotify
                }))

                return res.status(200).json(topArtists)
            } catch (refreshErr) {
                console.error('Error refreshing access token:', refreshErr.response?.data || refreshErr.message)
                return res.status(500).json({ error: 'Failed to refresh access token' })
            }
        }
        console.error('Error fetching top artists:', err.response?.data || err.message)
        res.status(500).json({ error: 'Failed to fetch top artists' })
    }
}