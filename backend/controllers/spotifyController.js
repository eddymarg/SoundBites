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
const refreshAccessToken = exports.refreshAccessToken = async (refresh_token) => {
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
    res.cookie("spotify_auth_state", state)
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
            return res.redirect(`${process.env.FRONTEND_URL}/signin?error=spotify_token_missing`)
        }

        const profileRes = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })

        const { id: spotifyId, display_name, email, images, explicit_content } = profileRes.data
        const avatar = images?.[0]?.url || ""
        const explicitContentFilter = explicit_content?.filter_enabled ?? false

        console.log("Saving user with:", { spotifyId, display_name, email, avatar })

        // save to DB
        let user = await SpotifyUser.findOne({ spotifyId })
        if (!user) {
            user = new SpotifyUser({ spotifyId, display_name, email, avatar, explicitContentFilter, spotifyRefreshToken: refresh_token })
            await user.save()
        } else {
            user.explicitContentFilter = explicitContentFilter
            user.spotifyRefreshToken = refresh_token
            await user.save()
        }

        // Issue a JWT so the user can access protected API routes (same as regular login)
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        const params = new URLSearchParams({
            access_token,
            refresh_token,
            spotify_id: spotifyId,
            app_token: jwtToken
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
        const user = await SpotifyUser.findById(req.user.id)
        if (!user) return res.status(404).json({ error: "User not found" })

        res.json({
            display_name: user.display_name,
            email: user.email,
            avatar: user.avatar,
            explicitContentFilter: user.explicitContentFilter ?? false,
        })
    } catch (error) {
        console.error("Error fetching Spotify user from DB:", error.message)
        res.status(500).json({ error: "Server error fetching user from DB" })
    }
}

// updates the user info
exports.updateSpotifyUser = async (req, res) => {
    try {
        const { display_name, email } = req.body
        const update = { display_name, email }

        if (req.file) {
            update.avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
        } else if (req.body.avatar) {
            update.avatar = req.body.avatar
        }

        const user = await SpotifyUser.findByIdAndUpdate(req.user.id, update, { new: true })
        if (!user) return res.status(404).json({ error: "User not found" })

        res.json({ message: "User updated" })
    } catch (err) {
        console.error("Failed to update user:", err.message)
        res.status(500).json({ error: "Server error" })
    }
}

// Checks for user password
exports.checkForPassword = async (req, res) => {
    try {
        const user = await SpotifyUser.findById(req.user.id)
        if (!user) return res.status(404).json({ error: "User not found" })

        res.json({
            isNewUser: !user.password,
            spotifyId: user.spotifyId,
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

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await SpotifyUser.findByIdAndUpdate(
            req.user.id,
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
    // x-spotify-token is sent when Authorization carries a JWT for auth instead
    let access_token = req.headers['x-spotify-token']
        || req.headers.authorization?.replace('Bearer ', '')
        || req.cookies.spotify_access_token

    let refresh_token = req.headers['x-refresh-token']
        || req.cookies.spotify_refresh_token

    if (!access_token || !refresh_token) {
        return res.status(400).json({ error: 'Tokens are required' })
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
                res.cookie("spotify_access_token", access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 1000 })

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