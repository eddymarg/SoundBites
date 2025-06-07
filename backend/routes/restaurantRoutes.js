const express = require("express")
const { getNearbyRestoByMusic } = require("../controllers/restaurantController")
const { saveRestaurant, removeRestaurant } = require("../controllers/saveController")

const router = express.Router()

router.post("/nearby-restaurants", getNearbyRestoByMusic)
router.post("/save", saveRestaurant)
router.delete("/remove/:place_id", removeRestaurant)

module.exports = router