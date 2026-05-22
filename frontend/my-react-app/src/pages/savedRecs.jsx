"use client"
import { useEffect, useState } from "react"
import { Box, Button, Stack, Typography, Rating, IconButton, Tabs, Tab, Skeleton } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { APIProvider } from "@vis.gl/react-google-maps"
import LoggedInHeader from "../components/loggedinHeader"
import GoogleMap from "../components/googleMap"
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import "../css/loggedin.css"

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' rx='20' fill='%23FFECEE'/%3E%3Ctext x='60' y='78' font-size='52' text-anchor='middle' font-family='serif'%3E🍽%3C/text%3E%3C/svg%3E"
const PRICE_LEVELS = ["$", "$$", "$$$", "$$$$"]

const SavedRestaurantsPage = () => {
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [userLocation, setUserLocation] = useState(null)
    const [savedRestaurants, setSavedRestaurants] = useState([])
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [savedIds, setSavedIds] = useState([])
    const [activeTab, setActiveTab] = useState(0)

    useEffect(() => {
        const storedCoords = localStorage.getItem("userLocation")
        if (storedCoords) setUserLocation(JSON.parse(storedCoords))

        const fetchSaved = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/savedRestaurants`)
                const data = await res.json()
                setSavedRestaurants(data)
                setSavedIds(data.map(item => item.place_id))
            } catch (err) {
                console.error("Failed to load saved restaurants", err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetchSaved()
    }, [])

    const bookmarkToggle = async (restaurant) => {
        const isSaved = savedIds.includes(restaurant.place_id)
        if (isSaved) {
            setSavedIds(prev => prev.filter(id => id !== restaurant.place_id))
            setSavedRestaurants(prev => prev.filter(r => r.place_id !== restaurant.place_id))
            if (selectedLocation?.place_id === restaurant.place_id) setSelectedLocation(null)
            try {
                await fetch(`${import.meta.env.VITE_API_URL}/api/remove/${restaurant.place_id}`, { method: 'DELETE' })
            } catch (err) {
                setSavedIds(prev => [...prev, restaurant.place_id])
                setSavedRestaurants(prev => [...prev, restaurant])
            }
        }
    }

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <LoggedInHeader homeButton />

                <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Left: saved list */}
                    <Box sx={{
                        width: { xs: '100%', md: '44%' },
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                        px: { xs: 2, md: 3 },
                        py: 2,
                    }}>
                        {/* Tabs */}
                        <Tabs
                            value={activeTab}
                            onChange={(_, v) => setActiveTab(v)}
                            sx={{
                                mb: 2,
                                minHeight: 'unset',
                                '& .MuiTabs-flexContainer': { gap: 1 },
                                '& .MuiTabs-indicator': { display: 'none' },
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    borderRadius: '50px',
                                    border: '1.5px solid #EF233C',
                                    minHeight: '36px',
                                    minWidth: '70px',
                                    px: 2,
                                    py: 0.5,
                                    fontSize: '15px',
                                    fontWeight: 500,
                                    color: '#EF233C',
                                },
                                '& .Mui-selected': {
                                    backgroundColor: '#EF233C !important',
                                    color: 'white !important',
                                },
                                '& .Mui-disabled': {
                                    opacity: 0.4,
                                    borderColor: '#ccc',
                                    color: '#aaa !important',
                                },
                            }}
                        >
                            <Tab label="All" />
                            <Tab label="Lists" disabled />
                            <Tab label="Visited" disabled />
                        </Tabs>

                        {/* Cards */}
                        {isLoading ? (
                            <Stack spacing={1.5}>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: '36px', backgroundColor: '#fff' }}>
                                        <Skeleton variant="rounded" width={100} height={100} sx={{ mr: 2, borderRadius: '20px', flexShrink: 0 }} />
                                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                                            <Skeleton variant="text" width="55%" height={24} />
                                            <Skeleton variant="text" width="40%" height={20} />
                                            <Skeleton variant="text" width="70%" height={16} />
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        ) : savedRestaurants.length === 0 ? (
                            <Box sx={{ textAlign: 'center', mt: 6 }}>
                                <Typography fontSize="48px">🔖</Typography>
                                <Typography fontWeight={700} fontSize="20px" fontFamily="'Tinos', serif" sx={{ mt: 1 }}>
                                    No saved spots yet
                                </Typography>
                                <Typography color="text.secondary" fontSize="14px" sx={{ mt: 0.5 }}>
                                    Bookmark restaurants from your recommendations to see them here.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="mainRed"
                                    onClick={() => navigate('/userHome')}
                                    sx={{
                                        mt: 3,
                                        color: 'white',
                                        borderRadius: '36px',
                                        textTransform: 'none',
                                        fontSize: '16px',
                                        px: 3,
                                        boxShadow: 0,
                                    }}
                                >
                                    Explore recommendations
                                </Button>
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {savedRestaurants.map((resto, index) => (
                                    <Box
                                        key={resto.place_id || index}
                                        className="restaurant-card"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '16px',
                                            borderRadius: '36px',
                                            cursor: 'pointer',
                                            border: selectedLocation?.place_id === resto.place_id
                                                ? '1.5px solid #EF233C'
                                                : '1.5px solid transparent',
                                            backgroundColor: selectedLocation?.place_id === resto.place_id
                                                ? '#EF233C10'
                                                : '#fff',
                                            '&:hover': {
                                                backgroundColor: '#EF233C20',
                                                border: '1.5px solid #EF233C',
                                            },
                                        }}
                                        onClick={() => setSelectedLocation(resto)}
                                    >
                                        <Box sx={{ width: 100, height: 100, mr: 2, flexShrink: 0 }}>
                                            <img
                                                src={resto.photo}
                                                alt={resto.name}
                                                onError={(e) => { e.target.onerror = null; e.target.src = IMG_FALLBACK }}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '20px',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </Box>
                                        <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Typography
                                                    fontFamily="'Tinos', serif"
                                                    fontWeight={700}
                                                    fontSize={{ xs: '1rem', sm: '1.1rem' }}
                                                    sx={{ lineHeight: 1.2 }}
                                                >
                                                    {resto.name}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); bookmarkToggle(resto) }}
                                                >
                                                    <BookmarkAddedIcon sx={{ color: '#EF233C', fontSize: 28 }} />
                                                </IconButton>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="body2">{Number(resto.rating).toFixed(1)}</Typography>
                                                <Rating readOnly value={Number(resto.rating)} precision={0.1} size="small" />
                                                {resto.price_level != null && (
                                                    <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>
                                                        {PRICE_LEVELS[resto.price_level]}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {resto.address}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>

                    {/* Right: Map */}
                    <Box sx={{
                        display: { xs: 'none', md: 'block' },
                        flex: 1,
                        px: 2,
                        py: 2,
                        height: '100%',
                    }}>
                        <GoogleMap
                            userLocation={userLocation}
                            restaurants={savedRestaurants}
                            error={error}
                            isLoading={isLoading}
                            selectedLocation={selectedLocation}
                            setSelectedLocation={setSelectedLocation}
                            savedIds={savedIds}
                            bookmarkToggle={bookmarkToggle}
                            newRestaurantIds={new Set()}
                        />
                    </Box>
                </Box>
            </Box>
        </APIProvider>
    )
}

export default SavedRestaurantsPage
