const axios = require('axios')

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

const GENRE_VENUE_MAP = [
    { keywords: ['jazz', 'bebop', 'swing', 'blues', 'jazz rap', 'soul jazz', 'jazz fusion'],                                                                                                     query: 'jazz bar',           safeQuery: 'jazz cafe' },
    { keywords: ['hip hop', 'hip-hop', 'rap', 'trap', 'drill', 'r&b', 'soul', 'funk', 'neo soul', 'motown', 'urban contemporary', 'contemporary r&b', 'alternative r&b'],                        query: 'soul food restaurant', safeQuery: 'soul food restaurant' },
    { keywords: ['indie', 'alternative', 'folk', 'acoustic', 'lo-fi', 'singer-songwriter', 'bedroom pop', 'chillwave', 'dream pop', 'shoegaze', 'slowcore'],                                      query: 'gastropub',           safeQuery: 'cafe bistro' },
    { keywords: ['classical', 'orchestra', 'opera', 'piano', 'baroque', 'chamber', 'symphonic', 'ambient classical'],                                                                            query: 'fine dining restaurant', safeQuery: 'fine dining restaurant' },
    { keywords: ['country', 'americana', 'bluegrass', 'western', 'outlaw', 'southern rock', 'texas country'],                                                                                    query: 'BBQ restaurant',      safeQuery: 'BBQ restaurant' },
    { keywords: ['electronic', 'edm', 'techno', 'house', 'dance', 'trance', 'dubstep', 'electronica', 'synthwave', 'vaporwave'],                                                                 query: 'cocktail bar',        safeQuery: 'boba tea cafe' },
    { keywords: ['rock', 'metal', 'punk', 'grunge', 'hard rock', 'hardcore', 'post-rock', 'progressive rock', 'math rock', 'emo'],                                                               query: 'pub',                 safeQuery: 'burger restaurant' },
    { keywords: ['pop', 'teen pop', 'synth pop', 'dance pop', 'bubblegum pop', 'hyperpop', 'electropop'],                                                                                        query: 'brunch restaurant',   safeQuery: 'brunch restaurant' },
    { keywords: ['k-pop', 'kpop', 'korean', 'j-pop', 'jpop', 'j-rock', 'jrock', 'japanese', 'mandopop', 'c-pop'],                                                                              query: 'Asian fusion restaurant', safeQuery: 'Asian fusion restaurant' },
    { keywords: ['latin', 'reggaeton', 'salsa', 'bossa nova', 'flamenco', 'cumbia', 'latin pop', 'latin trap', 'bachata', 'merengue', 'spanish'],                                                query: 'Latin restaurant',    safeQuery: 'Latin restaurant' },
    { keywords: ['reggae', 'caribbean', 'dancehall', 'tropical', 'ska', 'afrobeats', 'afropop', 'highlife', 'soca'],                                                                             query: 'Caribbean restaurant', safeQuery: 'Caribbean restaurant' },
    { keywords: ['gospel', 'christian', 'worship', 'spiritual', 'ccm'],                                                                                                                          query: 'soul food restaurant', safeQuery: 'soul food restaurant' },
]

function mapGenresToVenueQueries(genres, filterAlcohol = false) {
    if (!genres || genres.length === 0) return ['restaurant']

    const counts = {}
    for (const genre of genres) {
        const lower = genre.toLowerCase()
        for (const entry of GENRE_VENUE_MAP) {
            if (entry.keywords.some(k => lower.includes(k))) {
                const q = filterAlcohol ? entry.safeQuery : entry.query
                counts[q] = (counts[q] || 0) + 1
                break
            }
        }
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([q]) => q)
    return sorted.length > 0 ? sorted.slice(0, 2) : ['restaurant']
}

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
    const { lat, lng, genreFilter, pagetoken, filterAlcohol } = req.body
    const radius = 1000

    if (!lat || !lng) {
        return res.status(400).json({ message: "Missing required parameters." })
    }

    const venueQueries = mapGenresToVenueQueries(genreFilter, filterAlcohol === true)
    // When paginating, only use the primary query (pagetoken is tied to a specific search)
    const queriesToRun = pagetoken ? [venueQueries[0]] : venueQueries

    try {
        const FOOD_TYPES = new Set(['restaurant', 'food', 'bar', 'cafe', 'meal_delivery', 'meal_takeaway', 'bakery', 'night_club', 'fast_food'])
        const allFoodResults = []
        const seenIds = new Set()
        let nextPageToken = null

        for (const venueQuery of queriesToRun) {
            const params = {
                query: venueQuery,
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

            if (!response.data?.results) continue

            const foodResults = response.data.results.filter(place =>
                place.types && place.types.some(t => FOOD_TYPES.has(t))
            )

            for (const place of foodResults) {
                if (!seenIds.has(place.place_id)) {
                    seenIds.add(place.place_id)
                    allFoodResults.push(place)
                }
            }

            if (!nextPageToken && response.data.next_page_token) {
                nextPageToken = response.data.next_page_token
            }
        }

        const restaurants = await Promise.all(
            allFoodResults.map(async (resto) => {
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
            pagetoken: nextPageToken || null,
            hasMore: !!nextPageToken
        })
    } catch (error) {
        console.error('Error fetching restaurants:', error)
        res.status(500).json({message: 'Error fetching restaurants'})
    }
}