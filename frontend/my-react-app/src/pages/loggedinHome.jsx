"use client"
import { Box } from "@mui/material"
import { useState, useEffect } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import { getNearbyRestoByMusic } from "../services/locationService"
import LoggedInHeader from "../components/loggedinHeader"
import GoogleMap from "../components/googleMap"

const userHome = () => {
    const [userLocation, setUserLocation] = useState(null)
    const [restaurants, setRestaurants] = useState([])
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [genre, setGenre] = useState("jazz")

    useEffect(() => {
        if("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                    setUserLocation(location)
                    setIsLoading(false)

                    try {
                        const data = await getNearbyRestoByMusic(location.lat, location.lng, genre)
                        setRestaurants(data)
                    } catch (err) {
                        setError("Error fetching restaurant data")
                    }
                },
                (error) => {
                    console.error("Error getting location:", error.message)
                    setError(error.message)
                    setIsLoading(false)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            )
        } else {
            setError("Geolocation is not supported by this browser.")
            setIsLoading(false)
        }
    }, [genre])

    return(
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
            <div>
                <LoggedInHeader/>
                <div className="flex h-screen">
                    <div className="w-1/2 p-8 overflow-y-auto">
                        <h2 className="text-xl font-bold">Nearby {genre} Restaurants</h2>
                        <select onChange={(e) => setGenre(e.target.value)} className="p-2 border rounded-md w-full mt-2">
                            <option value="jazz">Jazz</option>
                            <option value="rock">Rock</option>
                            <option value="blues">Blues</option>
                        </select>

                        {isLoading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : restaurants.length > 0 ? (
                            <ul className="mt-4">
                                {restaurants.map((restaurants, index) => (
                                    <li key={index} className="p-3 border-b">
                                        <strong>{restaurants.name}</strong> - {restaurants.formatted_address}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No restaurants found.</p>
                        )
                        }
                    </div>
                    <div className="w-1/2 p-8">
                        <GoogleMap userLocation={userLocation} error={error} isLoading={isLoading}/>
                    </div>
                </div>
            </div>
        </APIProvider>
    )
}

export default userHome