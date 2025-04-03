"use client"
import { Box } from "@mui/material"
import { useState, useEffect } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import getNearbyRestoByMusic from "../services/locationService"
import LoggedInHeader from "../components/loggedinHeader"
import GoogleMap from "../components/googleMap"
import RestaurantList from "../components/restaurantList"
import FilterBar from "../components/filterBar"

const userHome = () => {
    const [userLocation, setUserLocation] = useState(null)
    const [restaurants, setRestaurants] = useState([])
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    // Filter states
    const [genreFilter, setGenreFilter] = useState([])
    const [distanceFilter, setDistanceFilter] = useState([])
    const [price, setPrice] = useState(0)
    //  For load more
    const [loadedCount, setLoadedCount] = useState(4)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(null)
    // for full info modal
    const [selectedLocation, setSelectedLocation] = useState(null)

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
            setRestaurants([])

            const validGenreFilter = genreFilter.length ? genreFilter : ['all genres of']
            const validDistanceFilter = distanceFilter.length ? distanceFilter : [10]
            const validPrice = price >= 0 ? price : 0
            getNearbyRestoByMusic(userLocation.lat, userLocation.lng, validGenreFilter, validDistanceFilter, validPrice, loadedCount, offset)
                .then((data) => {
                    if(data && Array.isArray(data.restaurants)) {
                        setRestaurants(prevRestaurants => [...prevRestaurants, ...data.restaurants])
                        setHasMore(data.hasMore)
                        setOffset(data.offset)
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
    }, [userLocation, genreFilter, distanceFilter, price, loadedCount])

    const handleLoadMore = () => {
        setLoadedCount(prevCount => prevCount + 4)
    }

    const handleLocationClick = (location) => {
        setSelectedLocation(location)
    }

    return(
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
            <div>
                <LoggedInHeader/>
                <div className="flex h-screen">
                    {/* Left Side: Recommendations */}
                    <div className="w-1/2 p-8 flex flex-col">
                        <div className="sticky top-0 bg-white shadow-md z-10 rounded-lg" style={{height: '8%', borderRadius: '20px'}}>
                            <FilterBar
                                genreFilter={genreFilter} setGenreFilter={setGenreFilter} distanceFilter={distanceFilter} setDistanceFilter={setDistanceFilter} price={price} setPrice={setPrice}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto mt-4">
                            <RestaurantList restaurants={restaurants} handleLoadMore={handleLoadMore} hasMore={hasMore} handleLocationClick={handleLocationClick}/>
                        </div>
                    </div>
                    {/* Right side: map */}
                    <div className="w-1/2 p-8">
                        <GoogleMap 
                            userLocation={userLocation} 
                            restaurants={restaurants}
                            error={error} 
                            isLoading={isLoading}
                            selectedLocation={selectedLocation}
                            setSelectedLocation={setSelectedLocation}
                        />
                    </div>
                </div>
            </div>
        </APIProvider>
    )
}

export default userHome