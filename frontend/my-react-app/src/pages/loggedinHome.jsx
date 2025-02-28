"use client"
import { Box } from "@mui/material"
import { useState, useEffect } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import LoggedInHeader from "../components/loggedinHeader"
import GoogleMap from "../components/googleMap"

const userHome = () => {
    const [userLocation, setUserLocation] = useState(null)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                    setIsLoading(false)
                },
                (error) => {
                    console.error("Error getting location:", error.message)
                    setError(error.message)
                    setIsLoading(false)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            )
        } else {
            setError("Geolocation is not supported by this browser.")
            setIsLoading(false)
        }
    }, [])

    return(
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
            <div>
                <LoggedInHeader/>
                <div className="flex h-screen">
                    <div className="w-1/2 p-8 overflow-y-auto">
                        {/* <div className="bg-gray-200 p-3 rounded-md shadow-md flex items-center gap-4">
                                <input
                                    type="text"
                                    id="search-input"
                                    placeholder="Search..."
                                    className="p-2 border rounded-md w-full"
                                />
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Apply</button>
                        </div>
                        <div className="flex-grow overflow-y-auto mt-4">
                            {/* List of locations here */}
                            <div className="p-3 border-b">Location 1</div>
                            <div className="p-3 border-b">Location 2</div>
                            <div className="p-3 border-b">Location 3</div>
                            <div className="p-3 border-b">Location 4</div>
                            <div className="p-3 border-b">Location 5</div>
                            {/* More locations... }
                        </div> */}
                    </div>
                    <div className="w-1/2 p-8">
                        <GoogleMap userLocation={userLocation} error={error} isLoading={isLoading}/>
                    </div>
                </div>
            </div>
        </APIProvider>
    )
}

export default userHome