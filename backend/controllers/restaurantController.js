const axios = require('axios')

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

exports.getNearbyRestoByMusic = async (req, res) => {
    console.log("Received request:", req.body)
    const { lat, lng, genre, offset } = req.body
    const radius = 50000
    const query = `restaurant live ${genre} music`

    if (!lat || !lng || !genre || offset === undefined) {
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
                    pagetoken: offset,
                }
            },
        )

        // console.log("Google Places API response:", response.data)

        if (!response.data || !response.data.results) {
            throw new Error("Invalid response from Google Places API")
        }

        let restaurants = response.data.results.map((resto) => {
            let photoUrl = "https://via.placeholder.com/400"
            if (resto.photos && resto.photos.length > 0) {
                photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${resto.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            }

            return {
                name: resto.name,
                address: resto.formatted_address,
                rating: resto.rating || "No rating",
                user_ratings_total: resto.use_ratings_total || 0,
                price_level: resto.price_level,
                photo: photoUrl,
                geometry: resto.geometry,
            }
        }) 
        
        const hasMore = response.data.next_page_token ? true : false

        res.status(200).json({ restaurants, hasMore, offset: response.data.next_page_token })
    } catch (error) {
        console.error('Error fetching restaurants:', error)
        res.status(500).json({message: 'Error fetching restaurants'})
    }
}