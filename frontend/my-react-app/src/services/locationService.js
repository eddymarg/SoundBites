import axios from 'axios'

export const getNearbyRestoByMusic = async (lat, lng, genre) => {
    try {
        const response = await axios.post('http://localhost:5001/api/nearby-restaurants', {
            lat,
            lng,
            genre,
        })
        return response.data
    } catch (error) {
        console.error("Error fetching music-themed restaurants (locationService):", error)
        throw error
    }
}