const List = require("../models/List")

exports.getLists = async (req, res) => {
    try {
        const lists = await List.find({ userId: req.user.id }).sort({ createdAt: -1 })
        res.json(lists)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.createList = async (req, res) => {
    try {
        const { name } = req.body
        if (!name?.trim()) return res.status(400).json({ message: "Name required" })
        const list = new List({ userId: req.user.id, name: name.trim() })
        await list.save()
        res.status(201).json(list)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.deleteList = async (req, res) => {
    try {
        const deleted = await List.findOneAndDelete({ _id: req.params.listId, userId: req.user.id })
        if (!deleted) return res.status(404).json({ message: "List not found" })
        res.json({ message: "Deleted" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.addToList = async (req, res) => {
    try {
        const list = await List.findOne({ _id: req.params.listId, userId: req.user.id })
        if (!list) return res.status(404).json({ message: "List not found" })
        if (!list.place_ids.includes(req.params.place_id)) {
            list.place_ids.push(req.params.place_id)
            await list.save()
        }
        res.json(list)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.removeFromList = async (req, res) => {
    try {
        const list = await List.findOne({ _id: req.params.listId, userId: req.user.id })
        if (!list) return res.status(404).json({ message: "List not found" })
        list.place_ids = list.place_ids.filter(id => id !== req.params.place_id)
        await list.save()
        res.json(list)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
