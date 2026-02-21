import axios from 'axios'

const getNearbyRestoByMusic = async (lat, lng, genreFilter, next_page_token = null) => {
    console.log("Sending lat/lng to API:", lat, lng, genreFilter)

    try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/nearby-restaurants`, {
            lat,
            lng,
            genreFilter,
            next_page_token,
        })
        return res.data
    } catch (error) {
        console.error("Error fetching music-themed restaurants (locationService):", error)
        throw error
    }
}

export default getNearbyRestoByMusic