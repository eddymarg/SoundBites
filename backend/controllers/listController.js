const List = require("../models/List")

const DEFAULT_LISTS = [
    { name: 'Liked' },
    { name: 'Must Visit' },
]

const ensureDefaultLists = async (userId) => {
    for (const d of DEFAULT_LISTS) {
        const exists = await List.findOne({ userId, name: d.name, isDefault: true })
        if (!exists) {
            await List.create({ userId, name: d.name, isDefault: true, place_ids: [] })
        }
    }
}

exports.getLists = async (req, res) => {
    try {
        await ensureDefaultLists(req.user.id)
        const lists = await List.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 })
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
        const list = await List.findOne({ _id: req.params.listId, userId: req.user.id })
        if (!list) return res.status(404).json({ message: "List not found" })
        if (list.isDefault) return res.status(403).json({ message: "Cannot delete a default list" })
        await list.deleteOne()
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
