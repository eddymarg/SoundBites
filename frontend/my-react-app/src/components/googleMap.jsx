"use client"
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps"

const GoogleMap = ({ userLocation, error, isLoading }) => {
    const fallbackLocation = { lat: 40.7128, lng: -74.0060 }

    return (
        <>
            {isLoading ? (
                <div className="text-center">Loading...</div>
            ) : userLocation ? (
                <Map 
                    zoom={12} 
                    center={userLocation} 
                    mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
                >
                    <AdvancedMarker position={userLocation}>
                        {/* <Pin background="grey"/> this customizes the pin*/}
                    </AdvancedMarker>
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