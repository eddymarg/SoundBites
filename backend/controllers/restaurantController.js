const axios = require('axios')
const { mapGenresToKeywords } = require('../models/genreMappings')

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

// Buckets a setting string into a broad venue category so we can ensure
// the two search queries sent to Google Places are genuinely different types.
function getVenueCategory(setting) {
    const s = setting.toLowerCase()
    if (s.includes('diner')) return 'diner'
    if (s.includes('fine dining') || s.includes("chef's table") || s.includes('omakase') || s.includes('tasting menu')) return 'fine_dining'
    if (s.includes('rooftop')) return 'rooftop'
    if (s.includes('food truck')) return 'food_truck'
    if (s.includes('food market') || s.includes('food hall') || s.includes('night market') || s.includes('open-air market') || s.includes('hawker') || s.includes('street food') || s.includes('pop-up')) return 'food_market'
    if (s.includes('pub') || s.includes('gastropub')) return 'pub'
    if (s.includes('wine bar')) return 'wine_bar'
    if (s.includes('cocktail') || s.includes('speakeasy')) return 'cocktail_bar'
    if (s.includes('pizza')) return 'pizza'
    if (s.includes('sushi') || s.includes('ramen') || s.includes('izakaya')) return 'japanese'
    if (s.includes('bbq') || s.includes('smokehouse') || s.includes('barbeque') || s.includes('barbecue') || s.includes('churrasco')) return 'bbq'
    if (s.includes('taco') || s.includes('cantina') || s.includes('taqueria')) return 'mexican'
    if (s.includes('vegan') || s.includes('vegetarian') || s.includes('plant-based') || s.includes('plant based')) return 'vegan'
    if (s.includes('soul food')) return 'soul_food'
    if (s.includes('brunch') || s.includes('pancake house')) return 'brunch'
    if (s.includes('steakhouse') || s.includes('steak house')) return 'steakhouse'
    if (s.includes('bakery') || s.includes('bakeries')) return 'bakery'
    if (s.includes('tapas') || s.includes('mezze')) return 'tapas'
    if (s.includes('tea')) return 'tea'
    if (s.includes('buffet')) return 'buffet'
    if (s.includes('fusion')) return 'fusion'
    if (s.includes('cafe') || s.includes('cafes') || s.includes('coffeehouse') || s.includes('coffee shop')) return 'cafe'
    if (s.includes('bistro')) return 'bistro'
    if (s.includes('lounge')) return 'lounge'
    if (s.includes('burger')) return 'burger'
    if (s.includes('bar')) return 'bar'
    return s
}

function mapGenresToVenueQueries(genres, filterAlcohol = false) {
    if (!genres || genres.length === 0) return ['restaurant']

    const { settings } = mapGenresToKeywords(genres)

    if (settings.length > 0) {
        const seenCategories = new Set()
        const chosen = []
        const dinerFallback = []

        for (const setting of settings) {
            if (chosen.length >= 2) break
            const cat = getVenueCategory(setting)
            if (cat === 'diner') {
                // collect one diner in case we run out of other options
                if (dinerFallback.length === 0) dinerFallback.push(setting)
                continue
            }
            if (!seenCategories.has(cat)) {
                seenCategories.add(cat)
                chosen.push(setting)
            }
        }

        // Only use a diner if there weren't enough diverse alternatives
        while (chosen.length < 2 && dinerFallback.length > 0) {
            chosen.push(dinerFallback.shift())
        }

        if (chosen.length > 0) return chosen
    }

    // Fall back to coarse map for genres with no detailed match
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
                website: detailsResponse.data.result.website || null,
                formatted_phone_number: detailsResponse.data.result.formatted_phone_number || "No associated phone number",
                opening_hours: detailsResponse.data.result.opening_hours || "No hours provided",
            }
        }
    } catch(error) {
        console.error(`Error fetching details for place ${placeId}:`, error)
    }

    return { website: null, formatted_phone_number: null, opening_hours: null}
}

const FOOD_TYPES = new Set(['restaurant', 'food', 'bar', 'cafe', 'bakery', 'night_club'])

const CHAIN_BLOCKLIST = [
    "mcdonald", "burger king", "kfc", "taco bell", "subway", "wendy",
    "domino", "pizza hut", "papa john", "chipotle", "panda express",
    "popeyes", "chick-fil-a", "five guys", "shake shack", "in-n-out",
    "sonic drive", "dairy queen", "dunkin", "starbucks", "tim horton",
    "costa coffee", "baskin-robbins", "little caesar", "arby", "jack in the box",
    "del taco", "carl's jr", "hardee", "white castle", "whataburger",
    "checkers", "rally's", "bojangles", "raising cane", "wingstop",
    "buffalo wild wings", "applebee", "chili's", "olive garden",
    "red lobster", "ihop", "denny", "waffle house", "cracker barrel",
    "golden corral", "bob evans", "panera", "jason's deli",
    "noodles & company", "moe's southwest", "qdoba", "jersey mike",
    "firehouse subs", "potbelly", "jimmy john", "pret a manger",
    "sweetgreen", "cosi", "quiznos", "blaze pizza", "mod pizza",
    "fatburger", "smashburger", "habit burger", "culver", "cook out",
]

const isChain = (name) => {
    const lower = name.toLowerCase()
    return CHAIN_BLOCKLIST.some(chain => lower.includes(chain))
}

exports.getNearbyRestoByMusic = async (req, res) => {
    const { lat, lng, genreFilter, pagetoken, filterAlcohol } = req.body
    const radius = 2500

    if (!lat || !lng) {
        return res.status(400).json({ message: "Missing required parameters." })
    }

    const venueQueries = mapGenresToVenueQueries(genreFilter, filterAlcohol === true)
    // When paginating, only use the primary query (pagetoken is tied to a specific search)
    const queriesToRun = pagetoken ? [venueQueries[0]] : venueQueries

    try {
        const allFoodResults = []
        const seenIds = new Set()
        let nextPageToken = null

        for (const venueQuery of queriesToRun) {
            const params = {
                query: venueQuery,
                location: `${lat}, ${lng}`,
                radius,
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
                place.types &&
                place.types.some(t => FOOD_TYPES.has(t)) &&
                !place.types.includes('fast_food') &&
                !isChain(place.name)
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

        const BAR_TYPES = new Set(['bar', 'night_club'])
        const nonBarResults = allFoodResults.filter(p => !p.types?.some(t => BAR_TYPES.has(t)))
        const barResults = allFoodResults.filter(p => p.types?.some(t => BAR_TYPES.has(t)))
        const barAllowance = Math.max(1, Math.floor(nonBarResults.length / 5))
        const mixed = [...nonBarResults, ...barResults.slice(0, barAllowance)]

        // Score to surface local gems: prefer rated, modest review counts, mid-range price
        const scored = mixed
            .filter(p => !p.rating || p.rating >= 3.5)
            .map(p => {
                const ratingScore = (p.rating || 3.5) * 2
                const priceScore = (p.price_level === 2 || p.price_level === 3) ? 1.5 : 0
                const reviewScore = p.user_ratings_total > 30 && p.user_ratings_total < 8000 ? 1 : 0
                return { ...p, _score: ratingScore + priceScore + reviewScore }
            })
            .sort((a, b) => b._score - a._score)

        const mixedResults = scored

        const restaurants = mixedResults.map((resto) => {
            let photoUrl = "https://source.unsplash.com/400x400/?restaurant"
            if (resto.photos && resto.photos.length > 0) {
                photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${resto.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            }

            return {
                place_id: resto.place_id,
                name: resto.name,
                address: resto.formatted_address,
                rating: resto.rating || "No rating",
                user_ratings_total: resto.user_ratings_total || 0,
                price_level: resto.price_level,
                photo: photoUrl,
                geometry: resto.geometry,
            }
        })

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

exports.getPlaceDetailsById = async (req, res) => {
    const { placeId } = req.params
    if (!placeId) return res.status(400).json({ message: 'Missing placeId' })

    const details = await getPlaceDetails(placeId)
    res.status(200).json(details)
}