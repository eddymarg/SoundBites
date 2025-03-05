"use client"
import { useState, useEffect } from "react"
import { Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps"

const GoogleMap = ({ userLocation, restaurants, error, isLoading }) => {
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