import axios from 'axios'

const getNearbyRestoByMusic = async (lat, lng, genreFilter, pagetoken = null, filterAlcohol = false) => {
    try {
        const token = localStorage.getItem('app_token') || localStorage.getItem('spotify_access_token')
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/nearby-restaurants`, {
            lat,
            lng,
            genreFilter,
            pagetoken,
            filterAlcohol,
        }, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        })
        return res.data
    } catch (error) {
        console.error("Error fetching music-themed restaurants (locationService):", error)
        throw error
    }
}

export default getNearbyRestoByMusic