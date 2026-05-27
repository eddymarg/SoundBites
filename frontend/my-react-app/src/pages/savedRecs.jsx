"use client"
import { useEffect, useState, useRef } from "react"
import {
    Box, Button, Stack, Typography, Rating, IconButton, Tabs, Tab, Skeleton,
    Tooltip, Menu, MenuItem, Checkbox, Divider, TextField
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { APIProvider } from "@vis.gl/react-google-maps"
import LoggedInHeader from "../components/loggedinHeader"
import GoogleMap from "../components/googleMap"
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import "../css/loggedin.css"

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' rx='20' fill='%23FFECEE'/%3E%3Ctext x='60' y='78' font-size='52' text-anchor='middle' font-family='serif'%3E🍽%3C/text%3E%3C/svg%3E"
const PRICE_LEVELS = ["$", "$$", "$$$", "$$$$"]

const TAB_STYLES = {
    mb: 0,
    borderBottom: '2px solid #f0f0f0',
    '& .MuiTabs-indicator': {
        backgroundColor: '#EF233C',
        height: 3,
        borderRadius: '2px 2px 0 0',
    },
    '& .MuiTab-root': {
        textTransform: 'none',
        fontSize: '15px',
        fontWeight: 500,
        color: '#888',
        minWidth: 'auto',
        px: 2,
        py: 1.5,
        minHeight: 'unset',
    },
    '& .Mui-selected': {
        color: '#EF233C !important',
        fontWeight: 700,
    },
}

// Attach Spotify access token as Authorization header so the backend can
// identify Spotify-authenticated users who don't yet have a JWT cookie.
const spotifyAuthHeaders = () => {
    const token = localStorage.getItem("spotify_access_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
}

const SavedRestaurantsPage = () => {
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [userLocation, setUserLocation] = useState(null)
    const [savedRestaurants, setSavedRestaurants] = useState([])
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [savedIds, setSavedIds] = useState([])
    const [activeTab, setActiveTab] = useState(0)

    const [lists, setLists] = useState([])
    const [selectedListId, setSelectedListId] = useState(null)
    const [creatingList, setCreatingList] = useState(false)
    const [newListName, setNewListName] = useState('')
    const [addToListAnchor, setAddToListAnchor] = useState(null)
    const [addToListRestaurant, setAddToListRestaurant] = useState(null)
    const [addPlacesMenuAnchor, setAddPlacesMenuAnchor] = useState(null)
    const [mobilePanelOpen, setMobilePanelOpen] = useState(false)

    const mobilePanelRef = useRef(null)
    const dragStartY = useRef(null)

    const visitedRestaurants = savedRestaurants.filter(r => r.visited)
    const selectedList = lists.find(l => l._id === selectedListId)
    const listRestaurants = selectedList
        ? savedRestaurants.filter(r => selectedList.place_ids.includes(r.place_id))
        : []

    const mapRestaurants = activeTab === 2
        ? visitedRestaurants
        : activeTab === 1 && selectedListId
            ? listRestaurants
            : savedRestaurants

    useEffect(() => {
        const storedCoords = localStorage.getItem("userLocation")
        if (storedCoords) setUserLocation(JSON.parse(storedCoords))

        const fetchSaved = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/savedRestaurants`, { credentials: 'include', headers: spotifyAuthHeaders() })
                if (!res.ok) {
                    if (res.status === 401) { navigate('/signin'); return }
                    throw new Error(`Server error: ${res.status}`)
                }
                const data = await res.json()
                const safeData = Array.isArray(data) ? data : []
                setSavedRestaurants(safeData)
                setSavedIds(safeData.map(item => item.place_id))
            } catch (err) {
                console.error("Failed to load saved restaurants", err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetchSaved()
        fetchLists()
    }, [])

    const fetchLists = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lists`, { credentials: 'include', headers: spotifyAuthHeaders() })
            if (!res.ok) {
                if (res.status === 401) { navigate('/signin'); return }
                throw new Error(`Server error: ${res.status}`)
            }
            const data = await res.json()
            setLists(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to load lists", err)
        }
    }

    const bookmarkToggle = async (restaurant) => {
        const isSaved = savedIds.includes(restaurant.place_id)
        if (isSaved) {
            setSavedIds(prev => prev.filter(id => id !== restaurant.place_id))
            setSavedRestaurants(prev => prev.filter(r => r.place_id !== restaurant.place_id))
            if (selectedLocation?.place_id === restaurant.place_id) setSelectedLocation(null)
            try {
                await fetch(`${import.meta.env.VITE_API_URL}/api/remove/${restaurant.place_id}`, { method: 'DELETE', credentials: 'include', headers: spotifyAuthHeaders() })
            } catch {
                setSavedIds(prev => [...prev, restaurant.place_id])
                setSavedRestaurants(prev => [...prev, restaurant])
            }
        }
    }

    const toggleVisited = async (restaurant) => {
        const wasVisited = restaurant.visited
        setSavedRestaurants(prev => prev.map(r =>
            r.place_id === restaurant.place_id ? { ...r, visited: !r.visited } : r
        ))
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/visited/${restaurant.place_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...spotifyAuthHeaders() },
                credentials: 'include',
                body: JSON.stringify(restaurant)
            })
        } catch {
            setSavedRestaurants(prev => prev.map(r =>
                r.place_id === restaurant.place_id ? { ...r, visited: wasVisited } : r
            ))
        }
    }

    const createList = async () => {
        if (!newListName.trim()) return
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...spotifyAuthHeaders() },
                credentials: 'include',
                body: JSON.stringify({ name: newListName.trim() })
            })
            const list = await res.json()
            setLists(prev => [list, ...prev])
            setNewListName('')
            setCreatingList(false)
        } catch (err) {
            console.error("Failed to create list", err)
        }
    }

    const deleteList = async (listId) => {
        setLists(prev => prev.filter(l => l._id !== listId))
        if (selectedListId === listId) setSelectedListId(null)
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/lists/${listId}`, { method: 'DELETE', credentials: 'include', headers: spotifyAuthHeaders() })
        } catch (err) {
            console.error("Failed to delete list", err)
            fetchLists()
        }
    }

    const toggleRestaurantInList = async (listId, restaurant) => {
        const list = lists.find(l => l._id === listId)
        const isInList = list?.place_ids?.includes(restaurant.place_id)
        setLists(prev => prev.map(l =>
            l._id === listId
                ? {
                    ...l, place_ids: isInList
                        ? l.place_ids.filter(id => id !== restaurant.place_id)
                        : [...l.place_ids, restaurant.place_id]
                }
                : l
        ))
        try {
            const endpoint = isInList
                ? `${import.meta.env.VITE_API_URL}/api/lists/${listId}/remove/${restaurant.place_id}`
                : `${import.meta.env.VITE_API_URL}/api/lists/${listId}/add/${restaurant.place_id}`
            await fetch(endpoint, { method: isInList ? 'DELETE' : 'POST', credentials: 'include', headers: spotifyAuthHeaders() })
        } catch (err) {
            console.error("Failed to update list", err)
            fetchLists()
        }
    }

    const handleCardClick = (loc) => {
        setSelectedLocation(loc)
        setMobilePanelOpen(false)
    }

    const handlePanelDragStart = (e) => {
        dragStartY.current = e.touches[0].clientY
    }

    const handlePanelDragMove = (e) => {
        if (dragStartY.current === null || !mobilePanelRef.current) return
        const delta = e.touches[0].clientY - dragStartY.current
        if (delta > 0) {
            mobilePanelRef.current.style.transition = 'none'
            mobilePanelRef.current.style.transform = `translateY(${delta}px)`
        }
    }

    const handlePanelDragEnd = (e) => {
        if (dragStartY.current === null || !mobilePanelRef.current) return
        const delta = e.changedTouches[0].clientY - dragStartY.current
        dragStartY.current = null
        mobilePanelRef.current.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        if (delta > 80) {
            mobilePanelRef.current.style.transform = 'translateY(100%)'
            setTimeout(() => {
                setMobilePanelOpen(false)
                if (mobilePanelRef.current) mobilePanelRef.current.style.transform = ''
            }, 300)
        } else {
            mobilePanelRef.current.style.transform = 'translateY(0)'
            setTimeout(() => {
                if (mobilePanelRef.current) mobilePanelRef.current.style.transform = ''
            }, 300)
        }
    }

    const RestaurantCard = ({ resto, showListIcon = false, showRemoveFromList = false, listId }) => (
        <Box
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
            onClick={() => handleCardClick(resto)}
        >
            <Box sx={{ width: 100, height: 100, mr: 2, flexShrink: 0 }}>
                <img
                    src={resto.photo}
                    alt={resto.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = IMG_FALLBACK }}
                    style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }}
                />
            </Box>
            <Stack spacing={0.3} sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                        fontFamily="'Tinos', serif"
                        fontWeight={700}
                        fontSize={{ xs: '1rem', sm: '1.1rem' }}
                        sx={{ lineHeight: 1.2, pr: 0.5 }}
                    >
                        {resto.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        {showListIcon && (
                            <Tooltip title="Add to list">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setAddToListAnchor(e.currentTarget)
                                        setAddToListRestaurant(resto)
                                    }}
                                >
                                    <PlaylistAddIcon sx={{ color: '#888', fontSize: 22 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {showRemoveFromList ? (
                            <Tooltip title="Remove from list">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleRestaurantInList(listId, resto)
                                    }}
                                >
                                    <RemoveCircleOutlineIcon sx={{ color: '#bbb', fontSize: 22, '&:hover': { color: '#EF233C' } }} />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); bookmarkToggle(resto) }}>
                                <BookmarkAddedIcon sx={{ color: '#EF233C', fontSize: 22 }} />
                            </IconButton>
                        )}
                    </Box>
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
    )

    const EmptyState = ({ icon, title, subtitle, action }) => (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography fontSize="48px">{icon}</Typography>
            <Typography fontWeight={700} fontSize="20px" fontFamily="'Tinos', serif" sx={{ mt: 1 }}>
                {title}
            </Typography>
            <Typography color="text.secondary" fontSize="14px" sx={{ mt: 0.5 }}>
                {subtitle}
            </Typography>
            {action}
        </Box>
    )

    const renderAllTab = () => {
        if (isLoading) {
            return (
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
            )
        }
        if (savedRestaurants.length === 0) {
            return (
                <EmptyState
                    icon="🔖"
                    title="No saved spots yet"
                    subtitle="Bookmark restaurants from your recommendations to see them here."
                    action={
                        <Button
                            variant="contained"
                            color="mainRed"
                            onClick={() => navigate('/userHome')}
                            sx={{ mt: 3, color: 'white', borderRadius: '36px', textTransform: 'none', fontSize: '16px', px: 3, boxShadow: 0 }}
                        >
                            Explore recommendations
                        </Button>
                    }
                />
            )
        }
        return (
            <Stack spacing={1.5}>
                {savedRestaurants.map((resto, index) => (
                    <RestaurantCard key={resto.place_id || index} resto={resto} showListIcon />
                ))}
            </Stack>
        )
    }

    const renderListsTab = () => {
        if (selectedListId && selectedList) {
            return (
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton size="small" onClick={() => setSelectedListId(null)}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography fontWeight={700} fontSize="17px" fontFamily="'Tinos', serif" sx={{ ml: 1 }}>
                                {selectedList.name}
                            </Typography>
                        </Box>
                        <Button
                            startIcon={<PlaylistAddIcon />}
                            size="small"
                            onClick={(e) => setAddPlacesMenuAnchor(e.currentTarget)}
                            sx={{ textTransform: 'none', color: '#EF233C', fontWeight: 600, fontSize: '13px', borderRadius: '20px', border: '1.5px solid #EF233C30', px: 1.5 }}
                        >
                            Add places
                        </Button>
                    </Box>
                    {listRestaurants.length === 0 ? (
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography color="text.secondary">No places in this list yet.</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Tap <strong>Add places</strong> above or use the <PlaylistAddIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} /> icon on the All tab.
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={1.5}>
                            {listRestaurants.map((resto, index) => (
                                <RestaurantCard
                                    key={resto.place_id || index}
                                    resto={resto}
                                    showRemoveFromList
                                    listId={selectedListId}
                                />
                            ))}
                        </Stack>
                    )}
                </Box>
            )
        }

        return (
            <Box>
                {creatingList ? (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                        <TextField
                            size="small"
                            placeholder="List name"
                            value={newListName}
                            onChange={e => setNewListName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') createList(); if (e.key === 'Escape') { setCreatingList(false); setNewListName('') } }}
                            autoFocus
                            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <IconButton onClick={createList} sx={{ color: '#EF233C' }}>
                            <CheckIcon />
                        </IconButton>
                        <IconButton onClick={() => { setCreatingList(false); setNewListName('') }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                ) : (
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() => setCreatingList(true)}
                        sx={{ mb: 2, textTransform: 'none', color: '#EF233C', fontWeight: 600, borderRadius: '36px', border: '1.5px solid #EF233C', px: 2 }}
                    >
                        New List
                    </Button>
                )}

                {lists.length === 0 && !creatingList ? (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography fontSize="36px">📋</Typography>
                        <Typography fontWeight={700} fontSize="18px" fontFamily="'Tinos', serif" sx={{ mt: 1 }}>
                            No lists yet
                        </Typography>
                        <Typography color="text.secondary" fontSize="14px" sx={{ mt: 0.5 }}>
                            Create a list to organize your saved spots.
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={1.5}>
                        {lists.map(list => (
                            <Box
                                key={list._id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: '14px 16px',
                                    borderRadius: '20px',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    border: '1.5px solid transparent',
                                    '&:hover': { border: '1.5px solid #EF233C', backgroundColor: '#EF233C08' },
                                }}
                                onClick={() => setSelectedListId(list._id)}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight={600} fontSize="15px" fontFamily="'Tinos', serif">
                                        {list.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {list.place_ids.length} {list.place_ids.length === 1 ? 'place' : 'places'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Tooltip title="Delete list">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); deleteList(list._id) }}
                                            sx={{ color: '#ccc', '&:hover': { color: '#ef233c' } }}
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <ChevronRightIcon sx={{ color: '#bbb' }} />
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>
        )
    }

    const renderVisitedTab = () => {
        if (isLoading) {
            return (
                <Stack spacing={1.5}>
                    {Array.from({ length: 3 }).map((_, i) => (
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
            )
        }
        if (visitedRestaurants.length === 0) {
            return (
                <EmptyState
                    icon="✅"
                    title="No visited spots yet"
                    subtitle="Mark places as visited from your recommendations or saved list."
                    action={
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/userHome')}
                            sx={{ mt: 3, borderColor: '#EF233C', color: '#EF233C', borderRadius: '36px', textTransform: 'none', fontSize: '16px', px: 3 }}
                        >
                            Go to recommendations
                        </Button>
                    }
                />
            )
        }
        return (
            <Stack spacing={1.5}>
                {visitedRestaurants.map((resto, index) => (
                    <RestaurantCard key={resto.place_id || index} resto={resto} />
                ))}
            </Stack>
        )
    }

    const sharedMenus = (
        <>
            {/* Add to list menu */}
            <Menu
                anchorEl={addToListAnchor}
                open={Boolean(addToListAnchor)}
                onClose={() => { setAddToListAnchor(null); setAddToListRestaurant(null) }}
                slotProps={{ paper: { sx: { borderRadius: '16px', minWidth: 210, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } } }}
            >
                {lists.length === 0 && (
                    <MenuItem disabled><Typography variant="body2" color="text.secondary">No lists yet</Typography></MenuItem>
                )}
                {lists.map(list => {
                    const isInList = list.place_ids.includes(addToListRestaurant?.place_id)
                    return (
                        <MenuItem key={list._id} onClick={() => toggleRestaurantInList(list._id, addToListRestaurant)} sx={{ gap: 1 }}>
                            <Checkbox size="small" checked={isInList} disableRipple sx={{ p: 0, color: '#EF233C', '&.Mui-checked': { color: '#EF233C' } }} onClick={(e) => e.stopPropagation()} />
                            <Typography variant="body2">{list.name}</Typography>
                        </MenuItem>
                    )
                })}
                <Divider />
                <MenuItem onClick={() => { setAddToListAnchor(null); setAddToListRestaurant(null); setActiveTab(1); setSelectedListId(null); setCreatingList(true) }} sx={{ color: '#EF233C', gap: 1 }}>
                    <AddIcon fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>New list</Typography>
                </MenuItem>
            </Menu>

            {/* Add places to list menu (from Lists tab) */}
            <Menu
                anchorEl={addPlacesMenuAnchor}
                open={Boolean(addPlacesMenuAnchor)}
                onClose={() => setAddPlacesMenuAnchor(null)}
                slotProps={{ paper: { sx: { borderRadius: '16px', minWidth: 260, maxHeight: 340, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } } }}
            >
                {savedRestaurants.length === 0 ? (
                    <MenuItem disabled><Typography variant="body2" color="text.secondary">No saved places yet</Typography></MenuItem>
                ) : savedRestaurants.map(restaurant => {
                    const isInList = selectedList?.place_ids?.includes(restaurant.place_id)
                    return (
                        <MenuItem key={restaurant.place_id} onClick={() => toggleRestaurantInList(selectedListId, restaurant)} sx={{ gap: 1.5, py: 1 }}>
                            <Checkbox size="small" checked={!!isInList} disableRipple sx={{ p: 0, color: '#EF233C', '&.Mui-checked': { color: '#EF233C' } }} onClick={(e) => e.stopPropagation()} />
                            <img src={restaurant.photo} alt={restaurant.name} onError={(e) => { e.target.onerror = null; e.target.src = IMG_FALLBACK }} style={{ width: 36, height: 36, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap>{restaurant.name}</Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>{restaurant.address}</Typography>
                            </Box>
                        </MenuItem>
                    )
                })}
            </Menu>
        </>
    )

    const googleMapProps = {
        userLocation,
        restaurants: mapRestaurants,
        error,
        isLoading,
        selectedLocation,
        setSelectedLocation,
        savedIds,
        bookmarkToggle,
        newRestaurantIds: new Set(),
        visitedIds: savedRestaurants.filter(r => r.visited).map(r => r.place_id),
        visitedToggle: toggleVisited,
    }

    const tabsPanel = (
        <>
            <Tabs
                value={activeTab}
                onChange={(_, v) => { setActiveTab(v); setSelectedListId(null); setCreatingList(false); setSelectedLocation(null) }}
                sx={TAB_STYLES}
            >
                <Tab label="All" />
                <Tab label="Lists" />
                <Tab label="Visited" />
            </Tabs>
            <Box sx={{ pt: 1.5 }}>
                {activeTab === 0 && renderAllTab()}
                {activeTab === 1 && renderListsTab()}
                {activeTab === 2 && renderVisitedTab()}
            </Box>
        </>
    )

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <LoggedInHeader homeButton />

                <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>

                    {/* ── MOBILE / TABLET (xs–sm, < 900px) ── */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', height: '100%', position: 'relative' }}>

                        {/* Map fills everything */}
                        <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>
                            <GoogleMap {...googleMapProps} />
                        </Box>

                        {/* Floating toggle pill */}
                        {!selectedLocation && (
                            <Box sx={{
                                position: 'absolute',
                                bottom: mobilePanelOpen ? 'calc(65% + 12px)' : '20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 11,
                                transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}>
                                <Button
                                    onClick={() => setMobilePanelOpen(prev => !prev)}
                                    disableElevation
                                    sx={{
                                        '@keyframes savedPulse': {
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
                                        animation: mobilePanelOpen ? 'none' : 'savedPulse 2s ease-out infinite',
                                        '&:hover': { backgroundColor: '#fff5f5' },
                                    }}
                                >
                                    {savedRestaurants.length} saved {mobilePanelOpen ? '▼' : '▲'}
                                </Button>
                            </Box>
                        )}

                        {/* Slide-up panel */}
                        <Box ref={mobilePanelRef} sx={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0,
                            height: '65%',
                            backgroundColor: '#f2f2f2',
                            borderRadius: '24px 24px 0 0',
                            boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
                            transform: mobilePanelOpen ? 'translateY(0)' : 'translateY(100%)',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}>
                            {/* Drag handle */}
                            <Box
                                onTouchStart={handlePanelDragStart}
                                onTouchMove={handlePanelDragMove}
                                onTouchEnd={handlePanelDragEnd}
                                sx={{ pt: 1.5, pb: 1, display: 'flex', justifyContent: 'center', flexShrink: 0, cursor: 'grab', touchAction: 'none' }}
                            >
                                <Box sx={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#c0c0c0' }} />
                            </Box>
                            {/* Scrollable content with tabs */}
                            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2 }}>
                                {tabsPanel}
                            </Box>
                        </Box>
                    </Box>

                    {/* ── DESKTOP (md+, ≥ 900px) ── */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, height: '100%' }}>
                        {/* Left: tabs + list */}
                        <Box sx={{
                            width: '44%',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0,
                            overflowY: 'auto',
                            px: 3,
                            pt: 2,
                        }}>
                            {tabsPanel}
                        </Box>
                        {/* Right: Map */}
                        <Box sx={{ flex: 1, px: 2, py: 2, minHeight: 0, height: '100%' }}>
                            <GoogleMap {...googleMapProps} />
                        </Box>
                    </Box>

                </Box>
            </Box>

            {sharedMenus}
        </APIProvider>
    )
}

export default SavedRestaurantsPage
