import { useState, useEffect, useRef } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import { Box, Button } from "@mui/material"
import LoggedInHeader from "../components/loggedinHeader"
import GoogleMap from "../components/googleMap"
import RestaurantList from "../components/restaurantList"
import GenreDisplay from "../components/genreDisplay"
import AddPassword from "../components/addPassword"
import "../css/loggedin.css"
import LoadingScreen from "../components/LoadingScreen"
import getNearbyRestoByMusic from "../services/locationService"

const CACHE_DURATION = 60 * 60 * 1000 * 24
const RESTAURANTS_PER_LOAD = 3

const UserHome = () => {
    const [userLocation, setUserLocation] = useState(null)
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
    const [pagetoken, setPagetoken] = useState(null)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasNoMoreResults, setHasNoMoreResults] = useState(false)
    const [newRestaurantIds, setNewRestaurantIds] = useState(new Set())

    // for full info modal
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [savedIds, setSavedIds] = useState([])
    // for loading screen
    const [loadingStage, setLoadingStage] = useState(0)
    const [showLoadingScreen, setShowLoadingScreen] = useState(true)
    // for password addition
    const [isNewUser, setIsNewUser] = useState(false)
    const [spotifyId, setSpotifyId] = useState("")

    const loadStartTime = useRef(Date.now())
    const listContainerRef = useRef(null)

    const delayMinLoadTime = (start, callback, min = 3000) => {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, min - elapsed)
        setTimeout(() => {
            checkForPassword()
            callback()
        }, remaining)
    }

    // Retrieves location data
    useEffect(() => {
        loadStartTime.current = Date.now()

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
            setUserLocation(coords)
            localStorage.setItem("userLocation", JSON.stringify(coords))
            setIsLoading(false)
            delayMinLoadTime(loadStartTime.current, () => setShowLoadingScreen(false))
        }

        function errorCallback(error) {
            console.warn("location error:", error.message)
            fallbackToIP()
        }

        function fallbackToIP() {
            const cachedIPLocation = localStorage.getItem("ipLocation")

            if (cachedIPLocation) {
                const coords = JSON.parse(cachedIPLocation)
                setUserLocation(coords)
                localStorage.setItem("userLocation", JSON.stringify(coords))
                setIsLoading(false)
                delayMinLoadTime(loadStartTime.current, () => setShowLoadingScreen(false))
                return
            }

            fetch(`${import.meta.env.VITE_API_URL}/api/get-ip-location`)
                .then((res) => res.json())
                .then((data) => {
                    const fallbackCoords = { lat: data.latitude, lng: data.longitude }
                    setUserLocation(fallbackCoords)
                    localStorage.setItem("userLocation", JSON.stringify(fallbackCoords))
                    setIsLoading(false)
                    delayMinLoadTime(loadStartTime.current, () => setShowLoadingScreen(false))
                })
                .catch(() => {
                    const nyc = { lat: 40.7128, lng: -74.0060 }
                    setUserLocation(nyc)
                    localStorage.setItem("userLocation", JSON.stringify(nyc))
                    setIsLoading(false)
                    delayMinLoadTime(loadStartTime.current, () => setShowLoadingScreen(false))
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
        if (!userLocation || genreFilter.length === 0) return

        const cacheKey = getCacheKey(userLocation, genreFilter)
        const cachedData = localStorage.getItem("restaurantCache")

        if (cachedData) {
            const parsed = JSON.parse(cachedData)
            const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION

            if (parsed.key === cacheKey && !isExpired) {
                setAllRestaurants(parsed.restaurants)
                setVisibleRestaurants(parsed.restaurants.slice(0, RESTAURANTS_PER_LOAD))
                setLoadedCount(RESTAURANTS_PER_LOAD)
                setPagetoken(parsed.pagetoken || null)
                setHasFetchedRestaurants(true)
                setIsLoading(false)
                return
            }
        }

        if (!hasFetchedRestaurants) {
            setIsLoading(true)
            getNearbyRestoByMusic(userLocation.lat, userLocation.lng, genreFilter, pagetoken)
                .then((data) => {
                    if (data && Array.isArray(data.restaurants)) {
                        const newRestaurants = [...data.restaurants]
                        setAllRestaurants(newRestaurants)
                        setVisibleRestaurants(newRestaurants.slice(0, RESTAURANTS_PER_LOAD))
                        setLoadedCount(RESTAURANTS_PER_LOAD)
                        setPagetoken(data.pagetoken)

                        localStorage.setItem("restaurantCache", JSON.stringify({
                            key: cacheKey,
                            timestamp: Date.now(),
                            restaurants: newRestaurants,
                            pagetoken: data.pagetoken
                        }))
                    }
                    setHasFetchedRestaurants(true)
                    setIsLoading(false)
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
                const response = await fetch(`${import.meta.env.VITE_API_URL}/top-artists`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
                        'x-refresh-token': localStorage.getItem('spotify_refresh_token')
                    }
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch top artists")
                }
    
                const newToken = response.headers.get('x-new-access-token')
                if (newToken) {
                    localStorage.setItem('spotify_access_token', newToken)
                }

                const data = await response.json()

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
                setTopGenres(topGenres)
                setGenreFilter(topGenres)
                setLoadingStage(1)
            } catch (err) {
                console.error("Error loading top artists:", err)
            }
        }
        fetchTopArtists()
    },[])


    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (accessToken && refreshToken) {
            localStorage.setItem('spotify_access_token', accessToken)
            localStorage.setItem('spotify_refresh_token', refreshToken)

            window.history.replaceState({}, '', '/userHome')
        }
    }, [])

    const checkForPassword = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/check-for-password`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
                    'x-refresh-token': localStorage.getItem('spotify_refresh_token'),
                }
            })
            const newToken = res.headers.get('x-new-access-token')
            if (newToken) {
                localStorage.setItem('spotify_access_token', newToken)
            }
            const data = await res.json()
            if (data.isNewUser) {
                setSpotifyId(data.spotifyId)
                setIsNewUser(true)
            }
        } catch (error) {
            console.error("Password check failed", error)
        }
    }

    // Helps to save locations
    const bookmarkToggle = async (restaurant) => {
        const isSaved = savedIds.includes(restaurant.place_id)

        if (isSaved) {
            setSavedIds(savedIds.filter(id => id !== restaurant.place_id))
            try {
                await fetch(`${import.meta.env.VITE_API_URL}/api/remove/${restaurant.place_id}`, {
                    method: 'DELETE',
                })
            } catch (error) {
                setSavedIds(prev => [...prev, restaurant.place_id])
                console.error("Failed to remove bookmark:", error)
            }
        } else {
            setSavedIds([...savedIds, restaurant.place_id])
            try {
                await fetch(`${import.meta.env.VITE_API_URL}/api/save`, {
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
            } catch (error) {
                setSavedIds(prev => prev.filter(id => id !== restaurant.place_id))
                console.error("Failed to save bookmark:", error)
            }
        }
    }

    // Clears new pin highlight after animation completes
    useEffect(() => {
        if (newRestaurantIds.size === 0) return
        const timeout = setTimeout(() => setNewRestaurantIds(new Set()), 2000)
        return () => clearTimeout(timeout)
    }, [newRestaurantIds])

    // Scroll list down to reveal skeleton cards when loading more
    useEffect(() => {
        if (!isLoadingMore || !listContainerRef.current) return
        // defer until React has rendered the skeleton cards into the DOM
        const id = setTimeout(() => {
            listContainerRef.current?.scrollBy({ top: 400, behavior: 'smooth' })
        }, 50)
        return () => clearTimeout(id)
    }, [isLoadingMore])

    // Assists with load more button
    const handleLoadMore = async () => {
        const nextOffset = loadedCount + RESTAURANTS_PER_LOAD
        const totalCached = allRestaurants.length

        if (nextOffset <= totalCached) {
            const newSlice = allRestaurants.slice(loadedCount, nextOffset)
            setNewRestaurantIds(new Set(newSlice.map(r => r.place_id)))
            setVisibleRestaurants(allRestaurants.slice(0, nextOffset))
            setLoadedCount(nextOffset)
            if (nextOffset >= totalCached && !pagetoken) {
                setHasNoMoreResults(true)
            }
        } else {
            if (!pagetoken) {
                setHasNoMoreResults(true)
                return
            }

            setIsLoadingMore(true)
            try {
                const data = await getNearbyRestoByMusic(
                    userLocation.lat,
                    userLocation.lng,
                    genreFilter,
                    pagetoken
                )

                if (data && Array.isArray(data.restaurants)) {
                    const newRestaurants = data.restaurants.filter(
                        newResto => !allRestaurants.some(existing => existing.place_id === newResto.place_id)
                    )

                    setNewRestaurantIds(new Set(newRestaurants.map(r => r.place_id)))

                    const updatedCache = [...allRestaurants, ...newRestaurants]
                    setAllRestaurants(updatedCache)

                    const updatedVisible = updatedCache.slice(0, nextOffset)
                    setVisibleRestaurants(updatedVisible)
                    setLoadedCount(updatedVisible.length)
                    setPagetoken(data.pagetoken)

                    if (!data.pagetoken && updatedVisible.length >= updatedCache.length) {
                        setHasNoMoreResults(true)
                    }

                    const cacheKey = getCacheKey(userLocation, genreFilter)
                    localStorage.setItem("restaurantCache", JSON.stringify({
                        key: cacheKey,
                        timestamp: Date.now(),
                        restaurants: updatedCache,
                        pagetoken: data.pagetoken
                    }))
                }
            } catch (err) {
                console.error("Error loading more restaurants:", err)
                setError(err.message)
            } finally {
                setIsLoadingMore(false)
            }
        }
    }

    useEffect(() => {
        setHasFetchedRestaurants(false)
        setPagetoken(null)
        setHasNoMoreResults(false)
    }, [genreFilter])

    // Helps with storing selected location
    const handleLocationClick = (location) => {
        setSelectedLocation(location)
    }

    return(
        <>
            {showLoadingScreen && <LoadingScreen loadingStage={loadingStage}/>} 
            <AddPassword open={isNewUser} onClose={() => setIsNewUser(false)} spotifyId={spotifyId} />
            
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
                <div style={{ filter: showLoadingScreen ? 'blur(25px)' : 'none'}}>
                    <LoggedInHeader setHasFetchedRestaurants={setHasFetchedRestaurants} setVisibleRestaurants={setVisibleRestaurants}/>
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
                                <Box ref={listContainerRef} sx={{ maxHeight: '75%', overflowY: 'auto'}}>
                                    <RestaurantList
                                        restaurants={visibleRestaurants}
                                        handleLocationClick={handleLocationClick}
                                        savedIds={savedIds}
                                        bookmarkToggle={bookmarkToggle}
                                        isLoadingMore={isLoadingMore}
                                        newRestaurantIds={newRestaurantIds}
                                    />
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    marginTop="2rem"
                                    marginBottom="1rem"
                                >
                                    {hasNoMoreResults ? (
                                        <p style={{ color: "#888", fontSize: "15px" }}>
                                            No more restaurants to load.
                                        </p>
                                    ) : (
                                        <Button variant="outlined" color="mainRed"
                                        disabled={isLoadingMore}
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
                                    )}
                                </Box>
                            </div>
                        </div>
                        {/* Right side: map */}
                        <div className="w-1/2 p-8">
                            <GoogleMap
                                userLocation={userLocation}
                                restaurants={visibleRestaurants}
                                error={error}
                                isLoading={isLoading}
                                selectedLocation={selectedLocation}
                                setSelectedLocation={setSelectedLocation}
                                savedIds={savedIds}
                                bookmarkToggle={bookmarkToggle}
                                newRestaurantIds={newRestaurantIds}
                            />
                        </div>
                    </div>
                </div>
            </APIProvider>
        </>
    )
}

export default UserHome