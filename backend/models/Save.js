const mongoose = require("mongoose")

const SaveSchema = new mongoose.Schema({
    place_id: { type: String, required: true, unique: true },
    name: String,
    photo: String,
    rating: Number,
    price_level: Number,
    address: String,
    geometry: {
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true}
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

module.exports =  mongoose.model("Save", SaveSchema)