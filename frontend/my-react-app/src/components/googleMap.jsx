// Main file for anything relating to just the Google Map

"use client"
import { useState, useEffect } from "react"
import { Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps"
import '../css/googleModal.css'
import { Box, Typography, Rating, Divider, Stack, IconButton } from "@mui/material"
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { rest } from "lodash"

const GoogleMap = ({ userLocation, restaurants, error, isLoading, selectedLocation, setSelectedLocation, savedIds, bookmarkToggle }) => {
    const [showAllHours, setShowAllHours] = useState(false)
    const [hoveredPinID, setHoveredPinID] = useState(null)
    const fallbackLocation = { lat: 40.7128, lng: -74.0060 }

    console.log("Restaurant in map", restaurants)

    const showInMapClicked = () => {
        if (selectedLocation?.place_id) {
            window.open(`https://www.google.com/maps/search/?api=1&query=place_id:${selectedLocation.place_id}`, "_blank");
        } else if (selectedLocation?.geometry?.location) {
            const { lat, lng } = selectedLocation.geometry.location;
            window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
        } else {
            console.error("Location data is missing");
        }
    };
    
    // Retrieves the current day's info (for hours)
    const getTodayHours = (weekdayText) => {
        const dayIndex = new Date().getDay()
        return weekdayText?.[dayIndex] || "No hours available"
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
                <Box sx={{ height: '85%'}}>
                    <Map 
                        defaultZoom={9}
                        center={userLocation} 
                        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
                        gestureHandling="auto"
                    >
                        {/* user's location */}
                        {userLocation && (
                            <AdvancedMarker position={userLocation}/>
                        )}

                        {/* recommended restaurants pins */}
                        {restaurants?.map((resto, index) => (
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
                                    <Pin 
                                        background="orange" borderColor="darkOrange" 
                                        glyphColor="darkOrange"
                                        scale={hoveredPinID === resto.place_id ? 1.2 : 1}
                                    />
                                </AdvancedMarker>
                            )
                        )) }
                        {selectedLocation && (
                            <div className="info-modal">
                                {/* Top of info section w/ photo */}
                                <Box sx={{ position: "relative", display: "inline-block"}}>
                                    <img src={selectedLocation.photo} alt={selectedLocation.name} />
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
                                    <Typography>
                                        <LocationOnIcon 
                                            fontSize="large" 
                                            onClick={showInMapClicked} 
                                            sx={{
                                                '&:hover': {color: 'grey'}
                                            }}/>
                                    </Typography>
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
                                {/* Description */}
                                <Typography margin={1}>{selectedLocation.description || "No description available."}</Typography>
                                <Divider orientation="horizontal" flexItem sx={{ borderColor: 'mainYellow.main'}}/>
                                {/* Underneath middle info strip */}
                                <Box margin={3} display="flex" flexDirection="column" gap={1.5}>
                                    {/* Hours */}
                                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
                                        <AccessTimeIcon style={{ color: "#0D1B2A"}}/>
                                        {getTodayHours(selectedLocation.opening_hours?.weekday_text)}
                                    </Typography>
                                    <Typography
                                        variant = "body2"
                                        onClick={() => setShowAllHours(!showAllHours)}
                                        sx={{
                                            cursor: 'pointer',
                                            color: '#43784F',
                                            textDecoration: 'underline',
                                            mt: 1,
                                            mb: showAllHours ? 1 : 0,
                                            ml: 4,                
                                        }}
                                    >
                                        {showAllHours ? "Hide hours ▲" : "Show all hours ▼"}
                                    </Typography>

                                    {showAllHours && (
                                        <Box sx={{ pl: 4}}>
                                            {selectedLocation.opening_hours?.weekday_text?.map((day, index) => (
                                                <Typography
                                                    key={index}
                                                    style={{ fontSize: "14px", color: "#0D1B2A90", marginBottom: "2px"}}
                                                >
                                                    {day}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                    <Typography
                                        component="a"
                                        href={selectedLocation.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whiteSpace="nowrap"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        sx={{
                                            textDecoration: "none",
                                            "&:hover": { textDecoration: "underline"}
                                        }}
                                    >
                                        <LanguageIcon style={{margin: 4}}/>
                                        {selectedLocation.website}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            textDecoration: "none",
                                            "&:hover": { textDecoration: "underline"}
                                        }}
                                    >
                                        <LocalPhoneIcon style={{margin: 4}}/>
                                        {selectedLocation.formatted_phone_number || "Phone number is not available"}
                                    </Typography>
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
            {error && <div className="text-red-500">Error: {error}</div>}
        </>
    )
}

export default GoogleMap