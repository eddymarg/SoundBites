// Main file for anything relating to just the Google Map

"use client"
import { useState } from "react"
import { Map, AdvancedMarker, useApiIsLoaded } from "@vis.gl/react-google-maps"
import '../css/googleModal.css'
import { Box, Typography, Rating, Divider, Stack, IconButton, Button, Skeleton, Tooltip } from "@mui/material"
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const GoogleMap = ({ userLocation, restaurants, error, isLoading, selectedLocation, setSelectedLocation, savedIds, bookmarkToggle, newRestaurantIds, visitedIds = [], visitedToggle, lists = [], onToggleList }) => {
    const [showAllHours, setShowAllHours] = useState(false)
    const [hoveredPinID, setHoveredPinID] = useState(null)
    const fallbackLocation = { lat: 40.7128, lng: -74.0060 }
    const apiIsLoaded = useApiIsLoaded()

    console.log("Restaurant in map", restaurants)

    const showInMapClicked = () => {
        if (selectedLocation?.place_id) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.name)}&query_place_id=${selectedLocation.place_id}`, "_blank");
        } else if (selectedLocation?.geometry?.location) {
            const { lat, lng } = selectedLocation.geometry.location;
            window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
        } else {
            console.error("Location data is missing");
        }
    };
    
    // Retrieves the current day's info (for hours)
    // Date.getDay() returns 0=Sun..6=Sat, but Google's weekday_text is 0=Mon..6=Sun
    const getTodayHours = (weekdayText) => {
        const googleDayIndex = (new Date().getDay() + 6) % 7
        return weekdayText?.[googleDayIndex] || "No hours available"
    }

    const handlePinClick = (location) => {
        setSelectedLocation(location)
    }
 
    return (
        <>
            {isLoading ? (
                <div className="text-center">Loading...</div>
            ) : userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number' ? (
                // general map
                <Box sx={{ height: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
                    <Map
                        defaultZoom={9}
                        defaultCenter={userLocation}
                        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
                        gestureHandling="greedy"
                    >
                        {/* user's location */}
                        {apiIsLoaded && userLocation && (
                            <AdvancedMarker position={userLocation}/>
                        )}

                        {/* recommended restaurants pins */}
                        {apiIsLoaded && restaurants?.map((resto, index) => (
                            resto.geometry?.location && (
                                <AdvancedMarker
                                    key={index}
                                    position={{
                                        lat: resto.geometry.location.lat,
                                        lng: resto.geometry.location.lng,
                                    }}
                                    onMouseEnter={() => setHoveredPinID(resto.place_id)}
                                    onMouseLeave={() => setHoveredPinID(null)}
                                    onClick={() => handlePinClick(resto)}
                                >
                                    <svg
                                        width={hoveredPinID === resto.place_id ? 32 : 26}
                                        height={hoveredPinID === resto.place_id ? 44 : 36}
                                        viewBox="0 0 24 36"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={newRestaurantIds?.has(resto.place_id) ? "new-pin" : ""}
                                        style={{ transition: "width 0.15s, height 0.15s", display: "block" }}
                                    >
                                        <path
                                            d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24S24 19.2 24 12C24 5.4 18.6 0 12 0z"
                                            fill="orange"
                                            stroke="darkorange"
                                            strokeWidth="1.5"
                                        />
                                        <circle cx="12" cy="11" r="4" fill="darkorange" />
                                    </svg>
                                </AdvancedMarker>
                            )
                        )) }
                        {selectedLocation && (
                            <div className="info-modal">
                                {/* Top of info section w/ photo */}
                                <Box sx={{ position: "relative", display: "block", width: "100%" }}>
                                    <img
                                        src={selectedLocation.photo}
                                        alt={selectedLocation.name}
                                        onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23FFECEE'/%3E%3Ctext x='200' y='118' font-size='80' text-anchor='middle' font-family='serif'%3E🍽%3C/text%3E%3C/svg%3E" }}
                                    />
                                    <button onClick={() => setSelectedLocation(null)} style={{color: "white"}} className="close-btn"><CloseIcon/></button>
                                    <IconButton 
                                        onClick={() => bookmarkToggle(selectedLocation)}
                                        className="save-rec"
                                    >
                                        {savedIds.includes(selectedLocation.place_id) ? (
                                            <BookmarkAddedIcon sx={{ color: "#EF233C" }}/>
                                        ) : (
                                            <BookmarkBorderIcon sx={{ color: "#FFBF69" }}/>
                                        )}
                                    </IconButton>
                                </Box>
                                {/* location name */}
                                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center"}}>
                                    <Typography variant="h4" style={{fontFamily: "'Tinos', serif", fontWeight: "700"}}>{selectedLocation.name}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                                        {(() => {
                                            const likedList = lists.find(l => l.isDefault && l.name === 'Liked')
                                            const isLiked = likedList?.place_ids?.includes(selectedLocation.place_id)
                                            return onToggleList && likedList ? (
                                                <Tooltip title={isLiked ? 'Remove from Liked' : 'Add to Liked'}>
                                                    <IconButton size="small" onClick={() => onToggleList(likedList._id, selectedLocation)}>
                                                        {isLiked
                                                            ? <FavoriteIcon sx={{ color: '#EF233C', fontSize: 26 }} />
                                                            : <FavoriteBorderIcon sx={{ color: '#ccc', fontSize: 26, '&:hover': { color: '#EF233C' } }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            ) : null
                                        })()}
                                        <Tooltip title="View on Google Maps">
                                            <IconButton size="small" onClick={showInMapClicked}>
                                                <LocationOnIcon sx={{ color: '#EF233C', fontSize: 26, '&:hover': { color: '#c41e32' } }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Stack>
                                {/* location rating */}
                                <Box display="flex" alignItems="center" gap={1} sx={{marginBottom: '0.5rem'}}>
                                    <Typography>
                                        {selectedLocation.rating ? selectedLocation.rating.toFixed(1) : "N/A"}
                                    </Typography>
                                    <Rating
                                        name={`restaurant-rating-${selectedLocation.id}`}
                                        readOnly
                                        value={Number(selectedLocation.rating) || 0}
                                        precision={0.1}
                                    />
                                </Box>
                                <Typography sx={{marginBottom: "0.5rem"}}>{selectedLocation.address}</Typography>
                                <Divider orientation="horizontal" flexItem sx={{ borderColor: 'mainYellow.main'}}/>
                                {/* Description / visited toggle */}
                                <Box sx={{ m: 1 }}>
                                    {selectedLocation.description ? (
                                        <Typography>{selectedLocation.description}</Typography>
                                    ) : visitedToggle ? (
                                        <Button
                                            size="small"
                                            disableElevation
                                            startIcon={visitedIds.includes(selectedLocation.place_id)
                                                ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} />
                                                : <CheckCircleOutlineIcon sx={{ fontSize: '14px !important' }} />
                                            }
                                            onClick={() => visitedToggle(selectedLocation)}
                                            sx={{
                                                borderRadius: '20px',
                                                textTransform: 'none',
                                                fontSize: '13px',
                                                py: 0.5,
                                                px: 1.5,
                                                minHeight: 'unset',
                                                fontWeight: 500,
                                                border: '1.5px solid',
                                                borderColor: visitedIds.includes(selectedLocation.place_id) ? '#4CAF50' : '#ddd',
                                                color: visitedIds.includes(selectedLocation.place_id) ? '#4CAF50' : '#aaa',
                                                backgroundColor: visitedIds.includes(selectedLocation.place_id) ? '#4CAF5010' : 'transparent',
                                                '&:hover': { borderColor: '#4CAF50', color: '#4CAF50', backgroundColor: '#4CAF5010' },
                                            }}
                                        >
                                            {visitedIds.includes(selectedLocation.place_id) ? "Visited" : "Mark as visited"}
                                        </Button>
                                    ) : (
                                        <Typography color="text.secondary">No description available.</Typography>
                                    )}
                                </Box>
                                <Divider orientation="horizontal" flexItem sx={{ borderColor: 'mainYellow.main'}}/>
                                {/* Underneath middle info strip */}
                                <Box margin={3} display="flex" flexDirection="column" gap={1.5}>
                                    {/* Hours */}
                                    {'opening_hours' in selectedLocation ? (
                                        <>
                                            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
                                                <AccessTimeIcon style={{ color: "#0D1B2A"}}/>
                                                {getTodayHours(selectedLocation.opening_hours?.weekday_text)}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                onClick={() => setShowAllHours(!showAllHours)}
                                                sx={{ cursor: 'pointer', color: '#43784F', textDecoration: 'underline', mt: 1, mb: showAllHours ? 1 : 0, ml: 4 }}
                                            >
                                                {showAllHours ? "Hide hours ▲" : "Show all hours ▼"}
                                            </Typography>
                                            {showAllHours && (
                                                <Box sx={{ pl: 4}}>
                                                    {selectedLocation.opening_hours?.weekday_text?.map((day, index) => {
                                                        const isToday = index === (new Date().getDay() + 6) % 7
                                                        return (
                                                            <Typography
                                                                key={index}
                                                                style={{ fontSize: "14px", color: isToday ? "#0D1B2A" : "#0D1B2A90", fontWeight: isToday ? "600" : "normal", marginBottom: "2px"}}
                                                            >
                                                                {day}
                                                            </Typography>
                                                        )
                                                    })}
                                                </Box>
                                            )}
                                        </>
                                    ) : (
                                        <Skeleton variant="text" width={160} height={24} />
                                    )}
                                    {'website' in selectedLocation ? (
                                        selectedLocation.website ? (
                                            <Typography
                                                component="a"
                                                href={selectedLocation.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whiteSpace="nowrap"
                                                overflow="hidden"
                                                textOverflow="ellipsis"
                                                sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline"} }}
                                            >
                                                <LanguageIcon style={{margin: 4}}/>
                                                {selectedLocation.website}
                                            </Typography>
                                        ) : (
                                            <Typography style={{ color: "#0D1B2A90", fontSize: "14px" }}>
                                                <LanguageIcon style={{margin: 4}}/>
                                                Website not available
                                            </Typography>
                                        )
                                    ) : (
                                        <Skeleton variant="text" width={200} height={24} />
                                    )}
                                    {'formatted_phone_number' in selectedLocation ? (
                                        selectedLocation.formatted_phone_number && selectedLocation.formatted_phone_number !== "No associated phone number" ? (
                                        <Typography
                                            component="a"
                                            href={`tel:${selectedLocation.formatted_phone_number}`}
                                            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline"} }}
                                        >
                                            <LocalPhoneIcon style={{margin: 4}}/>
                                            {selectedLocation.formatted_phone_number}
                                        </Typography>
                                    ) : (
                                        <Typography style={{ color: "#0D1B2A90", fontSize: "14px" }}>
                                            <LocalPhoneIcon style={{margin: 4}}/>
                                            Phone number not available
                                        </Typography>
                                    )) : (
                                        <Skeleton variant="text" width={150} height={24} />
                                    )}
                                </Box>
                            </div>
                        )}
                    </Map>
                </Box>
            ) : (
                <Map 
                    zoom={12} 
                    center={fallbackLocation} 
                    mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
                >
                    <AdvancedMarker position={fallbackLocation}>
                        {/* <Pin background="grey"/> this customizes the pin*/}
                    </AdvancedMarker>
                </Map>
            )}
        </>
    )
}

export default GoogleMap