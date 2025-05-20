"use client"
import { useState, useEffect } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import getNearbyRestoByMusic from "../services/locationService"
import LoggedInHeader from "../components/loggedinHeader"
import GoogleMap from "../components/googleMap"
import RestaurantList from "../components/restaurantList"
import "../css/loggedin.css"

const userHome = () => {
    const [userLocation, setUserLocation] = useState(null)
    const [restaurants, setRestaurants] = useState([])
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    // Filter states
    const [genreFilter, setGenreFilter] = useState([])
    const [distanceFilter, setDistanceFilter] = useState([])
    const [price, setPrice] = useState(0)
    const [topGenres, setTopGenres] = useState([])
    //  For load more
    const [loadedCount, setLoadedCount] = useState(4)
    const [hasMore, setHasMore] = useState(true)
    // for full info modal
    const [selectedLocation, setSelectedLocation] = useState(null)

    useEffect(() => {
        let watchId;

        if("geolocation" in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation ({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                    setIsLoading(false)
                },
                (error) => {
                    console.warn("Location error:", error.message)

                    if (error.code === 1) 
                        setError("Permission denied.")
                    else if (error.code === 2)
                        setError("Location unavailable. Showing default.")
                    else if (error.code === 3)
                        setError("Location request timed out.")
                    else 
                        setError("Unknown error occurred.")

                    fetch("http://localhost:5001/api/get-ip-location")
                        .then((res) => res.json())
                        .then((data) => {
                            setUserLocation({lat: data.latitude, lng: data.longitude})
                            setIsLoading(false)
                        })
                        .catch(() => {
                            setUserLocation({lat: 40.7128, lng: -74.0060})
                            setIsLoading(false)
                        })
                },
                {
                    enableHighAccuracy: true,
                    timeout: 1000,
                    maximumAge: 0,
                }
            )
        } else {
            setError("Geolocation is not supported by this browser.")
            setIsLoading(false)
        }

        return () => {
            if(watchId) navigator.geolocation.clearWatch(watchId)
        }
    }, [])

    useEffect(() => {
        console.log("Fetching with:", {
            userLocation,
            genreFilter,
            distanceFilter,
            price,
            loadedCount
        })
        if (userLocation) {
            setIsLoading(true)
            setRestaurants([])
            getNearbyRestoByMusic(userLocation.lat, userLocation.lng, genreFilter, distanceFilter, price, loadedCount)
                .then((data) => {
                    console.log("fetched restaurant data:", data)
                    if(data && Array.isArray(data.restaurants)) {
                        setRestaurants(prevRestaurants => [...prevRestaurants, ...data.restaurants])
                        setHasMore(data.hasMore)
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
    }, [userLocation])

    useEffect(() => {
        const fetchTopArtists = async () => {
            try {
                const response = await fetch("http://localhost:5001/top-artists", {
                    method: 'GET',
                    credentials: "include"
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch top artists")
                }
    
                const data = await response.json()
                console.log("Top artists loaded:", data)

                const desiredGenreCount = 3
                const genreSet = new Set()

                for (const artist of data) {
                    if (artist.genres && artist.genres.length > 0) {
                        for (const genre of artist.genres) {
                            if (genre) genreSet.add(genre.toLowerCase())
                            if(genreSet.size >= desiredGenreCount) break
                        }
                    }
                    if(genreSet.size >= desiredGenreCount) break
                }

                const topGenres = Array.from(genreSet)
                console.log("Top extracted genres:", topGenres)
                setTopGenres(topGenres)
                setGenreFilter(topGenres)
            } catch (err) {
                console.error("Error loading top artists:", err)
            }
        }
        fetchTopArtists()
    },[])

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
                        </div> {/* for filters */}
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