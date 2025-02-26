"use client"
import { Box } from "@mui/material"
import { useState } from "react"
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps"
import LoggedInHeader from "../components/loggedinHeader"

const userHome = () => {
    const position = { lat: 53.54, lng: 10 }
    return(
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
            <div>
                <LoggedInHeader/>
                <div className="flex h-screen">
                    <div className="w-1/2 p-8 overflow-y-auto">
                        <div className="bg-gray-200 p-3 rounded-md shadow-md flex items-center gap-4">
                                <input
                                    type="text"
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
                            {/* More locations... */}
                        </div>
                    </div>
                    <div className="w-1/2 p-8">
                        <Map zoom={9} center={position} ></Map>
                    </div>
                </div>
            </div>
        </APIProvider>
    )
}

export default userHome