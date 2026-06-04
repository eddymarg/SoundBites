const express = require("express")
const router = express.Router()
const ErrorLog = require("../models/ErrorLog")

// Frontend posts errors here — no auth required so unauthenticated errors are captured too
router.post("/log-error", async (req, res) => {
    try {
        const { level, action, message, stack, context, userId } = req.body
        if (!action || !message) return res.status(400).json({ msg: "action and message required" })

        await ErrorLog.create({
            level: level || "error",
            action: String(action).slice(0, 200),
            message: String(message).slice(0, 1000),
            stack: stack ? String(stack).slice(0, 3000) : undefined,
            context,
            userId,
            source: "frontend",
        })
        res.status(201).json({ ok: true })
    } catch (err) {
        res.status(500).json({ msg: "Failed to log error" })
    }
})

// View recent logs — use in dev to inspect errors
router.get("/errors", async (req, res) => {
    try {
        const { level, action, limit = 50 } = req.query
        const filter = {}
        if (level) filter.level = level
        if (action) filter.action = new RegExp(action, "i")

        const logs = await ErrorLog.find(filter)
            .sort({ timestamp: -1 })
            .limit(Number(limit))
            .lean()
        res.json(logs)
    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch logs" })
    }
})

module.exports = router
