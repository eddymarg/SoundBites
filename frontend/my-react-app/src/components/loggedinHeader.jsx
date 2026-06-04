// Main header file for when the user is logged in
import axios from "axios"
import React, { useEffect } from "react"
import { useState } from "react";
import { Button, Box, Stack, Avatar, IconButton, Tooltip } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { LogoWNote } from "../assets/logoWNote"
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HomeIcon from '@mui/icons-material/Home';
import "../css/home.css"
import '@fontsource/roboto/500.css'
import LogoutScreen from "./LogoutScreen"

const getAuthToken = () => localStorage.getItem("app_token") || localStorage.getItem("spotify_access_token")

const HomeHeader = ({setHasFetchedRestaurants, setVisibleRestaurants, homeButton = false}) => {
    const [loggingOut, setLoggingOut] = useState(false)
    const [avatarSrc, setAvatarSrc] = React.useState(undefined)
    const navigate = useNavigate()

    const handleUserLogout = () => {
        setLoggingOut(true)
        setTimeout(() => {
            localStorage.removeItem("restaurantCache")
            localStorage.removeItem("genreCache")
            localStorage.removeItem("userLocation")
            localStorage.removeItem("ipLocation")
            localStorage.removeItem("spotify_access_token")
            localStorage.removeItem("spotify_refresh_token")
            localStorage.removeItem("app_token")
            localStorage.removeItem("token")
            sessionStorage.removeItem("hasSeenLoadingScreen")

            if (typeof setHasFetchedRestaurants === "function") setHasFetchedRestaurants(false)
            if (typeof setVisibleRestaurants === "function") setVisibleRestaurants([])

            navigate("/")
        }, 1400)
    }

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                const token = getAuthToken()
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                    withCredentials: true,
                    ...(token && { headers: { Authorization: `Bearer ${token}` } })
                })
                setAvatarSrc(res.data.avatar || undefined)
                if (res.data.explicitContentFilter !== undefined) {
                    localStorage.setItem("explicitContentFilter", res.data.explicitContentFilter ? "true" : "false")
                }
            } catch (err) {
                console.error("Failed to fetch user info:", err)
            }
        }
        fetchAvatar()
    }, [])

    return (
        <>
        {loggingOut && <LogoutScreen />}
        <nav>
            <Stack direction="row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: '1rem'}}>
                {homeButton ? (
                    <Tooltip title="Back to home">
                        <IconButton onClick={() => navigate("/userHome")}>
                            <HomeIcon sx={{ width: 40, height: 40, color: '#F5536A' }} />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title="Profile settings">
                        <IconButton onClick={() => navigate("/profileSettings")}>
                            <Avatar src={avatarSrc || "/broken-image.jpg"} sx={{ width: 56, height: 56 }}/>
                        </IconButton>
                    </Tooltip>
                )}
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center'}}>
                    <LogoWNote />
                </Box>
                <Stack spacing={2} direction="row">
                    <Tooltip title="Saved restaurants">
                        <IconButton aria-label="bookmark" onClick={() => navigate("/savedRestaurantsPage")}>
                            <BookmarkIcon fontSize="large" sx={{ color: '#F5536A' }}/>
                        </IconButton>
                    </Tooltip>
                    <Button variant="contained" color="mainRed" onClick={handleUserLogout}
                        sx={{
                            color: "white",
                            width: { xs: '90px', sm: '110px', md: '140px' },
                            height: { xs: '40px', sm: '46px', md: '50px' },
                            borderRadius: "36px",
                            fontSize: { xs: '14px', sm: '17px', md: '20px' },
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
            </Stack>
        </nav>
        </>
    )
}

export default HomeHeader