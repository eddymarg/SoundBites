"use client"
import { useState, useEffect } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import getNearbyRestoByMusic from "../services/locationService"
import LoggedInHeader from "../components/loggedinHeader"
import GoogleMap from "../components/googleMap"
import RestaurantList from "../components/restaurantList"
import "../css/loggedin.css"
import { cache } from "react"

const UserHome = () => {
    const [userLocation, setUserLocation] = useState(null)
    const [restaurants, setRestaurants] = useState([])
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasFetchedRestaurants, setHasFetchedRestaurants] = useState(false)
    // Filter states
    const [genreFilter, setGenreFilter] = useState([])
    const [topGenres, setTopGenres] = useState([])
    //  For load more
    const [loadedCount, setLoadedCount] = useState(4)
    const [hasMore, setHasMore] = useState(false)
    // for full info modal
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [savedIds, setSavedIds] = useState([])

    // Retrieves location data
    useEffect(() => {
        if("permissions" in navigator && "geolocation" in navigator) {
            navigator.permissions.query({ name: "geolocation" }).then((result) => {
                if (result.state === "granted" || result.state === "prompt") {
                    const options = {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }
                    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options)
                } else {
                    fallbackToIP()
                }
            })
        } else {
            fallbackToIP()
        }

        function successCallback(position) {
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            }
            console.log("Success Geolocation:", coords)
            setUserLocation(coords)
            setIsLoading(false)
        }

        function errorCallback(error) {
            console.warn("location error:", error.message)
            fallbackToIP()
        }

        function fallbackToIP() {
            const cachedIPLocation = localStorage.getItem("ipLocation")

            if (cachedIPLocation) {
                const coords = JSON.parse(cachedIPLocation)
                console.log("Using cached IP location:", coords)
                setUserLocation(coords)
                setIsLoading(false)
                return
            }

            fetch("http://localhost:5001/api/get-ip-location")
                .then((res) => res.json())
                .then((data) => {
                    const fallbackCoords = { lat: data.latitude, lng: data.longitude}
                    console.log("Using IP fallback:", fallbackCoords)
                    setUserLocation(fallbackCoords)
                    console.log("IP location", data)
                    setIsLoading(false)
                })
                .catch(() => {
                    const nyc = { lat: 40.7128, lng: -74.0060 }
                    setUserLocation(nyc)
                    setIsLoading(false)
                })
        }
    }, [])

    // Deals with loading restaurant data
    useEffect(() => {
        console.count("useEffect ran")
        console.log("Loaded count:", loadedCount)
        console.log("Current userLocation:", userLocation)

        if (!userLocation || genreFilter.length === 0) return

        const cacheKey = JSON.stringify({ location: userLocation, genres: genreFilter })
        const cachedData = localStorage.getItem("restaurantCache")
        // console.log("Genre filter before fetching:", genreFilter)

        if (cachedData) {
            const parsed = JSON.parse(cachedData)
            if(parsed.key === cacheKey) {
                console.log("Loading from restaurantCache")
                setRestaurants(parsed.restaurants)
                console.log("Parsed restaurants", parsed.restaurants)
                setHasFetchedRestaurants(true)
                setIsLoading(false)
                return
            }
        }

        if (!hasFetchedRestaurants) {
            setIsLoading(true)
            getNearbyRestoByMusic(userLocation.lat, userLocation.lng, genreFilter)
                .then((data) => {
                    if (data && Array.isArray(data.restaurants)) {
                        setRestaurants(data.restaurants)
                        localStorage.setItem("restaurantCache", JSON.stringify({
                            key: cacheKey,
                            restaurants: data.restaurants
                        }))
                    }
                    setIsLoading(false)
                    console.log("Restaurants loaded:", data.restaurants)
                })
                .catch((err) => {
                    console.error("Error fetching restaurants:", err)
                    setError(err.message)
                    setIsLoading(false)
                })
        }
    }, [userLocation, genreFilter, hasFetchedRestaurants])

    // Gets Genres
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

    const bookmarkToggle = async (restaurant) => {
        const isSaved = savedIds.includes(restaurant.place_id)

        if (isSaved) {
            setSavedIds(savedIds.filter(id => id !== restaurant.place_id))
            await fetch(`http://localhost:5001/api/remove/${restaurant.place_id}`, {
                method: 'DELETE',
            })
        } else {
            setSavedIds([...savedIds, restaurant.place_id])

            await fetch('http://localhost:5001/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    place_id: restaurant.place_id,
                    name: restaurant.name,
                    photo: restaurant.photo,
                    rating: restaurant.rating,
                    address: restaurant.address,
                    geometry: {
                        location: {
                            lat: restaurant.geometry?.location?.lat ?? restaurant.geometry?.location?.lat?.(),
                            lng: restaurant.geometry?.location?.lng ?? restaurant.geometry?.location?.lng?.()
                        },
                        viewport: {
                            northeast: restaurant.geometry?.viewport?.northeast,
                            southeast: restaurant.geometry?.viewport?.southeast
                        }
                    }
                })
            })
            console.log("saved into db")
        }
    }

    // Assists with load more button
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
                            <RestaurantList 
                                restaurants={restaurants} 
                                handleLoadMore={handleLoadMore} 
                                hasMore={hasMore}
                                handleLocationClick={handleLocationClick}
                                savedIds={savedIds}
                                bookmarkToggle={bookmarkToggle}
                            />
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
                            savedIds={savedIds}
                            bookmarkToggle={bookmarkToggle}
                        />
                    </div>
                </div>
            </div>
        </APIProvider>
    )
}

export default UserHome