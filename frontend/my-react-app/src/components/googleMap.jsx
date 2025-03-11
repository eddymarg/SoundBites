"use client"
import { useState, useEffect } from "react"
import { Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps"
import '../css/googleModal.css'

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
                            <button onClick={() => setSelectedLocation(null)}>✖</button>
                            <img src={selectedLocation.photo || "https://via.placeholder.com/400"} alt={selectedLocation.name} />
                            <h2>{selectedLocation.name}</h2>
                            <p>{selectedLocation.address}</p>
                            <p>{selectedLocation.rating} ⭐</p>
                            <p>{selectedLocation.price_level ? `$`.repeat(selectedLocation.price_level) : "No price info"}</p>
                            <p>{selectedLocation.description || "No description available."}</p>
                            {selectedLocation.website && <a href={selectedLocation.website} target="_blank">Website</a>}
                            {selectedLocation.phone && <p>{selectedLocation.phone}</p>}
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