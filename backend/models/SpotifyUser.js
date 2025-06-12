const mongoose = require("mongoose")

const SpotifyUser = new mongoose.Schema({
    spotifyId: {
        type: String,
        required: true,
        unique: true,
    },
    display_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
    },
    avatar: {
        type: String,
        required: false,
    }
})

module.exports = mongoose.model("SpotifyUser", SpotifyUser)