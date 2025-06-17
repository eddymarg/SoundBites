// Main header file for when the user is logged in
import axios from "axios"
import React, { useEffect } from "react"
import { useState } from "react";
import { Button, Box, Stack, Avatar, IconButton, Modal, Typography, TextField, InputAdornment, Icon, Snackbar, Alert } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { LogoWNote } from "../assets/logoWNote"
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ButtonBase from '@mui/material/ButtonBase';
import EditIcon from '@mui/icons-material/Edit';
import "../css/home.css"
import '@fontsource/roboto/500.css'

const HomeHeader = () => {
    const [open, setOpen] = useState(false)
    const [avatarSrc, setAvatarSrc] = React.useState(undefined)
    const [avatarFile, setAvatarFile] = useState(null)
    const [editField, setEditField] = useState(null)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState("")
    const [snackbarSeverity, setSnackbarSeverity] = useState("success")
    const [userInfo, setUserInfo] = useState({
        display_name: "",
        email: "",
        avatar: "",
    })
    const navigate = useNavigate()

    const handleInfoOpen = () => {
        setOpen(true)
    }

    const handleInfoClose = () => {
        setOpen(false)
    }

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            const reader = new FileReader()
            reader.onload = () => setAvatarSrc(reader.result)
            reader.readAsDataURL(file)
        }

    }

    const handleSpotifyUpdate = async () => {
        try{
            const formData = new FormData()
            formData.append("display_name", userInfo.display_name)
            formData.append("email", userInfo.email)
            if (avatarFile) {
                formData.append("avatar", avatarFile)
            }

            await axios.put("http://localhost:5001/update-user", formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            handleInfoClose()
            setSnackbarMessage("User info updated successfully")
            setSnackbarSeverity("success")
            setSnackbarOpen(true)
        } catch (err) {
            console.error("Error saving user info:", err)
            setSnackbarMessage("Failed to save user info.")
            setSnackbarSeverity("error")
            setSnackbarOpen(true)
        }
    }

    // retrieves Spotify user info
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await axios.get("http://localhost:5001/spotify-user", {
                    withCredentials: true,
                })
                setUserInfo(res.data)
                setAvatarSrc(res.data.avatar)
            } catch (err) {
                console.error("Failed to fetch user info from DB:", err)
            }
        }
        fetchUserInfo()
    }, [])

    return (
        <>
        <nav>
            <Stack direction="row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: '1rem'}}>
                <IconButton onClick={handleInfoOpen}>
                    <Avatar src={avatarSrc || "/broken-image.jpg"} sx={{ width: 56, height: 56 }}/>
                </IconButton>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center'}}>
                    <LogoWNote />
                </Box>
                <Stack spacing={2} direction="row">
                    <IconButton aria-label="bookmark" onClick={() => navigate("/savedRestaurantsPage")}>
                        <BookmarkIcon fontSize="large" color="mainRed"/>
                    </IconButton>
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
            </Stack>
        </nav>
        <Modal
            open={open}
            onClose={handleInfoClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                sx={{
                    display: 'flex',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'background.paper',
                    p: '2rem',
                    borderRadius: '2.5%',
                    alignItems: 'center',
                }}
            >
                <ButtonBase
                    component="label"
                    role={undefined}
                    tabIndex={-1}
                    aria-label="Avatar image"
                    sx={{
                        borderRadius: '40px',
                        '&:has(:focus-visible)': {
                            outline: '2px solid',
                            outlineOffset: '2px',
                        },
                    }}
                >
                    <Avatar alt="upload new avatar" src={avatarSrc} sx={{ width: 200, height: 200 }}/>
                    <input
                        type="file"
                        accept="image/*"
                        style={{
                            border: 0,
                            clip: 'rect(0 0 0 0)',
                            height: '1px',
                            margin: '1px',
                            overflow: 'hidden',
                            padding: 0,
                            position: 'absolute',
                            whiteSpace: 'nowrap',
                            width: '1px',
                        }}
                        onChange={handleAvatarChange}
                    >
                    </input>
                    <EditIcon 
                        sx={{ 
                            position: 'absolute', 
                            width: 50,
                            height: 50, 
                            bottom: 8,
                            right: 2,
                            color: 'white',
                            backgroundColor: '#EF233C',
                            borderRadius: '50%',
                            padding: '0.5rem',
                        }}/>
                </ButtonBase>
                <Box sx={{ flexGrow: 2, marginLeft: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Stack>
                        <Typography>Username</Typography>
                        <TextField 
                            value={userInfo.display_name || ""}
                            variant="outlined"
                            disabled={editField !== 'name'}
                            onChange={(e) => setUserInfo({ ...userInfo, display_name: e.target.value})}
                            sx={{ mb: '1rem'}}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setEditField('name')}>
                                                <EditIcon/>
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                        <Typography>Email</Typography>
                        <TextField 
                            value={userInfo.email || ""}
                            variant="outlined"
                            disabled={editField !== 'email'}
                            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setEditField('email')}>
                                                <EditIcon/>
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Stack>
                    <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', p: '1rem', gap: 1 }}>
                        <Button 
                            onClick={handleInfoClose}
                            variant="outline"
                            sx={{
                                color: '0D1B2A',
                                border: '2px solid #EF233C',
                                borderRadius: '36px'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="mainRed"
                            onClick={handleSpotifyUpdate}
                            sx={{
                                color: 'white',
                                border: '2px solid #EF233C',
                                borderRadius: '36px'
                            }}
                        >
                            Save Changes
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Modal>
        <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center'}}
        >
            <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                {snackbarMessage}
            </Alert>
        </Snackbar>
        </>
    )
}

export default HomeHeader