// Holds all saved recommendations.
"use client"
import { useEffect, useState } from "react"
import { Avatar, Stack, Typography, Button } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { LogoWNote } from "../assets/logoWNote"
import { motion } from "framer-motion"
import HomeIcon from '@mui/icons-material/Home'
import GoogleMap from "../components/googleMap"
import { APIProvider } from "@vis.gl/react-google-maps"
import { Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps"
import "../css/loggedin.css"

const savedRestaurantsPage = () => {
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [userLocation, setUserLocation] = useState(null)
    const [savedRestaurants, setSavedRestaurants] = useState([])
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [savedIds, setSavedIds] = useState([])

    useEffect(() => {
        const storedCoords = localStorage.getItem("userLocation")
        if(storedCoords) {
            setUserLocation(JSON.parse(storedCoords))
        } else {
            console.warn("No stored user location found.")
        }
        const fetchSaved = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/savedRestaurants')
                const data = await res.json()
                setSavedRestaurants(data)
                setSavedIds(data.map((item) => item.place_id))
            } catch (err) {
                console.error("Failed to load saved restaurants", err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSaved()
    }, [])

    console.log("Current coords:", userLocation)

    const bookmarkToggle = async (restaurant) => {
        const isSaved = savedIds.includes(restaurant.place_id)

        if (isSaved) {
            setSavedIds(savedIds.filter(id => id !== restaurant.place_id))
            await fetch('http://localhost:5001/api/remove/${restaurant.place_id}', {
                method: 'DELETE',
            })
        } else {
            setSavedIds([...savedIds, restaurant.place_id])
            await fetch('http://localhost:5001/api/savedRestaurants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    place_id: restaurant.place_id,
                    name: restaurant.name,
                    photo: restaurant.photo,
                    rating: restaurant.rating,
                    address: restaurant.address,
                    geometry: {
                        location: {
                            lat: restaurant.geometry?.location?.lat ?? restaurant.geometry?.location?.lat?.(),
                            lng: restaurant.geometry?.location?.lng ?? restaurant.geometry?.location?.lng?.()
                        },
                        viewport: {
                            northeast: restaurant.geometry?.viewport?.northeast,
                            southeast: restaurant.geometry?.viewport?.southeast
                        }
                    }
                })
            })
            console.log("Saved into DB")
        }
    }    

    return (
        <>
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>  
            <nav>
                <Stack direction="row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: '1rem'}}>
                    <motion.button
                        whileHover={{ scale: 1.1}}
                    >
                        <HomeIcon onClick={() => navigate("/userHome")} color="mainRed" sx={{ width: 45, height: 45}}/>
                    </motion.button>
                    <LogoWNote/>
                    <Button variant="contained" color="mainRed" onClick={() => navigate("/")}
                        sx={{
                            color: "white",
                            width: "140px",
                            height: "50px",
                            borderRadius: "36px",
                            fontSize: "20px",
                            textTransform: "none",
                            boxShadow: 0,
                            "&:hover": {
                                backgroundColor: "mainRed.light",
                                boxShadow: 0,
                            }
                        }}
                    >
                        Log Out
                    </Button>
                </Stack>
            </nav>
            <Stack direction="row" sx={{ display: 'flex', px: '1rem'}}>
                <Typography>Saved Resto Page</Typography>
                <GoogleMap 
                    userLocation={userLocation} 
                    restaurants={savedRestaurants}
                    error={error} 
                    isLoading={isLoading}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    savedIds={savedIds}
                    bookmarkToggle={bookmarkToggle}
                />
            </Stack>
            </APIProvider>
        </>
    )
}

export default savedRestaurantsPage