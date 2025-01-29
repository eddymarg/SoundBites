import React from "react"
import { Button, Stack } from "@mui/material"
import { Link } from "react-router-dom"
import "../css/home.css"
import '@fontsource/roboto/500.css'
import { Logo } from "../assets/Logo"

const ScrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    })
}

const HomeHeader = () => {
    return (
        <nav>
            <Stack direction="row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: '1rem'}}>
                {/* NEED TO MAKE CLICKABLE ONCE PAGE EXPANDS */}
                <Logo/>
                <Stack spacing={2} direction="row">
                    <Button variant="outlined" color="mainRed"
                    sx={{
                        width: "140px",
                        height: "50px",
                        borderRadius: "36px",
                        fontSize: "20px",
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: "mainRed.light",
                            color: "white",
                            border: "0 none",
                        }
                    }}
                    >
                        About
                    </Button>
                    <Button variant="contained" color="mainRed" fontWeight=""
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
                        Sign In
                    </Button>
                </Stack>
            </Stack>
        </nav>
    )
}

export default HomeHeader