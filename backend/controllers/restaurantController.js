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
    const { lat, lng, genreFilter, pagetoken } = req.body
    const radius = 1000

    if (!lat || !lng) {
        return res.status(400).json({ message: "Missing required parameters." })
    }

    const genreQuery = genreFilter && genreFilter.length > 0
        ? `for people who have a ${genreFilter.join(' ')} vibe`
        : "for people with good vibes"
    const query = `restaurant ${genreQuery}`

    try {
        const params = {
            query: query,
            location: `${lat}, ${lng}`,
            radius: radius,
            type: 'food',
            key: GOOGLE_PLACES_API_KEY,
        }

        if (pagetoken) {
            params.pagetoken = pagetoken
        }

        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/textsearch/json',
            { params }
        )

        if (!response.data || !response.data.results) {
            throw new Error("Invalid response from Google Places API")
        }

        const FOOD_TYPES = new Set(['restaurant', 'food', 'bar', 'cafe', 'meal_delivery', 'meal_takeaway', 'bakery', 'night_club', 'fast_food'])
        const foodResults = response.data.results.filter(place =>
            place.types && place.types.some(t => FOOD_TYPES.has(t))
        )

        const restaurants = await Promise.all(
            foodResults.map(async (resto) => {
                let photoUrl = "https://source.unsplash.com/400x400/?restaurant"
                if (resto.photos && resto.photos.length > 0) {
                    photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${resto.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                }

                const details = await getPlaceDetails(resto.place_id)

                return {
                    place_id: resto.place_id,
                    name: resto.name,
                    address: resto.formatted_address,
                    rating: resto.rating || "No rating",
                    user_ratings_total: resto.user_ratings_total || 0,
                    price_level: resto.price_level,
                    photo: photoUrl,
                    geometry: resto.geometry,
                    opening_hours: details.opening_hours || "No hours available",
                    website: details.website,
                    formatted_phone_number: details.formatted_phone_number,
                }
            }) 
        )

        res.status(200).json({ 
            restaurants, 
            pagetoken: response.data.next_page_token || null,
            hasMore: !!response.data.next_page_token
        })
    } catch (error) {
        console.error('Error fetching restaurants:', error)
        res.status(500).json({message: 'Error fetching restaurants'})
    }
}