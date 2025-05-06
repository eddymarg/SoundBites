// Main header file for when the user is logged in

import React from "react"
import { Button, Box, Stack, Avatar, IconButton } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { LogoWNote } from "../assets/logoWNote"
import BookmarkIcon from '@mui/icons-material/Bookmark';
import "../css/home.css"
import '@fontsource/roboto/500.css'

const HomeHeader = () => {
    const navigate = useNavigate()
    return (
        <nav>
            <Stack direction="row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: '1rem'}}>
                <IconButton>
                    <Avatar src="/broken-image.jpg"/>
                </IconButton>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center'}}>
                    <LogoWNote />
                </Box>
                <Stack spacing={2} direction="row">
                    <IconButton aria-label="bookmark">
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
    )
}

export default HomeHeader