import React, { useEffect } from "react"
import { useState } from "react"
import LoadingAnimation from "./loadingAnimation"
import { Box, Stack, Typography } from "@mui/material"
import "../css/loading.css"

const LoadingScreen = ({ loadingStage }) => {
    const loadingText = [
        "Analyzing Spotify...",
        "Let it cook...",
        "Order up!"
    ]


    return(
        <Box className="loading-screen-container">
            <Box className="loading-animation">
                <LoadingAnimation />
            </Box>
            <Stack spacing={1} alignItems="center" className="loading-text-container">
                {loadingText.map((text, index) => (
                    <Typography
                        key={index}
                        className="loading-text"
                        style={{
                            fontFamily: "Tinos, serif",
                            fontWeight: 700,
                            fontSize: 20,
                            color: loadingStage === index ? "#EF233C" : "#E5E5E5",
                            transition: "color 0.3s ease"
                        }}
                    >
                        {text}
                    </Typography>
                ))}
            </Stack>
        </Box>
    )
}

export default LoadingScreen
