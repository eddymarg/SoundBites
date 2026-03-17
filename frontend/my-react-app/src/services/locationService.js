import axios from 'axios'

const getNearbyRestoByMusic = async (lat, lng, genreFilter, pagetoken = null) => {
    try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/nearby-restaurants`, {
            lat,
            lng,
            genreFilter,
            pagetoken,
        })
        return res.data
    } catch (error) {
        console.error("Error fetching music-themed restaurants (locationService):", error)
        throw error
    }
}

export default getNearbyRestoByMusic