const mongoose = require("mongoose")

const SaveSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    place_id: { type: String, required: true },
    name: String,
    photo: String,
    rating: Number,
    price_level: Number,
    address: String,
    geometry: {
        location: {
            lat: { type: Number },
            lng: { type: Number }
        },
        viewport: {
            northeast: {
                lat: Number,
                lng: Number
            },
            southeast: {
                lat: Number,
                lng: Number
            }
        }
    },
    visited: { type: Boolean, default: false },
    opening_hours: { type: mongoose.Schema.Types.Mixed },
    website: { type: String },
    formatted_phone_number: { type: String }
})

SaveSchema.index({ userId: 1, place_id: 1 }, { unique: true })

module.exports =  mongoose.model("Save", SaveSchema)