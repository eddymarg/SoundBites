"use client"
import { Box } from "@mui/material"
import { useState, useEffect } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import { getNearbyRestoByMusic } from "../services/locationService"
import LoggedInHeader from "../components/loggedinHeader"
import GoogleMap from "../components/googleMap"
import RestaurantList from "../components/restaurantList"

const userHome = () => {
    const [userLocation, setUserLocation] = useState(null)
    const [restaurants, setRestaurants] = useState([])
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [genre, setGenre] = useState("jazz")

    useEffect(() => {
        if("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation ({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                    setIsLoading(false)
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
    }, [])

    useEffect(() => {
        if (userLocation) {
            setIsLoading(true)
            getNearbyRestoByMusic(userLocation.lat, userLocation.lng, genre)
                .then((data) => {
                    setRestaurants(data)
                    setIsLoading(false)
                })
                .catch((err) => {
                    setError(err.message)
                    setIsLoading(false)
                })
        }
    }, [userLocation, genre])

    return(
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
            <div>
                <LoggedInHeader/>
                <div className="flex h-screen">
                    <div className="w-1/2 p-8 overflow-y-auto">
                        <RestaurantList restaurants={restaurants}/>
                    </div>
                    <div className="w-1/2 p-8">
                        <GoogleMap 
                            userLocation={userLocation} 
                            restaurants={restaurants}
                            error={error} 
                            isLoading={isLoading}/>
                    </div>
                </div>
            </div>
        </APIProvider>
    )
}

export default userHome