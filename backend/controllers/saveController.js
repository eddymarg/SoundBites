// Works to deal with saving recommendations
const SaveSchema = require("../models/Save")
const List = require("../models/List")

exports.saveRestaurant = async (req, res) => {
    console.log("Incoming save req.body", JSON.stringify(req.body, null, 2))
    try {
        const userId = req.user.id
        const exists = await SaveSchema.findOne({ userId, place_id: req.body.place_id })
        if (exists) return res.status(409).json({ message: "Restaurant already saved" })

        const { place_id, name, photo, rating, price_level, address, geometry, opening_hours, website, formatted_phone_number } = req.body
        const safeRating = rating !== undefined && !isNaN(Number(rating)) ? Number(rating) : null
        const safePriceLevel = price_level !== undefined && !isNaN(Number(price_level)) ? Number(price_level) : null
        const newRestaurant = new SaveSchema({ place_id, name, photo, rating: safeRating, price_level: safePriceLevel, address, geometry, opening_hours, website, formatted_phone_number, userId })
        const saved = await newRestaurant.save()
        res.status(201).json(saved)
    } catch (error) {
        console.error("Error in saveRestaurant:", error)
        res.status(500).json({ error: error.message })
    }
}

exports.removeRestaurant = async (req, res) => {
    try {
        const userId = req.user.id
        const place_id = req.params.place_id
        console.log("Removing place_id:", place_id, "for user:", userId)
        const removed = await SaveSchema.findOneAndDelete({ userId, place_id })
        if (!removed) return res.status(404).json({ message: "Not found" })

        await List.updateMany({ userId }, { $pull: { place_ids: place_id } })

        res.status(200).json({ message: "Removed successfully" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.getSavedRestaurants = async (req, res) => {
    try {
        const userId = req.user.id
        const savedRestaurants = await SaveSchema.find({ userId })
        res.status(200).json(savedRestaurants)
    } catch (error) {
        console.error("Error getting saved restaurants:", error)
        res.status(500).json({ error: error.message })
    }
}

exports.toggleVisited = async (req, res) => {
    try {
        const userId = req.user.id
        const { place_id } = req.params
        let restaurant = await SaveSchema.findOne({ userId, place_id })
        if (!restaurant) {
            const { name, photo, rating, price_level, address, geometry, opening_hours, website, formatted_phone_number } = req.body
            restaurant = new SaveSchema({ place_id, name, photo, rating, price_level, address, geometry, opening_hours, website, formatted_phone_number, userId, visited: true })
            await restaurant.save()
            return res.status(201).json(restaurant)
        }
        restaurant.visited = !restaurant.visited
        await restaurant.save()
        res.json(restaurant)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
