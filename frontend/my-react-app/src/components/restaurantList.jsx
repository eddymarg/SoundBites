// Deals with logic and displaying of all
// restaurant recommendations

import { Box, Typography, Stack, Rating, IconButton, Skeleton } from "@mui/material"
import '../css/googleModal.css'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' rx='20' fill='%23FFECEE'/%3E%3Ctext x='60' y='78' font-size='52' text-anchor='middle' font-family='serif'%3E🍽%3C/text%3E%3C/svg%3E"

const RestaurantList = ({ restaurants, handleLocationClick, savedIds, bookmarkToggle, isLoadingMore, newRestaurantIds }) => {
    const priceLevels = ["$", "$$", "$$$", "$$$$"]

    return (
        <>
            {restaurants.length === 0 && !isLoadingMore && <p>No restaurants found.</p>}
            <ul>
                {restaurants.map((resto, index) => (
                <Box
                    key={resto.place_id || index}
                    className={newRestaurantIds?.has(resto.place_id) ? "restaurant-card new-card" : "restaurant-card"}
                    sx={{
                        display: "flex",
                        alignItems: 'center',
                        backgroundColor: "#ffffff",
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
                    <Box sx={{ width: { xs: '80px', sm: '120px' }, height: { xs: '80px', sm: '120px' }, mr: 2, flexShrink: 0 }}>
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
                    <Stack spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Typography
                                variant="h6"
                                component="strong"
                                style={{ fontFamily: "'Tinos', serif", fontWeight: "700" }}
                            >
                                {resto.name}
                            </Typography>
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
                        <Box display="flex" alignItems="center">
                            <Typography variant="body1" marginRight={1}>
                                {resto.rating}
                            </Typography>
                            <Rating
                                name={`restaurant-rate-${resto.place_id}-${index}`}
                                readOnly
                                value={Number(resto.rating)}
                                precision={0.1}
                            />
                            <Typography variant="body1" marginLeft={2}>{priceLevels[resto.price_level]}</Typography>
                        </Box>
                        <Typography
                            variant="body2"
                            overflow="hidden"
                            textOverflow="ellipsis"
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
        </>
    )
}

export default RestaurantList
