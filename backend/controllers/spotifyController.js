const querystring = require("querystring")
const axios = require("axios")
require("dotenv").config()

const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI

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

exports.spotifyLogin = (req, res) => {
    const state = generateRandomString(16)
    res.cookie("spotify_auth_state", state) // stores state in cookies for later verification
    const scope = "user-read-private user-read-email playlist-read-private playlist-read-collaborative"

    res.redirect(
        "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
            response_type: "code",
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        })
    )
}

exports.spotifyCallback = async (req, res) => {
    // console.log("Spotify Callback Query:", req.query)
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

        // store tokens in a cookie (for frontend)
        res.cookie("spotify_access_token", access_token, { httpOnly: true, secure: false})
        res.cookie("spotify_refresh_token", refresh_token, { httpOnly: true, secure: false })

        res.redirect("http://localhost:5173/userHome")
    } catch (error) {
        console.error("Error fetching token:", error.response?.data || error.message)
        res.status(500).json({ error: "Failed to get tokens", details: error.message })
    }

    exports.getTopGenres = async(res, req) => {
        const access_token = req.cookies.spotify_access_token

        if (!access_token) {
            return res.status(401).json({ error: "Missing access token" })
        }

        try {
            const topGenres = await this.getTopGenres(access_token)
            res.json({ topGenres })
        } catch (error) {
            console.error("Error fetching top genres:", error.response?.data || error.message)
            res.status(500).json({ error: "Failed to get top genres" })
        }
    }
}