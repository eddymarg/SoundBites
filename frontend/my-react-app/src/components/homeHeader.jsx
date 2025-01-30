import React from "react"
import { Button, Stack } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { Logo } from "../assets/Logo"
import { useAuth0 } from "@auth0/auth0-react"
import "../css/home.css"
import '@fontsource/roboto/500.css'

const ScrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    })
}

const HomeHeader = () => {
    const navigate = useNavigate()

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
                    <Button variant="contained" color="mainRed" onClick={() => navigate("/signin")}
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
                        Log In
                    </Button>
                </Stack>
            </Stack>
        </nav>
    )
}

export default HomeHeader