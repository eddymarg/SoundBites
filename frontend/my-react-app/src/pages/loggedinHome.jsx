"use client"
import { useState, useEffect } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import { Box, Button } from "@mui/material"
import getNearbyRestoByMusic from "../services/locationService"
import LoggedInHeader from "../components/loggedinHeader"
import GoogleMap from "../components/googleMap"
import RestaurantList from "../components/restaurantList"
import GenreDisplay from "../components/genreDisplay"
import "../css/loggedin.css"
import { cache } from "react"
import LoadingScreen from "../components/LoadingScreen"

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
    const [allRestaurants, setAllRestaurants] = useState([])
    const [visibleRestaurants, setVisibleRestaurants] = useState([])
    const [loadedCount, setLoadedCount] = useState(0)
    // for full info modal
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [savedIds, setSavedIds] = useState([])
    // for loading screen
    const [loadStartTime, setLoadStartTime] = useState(null)
    const [loadingStage, setLoadingStage] = useState(0)

    const CACHE_DURATION = 60 * 60 * 1000 * 24
    const RESTAURANTS_PER_LOAD = 10

    const delayMinLoadTime = (start, callback, min = 5) => {
        const elapsed = Date.now() - start
        console.log(`🕒 Actual load duration: ${elapsed}ms`)
        // change to max later; it's only min for testing purposes
        const remaining = Math.max(0, min - elapsed)
        setTimeout(() => {
            console.log("✅ Hiding loading screen now.")
            callback
        }, remaining)
    }

    // Retrieves location data
    useEffect(() => {
        setLoadStartTime(Date.now())

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
            localStorage.setItem("userLocation", JSON.stringify(coords))
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
                localStorage.setItem("userLocation", JSON.stringify(coords))
                setIsLoading(false)
                return
            }

            fetch("http://localhost:5001/api/get-ip-location")
                .then((res) => res.json())
                .then((data) => {
                    const fallbackCoords = { lat: data.latitude, lng: data.longitude}
                    console.log("Using IP fallback:", fallbackCoords)
                    setUserLocation(fallbackCoords)
                    localStorage.setItem("userLocation", JSON.stringify(fallbackCoords))
                    console.log("IP location", data)
                    setIsLoading(false)
                })
                .catch(() => {
                    const nyc = { lat: 40.7128, lng: -74.0060 }
                    setUserLocation(nyc)
                    localStorage.setItem("userLocation", JSON.stringify(nyc))
                    setIsLoading(false)
                })
        }
    }, [])

    // normalize cache key
    const getCacheKey = (location, genres) => {
        if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
            console.warn("Invalid location passed to getCacheKey:", location)
            return null
        }

        const roundedLoc = {
            lat: Number(location.lat.toFixed(3)),
            lng: Number(location.lng.toFixed(3))
        }
        const sortedGenres = [...genres].sort()
        return JSON.stringify({ location: roundedLoc, genres: sortedGenres })
    }

    // Deals with loading restaurant data
    useEffect(() => {
        // console.count("useEffect ran")
        // console.log("Loaded count:", loadedCount)
        // console.log("Current userLocation:", userLocation)
        // console.log("Restaurant retrieval useEffect called")

        if (!userLocation || genreFilter.length === 0) return

        const cacheKey = getCacheKey(userLocation, genreFilter)
        const cachedData = localStorage.getItem("restaurantCache")

        if (cachedData) {
            // console.log("caching data")
            const parsed = JSON.parse(cachedData)
            const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION

            if(parsed.key === cacheKey && !isExpired) {
                console.log("Loading from restaurantCache")
                setRestaurants(parsed.restaurants)
                setVisibleRestaurants(parsed.restaurants)
                console.log("Parsed restaurants", parsed.restaurants)
                setHasFetchedRestaurants(true)
                setIsLoading(false)
                setLoadedCount(parsed.restaurants.length)
                return
            }
        }

        if (!hasFetchedRestaurants) {
            setIsLoading(true)
            console.log("Fetching restaurants starting in frontend")
            getNearbyRestoByMusic(userLocation.lat, userLocation.lng, genreFilter, 0)
                .then((data) => {
                    if (data && Array.isArray(data.restaurants)) {
                        const newRestaurants = [...data.restaurants]
                        setAllRestaurants(newRestaurants)
                        setVisibleRestaurants(newRestaurants.slice(0, RESTAURANTS_PER_LOAD))
                        setLoadedCount(RESTAURANTS_PER_LOAD)

                        localStorage.setItem("restaurantCache", JSON.stringify({
                            key: cacheKey,
                            timestamp: Date.now(),
                            restaurants: newRestaurants
                        }))
                    }
                    setHasFetchedRestaurants(true)
                    setIsLoading(false)
                    console.log("Restaurants loaded:", data.restaurants)
                    console.log("Loading resto, resto: ", restaurants)
                })
                .catch((err) => {
                    console.error("Error fetching restaurants:", err)
                    setError(err.message)
                    setIsLoading(false)
                })
        }
    }, [userLocation, genreFilter, hasFetchedRestaurants])

    // reset genreFilter changes
    useEffect(() => {
        setHasFetchedRestaurants(false)
    }, [genreFilter])

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
                setLoadingStage(1)
            } catch (err) {
                console.error("Error loading top artists:", err)
            }
        }
        fetchTopArtists()
    },[])

    // retrieves Spotify user info

    // helps to save locations
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
        const nextOffset = loadedCount + RESTAURANTS_PER_LOAD
        const totalCached = allRestaurants.length

        if(nextOffset <= totalCached) {
            setVisibleRestaurants(allRestaurants.slice(0, nextOffset))
            setLoadedCount(nextOffset)
        } else {
            getNearbyRestoByMusic(userLocation.lat, userLocation.lng, genreFilter, totalCached)
                .then((data) => {
                    if (data && Array.isArray(data.restaurants)) {
                        const updatedCache = [...allRestaurants, ...data.restaurants]
                        setAllRestaurants(updatedCache)

                        const updatedVisible = updatedCache.slice(0, nextOffset)
                        setVisibleRestaurants(updatedVisible)
                        setLoadedCount(updatedVisible.length)

                        const cacheKey = getCacheKey(userLocation, genreFilter)
                        localStorage.setItem("restaurantCache", JSON.stringify({
                            key: cacheKey,
                            timestamp: Date.now(),
                            restaurants: updatedCache
                        }))
                    }
                })
                .catch((err) => {
                    console.error("Error loading more restaurants:", err)
                    setError(err.message)
                })
        }

    }

    // Helps with storing selected location
    const handleLocationClick = (location) => {
        setSelectedLocation(location)
    }

    return(
        <>
            {/* {isLoading && <LoadingScreen loadingStage={loadingStage}/>}  */}
            
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
                {/* style={{ filter: isLoading ? 'blur(25px)' : 'none'}} */}
                <div>
                    <LoggedInHeader />
                    <div className="flex h-screen">
                        {/* Left Side: Recommendations */}
                        <div className="w-1/2 p-8 flex flex-col">
                            <div className="sticky top-0">
                                <GenreDisplay 
                                    topGenres={topGenres}
                                    setTopGenres={(updated) => {
                                        setGenreFilter(updated)
                                        setTopGenres(updated)
                                    }}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto mt-4">
                                <Box sx={{ maxHeight: '75%', overflowY: 'auto'}}>
                                    <RestaurantList 
                                        restaurants={visibleRestaurants} 
                                        handleLocationClick={handleLocationClick}
                                        savedIds={savedIds}
                                        bookmarkToggle={bookmarkToggle}
                                    />
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    marginTop="2rem"
                                >
                                    <Button variant="outlined" color="mainRed" 
                                    sx={{
                                        borderRadius: "36px",
                                        border: "2px solid",
                                        backgroundColor: "white",
                                        fontSize: "20px",
                                        textTransform: "none",
                                        width: "260px",
                                        "&:hover": {
                                            backgroundColor: "#EF233C20",
                                        }
                                    }}
                                    onClick={handleLoadMore}
                                    >Load More</Button>
                                </Box>
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
        </>
    )
}

export default UserHome