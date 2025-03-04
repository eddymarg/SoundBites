const axios = require('axios')

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

exports.getNearbyRestoByMusic = async (req, res) => {
    console.log("Received request:", req.body)
    const { lat, lng, genre } = req.body
    const radius = 50000
    const query = `restaurant live ${genre} music`

    if (!lat || !lng || !genre) {
        return res.status(400).json({ message: "Missing required parameters."})
    }

    try {
        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/textsearch/json',
            {
                params: {
                    query: query,
                    location: `${lat},${lng}`,
                    radius: radius,
                    key: GOOGLE_PLACES_API_KEY,
                }
            },
        )

        // console.log("Google Places API response:", response.data)

        if (!response.data || !response.data.results) {
            throw new Error("Invalid response from Google Places API")
        }

        const restaurants = response.data.results
        res.status(200).json(restaurants)
    } catch (error) {
        console.error('Error fetching restaurants:', error)
        res.status(500).json({message: 'Error fetching restaurants'})
    }
}