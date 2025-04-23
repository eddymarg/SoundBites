import axios from 'axios'

const getNearbyRestoByMusic = async (lat, lng, genreFilter, distanceFilter, price, limit) => {
    try {
        const res = await axios.post('http://localhost:5001/api/nearby-restaurants', {
            lat,
            lng,
            genreFilter,
            distanceFilter,
            price,
            limit,
        })
        return res.data
    } catch (error) {
        console.error("Error fetching music-themed restaurants (locationService):", error)
        throw error
    }
}

export default getNearbyRestoByMusic