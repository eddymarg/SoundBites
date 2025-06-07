// Works to deal with saving recommendations
const SaveSchema = require("../models/Save")

exports.saveRestaurant = async (req, res) => {
    console.log("Incoming save req.body", JSON.stringify(req.body, null, 2))
    try {
        const exists = await SaveSchema.findOne({ place_id: req.body.place_id })
        if (exists) return res.status(409).json({ message: "Restaurant already saved" })

        const newRestaurant = new SaveSchema(req.body)
        const saved = await newRestaurant.save()
        res.status(201).json(saved)
    } catch (error) {
        console.error("Error in saveRestaurant:", error)
        res.status(500).json({ error: error.message })
    }
}

exports.removeRestaurant = async (req, res) => {
    try {
        const { place_id } = req.params
        const removed = await SaveSchema.findOneAndDelete({ place_id })
        if(!removed) return res.status(404).json({ message: "Not found" })

        res.status(200).json({ message: "Removed successfully" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}