// Main file for anything relating to just the Google Map

"use client"
import { useState, useEffect } from "react"
import { Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps"
import '../css/googleModal.css'
import { Box, Typography, Rating, Divider, Stack } from "@mui/material"
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';


const GoogleMap = ({ userLocation, restaurants, error, isLoading, selectedLocation, setSelectedLocation }) => {
    const fallbackLocation = { lat: 40.7128, lng: -74.0060 }

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
    
    

    return (
        <>
            {isLoading ? (
                <div className="text-center">Loading...</div>
            ) : userLocation ? (
                <Map 
                    defaultZoom={9}
                    center={userLocation} 
                    mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
                    gestureHandling="auto"
                >
                    {/* user's location */}
                    {userLocation && (
                        <AdvancedMarker position={userLocation}>
                            {/* <Pin background="grey"/> this customizes the pin*/}
                        </AdvancedMarker>
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
                            >
                                <Pin 
                                    background="orange" borderColor="darkOrange" 
                                    glyphColor="darkOrange"
                                />
                            </AdvancedMarker>
                        )
                    )) }
                    {selectedLocation && (
                        <div className="info-modal">
                            <Box sx={{ position: "relative", display: "inline-block"}}>
                                <img src={selectedLocation.photo} alt={selectedLocation.name} />
                                <button onClick={() => setSelectedLocation(null)} style={{color: "white"}}><CloseIcon/></button>
                            </Box>
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
                            <Typography margin={1}>{selectedLocation.description || "No description available."}</Typography>
                            <Divider orientation="horizontal" flexItem sx={{ borderColor: 'mainYellow.main'}}/>

                            <Box margin={3} display="flex" flexDirection="column" gap={1.5}>
                                <Typography><LocalOfferIcon/> {selectedLocation.price_level ? `$`.repeat(selectedLocation.price_level) : "No price info"}</Typography>
                                {selectedLocation.opening_hours?.weekday_text?.map((day, index) => (
                                    <Typography key={index} style={{fontSize: "14px", color: "0D1B2A90", display: "flex", alignItems: "center", gap: "8px"}}>
                                        {index === 0 ? (
                                            <AccessTimeIcon style={{ color: "0D1B2A"}}/>
                                        ) : (
                                            <span style={{ width: 24 }}/>
                                        )}
                                        <span style={{lineHeight: 1}}>{day}</span>
                                    </Typography>
                                ))}
                                <Typography
                                    component="a"
                                    href={selectedLocation.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
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