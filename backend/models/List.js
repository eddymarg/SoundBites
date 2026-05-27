const mongoose = require("mongoose")

const ListSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    place_ids: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("List", ListSchema)
