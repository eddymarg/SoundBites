import { useState } from "react"
import { Box, Typography, Stack, Rating, IconButton, Skeleton, Menu, MenuItem, Checkbox, Divider, Tooltip } from "@mui/material"
import '../css/googleModal.css'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' rx='20' fill='%23FFECEE'/%3E%3Ctext x='60' y='78' font-size='52' text-anchor='middle' font-family='serif'%3E🍽%3C/text%3E%3C/svg%3E"

const LIST_ICONS = { 'Liked': '❤️', 'Must Visit': '⭐' }

const RestaurantList = ({ restaurants, handleLocationClick, selectedLocation, savedIds, bookmarkToggle, isLoading, isLoadingMore, newRestaurantIds, usingFallbackLocation, lists, onAddToList }) => {
    const priceLevels = ["$", "$$", "$$$", "$$$$"]
    const [menuAnchor, setMenuAnchor] = useState(null)
    const [menuRestaurant, setMenuRestaurant] = useState(null)

    const handleOpenMenu = (e, resto) => {
        e.stopPropagation()
        setMenuAnchor(e.currentTarget)
        setMenuRestaurant(resto)
    }

    const handleCloseMenu = () => {
        setMenuAnchor(null)
        setMenuRestaurant(null)
    }

    return (
        <>
            {restaurants.length === 0 && !isLoading && !isLoadingMore && (
                usingFallbackLocation ? (
                    <Box sx={{ textAlign: 'center', mt: 6, px: 2 }}>
                        <Typography sx={{ fontSize: '44px', mb: 1 }}>🎵</Typography>
                        <Typography
                            sx={{
                                fontFamily: "'Tinos', serif",
                                fontWeight: 700,
                                fontSize: '20px',
                                mb: 1,
                            }}
                        >
                            We've got the vibe, just not the venue.
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{ fontSize: '14px', maxWidth: '260px', mx: 'auto', lineHeight: 1.7 }}
                        >
                            Drop your location pin so SoundBites can spin up the perfect bites near you 📍
                        </Typography>
                        <Typography
                            sx={{ fontSize: '12px', color: '#bbb', mt: 1.5, fontStyle: 'italic' }}
                        >
                            Allow location access in your browser settings to get started.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', mt: 6, px: 2 }}>
                        <Typography sx={{ fontSize: '44px', mb: 1 }}>🍽️</Typography>
                        <Typography
                            sx={{
                                fontFamily: "'Tinos', serif",
                                fontWeight: 700,
                                fontSize: '20px',
                                mb: 1,
                            }}
                        >
                            No spots found nearby.
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: '14px' }}>
                            Try allowing location access in your browser settings.
                        </Typography>
                    </Box>
                )
            )}
            <ul>
                {restaurants.map((resto, index) => (
                <Box
                    key={resto.place_id || index}
                    className={newRestaurantIds?.has(resto.place_id) ? "restaurant-card new-card" : "restaurant-card"}
                    sx={{
                        display: "flex",
                        alignItems: 'center',
                        backgroundColor: selectedLocation?.place_id === resto.place_id ? "#EF233C10" : "#ffffff",
                        border: selectedLocation?.place_id === resto.place_id ? "1.5px solid #EF233C" : "1.5px solid transparent",
                        padding: "20px",
                        borderRadius: "36px",
                        marginBottom: "10px",
                        "&:hover": {
                            backgroundColor: "#EF233C20",
                            border: "1.5px solid #EF233C",
                        }
                    }}
                    onClick={() => handleLocationClick(resto)}
                >
                    <Box sx={{ width: { xs: '80px', md: '120px' }, height: { xs: '80px', md: '120px' }, mr: { xs: 1, md: 2 }, flexShrink: 0 }}>
                        <img
                            src={resto.photo}
                            alt={resto.name}
                            onError={(e) => { e.target.onerror = null; e.target.src = IMG_FALLBACK }}
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "28px",
                                objectFit: "cover",
                            }}
                        />
                    </Box>
                    <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography
                                variant="h6"
                                component="strong"
                                sx={{ fontFamily: "'Tinos', serif", fontWeight: 700, lineHeight: 1.25, fontSize: { xs: '1rem', md: '1.25rem' } }}
                            >
                                {resto.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                {lists && onAddToList && (
                                    <Tooltip title="Add to list">
                                        <IconButton onClick={(e) => handleOpenMenu(e, resto)} size="small">
                                            <PlaylistAddIcon sx={{ color: "#888", fontSize: "28px" }} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <IconButton onClick={(e) => {
                                    e.stopPropagation()
                                    bookmarkToggle(resto)
                                }}>
                                    {savedIds.includes(resto.place_id) ? (
                                        <BookmarkAddedIcon sx={{ color: "#EF233C", fontSize: "35px" }} />
                                    ) : (
                                        <BookmarkBorderIcon sx={{ color: "#FFBF69", fontSize: "35px" }} />
                                    )}
                                </IconButton>
                            </Box>
                        </Box>
                        <Box display="flex" alignItems="center" sx={{ flexWrap: 'nowrap', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ flexShrink: 0 }}>
                                {resto.rating}
                            </Typography>
                            <Rating
                                name={`restaurant-rate-${resto.place_id}-${index}`}
                                readOnly
                                value={Number(resto.rating)}
                                precision={0.1}
                                size="small"
                                sx={{ '& .MuiRating-icon': { fontSize: { xs: '14px', md: '18px' } } }}
                            />
                            <Typography variant="body2" sx={{ flexShrink: 0, ml: { xs: 0.5, sm: 1 } }}>{priceLevels[resto.price_level]}</Typography>
                        </Box>
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {resto.address}
                        </Typography>
                    </Stack>
                </Box>
                ))}

                {isLoadingMore && Array.from({ length: 3 }).map((_, i) => (
                    <Box
                        key={`skeleton-${i}`}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "20px",
                            borderRadius: "36px",
                            marginBottom: "10px",
                            backgroundColor: "#ffffff",
                        }}
                    >
                        <Skeleton variant="rounded" width={112} height={112} sx={{ mr: 2, borderRadius: "28px", flexShrink: 0 }} />
                        <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                            <Skeleton variant="text" width="55%" height={28} />
                            <Skeleton variant="text" width="40%" height={22} />
                            <Skeleton variant="text" width="75%" height={18} />
                        </Stack>
                    </Box>
                ))}
            </ul>

            {/* Add-to-list dropdown */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleCloseMenu}
                slotProps={{ paper: { sx: { borderRadius: '16px', minWidth: 220, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } } }}
            >
                {lists?.length === 0 && (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">No lists yet</Typography>
                    </MenuItem>
                )}
                {lists?.map(list => {
                    const isInList = list.place_ids?.includes(menuRestaurant?.place_id)
                    const icon = list.isDefault ? LIST_ICONS[list.name] : null
                    return (
                        <MenuItem
                            key={list._id}
                            onClick={() => { onAddToList(list._id, menuRestaurant); handleCloseMenu() }}
                            sx={{ gap: 1, py: 1 }}
                        >
                            <Checkbox
                                size="small"
                                checked={!!isInList}
                                disableRipple
                                sx={{ p: 0, color: '#EF233C', '&.Mui-checked': { color: '#EF233C' } }}
                                onClick={e => e.stopPropagation()}
                            />
                            {icon && <Typography sx={{ fontSize: '15px', lineHeight: 1 }}>{icon}</Typography>}
                            <Typography variant="body2">{list.name}</Typography>
                        </MenuItem>
                    )
                })}
            </Menu>
        </>
    )
}

export default RestaurantList
