const mongoose = require("mongoose")

const SaveSchema = new mongoose.Schema({
    place_id: { type: String, required: true, unique: true },
    name: String,
    photo: String,
    rating: Number,
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
    }
})

module.exports =  mongoose.model("Save", SaveSchema)