const express = require("express")
const { getNearbyRestoByMusic } = require("../controllers/restaurantController")
const { saveRestaurant, removeRestaurant, getSavedRestaurants, toggleVisited } = require("../controllers/saveController")
const { getLists, createList, deleteList, addToList, removeFromList } = require("../controllers/listController")

const router = express.Router()

router.post("/nearby-restaurants", getNearbyRestoByMusic)
router.post("/save", saveRestaurant)
router.get("/savedRestaurants", getSavedRestaurants)
router.delete("/remove/:place_id", removeRestaurant)
router.patch("/visited/:place_id", toggleVisited)

router.get("/lists", getLists)
router.post("/lists", createList)
router.delete("/lists/:listId", deleteList)
router.post("/lists/:listId/add/:place_id", addToList)
router.delete("/lists/:listId/remove/:place_id", removeFromList)

module.exports = router
