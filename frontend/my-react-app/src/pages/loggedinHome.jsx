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
    const [visibleCount, setVisibleCount] = useState(4)
    const [nextPageToken, setNextPageToken] = useState(null)

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
            getNearbyRestoByMusic(userLocation.lat, userLocation.lng, genre, visibleCount)
                .then((data) => {
                    if(data && Array.isArray(data.restaurants)) {
                        setRestaurants(data.restaurants)
                        setNextPageToken(data.nextPageToken || null)
                    } else {
                        console.error("Invalid response format:", data)
                        setRestaurants([])
                    }
                    setIsLoading(false)
                })
                .catch((err) => {
                    console.error("Error fetching restaurants:", err)
                    setError(err.message)
                    setIsLoading(false)
                })
        }
    }, [userLocation, genre, visibleCount])

    const handleShowMore = () => {
        if (nextPageToken) {
        setIsLoading(true)
        getNearbyRestoByMusic(userLocation.lat, userLocation.lng, genre, visibleCount, nextPageToken)
            .then((data) => {
                setRestaurants((prev) => [...prev, ...data.restaurants]) 
                setNextPageToken(data.nextPageToken)
                setIsLoading(false)
            })
            .catch((err) => {
                setError(err.message)
                setIsLoading(false)
            })
        }
        setVisibleCount((prev) => prev + 4)
    }

    return(
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
            <div>
                <LoggedInHeader/>
                <div className="flex h-screen">
                    <div className="w-1/2 p-8 overflow-y-auto">
                        <RestaurantList restaurants={restaurants} handleShowMore={handleShowMore}/>
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