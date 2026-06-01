import { useState, useEffect, useRef } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import { Box, Button, Snackbar, Portal } from "@mui/material"
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

const spotifyAuthHeaders = () => {
    const token = localStorage.getItem("spotify_access_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
}

const UserHome = () => {
    const [userLocation, setUserLocation] = useState(null)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasFetchedRestaurants, setHasFetchedRestaurants] = useState(false)
    // Filter states
    const [genreFilter, setGenreFilter] = useState([])
    const [topGenres, setTopGenres] = useState([])
    const [allGenres, setAllGenres] = useState([])
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
    const [visitedIds, setVisitedIds] = useState([])
    // for loading screen
    const [loadingStage, setLoadingStage] = useState(0)
    const [showLoadingScreen, setShowLoadingScreen] = useState(() => !sessionStorage.getItem("hasSeenLoadingScreen"))
    const hideLoadingScreen = () => {
        sessionStorage.setItem("hasSeenLoadingScreen", "true")
        setShowLoadingScreen(false)
    }
    // for password addition
    const [isNewUser, setIsNewUser] = useState(false)
    const [spotifyId, setSpotifyId] = useState("")

    const [lists, setLists] = useState([])
    const [refreshStatus, setRefreshStatus] = useState(null) // null | 'new' | 'same' | 'location'
    const [awaitingLocation, setAwaitingLocation] = useState(false)
    const [usingFallbackLocation, setUsingFallbackLocation] = useState(false)
    const isFirstVisitRef = useRef(!localStorage.getItem("userLocation"))
    const [mobileRecsOpen, setMobileRecsOpen] = useState(false)

    const loadStartTime = useRef(Date.now())
    const listContainerRef = useRef(null)

    // Must run synchronously before any effects so the genre fetch has the token
    const _tokenInitRef = useRef(false)
    if (!_tokenInitRef.current) {
        _tokenInitRef.current = true
        const _params = new URLSearchParams(window.location.search)
        const _at = _params.get('access_token')
        const _rt = _params.get('refresh_token')
        if (_at && _rt) {
            localStorage.setItem('spotify_access_token', _at)
            localStorage.setItem('spotify_refresh_token', _rt)
            window.history.replaceState({}, '', '/userHome')
        }
    }

    const mobileListContainerRef = useRef(null)
    const isRefreshRef = useRef(false)
    const preRefreshRestaurantsRef = useRef([])
    const dragStartY = useRef(null)
    const drawerRef = useRef(null)

    const delayMinLoadTime = (start, callback, min = 5500) => {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, min - elapsed)
        setTimeout(() => setLoadingStage(2), Math.max(0, remaining - 1800))
        setTimeout(() => {
            checkForPassword()
            callback()
        }, remaining)
    }

    // Retrieves location data
    useEffect(() => {
        loadStartTime.current = Date.now()
        let permResult = null
        const gotGPS = { current: false }

        const geoOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        }

        // Called if the user grants location permission after we already fell back to IP
        function onPermissionChange() {
            if (permResult?.state === "granted" && !gotGPS.current) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        if (gotGPS.current) return
                        gotGPS.current = true
                        const coords = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        }
                        setUserLocation(coords)
                        localStorage.setItem("userLocation", JSON.stringify(coords))
                        setUsingFallbackLocation(false)
                        // Clear cache and force a fresh restaurant fetch with real location
                        localStorage.removeItem("restaurantCache")
                        setAllRestaurants([])
                        setVisibleRestaurants([])
                        setIsLoading(true)
                        setLoadedCount(0)
                        setPagetoken(null)
                        setHasNoMoreResults(false)
                        setHasFetchedRestaurants(false)
                        setRefreshStatus("location")
                        permResult?.removeEventListener("change", onPermissionChange)
                    },
                    () => {} // silently ignore — we already have a fallback location
                )
            }
        }

        function successCallback(position) {
            if (gotGPS.current) return
            gotGPS.current = true
            setAwaitingLocation(false)
            setUsingFallbackLocation(false)
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            }
            setUserLocation(coords)
            localStorage.setItem("userLocation", JSON.stringify(coords))
            setIsLoading(false)
            delayMinLoadTime(loadStartTime.current, hideLoadingScreen)
            permResult?.removeEventListener("change", onPermissionChange)
        }

        function errorCallback(error) {
            console.warn("location error:", error.message)
            setAwaitingLocation(false)
            fallbackToIP()
            // Keep the permission listener alive — user may still grant after the timeout
        }

        function fallbackToIP() {
            setUsingFallbackLocation(true)
            const cachedIPLocation = localStorage.getItem("ipLocation")

            if (cachedIPLocation) {
                const coords = JSON.parse(cachedIPLocation)
                setUserLocation(coords)
                localStorage.setItem("userLocation", JSON.stringify(coords))
                setIsLoading(false)
                delayMinLoadTime(loadStartTime.current, hideLoadingScreen)
                return
            }

            fetch(`${import.meta.env.VITE_API_URL}/api/get-ip-location`)
                .then((res) => res.json())
                .then((data) => {
                    const fallbackCoords = { lat: data.latitude, lng: data.longitude }
                    setUserLocation(fallbackCoords)
                    localStorage.setItem("userLocation", JSON.stringify(fallbackCoords))
                    setIsLoading(false)
                    delayMinLoadTime(loadStartTime.current, hideLoadingScreen)
                })
                .catch(() => {
                    const nyc = { lat: 40.7128, lng: -74.0060 }
                    setUserLocation(nyc)
                    localStorage.setItem("userLocation", JSON.stringify(nyc))
                    setIsLoading(false)
                    delayMinLoadTime(loadStartTime.current, hideLoadingScreen)
                })
        }

        if ("permissions" in navigator && "geolocation" in navigator) {
            navigator.permissions.query({ name: "geolocation" }).then((result) => {
                permResult = result
                if (result.state === "granted") {
                    const cached = localStorage.getItem("userLocation")
                    if (cached) {
                        // Permission already granted and location cached — use it directly
                        gotGPS.current = true
                        const coords = JSON.parse(cached)
                        setUserLocation(coords)
                        setUsingFallbackLocation(false)
                        setIsLoading(false)
                        delayMinLoadTime(loadStartTime.current, hideLoadingScreen)
                    } else {
                        result.addEventListener("change", onPermissionChange)
                        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, geoOptions)
                    }
                } else if (result.state === "prompt") {
                    setAwaitingLocation(true)
                    result.addEventListener("change", onPermissionChange)
                    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, geoOptions)
                } else {
                    fallbackToIP()
                }
            })
        } else {
            fallbackToIP()
        }

        return () => {
            permResult?.removeEventListener("change", onPermissionChange)
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
            const filterAlcohol = localStorage.getItem('explicitContentFilter') === 'true'
            getNearbyRestoByMusic(userLocation.lat, userLocation.lng, genreFilter, pagetoken, filterAlcohol)
                .then((data) => {
                    if (data && Array.isArray(data.restaurants)) {
                        const newRestaurants = [...data.restaurants]

                        if (isRefreshRef.current) {
                            const prevIds = new Set(preRefreshRestaurantsRef.current.map(r => r.place_id))
                            const hasNew = newRestaurants.some(r => !prevIds.has(r.place_id))
                            isRefreshRef.current = false

                            if (!hasNew) {
                                setRefreshStatus('same')
                                setAllRestaurants(preRefreshRestaurantsRef.current)
                                setVisibleRestaurants(preRefreshRestaurantsRef.current.slice(0, RESTAURANTS_PER_LOAD))
                                setLoadedCount(Math.min(RESTAURANTS_PER_LOAD, preRefreshRestaurantsRef.current.length))
                                setHasFetchedRestaurants(true)
                                setIsLoading(false)
                                return
                            }
                            setRefreshStatus('new')
                        }

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
        const GENRE_CACHE_TTL = 60 * 60 * 1000 // 1 hour

        const fetchTopArtists = async () => {
            try {
                // Use cached genres if still fresh
                const cachedGenres = localStorage.getItem("genreCache")
                if (cachedGenres) {
                    const parsed = JSON.parse(cachedGenres)
                    if (Date.now() - parsed.timestamp < GENRE_CACHE_TTL) {
                        setAllGenres(parsed.allGenres)
                        setTopGenres(parsed.topGenres)
                        setGenreFilter(parsed.topGenres)
                        setLoadingStage(1)
                        return
                    }
                }

                const response = await fetch(`${import.meta.env.VITE_API_URL}/top-artists`, {
                    method: 'GET',
                    credentials: 'include',
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
                if (!Array.isArray(data)) throw new Error("Unexpected response from top artists")

                const desiredGenreCount = 10
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

                const allGenresList = Array.from(genreSet)
                const initialGenres = allGenresList.slice(0, 3)

                localStorage.setItem("genreCache", JSON.stringify({
                    timestamp: Date.now(),
                    allGenres: allGenresList,
                    topGenres: initialGenres,
                }))

                setAllGenres(allGenresList)
                setTopGenres(initialGenres)
                setGenreFilter(initialGenres)
                setLoadingStage(1)
            } catch (err) {
                console.error("Error loading top artists:", err)
            }
        }
        fetchTopArtists()
    },[])



    useEffect(() => {
        const loadSavedIds = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/savedRestaurants`, { credentials: 'include', headers: spotifyAuthHeaders() })
                if (!res.ok) return
                const data = await res.json()
                const safeData = Array.isArray(data) ? data : []
                setSavedIds(safeData.map(r => r.place_id))
                setVisitedIds(safeData.filter(r => r.visited).map(r => r.place_id))
            } catch (err) {
                console.error("Failed to load saved IDs:", err)
            }
        }
        loadSavedIds()
    }, [])

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lists`, { credentials: 'include', headers: spotifyAuthHeaders() })
                if (!res.ok) return
                const data = await res.json()
                setLists(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error("Failed to load lists:", err)
            }
        }
        fetchLists()
    }, [])

    const checkForPassword = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/check-for-password`, {
                credentials: 'include',
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
                    credentials: 'include',
                    headers: spotifyAuthHeaders(),
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
                    headers: { 'Content-Type': 'application/json', ...spotifyAuthHeaders() },
                    credentials: 'include',
                    body: JSON.stringify({
                        place_id: restaurant.place_id,
                        name: restaurant.name,
                        photo: restaurant.photo,
                        rating: restaurant.rating,
                        price_level: restaurant.price_level,
                        address: restaurant.address,
                        opening_hours: restaurant.opening_hours ?? null,
                        website: restaurant.website ?? null,
                        formatted_phone_number: restaurant.formatted_phone_number ?? null,
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

    const handleAddToList = async (listId, restaurant) => {
        if (!restaurant) return
        const list = lists.find(l => l._id === listId)
        if (!list) return
        const isInList = list.place_ids?.includes(restaurant.place_id)

        setLists(prev => prev.map(l =>
            l._id === listId
                ? { ...l, place_ids: isInList
                    ? l.place_ids.filter(id => id !== restaurant.place_id)
                    : [...l.place_ids, restaurant.place_id] }
                : l
        ))

        // Auto-save the restaurant when adding to a list for the first time
        if (!isInList && !savedIds.includes(restaurant.place_id)) {
            bookmarkToggle(restaurant)
        }

        try {
            const url = `${import.meta.env.VITE_API_URL}/api/lists/${listId}/${isInList ? 'remove' : 'add'}/${restaurant.place_id}`
            await fetch(url, { method: isInList ? 'DELETE' : 'POST', credentials: 'include', headers: spotifyAuthHeaders() })
        } catch {
            setLists(prev => prev.map(l =>
                l._id === listId
                    ? { ...l, place_ids: isInList
                        ? [...l.place_ids, restaurant.place_id]
                        : l.place_ids.filter(id => id !== restaurant.place_id) }
                    : l
            ))
        }
    }

    const visitedToggle = async (restaurant) => {
        const isVisited = visitedIds.includes(restaurant.place_id)
        const isSaved = savedIds.includes(restaurant.place_id)

        setVisitedIds(prev => isVisited
            ? prev.filter(id => id !== restaurant.place_id)
            : [...prev, restaurant.place_id]
        )
        if (!isSaved && !isVisited) {
            setSavedIds(prev => [...prev, restaurant.place_id])
        }

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/visited/${restaurant.place_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...spotifyAuthHeaders() },
                credentials: 'include',
                body: JSON.stringify({
                    place_id: restaurant.place_id,
                    name: restaurant.name,
                    photo: restaurant.photo,
                    rating: restaurant.rating,
                    price_level: restaurant.price_level,
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
        } catch {
            setVisitedIds(prev => isVisited
                ? [...prev, restaurant.place_id]
                : prev.filter(id => id !== restaurant.place_id)
            )
            if (!isSaved && !isVisited) {
                setSavedIds(prev => prev.filter(id => id !== restaurant.place_id))
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
        if (!isLoadingMore) return
        const id = setTimeout(() => {
            listContainerRef.current?.scrollBy({ top: 400, behavior: 'smooth' })
            mobileListContainerRef.current?.scrollBy({ top: 400, behavior: 'smooth' })
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
        setIsLoading(true)
        setHasFetchedRestaurants(false)
        setPagetoken(null)
        setHasNoMoreResults(false)
    }, [genreFilter])

    const handleRefresh = () => {
        isRefreshRef.current = true
        preRefreshRestaurantsRef.current = [...allRestaurants]
        setRefreshStatus(null)
        localStorage.removeItem("restaurantCache")
        setAllRestaurants([])
        setVisibleRestaurants([])
        setIsLoading(true)
        setLoadedCount(0)
        setPagetoken(null)
        setHasNoMoreResults(false)
        setHasFetchedRestaurants(false)
    }

    const handleRevertRefresh = () => {
        const prev = preRefreshRestaurantsRef.current
        setAllRestaurants(prev)
        setVisibleRestaurants(prev.slice(0, RESTAURANTS_PER_LOAD))
        setLoadedCount(Math.min(RESTAURANTS_PER_LOAD, prev.length))
        setRefreshStatus(null)
    }

    // Helps with storing selected location
    const handleLocationClick = (location) => {
        setSelectedLocation(location)
    }

    useEffect(() => {
        if (!selectedLocation?.place_id || 'website' in selectedLocation) return

        fetch(`${import.meta.env.VITE_API_URL}/api/place-details/${selectedLocation.place_id}`, {
            credentials: 'include',
            headers: spotifyAuthHeaders(),
        })
            .then(res => res.json())
            .then(details => {
                setSelectedLocation(prev =>
                    prev?.place_id === selectedLocation.place_id ? { ...prev, ...details } : prev
                )
            })
            .catch(err => console.error('Failed to fetch place details:', err))
    }, [selectedLocation?.place_id])

    const handleDrawerDragStart = (e) => {
        dragStartY.current = e.touches[0].clientY
    }

    const handleDrawerDragMove = (e) => {
        if (dragStartY.current === null || !drawerRef.current) return
        const delta = e.touches[0].clientY - dragStartY.current
        if (delta > 0) {
            drawerRef.current.style.transition = 'none'
            drawerRef.current.style.transform = `translateY(${delta}px)`
        }
    }

    const handleDrawerDragEnd = (e) => {
        if (dragStartY.current === null || !drawerRef.current) return
        const delta = e.changedTouches[0].clientY - dragStartY.current
        dragStartY.current = null
        drawerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        if (delta > 80) {
            drawerRef.current.style.transform = 'translateY(100%)'
            setTimeout(() => {
                setMobileRecsOpen(false)
                if (drawerRef.current) drawerRef.current.style.transform = ''
            }, 300)
        } else {
            drawerRef.current.style.transform = 'translateY(0)'
            setTimeout(() => {
                if (drawerRef.current) drawerRef.current.style.transform = ''
            }, 300)
        }
    }

    return(
        <>
            {showLoadingScreen && <LoadingScreen loadingStage={loadingStage} topGenres={topGenres} showLocationTip={awaitingLocation && isFirstVisitRef.current} />}
            <AddPassword open={isNewUser} onClose={() => setIsNewUser(false)} spotifyId={spotifyId} />

            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    filter: showLoadingScreen ? 'blur(25px)' : 'none',
                }}>
                    <LoggedInHeader setHasFetchedRestaurants={setHasFetchedRestaurants} setVisibleRestaurants={setVisibleRestaurants}/>

                    <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>

                        {/* ── MOBILE / TABLET (xs–sm, < 900px) ── */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', height: '100%', position: 'relative' }}>

                            {/* Map fills everything */}
                            <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>
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
                                    visitedIds={visitedIds}
                                    visitedToggle={visitedToggle}
                                    lists={lists}
                                    onToggleList={handleAddToList}
                                />
                            </Box>

                            {/* Floating toggle pill */}
                            {!selectedLocation && (
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: mobileRecsOpen ? 'calc(65% + 12px)' : '20px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    zIndex: 11,
                                    transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}>
                                    <Button
                                        onClick={() => setMobileRecsOpen(prev => !prev)}
                                        disableElevation
                                        sx={{
                                            '@keyframes recsPulse': {
                                                '0%':   { boxShadow: '0 2px 16px rgba(0,0,0,0.15), 0 0 0 0 rgba(239,35,60,0.40)' },
                                                '65%':  { boxShadow: '0 2px 16px rgba(0,0,0,0.15), 0 0 0 12px rgba(239,35,60,0)' },
                                                '100%': { boxShadow: '0 2px 16px rgba(0,0,0,0.15), 0 0 0 0 rgba(239,35,60,0)' },
                                            },
                                            borderRadius: '50px',
                                            backgroundColor: 'white',
                                            color: '#EF233C',
                                            boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '13px',
                                            px: 2.5,
                                            py: 0.9,
                                            whiteSpace: 'nowrap',
                                            border: '1.5px solid #EF233C30',
                                            animation: mobileRecsOpen ? 'none' : 'recsPulse 2s ease-out infinite',
                                            '&:hover': { backgroundColor: '#fff5f5' },
                                        }}
                                    >
                                        {visibleRestaurants.length} recs nearby {mobileRecsOpen ? '▼' : '▲'}
                                    </Button>
                                </Box>
                            )}

                            {/* Slide-up recs drawer */}
                            <Box ref={drawerRef} sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '65%',
                                backgroundColor: '#f2f2f2',
                                borderRadius: '24px 24px 0 0',
                                boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
                                transform: mobileRecsOpen ? 'translateY(0)' : 'translateY(100%)',
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                zIndex: 10,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                            }}>
                                {/* Drag handle — touch to drag down and close */}
                                <Box
                                    onTouchStart={handleDrawerDragStart}
                                    onTouchMove={handleDrawerDragMove}
                                    onTouchEnd={handleDrawerDragEnd}
                                    sx={{ pt: 1.5, pb: 1, display: 'flex', justifyContent: 'center', flexShrink: 0, cursor: 'grab', touchAction: 'none' }}
                                >
                                    <Box sx={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#c0c0c0' }} />
                                </Box>
                                {/* Genre bar */}
                                <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
                                    <GenreDisplay
                                        topGenres={topGenres}
                                        allGenres={allGenres}
                                        setTopGenres={(updated) => {
                                            setGenreFilter(updated)
                                            setTopGenres(updated)
                                        }}
                                    />
                                </Box>
                                {/* Scrollable recs */}
                                <Box ref={mobileListContainerRef} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1 }}>
                                    <RestaurantList
                                        restaurants={visibleRestaurants}
                                        handleLocationClick={(loc) => {
                                            handleLocationClick(loc)
                                            setMobileRecsOpen(false)
                                        }}
                                        selectedLocation={selectedLocation}
                                        savedIds={savedIds}
                                        bookmarkToggle={bookmarkToggle}
                                        isLoading={isLoading}
                                        isLoadingMore={isLoadingMore}
                                        newRestaurantIds={newRestaurantIds}
                                        usingFallbackLocation={usingFallbackLocation}
                                        lists={lists}
                                        onAddToList={handleAddToList}
                                    />
                                    <Box display="flex" justifyContent="center" alignItems="center" mt={2} mb={1.5}>
                                        {hasNoMoreResults ? (
                                            <p style={{ color: "#888", fontSize: "13px" }}>No new recommendations — check back tomorrow!</p>
                                        ) : (
                                            <Button variant="outlined" color="mainRed"
                                                disabled={isLoadingMore}
                                                sx={{
                                                    borderRadius: "36px",
                                                    border: "2px solid",
                                                    backgroundColor: "white",
                                                    fontSize: '13px',
                                                    textTransform: "none",
                                                    width: '140px',
                                                    "&:hover": { backgroundColor: "#EF233C20" }
                                                }}
                                                onClick={handleLoadMore}
                                            >Load More</Button>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* ── DESKTOP (md+, ≥ 900px) ── */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, height: '100%' }}>
                            {/* Left: genre bar + scrollable recs */}
                            <Box sx={{
                                width: '50%',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 0,
                                px: 4,
                                py: 2,
                            }}>
                                <Box sx={{ pb: 1, flexShrink: 0 }}>
                                    <GenreDisplay
                                        topGenres={topGenres}
                                        allGenres={allGenres}
                                        setTopGenres={(updated) => {
                                            setGenreFilter(updated)
                                            setTopGenres(updated)
                                        }}
                                    />
                                </Box>
                                <Box ref={listContainerRef} sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                                    <RestaurantList
                                        restaurants={visibleRestaurants}
                                        handleLocationClick={handleLocationClick}
                                        selectedLocation={selectedLocation}
                                        savedIds={savedIds}
                                        bookmarkToggle={bookmarkToggle}
                                        isLoading={isLoading}
                                        isLoadingMore={isLoadingMore}
                                        newRestaurantIds={newRestaurantIds}
                                        usingFallbackLocation={usingFallbackLocation}
                                        lists={lists}
                                        onAddToList={handleAddToList}
                                    />
                                    <Box display="flex" justifyContent="center" alignItems="center" marginTop="2rem" marginBottom="1rem">
                                        {hasNoMoreResults ? (
                                            <p style={{ color: "#888", fontSize: "15px" }}>No new recommendations — check back tomorrow!</p>
                                        ) : (
                                            <Button variant="outlined" color="mainRed"
                                                disabled={isLoadingMore}
                                                sx={{
                                                    borderRadius: "36px",
                                                    border: "2px solid",
                                                    backgroundColor: "white",
                                                    fontSize: '20px',
                                                    textTransform: "none",
                                                    width: '260px',
                                                    "&:hover": { backgroundColor: "#EF233C20" }
                                                }}
                                                onClick={handleLoadMore}
                                            >Load More</Button>
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Right: map */}
                            <Box sx={{
                                width: '50%',
                                pr: 4,
                                pl: 2,
                                py: 3,
                                minHeight: 0,
                                height: '100%',
                            }}>
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
                                    visitedIds={visitedIds}
                                    visitedToggle={visitedToggle}
                                    lists={lists}
                                    onToggleList={handleAddToList}
                                />
                            </Box>
                        </Box>

                    </Box>
                </Box>
            </APIProvider>

            <Portal>
                <Snackbar
                    open={refreshStatus === 'same'}
                    autoHideDuration={4000}
                    onClose={() => setRefreshStatus(null)}
                    message="No new recommendations right now"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
                <Snackbar
                    open={refreshStatus === 'new'}
                    autoHideDuration={6000}
                    onClose={() => setRefreshStatus(null)}
                    message="New recommendations loaded!"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    action={
                        <Button color="inherit" size="small" onClick={handleRevertRefresh}>
                            Revert
                        </Button>
                    }
                />
                <Snackbar
                    open={refreshStatus === 'location'}
                    autoHideDuration={4000}
                    onClose={() => setRefreshStatus(null)}
                    message="📍 Location updated! Refreshing recommendations..."
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
            </Portal>
        </>
    )
}

export default UserHome