const express = require("express")
const { getNearbyRestoByMusic } = require("../controllers/restaurantController")
const { saveRestaurant, removeRestaurant, getSavedRestaurants, toggleVisited } = require("../controllers/saveController")
const { getLists, createList, deleteList, addToList, removeFromList } = require("../controllers/listController")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/nearby-restaurants", getNearbyRestoByMusic)

// Protected routes — require a logged-in user
router.post("/save", authMiddleware, saveRestaurant)
router.get("/savedRestaurants", authMiddleware, getSavedRestaurants)
router.delete("/remove/:place_id", authMiddleware, removeRestaurant)
router.patch("/visited/:place_id", authMiddleware, toggleVisited)

router.get("/lists", authMiddleware, getLists)
router.post("/lists", authMiddleware, createList)
router.delete("/lists/:listId", authMiddleware, deleteList)
router.post("/lists/:listId/add/:place_id", authMiddleware, addToList)
router.delete("/lists/:listId/remove/:place_id", authMiddleware, removeFromList)

module.exports = router
