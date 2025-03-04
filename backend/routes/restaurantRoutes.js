const express = require("express")
const { getNearbyRestoByMusic } = require("../controllers/restaurantController")

const router = express.Router()

router.post("/nearby-restaurants", getNearbyRestoByMusic)

module.exports = router