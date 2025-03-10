import axios from 'axios'

const getNearbyRestoByMusic = async (lat, lng, genre, limit, offset) => {
    try {
        const response = await axios.post('http://localhost:5001/api/nearby-restaurants', {
            lat,
            lng,
            genre,
            limit,
            offset,
        })
        return response.data
    } catch (error) {
        console.error("Error fetching music-themed restaurants (locationService):", error)
        throw error
    }
}

export default getNearbyRestoByMusic