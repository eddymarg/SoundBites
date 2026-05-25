const mongoose = require("mongoose")

const ListSchema = new mongoose.Schema({
    name: { type: String, required: true },
    place_ids: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("List", ListSchema)
