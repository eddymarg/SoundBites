const axios = require('axios')

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

async function getPlaceDetails(placeId) {
    try {
        const detailsResponse = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
                params: {
                    place_id: placeId,
                    key: GOOGLE_PLACES_API_KEY,
                    fields: 'website,formatted_phone_number,opening_hours',
                }
            }
        )
        console.log(`Details for placeId ${placeId}:`, detailsResponse.data)
        if (detailsResponse.data.result) {
            return {
                website: detailsResponse.data.result.website || "No website found",
                formatted_phone_number: detailsResponse.data.result.formatted_phone_number || "No associated phone number",
                opening_hours: detailsResponse.data.result.opening_hours || "No hours provided",
            }
        }
    } catch(error) {
        console.error(`Error fetching details for place ${placeId}:`, error)
    }

    return { website: null, formatted_phone_number: null, opening_hours: null}
}

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

        let restaurants = await Promise.all(
            response.data.results.map(async (resto) => {
                let photoUrl = "https://via.placeholder.com/400"
                if (resto.photos && resto.photos.length > 0) {
                    photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${resto.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                }

                const details = await getPlaceDetails(resto.place_id)

                return {
                    name: resto.name,
                    address: resto.formatted_address,
                    rating: resto.rating || "No rating",
                    user_ratings_total: resto.use_ratings_total || 0,
                    price_level: resto.price_level,
                    photo: photoUrl,
                    geometry: resto.geometry,
                    opening_hours: details.opening_hours || "No hours available",
                    website: details.website,
                    formatted_phone_number: details.formatted_phone_number,
                }
            }) 
        )
        const hasMore = response.data.next_page_token ? true : false

        res.status(200).json({ restaurants, hasMore, offset: response.data.next_page_token })
    } catch (error) {
        console.error('Error fetching restaurants:', error)
        res.status(500).json({message: 'Error fetching restaurants'})
    }
}