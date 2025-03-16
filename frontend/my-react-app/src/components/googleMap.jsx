"use client"
import { useState, useEffect } from "react"
import { Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps"
import '../css/googleModal.css'
import { Box, Typography, Rating, Divider } from "@mui/material"

const GoogleMap = ({ userLocation, restaurants, error, isLoading, selectedLocation, setSelectedLocation }) => {
    const fallbackLocation = { lat: 40.7128, lng: -74.0060 }

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
                                <button onClick={() => setSelectedLocation(null)}>✖</button>
                            </Box>
                            <Typography variant="h4" style={{fontFamily: "'Tinos', serif", fontWeight: "700"}}>{selectedLocation.name}</Typography>
                            <Box display="flex" alignItems="center" gap={1}>
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
                            <Typography>{selectedLocation.address}</Typography>
                            <Divider orientation="horizontal" variant="middle" flexItem sx={{ borderColor: 'mainYellow.main'}}/>
                            <Typography>{selectedLocation.description || "No description available."}</Typography>
                            <Divider orientation="horizontal" variant="middle" flexItem sx={{ borderColor: 'mainYellow.main'}}/>
                            <Typography>{selectedLocation.price_level ? `$`.repeat(selectedLocation.price_level) : "No price info"}</Typography>
                            {selectedLocation.website && <a href={selectedLocation.website} target="_blank">Website</a>}
                            {selectedLocation.phone && <Typography>{selectedLocation.phone}</Typography>}
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