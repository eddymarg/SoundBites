const mongoose = require("mongoose")

const ErrorLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now, index: true },
    level: { type: String, enum: ["error", "warn", "info"], default: "error" },
    action: { type: String, required: true },
    message: { type: String, required: true },
    stack: { type: String },
    context: { type: mongoose.Schema.Types.Mixed },
    userId: { type: String },
    source: { type: String, enum: ["frontend", "backend"], default: "frontend" },
})

module.exports = mongoose.model("ErrorLog", ErrorLogSchema)
