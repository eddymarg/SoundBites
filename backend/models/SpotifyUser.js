const mongoose = require("mongoose")

const SpotifyUser = new mongoose.Schema({
    spotifyId: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
    },
    display_name: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    avatar: {
        type: String,
        required: false,
    },
    password: {
        type: String
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    explicitContentFilter: {
        type: Boolean,
        default: false
    },
    spotifyRefreshToken: {
        type: String,
        required: false,
    }
})

module.exports = mongoose.model("SpotifyUser", SpotifyUser)