const express = require("express")
const { getIpLocation } = require('../controllers/locationController')

const router = express.Router()

router.get('/get-ip-location', getIpLocation)

module.exports = router
